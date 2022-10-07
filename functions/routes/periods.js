const express = require('express');
const { getFirestore } = require('firebase-admin/firestore');
const router = express.Router();

const { getDateRangeFromSettingAndReference } = require('../util/date');

router.get('/', async (req, res) => {
  const { date: reference, cycleStart } = req.query;
  const dateRange = getDateRangeFromSettingAndReference(cycleStart, new Date(reference));
  return res.json(dateRange);
});

module.exports = router;
