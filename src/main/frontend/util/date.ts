import * as dateFns from 'date-fns';

export function formatDateIso8601(dateParts: any) {
  const { year, month, day } = dateParts;
  const date = new Date(year, month, day);
  return dateFns.format(date, 'yyyy-MM-dd');
}

export function parseDateIso8601(inputValue: string) {
  const date = dateFns.parse(inputValue, 'yyyy-MM-dd', new Date());
  return { year: date.getFullYear(), month: date.getMonth(), day: date.getDate() };
}
export const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
