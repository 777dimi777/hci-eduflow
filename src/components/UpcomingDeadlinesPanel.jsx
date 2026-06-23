import { useMemo, useState } from "react";
import { Link } from "react-router";
import { useDailyPlan } from "../context/DailyPlanContext";
import { useSubjects } from "../context/SubjectContext";
import { useTasks } from "../context/TaskContext";
import { useToast } from "../context/ToastContext";
import { formatDate } from "../utils/dateUtils";
import { getSubjectColorValue } from "../utils/subjectColorUtils";

function getDaysUntil(dateValue) {
  if (!dateValue) {
    return Number.POSITIVE_INFINITY;
  }

  const deadline = new Date(`${dateValue}T00:00:00`);
  const today = new Date();

  today.setHours(0, 0, 0, 0);

  if (Number.isNaN(deadline.getTime())) {
    return Number.POSITIVE_INFINITY;
  }

  return Math.round((deadline - today) / (1000 * 60 * 60 * 24));
}

function getDeadlineLabel(daysUntil, dueDate) {
  if (!Number.isFinite(daysUntil)) {
    return "Nema roka";
  }

  if (daysUntil < 0) {
    return `Kasni ${Math.abs(daysUntil)} dana`;
  }

  if (daysUntil === 0) {
    return "Rok je danas";
  }

  if (daysUntil === 1) {
    return "Rok je sutra";
  }

  if (daysUntil <= 7) {
    return `Rok je za ${daysUntil} dana`;
  }

  return formatDate(dueDate);
}

