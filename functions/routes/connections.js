const functions = require('firebase-functions');
const { getFirestore } = require('firebase-admin/firestore');
const express = require('express');
const router = express.Router();
const addSeconds = require('date-fns/addSeconds');
const addDays = require('date-fns/addDays');
const { encrypt } = require('../util/secure');
const { formatDate } = require('../util/date');

const { exchangeCodeForToken, getAccounts, getAccountBalance, getTransactions } = require('../truelayer/api');

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
    trueLayerAccounts.forEach(async (account) => {
      const balance = await getAccountBalance(account.account_id, tokens.access_token);

      const accountPromise = accountsCollection
        .doc(account.account_id)
        .set({
          uid,
          account_id: account.account_id,
          authorised: now,
          expires: addDays(now, 90),
          nickname: '',
          connection_data: { account, balance },
          budgets: [],
          balance_pots: [],
          overdraft_available: false
      });
      promises.push(accountPromise);

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
    });

    const results = Promise.all(promises);
    return res.json(results);
  }
  catch(e) {
    res.status(400);
    return res.json(e);
  }
});

module.exports = router;
