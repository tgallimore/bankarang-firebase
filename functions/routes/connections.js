const functions = require('firebase-functions');
const { getFirestore } = require('firebase-admin/firestore');
const express = require('express');
const router = express.Router();
const addSeconds = require('date-fns/addSeconds');
const addDays = require('date-fns/addDays');
const { encrypt } = require('../util/secure');

const { exchangeCodeForToken, getAccounts, getAccountBalance } = require('../truelayer/api');
const { syncBankConnection } = require('../util/sync');

router.post('/connect', async (req, res) => {
  const { code, redirectUri } = req.body;
  const now = new Date();
  const uid = req.user.uid;

  try {
    const tokens = await exchangeCodeForToken(code, decodeURI(redirectUri));
    const trueLayerAccounts = await getAccounts(tokens.access_token);
    const db = getFirestore();
    const accountsCollection = db.collection('Accounts');
    const tokensCollection = db.collection('Tokens');
    const promises = [];
    const accounts = [];
    for (let i = 0; i < trueLayerAccounts.length; i++) {
      const account = trueLayerAccounts[i];
      const accountDocument = accountsCollection.doc(account.account_id);
      const accountPromise = accountDocument
        .set({
          uid,
          account_id: account.account_id,
          type: 'current',
          authorised: now,
          expires: addDays(now, 90),
          nickname: '',
          connection_data: { account },
          current: {
            categories: null,
            percent_incoming: null,
            round_outgoing: null,
            overdraft_available: false,
            scheduled_incoming_available: false,
          }
        });
      promises.push(accountPromise);
      accounts.push(account);

      const tokenPromise = tokensCollection
        .doc(account.account_id)
        .set({
          uid,
          account_id: account.account_id,
          token: encrypt(tokens.access_token),
          refresh_token: encrypt(tokens.refresh_token),
          expires: addSeconds(now, tokens.expires_in)
        });
      promises.push(tokenPromise);

      await accountPromise;
      const syncPromise = syncBankConnection({
        uid,
        account_id: account.account_id,
        token: tokens.access_token,
        accountDocument
      });
      promises.push(syncPromise)
    }

    await Promise.all(promises);
    return res.json(accounts);
  }
  catch(e) {
    res.status(400);
    return res.json(e);
  }
});

router.post('/renew', async (req, res) => {
  const { code, redirectUri, connectionId } = req.body;
  const now = new Date();

  try {
    const tokens = await exchangeCodeForToken(code, decodeURI(redirectUri));

    const db = getFirestore();
    const account = db.collection('Accounts').doc(connectionId)

    await account.set({
      expires: addDays(now, 90),
    }, { merge: true })

    await db.collection('Tokens').doc(connectionId).set({
      token: encrypt(tokens.access_token),
      refresh_token: encrypt(tokens.refresh_token),
      expires: addSeconds(now, tokens.expires_in)
    }, { merge: true })

    const accountData = (await account.get()).data()

    return res.json(accountData);
  }
  catch(e) {
    res.status(400);
    return res.json(e);
  }
});

module.exports = router;
