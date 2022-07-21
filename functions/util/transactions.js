const isWeekend = require('date-fns/isWeekend');
const isLastDayOfMonth = require('date-fns/isLastDayOfMonth');

const {
  forEachDayBetween,
  isLastWeekday,
  isNthWeekday,
  isBankHoliday,
  isLastWorkingDay,
  isNthWorkingDay,
  isNamedDay,
  isLastNamedDay,
  isNthNamedDay,
} = require('./date');

const createPendingTransaction = (transaction, date) => ({
  type: transaction.type,
  title: transaction.title,
  subtitle: transaction.subtitle,
  amount: transaction.amount,
  account: transaction.account,
  recurring: transaction.recurring,
  savingAccount: transaction.savingAccount,
  _id: transaction._id + `__${new Date(date).getTime()}`,
  date: new Date(date),
  lastPaid: transaction.date,
});

/**
Formats:
day (every day)
Monday (every monday)
Wednesday (every wednesday)
weekday (every weekday)
working (every working day)
1:day (first day of month)
3:day (third day of month)
last:day (last day of the month)
last:Friday (last friday of the month)
2:Tuesday (second tuesday of the month)
3:Tuesday (third tuesday of the month)
4:Tuesday (INVALID)
1:weekday (first weekday day of the month)
1:working (first working day of the month)
2:working (second working day of the month)
last:working (last working day of the month)
1:weeks:{starting} (INVALID)
2:weeks:{starting} (every two weeks starting on...)
3:weeks:{starting} (every three weeks starting on...)
4:weeks:{starting} (every four weeks starting on...)
5:weeks:{starting} (INVALID)
**/
const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const getPendingTransactionsFromRecurring = (transaction, endDate, startDate) => {
  const {recurring } = transaction;
  const [part1, part2] = recurring.split(':');
  const acc = [];

  if (part1 === 'day') {
    forEachDayBetween(startDate, endDate, (day) => {
      acc.push(createPendingTransaction(transaction, day));
    });
    return acc;
  }
  if (part1 === 'weekday') {
    forEachDayBetween(startDate, endDate, (day) => {
      if (!isWeekend(day)) {
        acc.push(createPendingTransaction(transaction, day));
      }
    });
    return acc;
  }
  if (part1 === 'working') {
    forEachDayBetween(startDate, endDate, (day) => {
      if (!isWeekend(day) && !isBankHoliday(day)) {
        acc.push(createPendingTransaction(transaction, day));
      }
    });
    return acc;
  }

  if (daysOfWeek.includes(part1)) {
    forEachDayBetween(startDate, endDate, (day) => {
      if (isNamedDay(day, part1)) {
        acc.push(createPendingTransaction(transaction, day));
      }
    });
    return acc;
  }

  if (!part2 || part2 === 'day') {
    forEachDayBetween(startDate, endDate, (day) => {
      if (part1 === 'last' && isLastDayOfMonth(day)) {
        acc.push(createPendingTransaction(transaction, day));
      }
      else if (String(day.getDate()) === part1) {
        acc.push(createPendingTransaction(transaction, day));
      }
    });
    return acc;
  }

  if (part2 === 'weekday') {
    forEachDayBetween(startDate, endDate, (day) => {
      if (part1 === 'last') {
        if (isLastWeekday(day)) {
          acc.push(createPendingTransaction(transaction, day));
        }
      } else {
        if (part1 !== '1') {
          throw new Error('Only first or last weekday is supported.');
        } else if (isNthWeekday(day, parseInt(part1))) {
          acc.push(createPendingTransaction(transaction, day));
        }
      }
    });
    return acc;
  }

  if (part2 === 'working') {
    forEachDayBetween(startDate, endDate, (day) => {
      if (part1 === 'last') {
        if (isLastWorkingDay(day)) {
          acc.push(createPendingTransaction(transaction, day));
        }
      } else {
        if (isNthWorkingDay(day, parseInt(part1))) {
          acc.push(createPendingTransaction(transaction, day));
        }
      }
    });
    return acc;
  }

  // part2 must be day of week (Monday)
  forEachDayBetween(startDate, endDate, (day) => {
    if (part1 === 'last') {
      if (isLastNamedDay(day, part2)) {
        acc.push(createPendingTransaction(transaction, day));
      }
    } else {
      if (!['1', '2', '3'].includes(part1)) {
        throw new Error('Only first, second or third named days allowed.');
      } else if (isNthNamedDay(day, parseInt(part1), part2)) {
        acc.push(createPendingTransaction(transaction, day));
      }
    }
  });

  return acc;
}

module.exports = {
  getPendingTransactionsFromRecurring
};
