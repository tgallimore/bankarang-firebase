const { getFirestore } = require('firebase-admin/firestore');
const express = require('express');
const addDays = require('date-fns/addDays');
const isBefore = require('date-fns/isBefore');

const { getAccountBalance, getTransactions } = require('../truelayer/api');
const { isAfter } = require('date-fns');

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
    const threeMonthsAgo = addDays(now, -92);
    const latestSync = addDays(account.latest_sync?.toDate(), -1);
    const latest_sync = latestSync && !isBefore(latestSync, onYearAgo)
      ? latestSync
      : threeMonthsAgo;

    const balance = await getAccountBalance(account_id, token);
    const transactions = await getTransactions(account_id, latest_sync.toISOString(), now.toISOString(), token);

    // 1. Sync transactions
    const batch = db.batch();

    const subscriptionsCollection = db.collection('Subscriptions');
    const subscriptionsSnapshot = await subscriptionsCollection.get();
    const subscriptions = subscriptionsSnapshot.docs.map((doc) => ({...doc.data(), _id: doc.id}));

    const { round_outgoing, percent_incoming } = account.current || {};

    for (let i = 0; i < transactions.length; i++) {
      const connection_data = transactions[i];
      const transacitonDocument = db.collection('BankTransactions').doc(connection_data.normalised_provider_transaction_id || connection_data.transaction_id);
      const transaction = await transacitonDocument.get();
      const amount = Math.round(connection_data.amount * 100);

      /**
        * Find a matching subscription to update
        * and use from transaction data
        */
      const subscription = subscriptions?.find((sub) => {
        const minValue = sub.minValue || sub.amount;
        const maxValue = sub.maxValue || sub.amount;
        return connection_data.description.trim().toLowerCase() === sub.title.trim().toLowerCase()
          && amount <= maxValue
          && amount >= minValue
      }) || null;

      if (subscription) {
        const latestPaid = new Date(subscription.latest.timestamp)
        const transactionDate = new Date(connection_data.timestamp)
        if (isAfter(transactionDate, latestPaid)) {
          await subscriptionsCollection.doc(subscription._id)
            .update({ latest: connection_data });
        }
      }

      // Update transactions that we already have saved
      if (transaction.data()) {
        batch.set(transacitonDocument, {
          connection_data,
          amount: amount,
          date: new Date(connection_data.timestamp),
        }, { merge: true });
      }
      // Add any new transactions
      else {
        batch.set(transacitonDocument, {
          connection_data,
          uid,
          account_id,
          amount,
          subscription: subscription && subscription._id,

          transaction_id: connection_data.normalised_provider_transaction_id || connection_data.transaction_id,
          title: connection_data.description,
          date: new Date(connection_data.timestamp),
          receipt: null,

          categories: subscription?.categories
              ? subscription.categories
              : amount > 0
                ? [{ id: 'Income', allocation: amount }]
                : connection_data.transaction_classification?.[0]
                  ? [{ id: connection_data.transaction_classification[0], allocation: amount }]
                  : null,
          
          auto_saving: round_outgoing?.account_id || percent_incoming?.account_id
            // If there are auto saving account, set null so the transaction can be reviewed
            ? null
            // If there aren't any, we don't want to trigger a review for this transaction
            : {},
          // auto_saving: amount > 0 && percent_incoming
          //   ? {
          //     amount: 0,
          //     rule: { type: 'percent_incoming', percent_incoming: percent_incoming.percent_incoming },
          //     account_type: percent_incoming.account_type,
          //     account_id: percent_incoming.account_id
          //   }
          //   : amount <= 0 && round_outgoing
          //     ? {
          //       amount: 0,
          //       rule: { type: 'round_outgoing' },
          //       account_type: round_outgoing.account_type,
          //       account_id: round_outgoing.account_id
          //     }
          //     : null
        });
      }
    }

    await batch.commit();

    // 2. Update account balance and sync data
    await accountDocument.set({
      latest_sync: now,
      connection_data: {
        ...account.connection_data,
        balance
      }
    }, { merge: true })

    return Promise.resolve();

  } catch(e) {
    return Promise.reject(e);
  }
}

module.exports = {
  syncBankConnection
};
