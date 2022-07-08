const startOfDay = require('date-fns/startOfDay');
const lastDayOfMonth = require('date-fns/lastDayOfMonth');
const startOfMonth = require('date-fns/startOfMonth');
const previousFriday = require('date-fns/previousFriday');
const nextMonday = require('date-fns/nextMonday');
const addDays = require('date-fns/addDays');
const addMonths = require('date-fns/addMonths');
const isWeekend = require('date-fns/isWeekend');
const isEqual = require('date-fns/isEqual');
const endOfDay = require('date-fns/endOfDay');
const isLastDayOfMonth = require('date-fns/isLastDayOfMonth');
const bankHolidays = require('./bank-holidays.json');

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
  const dayString = day.toISOString().split('T')[0];
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
  while (isWeekend(weekDay)) {
    weekDay.setDate(weekDay.getDate() + 1)
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
  while (isWeekend(workingDay) || isBankHoliday(workingDay)) {
    workingDay.setDate(workingDay.getDate() - 1)
  }
  return workingDay;
}

const nextWorkingDay = (day) => {
  const workingDay = new Date(day);
  while (isWeekend(workingDay) || isBankHoliday(workingDay)) {
    workingDay.setDate(workingDay.getDate() + 1)
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
  return day.toLocaleString('en-gb', { weekday:'long' }).toLowerCase() === dayName.toLowerCase();
}

const isLastNamedDay = (day, dayName) => {
  const lastDay = lastDayOfMonth(day);
  const lastNamedDay = !isNamedDay(lastDay, dayName) ? previousNamedDay(lastDay, dayName) : lastDay;
  return isEqual(startOfDay(day), startOfDay(lastNamedDay));
}

const nextNamedDay = (day, dayName) => {
  const namedDay = new Date(day);
  while (!isNamedDay(namedDay, dayName)) {
    namedDay.setDate(namedDay.getDate() + 1);
  }
  return namedDay;
}

const previousNamedDay = (day, dayName) => {
  const namedDay = new Date(day);
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
  while (!isLastNamedDay(previousLastNamedDay, dayName)) {
    previousLastNamedDay.setDate(previousLastNamedDay.getDate() - 1)
  }
  return previousLastNamedDay;
}

const isNthNamedDay = (day, n, dayName) => {
  const namedDays = getAllDaysInMonth(day).filter((d) => isNamedDay(d, dayName));
  return isEqual(startOfDay(day), startOfDay(namedDays[n - 1]));
}

const previousNthDay = (day, n) => {
  const nthDay = new Date(day);
  while (String(nthDay.getDate()) !== n) {
    nthDay.setDate(nthDay.getDate() - 1)
  }
  return nthDay;
}

const nextNthDay = (day, n) => {
  const nthDay = new Date(day);
  while (String(nthDay.getDate()) !== n) {
    nthDay.setDate(nthDay.getDate() + 1)
  }
  return nthDay;
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
        endOfDay(addDays(reference, 7))
      ]
    }
    return [
      previousNamedDay(reference, part1),
      endOfDay(addDays(nextNamedDay(reference, part1), -1))
    ]
  }

  if (part2 === 'day') {
    if (part1 === 'last') {
      if (isLastDayOfMonth(reference)) {
        return [
          startOfDay(reference),
          endOfDay(addDays(lastDayOfMonth(addDays(reference, 1)), -1))
        ]
      }
      return [
        addDays(startOfMonth(reference), -1),
        endOfDay(addDays(lastDayOfMonth(reference), -1))
      ]
    }
    if (String(reference.getDate()) === part1) {
      return [
        startOfDay(reference),
        endOfDay(addDays(addMonths(reference, 1), -1))
      ]
    }
    return [
      previousNthDay(reference, part1),
      endOfDay(addDays(nextNthDay(reference, part1), -1))
    ]
  }

  if (part2 === 'weekday') {
    if (part1 === 'last') {
      if (isLastWeekday(reference)) {
        return [
          startOfDay(reference),
          endOfDay(addDays(lastDayOfMonth(addDays(reference, 7)), -1))
        ]
      }
      return [
        previousWeekDay(startOfMonth(reference)),
        endOfDay(addDays(lastWeekDay(reference), -1))
      ]
    }
  }

  if (part2 === 'working') {
    if (part1 === 'last') {
      if (isLastWorkingDay(reference)) {
        return [
          startOfDay(reference),
          endOfDay(addDays(lastWorkingDay(addDays(reference, 7)), -1))
        ]
      }
      return [
        previousWeekDay(startOfMonth(reference)),
        endOfDay(addDays(lastWeekDay(reference), -1))
      ]
    }
  }

  // part2 must be day of week (Monday)
  if (part1 === 'last') {
    if (isLastNamedDay(reference, part2)) {
      return [
        startOfDay(reference),
        endOfDay(addDays(lastNamedDay(addDays(reference, 7), part2), -1))
      ]
    }
    return [
      startOfDay(previousLastNamedDay(reference, part2)),
      endOfDay(addDays(lastNamedDay(addDays(previousLastNamedDay(reference, part2), 7), part2), -1))
    ]
  }

  // fallback returning reference as start 
  // and a month later as end
  return [
    startOfDay(reference),
    endOfDay(addDays(addMonths(reference), -1))
  ];
};

module.exports = {
  getAllDaysInMonth,
  forEachDayBetween,
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
  nextNamedDay,
  isLastNamedDay,
  lastNamedDay,
  isNthNamedDay,
  previousNthDay,
  nextNthDay,
  getDateRangeFromSettingAndReference
}