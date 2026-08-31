import { DAILY, MONTHLY, SPANS, FLOATING, EASTER_BASED } from "../data/holidays.js";
import { BIRTHDAYS } from "../data/birthdays.js";

/* ------------------------------------------------------------------
   DATE HELPERS
------------------------------------------------------------------- */

export const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
export const MONTH_ABBR = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function formatRange(start, end) {
  const a = `${MONTH_ABBR[start.getMonth()]} ${start.getDate()}`;
  if (start.getMonth() === end.getMonth()) return `${a}\u2013${end.getDate()}`;
  return `${a}\u2013${MONTH_ABBR[end.getMonth()]} ${end.getDate()}`;
}

export const toKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
export const fromKey = (s) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};
export const daysInMonth = (y, m) => new Date(y, m, 0).getDate();

export function nthWeekday(year, month, dow, nth) {
  const first = new Date(year, month - 1, 1);
  let day = 1 + ((dow - first.getDay() + 7) % 7) + (nth - 1) * 7;
  if (day > daysInMonth(year, month)) return null;
  return new Date(year, month - 1, day);
}

export function lastWeekday(year, month, dow) {
  const last = new Date(year, month, 0);
  const day = last.getDate() - ((last.getDay() - dow + 7) % 7);
  return new Date(year, month - 1, day);
}

export function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

/* First day of the nth week of a month that starts on `dow` and fits entirely
   inside the month — the standard reading of "first full week of May". */
export function nthFullWeekStart(year, month, dow, nth) {
  const first = new Date(year, month - 1, 1);
  let day = 1 + ((dow - first.getDay() + 7) % 7);
  if (day + 6 > daysInMonth(year, month)) day += 7;
  day += (nth - 1) * 7;
  if (day + 6 > daysInMonth(year, month)) return null;
  return new Date(year, month - 1, day);
}

export function lastFullWeekStart(year, month, dow) {
  let start = null;
  for (let n = 1; n <= 5; n++) {
    const candidate = nthFullWeekStart(year, month, dow, n);
    if (!candidate) break;
    start = candidate;
  }
  return start;
}

/* Anonymous Gregorian algorithm */
export function easterSunday(year) {
  const a = year % 19, b = Math.floor(year / 100), c = year % 100;
  const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

export const sameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

/* ------------------------------------------------------------------
   LOOKUP
------------------------------------------------------------------- */

export function getDailyHolidays(date) {
  const y = date.getFullYear(), m = date.getMonth() + 1, d = date.getDate();
  const out = [...(DAILY[`${m}-${d}`] || [])];

  for (const f of FLOATING) {
    let hit = null;
    if (f.type === "nth") hit = nthWeekday(y, f.m, f.dow, f.nth);
    if (f.type === "last") hit = lastWeekday(y, f.m, f.dow);
    if (f.type === "offset") {
      const base = nthWeekday(y, f.from.m, f.from.dow, f.from.nth);
      hit = base ? addDays(base, f.days) : null;
    }
    if (hit && sameDay(hit, date)) out.push(f.name);
  }

  const easter = easterSunday(y);
  for (const e of EASTER_BASED) {
    if (sameDay(addDays(easter, e.offset), date)) out.push(e.name);
  }

  if (d === 13 && date.getDay() === 5) out.push("Friday the 13th");

  return [...new Set(out)];
}

export function getSpanHolidays(date) {
  const y = date.getFullYear(), m = date.getMonth() + 1, d = date.getDate();
  const out = (MONTHLY[m] || []).map((name) => ({ name, range: "All month" }));

  for (const s of SPANS) {
    if (s.type === "range") {
      if (s.m === m && d >= s.from && d <= s.to) {
        out.push({
          name: s.name,
          range: formatRange(new Date(y, s.m - 1, s.from), new Date(y, s.m - 1, s.to)),
        });
      }
      continue;
    }
    let start = null;
    if (s.type === "week") start = nthFullWeekStart(y, s.m, s.dow, s.nth);
    if (s.type === "lastWeek") start = lastFullWeekStart(y, s.m, s.dow);
    if (s.type === "weekOf") {
      const anchor = new Date(y, s.m - 1, s.day);
      start = addDays(anchor, -((anchor.getDay() - s.dow + 7) % 7));
    }
    if (!start) continue;
    const end = addDays(start, 6);
    if (date >= start && date <= end) out.push({ name: s.name, range: formatRange(start, end) });
  }

  const seen = new Set();
  return out.filter((h) => (seen.has(h.name) ? false : seen.add(h.name)));
}

export function getBirthdays(date) {
  const key = `${date.getMonth() + 1}-${date.getDate()}`;
  return [...(BIRTHDAYS[key] || [])]
    .sort((a, b) => a[1] - b[1])
    .map(([name, year]) => ({ name, year }));
}
