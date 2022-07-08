const functions = require('firebase-functions');
const { getFirestore } = require('firebase-admin/firestore');
const express = require('express');
const router = express.Router();
const CryptoJS = require('crypto-js');
const addSeconds = require('date-fns/addSeconds');

const { exchangeCodeForToken, getAccounts } = require('../truelayer/api');

router.post('/truelayer-callback', async (req, res) => {
  const { code, redirectUri } = req.body;
  const now = new Date();
  const uid = req.user.uid;

  try {
    const tokens = await exchangeCodeForToken(code, decodeURI(redirectUri));
    const trueLayerAccounts = await getAccounts(tokens.access_token);
    const newConnection = {
      uid,
      token: CryptoJS.AES.encrypt(tokens.access_token, process.env.ENCRYPT_KEY).toString(),
      refreshToken: CryptoJS.AES.encrypt(tokens.refresh_token, process.env.ENCRYPT_KEY).toString(),
      accounts: trueLayerAccounts.results.map(({account_id}) => account_id),
      expires: addSeconds(now, tokens.expires_in)
    };
    functions.logger.log('newConnection', newConnection);
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
