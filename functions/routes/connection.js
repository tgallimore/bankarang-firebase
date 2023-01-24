const { getFirestore } = require('firebase-admin/firestore');
const express = require('express');
const router = express.Router();
const { syncBankConnection } = require('../util/sync');

router.post('/sync', async (req, res) => {
  const { connections } = res.locals;
  const { account_id } = req.body;
  const uid = req.user.uid;
  const connection = connections.find((c) => c.account_id === account_id);

  if (!connection) {
    return res.sendStatus(403);
  }

  try {
    const db = getFirestore();
    const accountDocument = db.collection('Accounts').doc(account_id);
    const accountSnapshot = await accountDocument.get();
    const account = accountSnapshot.data();

    if (!account) {
      return res.sendStatus(400);
    }

    await syncBankConnection({
      uid,
      account_id,
      token: connection.token,
      accountDocument
    });

    return res.json({});
  }
  catch(e) {
    res.sendStatus(400);
  }

});

module.exports = router;
