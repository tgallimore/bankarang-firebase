const startOfMonth = require('date-fns/startOfMonth');
const endOfMonth = require('date-fns/endOfMonth');
const addDays = require('date-fns/addDays');
const endOfDay = require('date-fns/endOfDay');
const format = require('date-fns/format');
const formatDistanceStrict = require('date-fns/formatDistanceStrict');
const startOfDay = require('date-fns/startOfDay');

const {
  getDateRangeFromSettingAndReference,
  previousNthDay,
  nextNthDay,
  previousLastDay,
  endOfPreviousDay,
  nextLastNamedDay,
  previousLastNamedDay,
  previousNthNamedDay,
  nextNthNamedDay,
  previousNthWeekday,
  nextNthWeekday,
  previousLastWeekday,
  nextLastWeekday,
  previousLastWorkingDay,
  nextLastWorkingDay,
  previousNthWorkingDay,
  nextNthWorkingDay,
  previousNamedDay,
  nextNamedDay,
  isNamedDay,
  isLastNamedDay,
  isNthDay,
  isNthNamedDay,
  isLastWeekday,
  isNthWeekday,
  isLastWorkingDay,
  isNthWorkingDay
} = require('../util/date');
const { isLastDayOfMonth, lastDayOfMonth } = require('date-fns');

const prettyDate = (date) => format(date, 'EEE do MMM yyyy HH:mm:ss');

describe('getDateRangeFromSettingAndReference()', () => {
  const daysOfTheWeek = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday'
  ];

  const referenceDates = [
    '2020-01-12',
    '2020-02-28',
    '2021-02-28',
    '2020-03-01',
    '2020-04-04',
    '2020-05-21',
    '2020-06-30',
    '2020-07-02',
    '2020-08-01',
    '2020-09-10',
    '2020-11-29',
    '2020-12-31',
  ];

  describe('Fixed day of the month', () => {
    const fixedDates = [
      '1','2','3','4','5','6','7','8','9','10',
      '11','12','13','14','15','16','17','18','19','20',
      '21','22','23','24','25','26','27','28','last'
    ];
  
    referenceDates.forEach((referenceDate) => {
      const day = new Date(referenceDate);

      fixedDates.forEach((fixedDate) => {
        const start = fixedDate === 'last'
          ? isLastDayOfMonth(day) ? startOfDay(day) : previousLastDay(day)
          : isNthDay(day, fixedDate) ? startOfDay(day) : previousNthDay(day, fixedDate);
  
        const end = fixedDate === 'last'
          ? isLastDayOfMonth(day) ? endOfPreviousDay(lastDayOfMonth(addDays(day, 1))) : endOfPreviousDay(endOfMonth(day))
          : endOfDay(addDays(nextNthDay(day, fixedDate), -1));

        describe(`on ${prettyDate(day)}`, () => {  
          it(`${fixedDate}:day returns [${prettyDate(start)}, ${prettyDate(end)}]`, () => {
            expect(getDateRangeFromSettingAndReference(`${fixedDate}:day`, day)).toEqual([start, end]);
          });
        });
      });
    });
  });

  describe('Variable day of the month', () => {
    const variableDates = [
      '1','2','3','last'
    ];
  
    referenceDates.forEach((referenceDate) => {
      const day = new Date(referenceDate);

      variableDates.forEach((variableDate) => {
        daysOfTheWeek.forEach((dayOfTheWeek) => {
          const start = variableDate === 'last'
            ? isLastNamedDay(day, dayOfTheWeek) ? startOfDay(day) : previousLastNamedDay(day, dayOfTheWeek)
            : isNthNamedDay(day, variableDate, dayOfTheWeek) ? startOfDay(day) : previousNthNamedDay(day, variableDate, dayOfTheWeek);

          const end = variableDate === 'last'
            ? endOfPreviousDay(nextLastNamedDay(day, dayOfTheWeek))
            : endOfPreviousDay(nextNthNamedDay(day, variableDate, dayOfTheWeek));

          describe(`on ${prettyDate(day)}`, () => {  
            it(`${variableDate}:${dayOfTheWeek} returns [${prettyDate(start)}, ${prettyDate(end)}]`, () => {
              expect(getDateRangeFromSettingAndReference(`${variableDate}:${dayOfTheWeek}`, day))
              .toEqual([start, end]);
            });
          });
        });

        describe(`on ${prettyDate(day)}`, () => {  
          const start = variableDate === 'last'
            ? isLastWeekday(day) ? startOfDay(day) : previousLastWeekday(day)
            : isNthWeekday(day, variableDate) ? startOfDay(day) : previousNthWeekday(day, variableDate);

          const end = variableDate === 'last'
            ? endOfPreviousDay(nextLastWeekday(day))
            : endOfPreviousDay(nextNthWeekday(day, variableDate));

          it(`${variableDate}:weekday returns [${prettyDate(start)}, ${prettyDate(end)}]`, () => {
            expect(getDateRangeFromSettingAndReference(`${variableDate}:weekday`, day))
              .toEqual([start, end]);
          });
        });

        describe(`on ${prettyDate(day)}`, () => {  
          const start = variableDate === 'last'
            ? isLastWorkingDay(day) ? startOfDay(day) : previousLastWorkingDay(day)
            : isNthWorkingDay(day, variableDate) ? startOfDay(day) : previousNthWorkingDay(day, variableDate);

          const end = variableDate === 'last'
            ? endOfPreviousDay(nextLastWorkingDay(day))
            : endOfPreviousDay(nextNthWorkingDay(day, variableDate));

          it(`${variableDate}:working returns [${prettyDate(start)}, ${prettyDate(end)}]`, () => {
            expect(getDateRangeFromSettingAndReference(`${variableDate}:working`, day))
              .toEqual([start, end]);
          });
        });
      });
    });
  });

  describe('Weekly', () => {
    referenceDates.forEach((referenceDate) => {
      const day = new Date(referenceDate);
      daysOfTheWeek.forEach((dayOfTheWeek) => {
        const start = isNamedDay(day, dayOfTheWeek) ? startOfDay(day) : previousNamedDay(day, dayOfTheWeek);
        const end = endOfPreviousDay(nextNamedDay(day, dayOfTheWeek));

        describe(`on ${prettyDate(day)}`, () => {  
          it(`${dayOfTheWeek} returns [${prettyDate(start)}, ${prettyDate(end)}]`, () => {
            expect(getDateRangeFromSettingAndReference(dayOfTheWeek, day))
            .toEqual([start, end]);
          });
        });
      });
    });
  });
});