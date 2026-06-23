import { useMemo } from "react";
import { useFocusHistory } from "../context/FocusHistoryContext";
import { toDateKey } from "../utils/dateUtils";

const weekDayLabels = [
  "Ned",
  "Pon",
  "Uto",
  "Sre",
  "Čet",
  "Pet",
  "Sub",
];

function getDateBefore(daysBeforeToday) {
  const date = new Date();

  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - daysBeforeToday);

  return date;
}

function FocusConsistencyPanel() {
  const { focusHistory } = useFocusHistory();

  const statistics = useMemo(() => {
    const lastSevenDays = Array.from({ length: 7 }, (_, index) => {
      const date = getDateBefore(6 - index);

      return {
        date,
        key: toDateKey(date),
        label: weekDayLabels[date.getDay()],
        sessions: 0,
        minutes: 0,
      };
    });

    const dayMap = new Map(
      lastSevenDays.map((day) => [day.key, day]),
    );

    focusHistory.forEach((session) => {
      const sessionDate = new Date(session.date);

      if (Number.isNaN(sessionDate.getTime())) {
        return;
      }

      const dayKey = toDateKey(sessionDate);
      const matchingDay = dayMap.get(dayKey);

      if (!matchingDay) {
        return;
      }

      matchingDay.sessions += 1;
      matchingDay.minutes += Number(session.durationMinutes) || 0;
    });

    const totalSessions = lastSevenDays.reduce(
      (sum, day) => sum + day.sessions,
      0,
    );

    const totalMinutes = lastSevenDays.reduce(
      (sum, day) => sum + day.minutes,
      0,
    );

    const maxSessions = Math.max(
      ...lastSevenDays.map((day) => day.sessions),
      1,
    );

    let streak = 0;

    for (let index = 0; index < 60; index += 1) {
      const day = getDateBefore(index);
      const dayKey = toDateKey(day);

      const hasSession = focusHistory.some((session) => {
        const sessionDate = new Date(session.date);

        return (
          !Number.isNaN(sessionDate.getTime()) &&
          toDateKey(sessionDate) === dayKey
        );
      });

      if (!hasSession) {
        break;
      }

      streak += 1;
    }

    return {
      lastSevenDays,
      totalSessions,
      totalMinutes,
      maxSessions,
      streak,
    };
  }, [focusHistory]);

  return (
    <section className="focus-consistency-panel">
      <div className="focus-consistency-heading">
        <div>
          <p className="page-eyebrow">KONTINUITET UČENJA</p>
          <h2>Tvoj fokus ove nedelje</h2>
          <p>
            Prati ritam rada kroz završene fokus sesije i minute učenja.
          </p>
        </div>

        <div className="focus-consistency-streak">
          <i className="bi bi-fire"></i>

          <div>
            <strong>{statistics.streak}</strong>
            <span>
              {statistics.streak === 1 ? "dan u nizu" : "dana u nizu"}
            </span>
          </div>
        </div>
      </div>

      <div className="focus-consistency-summary">
        <article>
          <span>Fokus sesije</span>
          <strong>{statistics.totalSessions}</strong>
          <small>u poslednjih 7 dana</small>
        </article>

        <article>
          <span>Ukupno vremena</span>
          <strong>{statistics.totalMinutes}</strong>
          <small>minuta učenja</small>
        </article>

        <article>
          <span>Prosek po sesiji</span>
          <strong>
            {statistics.totalSessions > 0
              ? Math.round(
                  statistics.totalMinutes / statistics.totalSessions,
                )
              : 0}
          </strong>
          <small>minuta fokusa</small>
        </article>
      </div>

      <div className="focus-consistency-chart">
        {statistics.lastSevenDays.map((day) => {
          const height =
            day.sessions > 0
              ? Math.max(
                  18,
                  (day.sessions / statistics.maxSessions) * 100,
                )
              : 7;

          return (
            <article
              className={
                day.sessions > 0
                  ? "focus-consistency-day focus-consistency-day-active"
                  : "focus-consistency-day"
              }
              key={day.key}
            >
              <span className="focus-consistency-value">
                {day.sessions > 0 ? `${day.sessions} ses.` : "—"}
              </span>

              <div className="focus-consistency-bar-area">
                <span
                  className="focus-consistency-bar"
                  style={{
                    height: `${height}%`,
                  }}
                ></span>
              </div>

              <strong>{day.label}</strong>

              <small>
                {day.minutes > 0 ? `${day.minutes} min` : "Bez fokusa"}
              </small>
            </article>
          );
        })}
      </div>

      {statistics.totalSessions === 0 && (
        <p className="focus-consistency-empty-message">
          <i className="bi bi-lightbulb"></i>
          Pokreni prvu fokus sesiju iz Focus Timer panela i ovde će se pojaviti
          tvoj nedeljni ritam rada.
        </p>
      )}
    </section>
  );
}

export default FocusConsistencyPanel;