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

  try {
    const dbTransactions = await db.collection('Transactions')
      .where('uid', '==', uid)
      .where('type', '==', 'saving')
      .where('savingPot', '>=', savingPot);

    const dbBankTransactions = await db.collection('BankTransactions')
      .where('uid', '==', uid)
      .where('saving.savingPotId', '==', savingPot);

    const transactionSnapshot = await dbTransactions.get();
    const bankTransactionSnapshot = await dbBankTransactions.get();

    const batch = db.batch();
    
    if (transactionSnapshot.size) {
      transactionSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
    }

    if (bankTransactionSnapshot.size) {
      bankTransactionSnapshot.docs.forEach((doc) => {
        batch.set(doc.ref, { saving: {} }, { merge: true })
      });
    } 

    await batch.commit();
    await deleteSavingPot();
    return res.json({});
  } catch(e) {
    res.status(500);
    return res.json();
  }
});


module.exports = router;
