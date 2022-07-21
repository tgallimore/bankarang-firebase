const startOfDay = require('date-fns/startOfDay');
const lastDayOfMonth = require('date-fns/lastDayOfMonth');
const startOfMonth = require('date-fns/startOfMonth');
const endOfYesterday = require('date-fns/endOfYesterday');
const endOfMonth = require('date-fns/endOfMonth');
const previousFriday = require('date-fns/previousFriday');
const nextMonday = require('date-fns/nextMonday');
const addDays = require('date-fns/addDays');
const addMonths = require('date-fns/addMonths');
const isWeekend = require('date-fns/isWeekend');
const isEqual = require('date-fns/isEqual');
const endOfDay = require('date-fns/endOfDay');
const isLastDayOfMonth = require('date-fns/isLastDayOfMonth');
const formatDate = require('date-fns/format');
const isMonday = require('date-fns/isMonday');
const isTuesday = require('date-fns/isTuesday');
const isWednesday = require('date-fns/isWednesday');
const isThursday = require('date-fns/isThursday');
const isFriday = require('date-fns/isFriday');
const isSaturday = require('date-fns/isSaturday');
const isSunday = require('date-fns/isSunday');
const bankHolidays = require('./bank-holidays.json');

const isNamedDays = {
  Monday: isMonday,
  Tuesday: isTuesday,
  Wednesday: isWednesday,
  Thursday: isThursday,
  Friday: isFriday,
  Saturday: isSaturday,
  Sunday: isSunday,
};

const getAllDaysInMonth = (day) => {
  const month = day.getMonth() + 1;
  const year = day.getFullYear();
  return Array.from(
    { length: new Date(year, month, 0).getDate() },
    (_, i) => new Date(year, month - 1, i + 1)
  );
}

const forEachDayBetween = (from, to, cb) => {
  const start = new Date(from);
  const end = new Date(to);
  start.setDate(start.getDate() + 1);
  for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
    cb(d);
  }
}

const isNthDay = (day, n) => {
  return String(day.getDate()) === n;
}

const isLastWeekday = (day) => {
  const lastDay = lastDayOfMonth(day);
  const lastWeekDay = isWeekend(lastDay) ? previousFriday(lastDay) : lastDay;
  return isEqual(startOfDay(day), startOfDay(lastWeekDay));
}

const isNthWeekday = (day, n) => {
  const firstDay = startOfMonth(day);
  const firstWeekday = isWeekend(firstDay) ? nextMonday(firstDay) : firstDay;
  const nthWeekday = addDays(firstWeekday, n - 1);
  return isEqual(startOfDay(day), startOfDay(nthWeekday));
}

const isBankHoliday = (day) => {
  // TODO this might not include bank holidays
  // during daylight saving, because it will be like
  // yyyy-mm-ddT23:00:00
  // but will be the day before at 23:00
  // use date-fns format instead
  // const dayString = day.toISOString().split('T')[0];
  const dayString = formatDate(day, 'yyyy-MM-dd');
  return bankHolidays.find(({date: holiday}) => holiday === dayString);
}

const previousWeekDay = (day) => {
  const weekDay = new Date(day);
  weekDay.setDate(weekDay.getDate() - 1);
  while (isWeekend(weekDay)) {
    weekDay.setDate(weekDay.getDate() - 1)
  }
  return weekDay;
}

const nextWeekDay = (day) => {
  const weekDay = new Date(day);
  weekDay.setDate(weekDay.getDate() + 1);
  while (isWeekend(weekDay)) {
    weekDay.setDate(weekDay.getDate() + 1);
  }
  return weekDay;
}

const lastWeekDay = (day) => {
  const lastDay = lastDayOfMonth(day);
  const lastWeekDay = isWeekend(lastDay) ? previousFriday(lastDay) : lastDay;
  return lastWeekDay;
}

const previousWorkingDay = (day) => {
  const workingDay = new Date(day);
  workingDay.setDate(workingDay.getDate() - 1);
  while (isWeekend(workingDay) || isBankHoliday(workingDay)) {
    workingDay.setDate(workingDay.getDate() - 1);
  }
  return workingDay;
}

