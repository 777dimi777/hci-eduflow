import { useMemo } from "react";
import { Link } from "react-router";
import { useDailyPlan } from "../context/DailyPlanContext";
import { useTasks } from "../context/TaskContext";
import { formatDate } from "../utils/dateUtils";

function getDaysUntil(dateValue) {
  if (!dateValue) {
    return 999;
  }

  const taskDate = new Date(`${dateValue}T00:00:00`);
  const today = new Date();

  today.setHours(0, 0, 0, 0);

  return Math.round((taskDate - today) / (1000 * 60 * 60 * 24));
}

function DailyLoadInsight() {
  const { tasks } = useTasks();

  const {
    todayKey,
    getPlanTaskIds,
    maxDailyTasks,
  } = useDailyPlan();

  const insight = useMemo(() => {
    const plannedTaskIds = getPlanTaskIds(todayKey);

    const plannedTasks = plannedTaskIds
      .map((taskId) => tasks.find((task) => task.id === taskId))
      .filter(Boolean)
      .filter((task) => task.status !== "done")
      .sort((firstTask, secondTask) => {
        return getDaysUntil(firstTask.dueDate) - getDaysUntil(secondTask.dueDate);
      });

    const count = plannedTasks.length;

    const highPriorityCount = plannedTasks.filter(
      (task) => task.priority === "high",
    ).length;

    const urgentCount = plannedTasks.filter(
      (task) => getDaysUntil(task.dueDate) <= 1,
    ).length;

    if (count === 0) {
      return {
        count,
        level: "empty",
        icon: "bi-calendar-plus",
        title: "Dnevni fokus je prazan",
        message: "Dodaj jednu do tri važne obaveze i napravi realan plan za danas.",
        plannedTasks,
      };
    }

    if (count <= 3) {
      return {
        count,
        level: "light",
        icon: "bi-emoji-smile",
        title: "Lagano i fokusirano",
        message: "Plan je realan. Imaš dovoljno prostora da svaku obavezu uradiš kvalitetno.",
        plannedTasks,
      };
    }

    if (count <= maxDailyTasks) {
      return {
        count,
        level: "balanced",
        icon: "bi-check2-circle",
        title: "Dobar dnevni ritam",
        message: "Imaš pun, ali i dalje izvodljiv plan. Kreni od najbližeg roka.",
        plannedTasks,
      };
    }

    if (count <= maxDailyTasks + 2) {
      return {
        count,
        level: "warning",
        icon: "bi-exclamation-triangle",
        title: "Plan je prilično pun",
        message: `Imaš ${count} obaveza. Sve možeš da zadržiš, ali izaberi 2–3 glavne za današnji fokus.`,
        plannedTasks,
      };
    }

    return {
      count,
      level: "danger",
      icon: "bi-lightning-charge",
      title: "Preopterećen dnevni plan",
      message: `Imaš ${count} obaveza. Ne moraš da brišeš ništa, ali odredi prioritete da ne izgubiš fokus.`,
      plannedTasks,
    };
  }, [tasks, todayKey, getPlanTaskIds, maxDailyTasks]);

  return (
    <section className={`daily-load-insight daily-load-${insight.level}`}>
      <div className="daily-load-icon">
        <i className={`bi ${insight.icon}`}></i>
      </div>

      <div className="daily-load-content">
        <span className="daily-load-label">OPTEREĆENJE ZA DANAS</span>
        <h3>{insight.title}</h3>
        <p>{insight.message}</p>
      </div>

      <div className="daily-load-side">
        <strong>{insight.count}</strong>
        <span>obaveza</span>
      </div>

      {insight.plannedTasks.length > 0 && (
        <div className="daily-load-deadlines">
          {insight.plannedTasks.slice(0, 3).map((task) => (
            <span key={task.id}>
              <i className="bi bi-calendar3"></i>
              {task.title} · {formatDate(task.dueDate)}
            </span>
          ))}
        </div>
      )}

      <Link to="/tasks" className="daily-load-link">
        Upravljaj obavezama
        <i className="bi bi-arrow-right"></i>
      </Link>
    </section>
  );
}

export default DailyLoadInsight;