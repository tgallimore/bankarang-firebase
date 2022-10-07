const express = require('express');
const router = express.Router();
const { getAccountBalance } = require('../truelayer/api');

router.get('/', async (req, res) => {
  const { account: accountId } = req.query;
  const connection = res.locals.truelayerConnections
    .find(({accounts}) => !!accounts.find(({account_id}) => account_id === accountId));
  let account;
  try {
    const bankAccounts = await getAccountBalance(accountId, connection.token);
    account = bankAccounts.results[0];
    account.available = Math.ceil(account.available * 100);
    account.current = Math.ceil(account.current * 100);
    account.overdraft = Math.ceil(account.overdraft * 100);
  } catch(error) {
    res.status(500);
    res.json({ message: 'Could not get bank balance details', error });
  }
  return res.json(account);
});

module.exports = router;
