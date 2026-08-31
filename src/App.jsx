import { useMemo, useState } from "react";
import {
  MONTH_NAMES, DAY_NAMES, toKey, fromKey, sameDay,
  getDailyHolidays, getSpanHolidays, getBirthdays,
} from "./lib/dates.js";
import "./styles.css";

export default function HolidayOfTheDay() {
  const today = useMemo(() => {
    const n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), n.getDate());
  }, []);
  const [selected, setSelected] = useState(toKey(today));

  const date = fromKey(selected);
  const isToday = sameDay(date, today);
  const daily = getDailyHolidays(date);
  const spans = getSpanHolidays(date);
  const births = getBirthdays(date);

  return (
    <div className="hd-root">

      <div className="hd-shell">
        <p className="hd-eyebrow">Let's celebrate</p>

        <div className="hd-page">
          <p className="hd-dow">{DAY_NAMES[date.getDay()]}</p>
          <p className="hd-num">{date.getDate()}</p>
          <p className="hd-monthyear">{MONTH_NAMES[date.getMonth()]} {date.getFullYear()}</p>
          <div className="hd-perf" />
        </div>

        <div className="hd-controls">
          <input
            className="hd-date"
            type="date"
            value={selected}
            onChange={(e) => e.target.value && setSelected(e.target.value)}
            aria-label="Pick a date"
          />
          {!isToday && (
            <button className="hd-back" onClick={() => setSelected(toKey(today))}>
              Today's holidays
            </button>
          )}
        </div>

        <section className="hd-section">
          <h2 className="hd-h2">
            <span>{isToday ? "Today's holidays" : "Holidays on this day"}</span>
            <span className="hd-count">{daily.length}</span>
          </h2>
          {daily.length ? (
            <ul className="hd-list">
              {daily.map((h) => <li className="hd-item" key={h}><span>{h}</span></li>)}
            </ul>
          ) : (
            <p className="hd-empty">Nothing on the books. Make something up.</p>
          )}
        </section>

        <section className="hd-section">
          <h2 className="hd-h2">
            <span>{isToday ? "Today is part of" : "This day is part of"}</span>
            <span className="hd-count">{spans.length}</span>
          </h2>
          {spans.length ? (
            <ul className="hd-list">
              {spans.map((h) => (
                <li className="hd-item" key={h.name}>
                  <span>{h.name}</span>
                  <span className="hd-range">{h.range}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="hd-empty">No weekly or monthly observances.</p>
          )}
        </section>

        <section className="hd-section">
          <h2 className="hd-h2">
            <span>{isToday ? "Born today" : "Born on this day"}</span>
            <span className="hd-count">{births.length}</span>
          </h2>
          {births.length ? (
            <ul className="hd-list">
              {births.map((b) => (
                <li className="hd-item" key={b.name}>
                  <span>{b.name}</span>
                  <span className="hd-range">{b.year}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="hd-empty">No one on file. Somebody was born, though.</p>
          )}
        </section>

        <p className="hd-foot">Bundled dataset · no network required</p>
      </div>
    </div>
  );
}