function UpcomingDeadlinesPanel() {
  const { tasks, updateTaskStatus } = useTasks();
  const { subjects } = useSubjects();
  const { todayKey, getPlanTaskIds, addTaskToPlan } = useDailyPlan();
  const { showToast } = useToast();

  const [activeFilter, setActiveFilter] = useState("all");

  const subjectMap = useMemo(() => {
    return new Map(subjects.map((subject) => [Number(subject.id), subject]));
  }, [subjects]);

  const plannedTaskIds = getPlanTaskIds(todayKey) || [];

  const activeTasks = useMemo(() => {
    return tasks
      .filter((task) => task.status !== "done")
      .sort((firstTask, secondTask) => {
        return getDaysUntil(firstTask.dueDate) - getDaysUntil(secondTask.dueDate);
      });
  }, [tasks]);

  const filterCounts = useMemo(() => {
    return {
      all: activeTasks.length,
      overdue: activeTasks.filter((task) => getDaysUntil(task.dueDate) < 0)
        .length,
      today: activeTasks.filter((task) => getDaysUntil(task.dueDate) === 0)
        .length,
      week: activeTasks.filter((task) => {
        const daysUntil = getDaysUntil(task.dueDate);
        return daysUntil >= 0 && daysUntil <= 7;
      }).length,
    };
  }, [activeTasks]);

  const visibleTasks = useMemo(() => {
    const filteredTasks = activeTasks.filter((task) => {
      const daysUntil = getDaysUntil(task.dueDate);

      if (activeFilter === "overdue") {
        return daysUntil < 0;
      }

      if (activeFilter === "today") {
        return daysUntil === 0;
      }

      if (activeFilter === "week") {
        return daysUntil >= 0 && daysUntil <= 7;
      }

      return true;
    });

    return filteredTasks.slice(0, 8);
  }, [activeTasks, activeFilter]);

  function getTaskSubject(task) {
    return subjectMap.get(Number(task.subjectId));
  }

  function getTaskColor(task) {
    const subject = getTaskSubject(task);

    return subject ? getSubjectColorValue(subject.color) : "#64748b";
  }

  function getSubjectLabel(task) {
    const subject = getTaskSubject(task);

    if (!subject) {
      return task.taskType === "exam"
        ? "Ispit iz rasporeda"
        : "Nepovezana obaveza";
    }

    return `${subject.code} — ${subject.name}`;
  }

  function isTaskInFocus(taskId) {
    return plannedTaskIds.some(
      (plannedTaskId) => String(plannedTaskId) === String(taskId),
    );
  }

  function handleAddToFocus(task) {
    const result = addTaskToPlan(todayKey, task.id);

    if (result.added) {
      showToast({
        message: result.warning
          ? `„${task.title}“ je dodat. Dnevni fokus sada ima ${result.count} obaveza.`
          : `„${task.title}“ je dodat u današnji fokus.`,
        type: result.warning ? "warning" : "success",
      });

      return;
    }

    showToast({
      message: "Ta obaveza je već u današnjem fokusu.",
      type: "info",
    });
  }

  function handleCompleteTask(task) {
    updateTaskStatus(task.id, "done");

    showToast({
      message: `„${task.title}“ je označen kao završen.`,
      type: "success",
    });
  }

  return (
    <section className="deadline-timeline-panel">
      <div className="deadline-timeline-heading">
        <div>
          <p className="page-eyebrow">PREGLED ROKOVA</p>
          <h2>Šta te čeka narednih dana?</h2>
          <p>Filtriraj aktivne obaveze i odmah reaguj na najvažnije rokove.</p>
        </div>

        <Link to="/tasks" className="outline-button">
          Sve obaveze
          <i className="bi bi-arrow-right"></i>
        </Link>
      </div>

      <div className="deadline-timeline-filters">
        <button
          type="button"
          className={activeFilter === "all" ? "deadline-filter-active" : ""}
          onClick={() => setActiveFilter("all")}
        >
          Sve
          <span>{filterCounts.all}</span>
        </button>

        <button
          type="button"
          className={
            activeFilter === "overdue" ? "deadline-filter-active" : ""
          }
          onClick={() => setActiveFilter("overdue")}
        >
          Kasni
          <span>{filterCounts.overdue}</span>
        </button>

        <button
          type="button"
          className={
            activeFilter === "today" ? "deadline-filter-active" : ""
          }
          onClick={() => setActiveFilter("today")}
        >
          Danas
          <span>{filterCounts.today}</span>
        </button>

        <button
          type="button"
          className={activeFilter === "week" ? "deadline-filter-active" : ""}
          onClick={() => setActiveFilter("week")}
        >
          7 dana
          <span>{filterCounts.week}</span>
        </button>
      </div>

      {visibleTasks.length > 0 ? (
        <div className="deadline-timeline-list">
          {visibleTasks.map((task) => {
            const daysUntil = getDaysUntil(task.dueDate);
            const inFocus = isTaskInFocus(task.id);

            return (
              <article
                className={[
                  "deadline-timeline-item",
                  daysUntil < 0 ? "deadline-timeline-overdue" : "",
                  daysUntil === 0 ? "deadline-timeline-today" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                key={task.id}
                style={{
                  "--subject-color": getTaskColor(task),
                }}
              >
                <span className="deadline-timeline-line"></span>

                <div className="deadline-timeline-date">
                  <strong>
                    {Number.isFinite(daysUntil)
                      ? task.dueDate.slice(8, 10)
                      : "—"}
                  </strong>
                  <span>
                    {Number.isFinite(daysUntil)
                      ? task.dueDate.slice(5, 7)
                      : "rok"}
                  </span>
                </div>

                <div className="deadline-timeline-main">
                  <span className="deadline-timeline-subject">
                    <i></i>
                    {getSubjectLabel(task)}
                  </span>

                  <strong>{task.title}</strong>

                  {task.notes && <small>{task.notes}</small>}
                </div>

                <div className="deadline-timeline-status">
                  <span
                    className={
                      daysUntil < 0
                        ? "deadline-status-overdue"
                        : daysUntil === 0
                          ? "deadline-status-today"
                          : ""
                    }
                  >
                    <i className="bi bi-calendar3"></i>
                    {getDeadlineLabel(daysUntil, task.dueDate)}
                  </span>

                  <div>
                    <button
                      type="button"
                      className="deadline-focus-button"
                      onClick={() => handleAddToFocus(task)}
                      disabled={inFocus}
                    >
                      <i
                        className={`bi ${
                          inFocus ? "bi-check2" : "bi-plus-lg"
                        }`}
                      ></i>
                      {inFocus ? "U fokusu" : "Fokus"}
                    </button>

                    <button
                      type="button"
                      className="deadline-complete-button"
                      onClick={() => handleCompleteTask(task)}
                      title="Označi kao završeno"
                      aria-label={`Označi kao završeno: ${task.title}`}
                    >
                      <i className="bi bi-check-lg"></i>
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="deadline-timeline-empty">
          <i className="bi bi-calendar-check"></i>
          <h3>Nema obaveza za izabrani pregled</h3>
          <p>Promeni filter ili dodaj novu obavezu u planer.</p>
        </div>
      )}
    </section>
  );
}

export default UpcomingDeadlinesPanel;