const nextWorkingDay = (day) => {
  const workingDay = new Date(day);
  workingDay.setDate(workingDay.getDate() + 1);
  while (isWeekend(workingDay) || isBankHoliday(workingDay)) {
    workingDay.setDate(workingDay.getDate() + 1);
  }
  return workingDay;
}

const isLastWorkingDay = (day) => {
  const lastDay = lastDayOfMonth(day);
  const lastWorkingDay = (isWeekend(lastDay) || isBankHoliday(lastDay)) ? previousWorkingDay(lastDay) : lastDay;
  return isEqual(startOfDay(day), startOfDay(lastWorkingDay));
}

const lastWorkingDay = (day) => {
  const lastDay = lastDayOfMonth(day);
  const lastWorkingDay = (isWeekend(lastDay) || isBankHoliday(lastDay)) ? previousWorkingDay(lastDay) : lastDay;
  return lastWorkingDay;
}

const isNthWorkingDay = (day, n) => {
  const workingDays = getAllDaysInMonth(day).filter((d) => !isWeekend(d) && !isBankHoliday(d));
  return isEqual(startOfDay(day), startOfDay(workingDays[n - 1]));
}

const isNamedDay = (day, dayName) => {
  return isNamedDays[dayName](day);
  // Don't use below because its well slow
  // return day.toLocaleString('en-gb', { weekday:'long' }).toLowerCase() === dayName.toLowerCase();
}

const isLastNamedDay = (day, dayName) => {
  const lastDay = lastDayOfMonth(day);
  const lastNamedDay = !isNamedDay(lastDay, dayName) ? previousNamedDay(lastDay, dayName) : lastDay;
  return isEqual(startOfDay(day), startOfDay(lastNamedDay));
}

const nextNamedDay = (day, dayName) => {
  const namedDay = new Date(day);
  namedDay.setDate(namedDay.getDate() + 1);
  while (!isNamedDay(namedDay, dayName)) {
    namedDay.setDate(namedDay.getDate() + 1);
  }
  return namedDay;
}

const previousNamedDay = (day, dayName) => {
  const namedDay = new Date(day);
  namedDay.setDate(namedDay.getDate() - 1);
  while (!isNamedDay(namedDay, dayName)) {
    namedDay.setDate(namedDay.getDate() - 1);
  }
  return namedDay;
}

const lastNamedDay = (day, dayName) => {
  const lastDay = lastDayOfMonth(day);
  const lastNamedDay = !isNamedDay(lastDay, dayName) ? previousNamedDay(lastDay, dayName) : lastDay;
  return lastNamedDay;
}

const previousLastNamedDay = (day, dayName) => {
  let previousLastNamedDay = previousNamedDay(day, dayName);
  previousLastNamedDay.setDate(previousLastNamedDay.getDate() - 1);
  while (!isLastNamedDay(previousLastNamedDay, dayName)) {
    previousLastNamedDay.setDate(previousLastNamedDay.getDate() - 1);
  }
  return previousLastNamedDay;
}

const nextLastNamedDay = (day, dayName) => {
  let nextLastNamedDay = nextNamedDay(day, dayName);
  nextLastNamedDay.setDate(nextLastNamedDay.getDate() + 1);
  while (!isLastNamedDay(nextLastNamedDay, dayName)) {
    nextLastNamedDay.setDate(nextLastNamedDay.getDate() + 1);
  }
  return nextLastNamedDay;
}

const isNthNamedDay = (day, n, dayName) => {
  const namedDays = getAllDaysInMonth(day).filter((d) => isNamedDay(d, dayName));
  return isEqual(startOfDay(day), startOfDay(namedDays[n - 1]));
}

const previousNthDay = (day, n) => {
  const nthDay = new Date(day);
  nthDay.setDate(nthDay.getDate() - 1);
  while (String(nthDay.getDate()) !== n) {
    nthDay.setDate(nthDay.getDate() - 1);
  }
  return nthDay;
}

const nextNthDay = (day, n) => {
  const nthDay = new Date(day);
  nthDay.setDate(nthDay.getDate() + 1);
  while (String(nthDay.getDate()) !== n) {
    nthDay.setDate(nthDay.getDate() + 1);
  }
  return nthDay;
}

