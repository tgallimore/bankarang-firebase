const functions = require('firebase-functions');
const { getFirestore } = require('firebase-admin/firestore');
const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const { getAccounts } = require('../truelayer/api');

router.get('/', async (req, res) => {
  const { truelayerConnections } = res.locals;
  const accounts = [];
  for (let i = 0; i < truelayerConnections.length; i++) {
    const connection = truelayerConnections[i];
    try {
      const bankAccount = await getAccounts(connection.token);
      accounts.push(...bankAccount.results);
    } catch(error) {
      res.status(500);
      return res.json({ message: 'Could not get bank account details', error });
    }
  }
  return res.json(accounts);
});

module.exports = router;
