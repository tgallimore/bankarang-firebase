const { getFirestore } = require('firebase-admin/firestore');
const express = require('express');
const addDays = require('date-fns/addDays');
const isBefore = require('date-fns/isBefore');

const { getAccountBalance, getTransactions } = require('../truelayer/api');

const syncBankConnection = async ({ uid, account_id, token, accountDocument }) => {
  const now = new Date();

  try {
    const db = getFirestore();

    const accountSnapshot = await accountDocument.get();
    const account = accountSnapshot.data();
    if (!account) {
      return Promise.reject();
    }

    const onYearAgo = addDays(now, -364);
    const twoMonthsAgo = addDays(now, -62);
    const latestSync = account.latest_sync?.toDate();
    const latest_sync = latestSync && !isBefore(latestSync, onYearAgo)
      ? latestSync
      : twoMonthsAgo;

    const balance = await getAccountBalance(account_id, token);
    
    const transactions = await getTransactions(account_id, latest_sync.toISOString(), now.toISOString(), token);

    // 1. Update account balance and sync data
    await accountDocument.set({
      latest_sync: now,
      connection_data: {
        ...account.connection_data,
        balance
      }
    }, { merge: true })

    // 2. Sync transactions
    const batch = db.batch();

    for (let i = 0; i < transactions.length; i++) {
      const connection_data = transactions[i];
      const transacitonDocument = db.collection('BankTransactions').doc(connection_data.transaction_id);
      const transaction = await transacitonDocument.get();

      if (transaction.data()) {
        batch.set(transacitonDocument, {
          connection_data,
          amount: connection_data.amount * 100,
          date: new Date(connection_data.timestamp),
        }, { merge: true });
      } else {
        batch.set(transacitonDocument, {
          connection_data,
          uid,
          account_id,
          transaction_id: connection_data.transaction_id,
          title: connection_data.description,
          date: new Date(connection_data.timestamp),
          amount: connection_data.amount * 100,
          receipt: null,
          categories: connection_data.transaction_classification?.[0]
            ? [{
              report_category: connection_data.transaction_classification[0],
              budget_category: connection_data.transaction_classification[0],
              allocation: connection_data.transaction_classification[0]
                ? connection_data.amount * 100
                : undefined
            }]
            : null,
          /**
           * TODO
           * 1. Find subscription and update
           * 2. Check for auto saving rules on the account and apply
           */
          subscription: null,
          auto_saving: null,
        });
      }
    }

    await batch.commit();
    return Promise.resolve();

  } catch(e) {
    return Promise.reject(e);
  }
}

module.exports = {
  syncBankConnection
};
