import { Link } from "react-router";
import { useMemo } from "react";
import { useExamSchedules } from "../context/ExamScheduleContext";
import { useSubjects } from "../context/SubjectContext";
import { findMatchingSubjectForEntry } from "../utils/examSchedulePdfUtils";
import { getSubjectColorValue } from "../utils/subjectColorUtils";

function getDaysUntil(dateValue) {
  if (!dateValue) {
    return Number.POSITIVE_INFINITY;
  }

  const examDate = new Date(`${dateValue}T00:00:00`);
  const today = new Date();

  today.setHours(0, 0, 0, 0);

  if (Number.isNaN(examDate.getTime())) {
    return Number.POSITIVE_INFINITY;
  }

  return Math.round((examDate - today) / (1000 * 60 * 60 * 24));
}

function formatExamDate(dateValue) {
  if (!dateValue) {
    return "Datum nije unet";
  }

  const date = new Date(`${dateValue}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return dateValue;
  }

  return new Intl.DateTimeFormat("sr-RS", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
}

function getCountdownLabel(daysUntil) {
  if (daysUntil === 0) {
    return "Danas";
  }

  if (daysUntil === 1) {
    return "Sutra";
  }

  if (daysUntil > 1) {
    return `Za ${daysUntil} dana`;
  }

  return "Termin je prošao";
}

function NextExamCountdown() {
  const { schedules } = useExamSchedules();
  const { subjects } = useSubjects();

  const nextExam = useMemo(() => {
    const allEntries = schedules.flatMap((schedule) =>
      (schedule.entries || []).map((entry) => ({
        ...entry,
        scheduleTitle: schedule.title,
      })),
    );

    return allEntries
      .filter((entry) => getDaysUntil(entry.dateIso) >= 0)
      .sort(
        (firstEntry, secondEntry) =>
          getDaysUntil(firstEntry.dateIso) - getDaysUntil(secondEntry.dateIso),
      )[0];
  }, [schedules]);

  if (!nextExam) {
    return (
      <section className="next-exam-countdown next-exam-empty">
        <div className="next-exam-icon">
          <i className="bi bi-calendar-plus"></i>
        </div>

        <div className="next-exam-content">
          <p className="page-eyebrow">SLEDEĆI ISPIT</p>
          <h2>Nema unetih narednih ispita</h2>
          <p>Uvezi PDF raspored ispita da bi EduFlow prikazao odbrojavanje.</p>
        </div>

        <Link to="/pdf-import" className="outline-button">
          Uvezi raspored
          <i className="bi bi-arrow-right"></i>
        </Link>
      </section>
    );
  }

  const daysUntil = getDaysUntil(nextExam.dateIso);

  const manuallyLinkedSubject = subjects.find(
    (subject) => Number(subject.id) === Number(nextExam.subjectId),
  );

  const linkedSubject =
    manuallyLinkedSubject ||
    findMatchingSubjectForEntry(subjects, nextExam);

  const subjectColor = linkedSubject
    ? getSubjectColorValue(linkedSubject.color)
    : "#86efac";

  return (
    <section
      className="next-exam-countdown"
      style={{
        "--exam-color": subjectColor,
      }}
    >
      <div className="next-exam-icon">
        <i className="bi bi-mortarboard-fill"></i>
      </div>

      <div className="next-exam-content">
        <p className="page-eyebrow">SLEDEĆI ISPIT</p>

        <h2>{nextExam.subjectName}</h2>

        <div className="next-exam-meta">
          <span>
            <i className="bi bi-calendar3"></i>
            {formatExamDate(nextExam.dateIso)}
          </span>

          {nextExam.time && (
            <span>
              <i className="bi bi-clock"></i>
              {nextExam.time}
            </span>
          )}

          {nextExam.rooms && (
            <span>
              <i className="bi bi-geo-alt"></i>
              {nextExam.rooms}
            </span>
          )}
        </div>

        <small>
          {linkedSubject
            ? `${linkedSubject.code} · ${linkedSubject.name}`
            : nextExam.scheduleTitle}
        </small>
      </div>

      <div className="next-exam-count">
        <strong>{daysUntil}</strong>
        <span>{daysUntil === 1 ? "dan" : "dana"}</span>
        <small>{getCountdownLabel(daysUntil)}</small>
      </div>

      <Link to="/calendar" className="next-exam-link">
        Kalendar
        <i className="bi bi-arrow-right"></i>
      </Link>
    </section>
  );
}

export default NextExamCountdown;