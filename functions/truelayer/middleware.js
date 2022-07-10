const functions = require('firebase-functions');
const { getFirestore } = require('firebase-admin/firestore');

const CryptoJS = require('crypto-js');
const isDateBefore = require('date-fns/isBefore');
const addSeconds = require('date-fns/addSeconds');

const { refreshToken } = require('../truelayer/api');

const decrypt = (str) => {
  return CryptoJS.AES.decrypt(str, process.env.ENCRYPT_KEY).toString(CryptoJS.enc.Utf8);
}

const encrypt = (str) => {
  return CryptoJS.AES.encrypt(str, process.env.ENCRYPT_KEY).toString();
}

module.exports = async function(req, res, next) {
  const uid = req.user.uid;
  const db = getFirestore();
  const truelayerConnections = db.collection('BankConnections').where('uid', '==', uid);
  const snapshots = await truelayerConnections.get();
  const connections = [];
  for (let i = 0; i < snapshots.docs.length; i++) {
    const snapshot = snapshots.docs[i];
    const connection = snapshots.docs[i].data();
    const trueLayerToken = decrypt(connection.token);
    const isValid = isDateBefore(new Date(), connection.expires.toDate());
    if (isValid) {
      connections.push({
        token: trueLayerToken,
        accounts: connection.accounts
      });
    } else {

      try {
        const now = new Date();
        const trueLayerRefreshToken = decrypt(connection.refreshToken);
        const newToken = await refreshToken(trueLayerRefreshToken);
        await db.collection('BankConnections').doc(snapshot.id).set({
          token: encrypt(newToken.access_token),
          refreshToken: encrypt(newToken.refresh_token),
          expires: addSeconds(now, newToken.expires_in),
        }, { merge: true });
        connections.push({
          token: newToken.access_token,
          accounts: connection.accounts
        });
      }
      catch(e) {
        res.status(500);
        return res.json({ message: 'Failed to get/save new tokens', e });
      }
    }
  }
  res.locals.truelayerConnections = connections;
  return next();
};
