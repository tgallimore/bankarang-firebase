const functions = require('firebase-functions');
const { getFirestore } = require('firebase-admin/firestore');
const express = require('express');
const router = express.Router();

router.delete('/bank-connection', async (req, res) => {
  const { account_id } = req.body;
  /**
   * Deletes a single bank connection
   * (deletes a single account in the array on the bank connection, or the bank connection document)
   * Delete all:
   * BankTransactions
   * Transactions
   * SavingPots
   * SpendingBudgets
   * and then delete the account from this BankConnection
   *  - if this is the only account, delete the BankConnection document
   *  - if there are more accounts, just delete this account
   */
});

router.delete('/saving-pot', async (req, res) => {
  const { savingPot } = req.body;
  const uid = req.user.uid;
  const db = getFirestore();

  const deleteSavingPot = async () => {
    return await db.collection('SavingPots')
      .doc(savingPot)
      .delete();
  }

  const dbTransactions = await db.collection('Transactions')
    .where('uid', '==', uid)
    .where('type', '==', 'saving')
    .where('savingPot', '>=', savingPot);

  const snapshot = await dbTransactions.get();

  const batchSize = snapshot.size;
  if (batchSize === 0) {
    await deleteSavingPot();
    return res.json({});
  }

  // Delete documents in a batch
  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();
  await deleteSavingPot();
  return res.json({});
});


module.exports = router;
