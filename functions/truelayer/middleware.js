const { getFirestore } = require('firebase-admin/firestore');
const isDateBefore = require('date-fns/isBefore');
const addSeconds = require('date-fns/addSeconds');
const { encrypt, decrypt } = require('../util/secure');

const { refreshToken } = require('../truelayer/api');

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
        accounts: connection.accounts,
        _id: snapshot.id
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
          accounts: connection.accounts,
          _id: snapshot.id
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
