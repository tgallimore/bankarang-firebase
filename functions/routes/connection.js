const { getFirestore } = require('firebase-admin/firestore');
const express = require('express');
const router = express.Router();
const addDays = require('date-fns/addDays');
const isBefore = require('date-fns/isBefore');

const { getAccountBalance, getTransactions } = require('../truelayer/api');

router.post('/sync', async (req, res) => {
  const { connections } = res.locals;
  const { account_id } = req.body;
  const uid = req.user.uid;
  const now = new Date();

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

    const oneYearAgo = addDays(now, -364);
    const latestSync = account.latest_sync?.toDate();
    const latest_sync = latestSync && !isBefore(latestSync, oneYearAgo)
      ? latestSync
      : oneYearAgo;


    const balance = await getAccountBalance(account_id, connection.token);
    
    const transactions = await getTransactions(account_id, latest_sync.toISOString(), now.toISOString(), connection.token);

    // 1. Update account balance and sync data
    await accountDocument.set({ balance, latest_sync: now }, { merge: true })

    // 2. Sync transactions
    const transactionsPromises = [];

    for (let i = 0; i < transactions.length; i++) {
      const connection_data = transactions[i];
      const transacitonDocument = db.collection('BankTransactions').doc(connection_data.transaction_id);
      const transaction = await transacitonDocument.get();

      if (transaction.data()) {
        transactionsPromises.push(
          transacitonDocument.set({ connection_data }, { merge: true })
        )
      } else {
        transactionsPromises.push(
          transacitonDocument.set({
            connection_data,
            uid,
            account_id,
            title: connection_data.description,
            date: new Date(connection_data.timestamp),
            amount: connection_data.amount * 100,
            receipt: null,
            categories: connection_data.transaction_classification?.[0]
              ? [{
                report_category: connection_data.transaction_classification[0],
                budget_category: connection_data.transaction_classification[0],
                allocation: connection_data.amount * 100,
              }]
              : null,
            /**
             * TODO
             * 1. Find subscription and update
             * 2. Check for auto saving rules on the account and apply
             */
            subscription: null,
            auto_saving: null,
            categories: null,
          })
        )
      }
    }

    await Promise.all(transactionsPromises);
    return res.json({});

  } catch(e) {
    res.status(400);
    return res.json(e);
  }
});

module.exports = router;