const previousLastDay = (day) => {
  const nthDay = new Date(day);
  nthDay.setDate(nthDay.getDate() - 1);
  while (!isLastDayOfMonth(nthDay)) {
    nthDay.setDate(nthDay.getDate() - 1);
  }
  return nthDay;
};

const previousNthNamedDay = (day, n, dayName) => {
  const nthDay = new Date(day);
  nthDay.setDate(nthDay.getDate() - 1);
  while (!isNthNamedDay(nthDay, n, dayName)) {
    nthDay.setDate(nthDay.getDate() - 1);
  }
  return nthDay;
};

const nextNthNamedDay = (day, n, dayName) => {
  const nthDay = new Date(day);
  nthDay.setDate(nthDay.getDate() + 1);
  while (!isNthNamedDay(nthDay, n, dayName)) {
    nthDay.setDate(nthDay.getDate() + 1);
  }
  return nthDay;
};

const previousNthWeekday = (day, n) => {
  const nthDay = new Date(day);
  nthDay.setDate(nthDay.getDate() - 1);
  while (!isNthWeekday(nthDay, n)) {
    nthDay.setDate(nthDay.getDate() - 1);
  }
  return nthDay;
};

const nextNthWeekday = (day, n) => {
  const nthDay = new Date(day);
  nthDay.setDate(nthDay.getDate() + 1);
  while (!isNthWeekday(nthDay, n)) {
    nthDay.setDate(nthDay.getDate() + 1);
  }
  return nthDay;
};

const previousLastWeekday = (day) => {
  const nthDay = new Date(day);
  nthDay.setDate(nthDay.getDate() - 1);
  while (!isLastWeekday(nthDay)) {
    nthDay.setDate(nthDay.getDate() - 1);
  }
  return nthDay;
};

const nextLastWeekday = (day) => {
  const nthDay = new Date(day);
  nthDay.setDate(nthDay.getDate() + 1);
  while (!isLastWeekday(nthDay)) {
    nthDay.setDate(nthDay.getDate() + 1);
  }
  return nthDay;
};

const previousLastWorkingDay = (day) => {
  const nthDay = new Date(day);
  nthDay.setDate(nthDay.getDate() - 1);
  while (!isLastWorkingDay(nthDay)) {
    nthDay.setDate(nthDay.getDate() - 1);
  }
  return nthDay;
};

const nextLastWorkingDay = (day) => {
  const nthDay = new Date(day);
  nthDay.setDate(nthDay.getDate() + 1);
  while (!isLastWorkingDay(nthDay)) {
    nthDay.setDate(nthDay.getDate() + 1);
  }
  return nthDay;
};

const previousNthWorkingDay = (day, n) => {
  const nthDay = new Date(day);
  nthDay.setDate(nthDay.getDate() - 1);
  while (!isNthWorkingDay(nthDay, n)) {
    nthDay.setDate(nthDay.getDate() - 1);
  }
  return nthDay;
};

const nextNthWorkingDay = (day, n) => {
  const nthDay = new Date(day);
  nthDay.setDate(nthDay.getDate() + 1);
  while (!isNthWorkingDay(nthDay, n)) {
    nthDay.setDate(nthDay.getDate() + 1);
  }
  return nthDay;
};

const endOfPreviousDay = (day) => {
  return endOfDay(addDays(day, -1));
}

