const startOfDay = require('date-fns/startOfDay');
const { endOfPreviousDay } = require('../util/date');
const { getPendingTransactionsFromRecurring } = require('../util/transactions');

const prettyDate = (date) => format(date, 'EEE do MMM yyyy HH:mm:ss');

describe('getPendingTransactionsFromRecurring()', () => {
  const daysOfTheWeek = [ 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday' ];
  const d = (date) => startOfDay(new Date(date));

  describe('day', () => {
    it('returns a transaction for every day between transaction date and end', () => {
      const transaction = { recurring: 'day', _id: '123' };
      const start = d('2022-01-01');
      const end = endOfPreviousDay(d('2022-01-21'));
      const result = getPendingTransactionsFromRecurring(transaction, end, start);
      expect(result.map((r) => r.date)).toEqual([
        d('2022-01-01'),
        d('2022-01-02'), d('2022-01-03'), d('2022-01-04'), d('2022-01-05'),
        d('2022-01-06'), d('2022-01-07'), d('2022-01-08'), d('2022-01-09'),
        d('2022-01-10'), d('2022-01-11'), d('2022-01-12'), d('2022-01-13'),
        d('2022-01-14'), d('2022-01-15'), d('2022-01-16'), d('2022-01-17'),
        d('2022-01-18'), d('2022-01-19'), d('2022-01-20'),
      ]);
    });
  });

  describe('Monday', () => {
    it('returns a transaction for every Monday between start and end', () => {
      const transaction = { recurring: 'Monday', _id: '123' };
      const start = d('2022-01-01');
      const end = endOfPreviousDay(d('2022-01-30'));
      const result = getPendingTransactionsFromRecurring(transaction, end, start);
      expect(result.map((r) => r.date)).toEqual([
        d('2022-01-03'),
        d('2022-01-10'),
        d('2022-01-17'),
        d('2022-01-24'),
      ]);
    });
    it('includes start date and end dates if they are Mondays', () => {
      const transaction = { recurring: 'Monday', _id: '123' };
      const start = d('2022-01-03');
      const end = endOfPreviousDay(d('2022-01-31'));
      const result = getPendingTransactionsFromRecurring(transaction, end, start);
      expect(result.map((r) => r.date)).toEqual([
        d('2022-01-03'),
        d('2022-01-10'),
        d('2022-01-17'),
        d('2022-01-24'),
      ]);
    });
  });

  describe('weekday', () => {
    it('returns a transaction for every weekday between start and end', () => {
      const transaction = { recurring: 'weekday', _id: '123' };
      const start = d('2022-01-01');
      const end = endOfPreviousDay(d('2022-01-31'));
      const result = getPendingTransactionsFromRecurring(transaction, end, start);
      expect(result.map((r) => r.date)).toEqual([
        d('2022-01-03'), d('2022-01-04'), d('2022-01-05'), d('2022-01-06'), d('2022-01-07'),
        d('2022-01-10'), d('2022-01-11'), d('2022-01-12'), d('2022-01-13'), d('2022-01-14'),
        d('2022-01-17'), d('2022-01-18'), d('2022-01-19'), d('2022-01-20'), d('2022-01-21'),
        d('2022-01-24'), d('2022-01-25'), d('2022-01-26'), d('2022-01-27'), d('2022-01-28'),
      ]);
    });
  });

  describe('working', () => {
    it('returns a transaction for every working day between start and end', () => {
      const transaction = { recurring: 'working', _id: '123' };
      const start = d('2021-12-01');
      const end = endOfPreviousDay(d('2022-01-01'));
      const result = getPendingTransactionsFromRecurring(transaction, end, start);
      expect(result.map((r) => r.date)).toEqual([
        d('2021-12-01'), d('2021-12-02'), d('2021-12-03'),
        d('2021-12-06'), d('2021-12-07'), d('2021-12-08'), d('2021-12-09'), d('2021-12-10'), 
        d('2021-12-13'), d('2021-12-14'), d('2021-12-15'), d('2021-12-16'), d('2021-12-17'), 
        d('2021-12-20'), d('2021-12-21'), d('2021-12-22'), d('2021-12-23'), d('2021-12-24'), 
        d('2021-12-29'), d('2021-12-30'), d('2021-12-31'), 
      ]);
    });
  });

  describe('1:day', () => {
    it('returns a transaction for every first day of the month between start and end', () => {
      const transaction = { recurring: '1:day', _id: '123' };
      const start = d('2021-01-01');
      const end = endOfPreviousDay(d('2021-12-31'));
      const result = getPendingTransactionsFromRecurring(transaction, end, start);
      expect(result.map((r) => r.date)).toEqual([
        d('2021-01-01'), d('2021-02-01'), d('2021-03-01'), d('2021-04-01'), d('2021-05-01'),
        d('2021-06-01'), d('2021-07-01'), d('2021-08-01'), d('2021-09-01'), d('2021-10-01'),
        d('2021-11-01'), d('2021-12-01'),
      ]);
    });
  });

  describe('15:day', () => {
    it('returns a transaction for every 15th day of the month between start and end', () => {
      const transaction = { recurring: '15:day', _id: '123' };
      const start = d('2021-01-01');
      const end = endOfPreviousDay(d('2021-12-31'));
      const result = getPendingTransactionsFromRecurring(transaction, end, start);
      expect(result.map((r) => r.date)).toEqual([
        d('2021-01-15'), d('2021-02-15'), d('2021-03-15'), d('2021-04-15'), d('2021-05-15'),
        d('2021-06-15'), d('2021-07-15'), d('2021-08-15'), d('2021-09-15'), d('2021-10-15'),
        d('2021-11-15'), d('2021-12-15'),
      ]);
    });
  });

  describe('last:day', () => {
    it('returns a transaction for every last day of the month between start and end', () => {
      const transaction = { recurring: 'last:day', _id: '123' };
      const start = d('2021-01-01');
      const end = endOfPreviousDay(d('2021-12-31'));
      const result = getPendingTransactionsFromRecurring(transaction, end, start);
      expect(result.map((r) => r.date)).toEqual([
        d('2021-01-31'), d('2021-02-28'), d('2021-03-31'), d('2021-04-30'), d('2021-05-31'),
        d('2021-06-30'), d('2021-07-31'), d('2021-08-31'), d('2021-09-30'), d('2021-10-31'),
        d('2021-11-30'),
      ]);
    });
  });

  describe('1:Monday', () => {
    it('returns a transaction for every first Monday of the month between start and end', () => {
      const transaction = { recurring: '1:Monday', _id: '123' };
      const start = d('2022-01-01');
      const end = endOfPreviousDay(d('2022-12-31'));
      const result = getPendingTransactionsFromRecurring(transaction, end, start);
      expect(result.map((r) => r.date)).toEqual([
        d('2022-01-03'), d('2022-02-07'), d('2022-03-07'), d('2022-04-04'), d('2022-05-02'),
        d('2022-06-06'), d('2022-07-04'), d('2022-08-01'), d('2022-09-05'), d('2022-10-03'),
        d('2022-11-07'), d('2022-12-05'),
      ]);
    });
  });
  
  describe('last:Friday', () => {
    it('returns a transaction for every last Friday of the month between start and end', () => {
      const transaction = { recurring: 'last:Friday', _id: '123' };
      const start = d('2022-01-01');
      const end = endOfPreviousDay(d('2022-12-31'));
      const result = getPendingTransactionsFromRecurring(transaction, end, start);
      expect(result.map((r) => r.date)).toEqual([
        d('2022-01-28'), d('2022-02-25'), d('2022-03-25'), d('2022-04-29'), d('2022-05-27'),
        d('2022-06-24'), d('2022-07-29'), d('2022-08-26'), d('2022-09-30'), d('2022-10-28'),
        d('2022-11-25'), d('2022-12-30'),
      ]);
    });
  });

  describe('last:weekday', () => {
    it('returns a transaction for every last weekday of the month between start and end', () => {
      const transaction = { recurring: 'last:weekday', _id: '123' };
      const start = d('2022-01-01');
      const end = endOfPreviousDay(d('2023-01-01'));
      const result = getPendingTransactionsFromRecurring(transaction, end, start);
      expect(result.map((r) => r.date)).toEqual([
        d('2022-01-31'), d('2022-02-28'), d('2022-03-31'), d('2022-04-29'), d('2022-05-31'),
        d('2022-06-30'), d('2022-07-29'), d('2022-08-31'), d('2022-09-30'), d('2022-10-31'),
        d('2022-11-30'), d('2022-12-30'),
      ]);
    });
  });

  describe('last:working', () => {
    it('returns a transaction for every last working day of the month between start and end', () => {
      const transaction = { recurring: 'last:working', _id: '123' };
      const start = d('2021-01-01');
      const end = endOfPreviousDay(d('2022-01-01'));
      const result = getPendingTransactionsFromRecurring(transaction, end, start);
      expect(result.map((r) => r.date)).toEqual([
        d('2021-01-29'), d('2021-02-26'), d('2021-03-31'), d('2021-04-30'), d('2021-05-28'), // d('2021-05-31') is a monday but is bank holiday
        d('2021-06-30'), d('2021-07-30'), d('2021-08-31'), d('2021-09-30'), d('2021-10-29'),
        d('2021-11-30'), d('2021-12-31'),
      ]);
    });
  });

  describe('2:weeks:2022-01-01 where reference is between start and end', () => {
    it('returns one transaction every 2 weeks between start and end (using the reference point to decide days)', () => {
      const transaction = { recurring: '2:weeks:2022-01-01', _id: '123' };
      const start = d('2021-11-06');
      const end = endOfPreviousDay(d('2022-04-30'));
      const result = getPendingTransactionsFromRecurring(transaction, end, start);
      expect(result.map((r) => r.date)).toEqual([
        d('2021-11-06'), d('2021-11-20'),
        d('2021-12-04'), d('2021-12-18'),
        d('2022-01-01'),
        d('2022-01-15'), d('2022-01-29'), d('2022-02-12'), d('2022-02-26'), d('2022-03-12'),
        d('2022-03-26'), d('2022-04-09'), d('2022-04-23'),
      ]);
    });
  });
  
  describe('2:weeks:2021-11-20 where reference < start', () => {
    it('returns one transaction every 2 weeks between start and end (using the reference point to decide days)', () => {
      const transaction = { recurring: '2:weeks:2021-11-20', _id: '123' };
      const start = d('2021-12-29');
      const end = endOfPreviousDay(d('2022-05-05'));
      const result = getPendingTransactionsFromRecurring(transaction, end, start);
      expect(result.map((r) => r.date)).toEqual([
        d('2022-01-01'),
        d('2022-01-15'), d('2022-01-29'), d('2022-02-12'), d('2022-02-26'), d('2022-03-12'),
        d('2022-03-26'), d('2022-04-09'), d('2022-04-23'),
      ]);
    });
  });
  
  describe('2:weeks:2022-01-01 where reference === start', () => {
    it('returns one transaction every 2 weeks between start and end (using the reference point to decide days)', () => {
      const transaction = { recurring: '2:weeks:2022-01-01', _id: '123' };
      const start = d('2022-01-01');
      const end = endOfPreviousDay(d('2022-04-30'));
      const result = getPendingTransactionsFromRecurring(transaction, end, start);
      expect(result.map((r) => r.date)).toEqual([
        d('2022-01-01'),
        d('2022-01-15'), d('2022-01-29'), d('2022-02-12'), d('2022-02-26'), d('2022-03-12'),
        d('2022-03-26'), d('2022-04-09'), d('2022-04-23'),
      ]);
    });
  });

  describe('2:weeks:2022-08-27 where reference > end', () => {
    it('returns one transaction every 2 weeks between start and end (using the reference point to decide days)', () => {
      const transaction = { recurring: '2:weeks:2022-08-27', _id: '123' };
      const start = d('2022-01-01');
      const end = endOfPreviousDay(d('2022-04-30'));
      const result = getPendingTransactionsFromRecurring(transaction, end, start);
      expect(result.map((r) => r.date)).toEqual([
        d('2022-01-01'),
        d('2022-01-15'), d('2022-01-29'), d('2022-02-12'), d('2022-02-26'), d('2022-03-12'),
        d('2022-03-26'), d('2022-04-09'), d('2022-04-23'),
      ]);
    });
  });

  describe('2:weeks:2022-04-23 where reference === end', () => {
    it('returns one transaction every 2 weeks between start and end (using the reference point to decide days)', () => {
      const transaction = { recurring: '2:weeks:2022-04-23', _id: '123' };
      const start = d('2022-01-01');
      const end = endOfPreviousDay(d('2022-04-30'));
      const result = getPendingTransactionsFromRecurring(transaction, end, start);
      expect(result.map((r) => r.date)).toEqual([
        d('2022-01-01'),
        d('2022-01-15'), d('2022-01-29'), d('2022-02-12'), d('2022-02-26'), d('2022-03-12'),
        d('2022-03-26'), d('2022-04-09'), d('2022-04-23'),
      ]);
    });
  });


});