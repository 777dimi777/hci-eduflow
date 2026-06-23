import { useMemo, useState } from "react";
import { Link } from "react-router";
import { useDailyPlan } from "../context/DailyPlanContext";
import { useSubjects } from "../context/SubjectContext";
import { useTasks } from "../context/TaskContext";
import { formatDate } from "../utils/dateUtils";
import { getSubjectColorValue } from "../utils/subjectColorUtils";
import { useToast } from "../context/ToastContext";
const priorityScore = {
  high: 3,
  medium: 2,
  low: 1,
};

function getDaysUntil(dateValue) {
  if (!dateValue) {
    return 999;
  }

  const taskDate = new Date(`${dateValue}T00:00:00`);
  const today = new Date();

  today.setHours(0, 0, 0, 0);

  if (Number.isNaN(taskDate.getTime())) {
    return 999;
  }

  return Math.round((taskDate - today) / (1000 * 60 * 60 * 24));
}

function getUrgencyScore(task) {
  const daysUntil = getDaysUntil(task.dueDate);
  const priority = priorityScore[task.priority] || 1;

  if (daysUntil < 0) {
    return 1000 + Math.abs(daysUntil) * 10 + priority;
  }

  if (daysUntil === 0) {
    return 900 + priority;
  }

  if (daysUntil === 1) {
    return 800 + priority;
  }

  if (daysUntil <= 3) {
    return 700 - daysUntil * 10 + priority;
  }

  return 400 - Math.min(daysUntil, 100) + priority;
}

function getUrgencyLabel(task) {
  const daysUntil = getDaysUntil(task.dueDate);

  if (daysUntil < 0) {
    return `Rok je prošao pre ${Math.abs(daysUntil)} dana`;
  }

  if (daysUntil === 0) {
    return "Rok je danas";
  }

  if (daysUntil === 1) {
    return "Rok je sutra";
  }

  if (daysUntil <= 3) {
    return `Rok je za ${daysUntil} dana`;
  }

  return `Rok: ${formatDate(task.dueDate)}`;
}

function getRecommendationMessage(task) {
  const daysUntil = getDaysUntil(task.dueDate);

  if (daysUntil < 0) {
    return "Ova obaveza je već prekoračena i treba da joj daš prioritet.";
  }

  if (daysUntil === 0) {
    return "Ovo je rok za danas. Dodaj ga odmah u dnevni fokus.";
  }

  if (daysUntil === 1) {
    return "Rok je sutra, zato je dobro da danas završiš glavni deo posla.";
  }

  if (task.priority === "high") {
    return "Ima visok prioritet i blizak rok, zato je među glavnim preporukama.";
  }

  return "Dobra je prilika da unapred završiš ovu obavezu i rasteretiš naredne dane.";
}

