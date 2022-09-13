const functions = require('firebase-functions');
const { getFirestore } = require('firebase-admin/firestore');
const express = require('express');
const router = express.Router();
const CryptoJS = require('crypto-js');
const addSeconds = require('date-fns/addSeconds');
const addDays = require('date-fns/addDays');

const { exchangeCodeForToken, getAccounts } = require('../truelayer/api');

const encrypt = (str) => {
  return CryptoJS.AES.encrypt(str, process.env.ENCRYPT_KEY).toString();
}

const decrypt = (str) => {
  return CryptoJS.AES.decrypt(str, process.env.ENCRYPT_KEY).toString(CryptoJS.enc.Utf8);
}

router.post('/truelayer-callback', async (req, res) => {
  const { code, redirectUri } = req.body;
  const now = new Date();
  const uid = req.user.uid;

  try {
    const tokens = await exchangeCodeForToken(code, decodeURI(redirectUri));
    const trueLayerAccounts = await getAccounts(tokens.access_token);
    const newConnection = {
      uid,
      token: encrypt(tokens.access_token),
      refreshToken: encrypt(tokens.refresh_token),
      accounts: trueLayerAccounts.results.map(({account_id}) => ({
        account_id,
        registered: now.toISOString(),
        authorised: now.toISOString(),
        expires: addDays(now, 90).toISOString(),
        primary: false
      })),
      expires: addSeconds(now, tokens.expires_in)
    };
    const db = getFirestore();
    const connectionsCollection = db.collection('BankConnections');
    await connectionsCollection.add(newConnection);
    return res.json({});
  }
  catch(e) {
    res.status(400);
    return res.json(e);
  }
});

module.exports = router;
