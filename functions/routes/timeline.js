const express = require('express');
const { getFirestore } = require('firebase-admin/firestore');
const router = express.Router();

const { getDateRangeFromSettingAndReference } = require('../util/date');

const getDateRange = (settings, reference) => {
  return getDateRangeFromSettingAndReference(settings, reference);
};

/**
 * TODO
 * Remove this completely and calculate on client
 */
router.get('/', async (req, res) => {
  const { date: reference } = req.query;
  const uid = req.user.uid;
  const db = getFirestore();
  const settingsSnapshot = await db.collection('Settings').doc(uid).get();
  const cycleStart = settingsSnapshot.cycleStart || '1:day';
  const dateRange = getDateRange(cycleStart, new Date(reference));
  return res.json(dateRange);
});

module.exports = router;
