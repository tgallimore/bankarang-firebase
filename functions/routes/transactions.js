const functions = require('firebase-functions');
const express = require('express');
const router = express.Router();
const isDateBefore = require('date-fns/isBefore');
const isDateAfter = require('date-fns/isAfter');
const isSameDay = require('date-fns/isSameDay');

const { getTransactions } = require('../truelayer/api');
const { getPendingTransactionsFromRecurring } = require('../util/transactions');

const { getFirestore } = require('firebase-admin/firestore');

const sortByDateFn = (a, b) => {
  return isDateBefore(new Date(a.date), new Date(b.date))
    ? 1
    : isDateAfter(new Date(a.date), new Date(b.date))
      ? -1
      : 0;
};

const addDayTagsToTransactions = (transactions) => {
  const result = [];
  transactions?.forEach((transaction, i) => {
    if (typeof transaction.running_balance === 'number') {
      const previousTransaction = transactions[i-1];
      if (!previousTransaction?.date || !isSameDay(new Date(previousTransaction.date), new Date(transaction.date))) {
        result.push([transaction.date, transaction.running_balance]);
      }
    }
    result.push(transaction);
  });
  return result;
}

router.get('/', async (req, res) => {
  const uid = req.user.uid;
  const transactions = [];
  const pendingTransactions = [];
  const savingTransactions = [];
  const { from, to, account: accountId, includeAll = false } = req.query;
  const now = new Date();

  const connection = res.locals.truelayerConnections
    .find(({accounts}) => accounts.includes(accountId));
  const { token } = connection;

  /**
   * Actual transactions
   * Includes only transactions within the from/to date range
   */
  if (isDateAfter(now, new Date(from))) {
    try {
      const accountTransactions = await getTransactions(
        accountId,
        from,
        isDateAfter(new Date(to), now) ? now.toISOString() : to,
        token
      );
      transactions.push(...accountTransactions.results.map((result) => {
        return {
          ...result,
          title: result.description,
          subtitle: result.meta.provider_category,
          amount: Math.floor(result.amount * 100),
          account: accountId,
          date: result.timestamp,
          transaction_id: result.transaction_id,
          running_balance: result.running_balance ? Math.floor(result.running_balance.amount * 100) : null, 
          _id: result.transaction_id
        }
      }));
    } catch (error) {
      res.status(500);
      return res.json(error);
    }
  }

  try {
    const db = getFirestore();
    const dbTransactions = await db.collection('Transactions')
      .where('uid', '==', uid)
      .where('account', '==', accountId)
      .get();
    
    if (!dbTransactions.empty) {

      /**
       * Pending transactions
       * Includes all transactions up to the end of the date range
       * Recurring transactions will be from the last paid date, up to the end of the date range
       */
      const items = dbTransactions.docs.map((doc) => ({ ...doc.data(), _id: doc.id }));

      // first get all standard pending transactions
      const includedPendingTransactions = items
        .filter(({date, type, recurring}) => {
          const isStandardPending = type === 'pending' && !recurring;
          const isBeforeEnd = !isDateAfter(new Date(date), new Date(to));
          const isAfterStart = !!includeAll || !isDateBefore(new Date(date), new Date(from));
          return isStandardPending && isBeforeEnd && isAfterStart;
        });
      // then add recurring transactions
      items
        .filter(({type, recurring}) => type === 'pending' && recurring)
        .forEach((transaction) => {
          const getTransactionsFrom = includeAll || isDateBefore(new Date(from), new Date(transaction.date))
            ? transaction.date
            : from;
          try {
            const pendingFromRecurringTransactions =
              getPendingTransactionsFromRecurring(transaction, to, getTransactionsFrom);
            includedPendingTransactions.push(...pendingFromRecurringTransactions);
          } catch (error) {
            res.status(500);
            res.json({
              message: 'Could not parse recurring transaction.',
              transaction: transaction._id
            });
          }
        });
      // finally add to response
      pendingTransactions.push(...includedPendingTransactions);

      /**
       * Saving transactions
       * Includes all transactions up to the end of the date range
       * because we should account for money saved over all time
       */

      // first get all savings transactions
      const includedSavingTransactions = items
        .filter(({date, type, recurring}) => {
          const isSaving = type === 'saving' && !recurring;
          const isBeforeEnd = !isDateAfter(new Date(date), new Date(to));
          return isSaving && isBeforeEnd;
        });
      // then add recurring saving transactions
      items
        .filter(({type, recurring}) => type === 'saving' && recurring)
        .forEach((transaction) => {
          const getTransactionsFrom = transaction.date;
          try {
            const pendingFromRecurringTransactions =
              getPendingTransactionsFromRecurring(transaction, to, getTransactionsFrom);
            includedSavingTransactions.push(...pendingFromRecurringTransactions);
          } catch (error) {
            res.status(500);
            res.json({
              message: 'Could not parse recurring saving transaction.',
              transaction: transaction._id
            });
          }
        });
      // finally add to response
      savingTransactions.push(...includedSavingTransactions);
    }
  } catch (error) {
    res.status(500);
    return res.json(error);
  }
  return res.json({
    transactions: addDayTagsToTransactions(transactions),
    pendingTransactions: addDayTagsToTransactions(pendingTransactions.sort(sortByDateFn)),
    savingTransactions: savingTransactions.sort(sortByDateFn)
  });
});

module.exports = router;