/**
Formats:
day (every day) INVALID
Monday (every monday)
Wednesday (every wednesday)
weekday (every weekday) INVALID
working (every working day) INVALID
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
**/
const getDateRangeFromSettingAndReference = (setting, reference) => {
  const [part1, part2] = setting.split(':');

  // part1 must be a day of the week (Monday)
  if (!part2) {
    if (isNamedDay(reference, part1)) {
      return [
        startOfDay(reference),
        endOfPreviousDay(nextNamedDay(reference, part1))
      ]
    }
    return [
      previousNamedDay(reference, part1),
      endOfPreviousDay(nextNamedDay(reference, part1))
    ]
  }

  if (part2 === 'day') {
    if (part1 === 'last') {
      if (isLastDayOfMonth(reference)) {
        return [
          startOfDay(reference),
          endOfPreviousDay(lastDayOfMonth(addDays(reference, 1)))
        ]
      }
      return [
        previousLastDay(reference),
        endOfPreviousDay(lastDayOfMonth(reference))
      ];
    }
    if (isNthDay(reference, part1)) {
      return [
        startOfDay(reference),
        endOfPreviousDay(nextNthDay(reference, part1))
      ]
    }
    return [
      previousNthDay(reference, part1),
      endOfPreviousDay(nextNthDay(reference, part1))
    ]
  }

  if (part2 === 'weekday') {
    if (part1 === 'last') {
      if (isLastWeekday(reference)) {
        return [
          startOfDay(reference),
          endOfPreviousDay(nextLastWeekday(reference))
        ]
      }
      return [
        previousLastWeekday(reference),
        endOfPreviousDay(nextLastWeekday(reference))
      ]
    }
    if (!['1', '2', '3'].includes(part1)) {
      throw new Error('Only first, second or third named days allowed.');
    }
    if (isNthWeekday(reference, part1)) {
      return [
        startOfDay(reference),
        endOfPreviousDay(nextNthWeekday(reference, part1))
      ]
    }
    return [
      previousNthWeekday(reference, part1),
      endOfPreviousDay(nextNthWeekday(reference, part1))
    ]
  }

  if (part2 === 'working') {
    if (part1 === 'last') {
      if (isLastWorkingDay(reference)) {
        return [
          startOfDay(reference),
          endOfPreviousDay(nextLastWorkingDay(reference))
        ]
      }
      return [
        previousLastWorkingDay(reference),
        endOfPreviousDay(nextLastWorkingDay(reference))
      ]
    }
    if (!['1', '2', '3'].includes(part1)) {
      throw new Error('Only first, second or third named days allowed.');
    }
    if (isNthWorkingDay(reference, part1)) {
      return [
        startOfDay(reference),
        endOfPreviousDay(nextNthWorkingDay(reference, part1))
      ]
    }
    return [
      previousNthWorkingDay(reference, part1),
      endOfPreviousDay(nextNthWorkingDay(reference, part1))
    ]
  }

  // part2 must be day of week (Monday)
  if (part1 === 'last') {
    if (isLastNamedDay(reference, part2)) {
      return [
        startOfDay(reference),
        endOfPreviousDay(nextLastNamedDay(reference, part2))
      ]
    }
    return [
      previousLastNamedDay(reference, part2),
      endOfPreviousDay(nextLastNamedDay(reference, part2)),
    ]
  }
  if (!['1', '2', '3'].includes(part1)) {
    throw new Error('Only first, second or third named days allowed.');
  }
  if (isNthNamedDay(reference, part1, part2)) {
    return [
      startOfDay(reference),
      endOfPreviousDay(nextNthNamedDay(reference, part1, part2))
    ]
  }
  return [
    previousNthNamedDay(reference, part1, part2),
    endOfPreviousDay(nextNthNamedDay(reference, part1, part2)),
  ]
};

module.exports = {
  getAllDaysInMonth,
  forEachDayBetween,
  isNthDay,
  isLastWeekday,
  isNthWeekday,
  isBankHoliday,
  previousWeekDay,
  nextWeekDay,
  lastWeekDay,
  previousWorkingDay,
  nextWorkingDay,
  isLastWorkingDay,
  lastWorkingDay,
  isNthWorkingDay,
  isNamedDay,
  previousNamedDay,
  previousLastNamedDay,
  nextLastNamedDay,
  nextNamedDay,
  isLastNamedDay,
  lastNamedDay,
  isNthNamedDay,
  previousNthDay,
  nextNthDay,
  previousLastDay,
  endOfPreviousDay,
  getDateRangeFromSettingAndReference,
  previousNthNamedDay,
  nextNthNamedDay,
  previousNthWeekday,
  nextNthWeekday,
  previousLastWeekday,
  nextLastWeekday,
  previousLastWorkingDay,
  nextLastWorkingDay,
  previousNthWorkingDay,
  nextNthWorkingDay
}