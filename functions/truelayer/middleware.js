const { getFirestore } = require('firebase-admin/firestore');
const isDateBefore = require('date-fns/isBefore');
const addSeconds = require('date-fns/addSeconds');
const { encrypt, decrypt } = require('../util/secure');

const { refreshToken } = require('../truelayer/api');

module.exports = async function(req, res, next) {
  const uid = req.user.uid;
  const db = getFirestore();
  const connectionsQuery = db.collection('Tokens').where('uid', '==', uid);
  const snapshots = await connectionsQuery.get();
  const connections = [];
  for (let i = 0; i < snapshots.docs.length; i++) {
    const snapshot = snapshots.docs[i];
    const connection = snapshots.docs[i].data();
    const token = decrypt(connection.token);
    const isValid = isDateBefore(new Date(), connection.expires.toDate());
    if (isValid) {
      connections.push({
        token,
        account_id: connection.account_id,
      });
    } else {
      try {
        const now = new Date();
        const oldRefreshToken = decrypt(connection.refresh_token);
        const newToken = await refreshToken(oldRefreshToken);
        await db.collection('Tokens').doc(snapshot.id).set({
          token: encrypt(newToken.access_token),
          refresh_token: encrypt(newToken.refresh_token),
          expires: addSeconds(now, newToken.expires_in),
        }, { merge: true });
        connections.push({
          token: newToken.access_token,
          account_id: connection.account_id,
        });
      }
      catch(e) {
        res.status(500);
        return res.json({ message: 'Failed to get/save new tokens', e });
      }
    }
  }
  res.locals.connections = connections;
  return next();
};