function SmartStudyAssistant() {
  const { subjects } = useSubjects();
  const { tasks } = useTasks();

const { todayKey, getPlanTaskIds, addTaskToPlan } = useDailyPlan();

  const [feedback, setFeedback] = useState("");
  const { showToast } = useToast();
  const subjectMap = useMemo(() => {
    return new Map(subjects.map((subject) => [subject.id, subject]));
  }, [subjects]);

  const plannedTaskIds = getPlanTaskIds(todayKey) || [];

  const activeTasks = useMemo(() => {
    return tasks.filter((task) => task.status !== "done");
  }, [tasks]);

  const recommendations = useMemo(() => {
    return activeTasks
      .filter((task) => !plannedTaskIds.includes(task.id))
      .sort(
        (firstTask, secondTask) =>
          getUrgencyScore(secondTask) - getUrgencyScore(firstTask),
      )
      .slice(0, 3);
  }, [activeTasks, plannedTaskIds]);

  const overdueTasks = useMemo(() => {
    return activeTasks.filter((task) => getDaysUntil(task.dueDate) < 0);
  }, [activeTasks]);

  const busiestSubject = useMemo(() => {
    const subjectWorkload = subjects
      .map((subject) => {
        const subjectTasks = activeTasks.filter(
          (task) => Number(task.subjectId) === Number(subject.id),
        );

        return {
          ...subject,
          activeTaskCount: subjectTasks.length,
        };
      })
      .sort(
        (firstSubject, secondSubject) =>
          secondSubject.activeTaskCount - firstSubject.activeTaskCount,
      );

    return subjectWorkload[0] || null;
  }, [subjects, activeTasks]);

  function getSubject(task) {
    return subjectMap.get(Number(task.subjectId));
  }

  function getSubjectLabel(task) {
    const subject = getSubject(task);

    if (!subject) {
      return task.taskType === "exam"
        ? "Ispit iz rasporeda"
        : "Nepovezana obaveza";
    }

    return `${subject.code} — ${subject.name}`;
  }

  function getTaskColor(task) {
    const subject = getSubject(task);

    return subject ? getSubjectColorValue(subject.color) : "#64748b";
  }

  function handleAddToFocus(task) {
    const result = addTaskToPlan(todayKey, task.id);

    if (result.added) {
      const message = result.warning
        ? `„${task.title}“ je dodat u fokus. Sada imaš ${result.count} obaveza — plan je prilično opterećen.`
        : `„${task.title}“ je dodat u današnji fokus.`;

      setFeedback(message);

      showToast({
        message,
        type: result.warning ? "warning" : "success",
      });

      return;
    }

    if (result.reason === "exists") {
      const message = "Ta obaveza je već u današnjem fokusu.";

      setFeedback(message);

      showToast({
        message,
        type: "info",
      });
    }
  }

  return (
    <section className="smart-study-assistant">
      <div className="smart-study-heading">
        <div>
          <p className="page-eyebrow">PAMETNI ASISTENT</p>
          <h2>Šta je najbolje da radiš danas?</h2>
          <p>
            EduFlow rangira obaveze prema roku, prioritetu i trenutnom
            opterećenju.
          </p>
        </div>

        <Link to="/tasks" className="outline-button">
          Sve obaveze
          <i className="bi bi-arrow-right"></i>
        </Link>
      </div>

      {feedback && (
        <p className="smart-study-feedback" aria-live="polite">
          <i className="bi bi-check-circle-fill"></i>
          {feedback}
        </p>
      )}

      <div className="smart-study-layout">
        <section className="smart-study-recommendations">
          <div className="smart-study-section-heading">
            <div>
              <i className="bi bi-stars"></i>
              <h3>Preporučene obaveze</h3>
            </div>

            <span>{recommendations.length}</span>
          </div>

          {recommendations.length > 0 ? (
            <div className="smart-study-task-list">
              {recommendations.map((task, index) => (
                <article
                  className="smart-study-task"
                  key={task.id}
                  style={{
                    "--subject-color": getTaskColor(task),
                  }}
                >
                  <span className="smart-study-rank">{index + 1}</span>

                  <div className="smart-study-task-main">
                    <span className="smart-study-subject">
                      <span></span>
                      {getSubjectLabel(task)}
                    </span>

                    <strong>{task.title}</strong>

                    <small>{getRecommendationMessage(task)}</small>
                  </div>

                  <div className="smart-study-task-side">
                    <span
                      className={[
                        "smart-study-urgency",
                        getDaysUntil(task.dueDate) < 0
                          ? "smart-study-urgency-overdue"
                          : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      <i className="bi bi-calendar3"></i>
                      {getUrgencyLabel(task)}
                    </span>

                    <button
                      type="button"
                      className="smart-study-add-button"
                      onClick={() => handleAddToFocus(task)}
                    >
                      <i className="bi bi-plus-lg"></i>
                      Fokus
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="smart-study-empty">
              <i className="bi bi-check2-all"></i>
              <h3>Sve aktivne obaveze su već u dnevnom fokusu</h3>
              <p>Završi planirane obaveze ili dodaj novu obavezu u planer.</p>
            </div>
          )}
        </section>

        <aside className="smart-study-side-column">
          <section
            className={[
              "smart-study-alert-card",
              overdueTasks.length > 0
                ? "smart-study-alert-danger"
                : "smart-study-alert-success",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <div className="smart-study-alert-icon">
              <i
                className={`bi ${
                  overdueTasks.length > 0
                    ? "bi-exclamation-triangle-fill"
                    : "bi-check-circle-fill"
                }`}
              ></i>
            </div>

            {overdueTasks.length > 0 ? (
              <>
                <p className="page-eyebrow">UPOZORENJE</p>
                <h3>Imaš prekoračene rokove</h3>
                <p>
                  Trenutno imaš <strong>{overdueTasks.length}</strong>{" "}
                  {overdueTasks.length === 1
                    ? "obavezu kojoj je prošao rok"
                    : "obaveze kojima je prošao rok"}
                  .
                </p>

                <Link to="/tasks">
                  Pregledaj obaveze
                  <i className="bi bi-arrow-right"></i>
                </Link>
              </>
            ) : (
              <>
                <p className="page-eyebrow">STATUS ROKOVA</p>
                <h3>Svi rokovi su pod kontrolom</h3>
                <p>
                  Nema prekoračenih obaveza. Nastavi po dnevnom planu i završi
                  najbliže rokove.
                </p>
              </>
            )}
          </section>

          <section className="smart-study-subject-card">
            <div className="smart-study-subject-icon">
              <i className="bi bi-bullseye"></i>
            </div>

            <p className="page-eyebrow">PREDMET ZA FOKUS</p>

            {busiestSubject && busiestSubject.activeTaskCount > 0 ? (
              <>
                <h3>{busiestSubject.name}</h3>
                <p>
                  Ima najviše otvorenih obaveza:{" "}
                  <strong>{busiestSubject.activeTaskCount}</strong>.
                </p>

                <span
                  style={{
                    "--subject-color": getSubjectColorValue(
                      busiestSubject.color,
                    ),
                  }}
                >
                  <i></i>
                  {busiestSubject.code} · {busiestSubject.ects} ESPB
                </span>
              </>
            ) : (
              <>
                <h3>Nema izraženog prioriteta</h3>
                <p>
                  Dodaj obaveze uz predmete da EduFlow može bolje da preporuči
                  fokus.
                </p>
              </>
            )}
          </section>
        </aside>
      </div>
    </section>
  );
}

export default SmartStudyAssistant;
