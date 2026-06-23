import { useEffect, useMemo, useState } from "react";
import { useDailyPlan } from "../context/DailyPlanContext";
import { useFocusHistory } from "../context/FocusHistoryContext";
import { useTasks } from "../context/TaskContext";
import { useToast } from "../context/ToastContext";
import { toDateKey } from "../utils/dateUtils";

const STORAGE_PREFIX = "eduflow-daily-reflection-";

const moodOptions = [
  {
    value: "great",
    label: "Odlično",
    icon: "bi-emoji-laughing",
  },
  {
    value: "good",
    label: "Dobro",
    icon: "bi-emoji-smile",
  },
  {
    value: "neutral",
    label: "Onako",
    icon: "bi-emoji-neutral",
  },
  {
    value: "hard",
    label: "Teško",
    icon: "bi-emoji-frown",
  },
];

function createEmptyReflection(dateKey) {
  return {
    dateKey,
    mood: "",
    note: "",
    updatedAt: "",
  };
}

function loadReflection(dateKey) {
  const savedReflection = localStorage.getItem(`${STORAGE_PREFIX}${dateKey}`);

  if (!savedReflection) {
    return createEmptyReflection(dateKey);
  }

  try {
    const parsedReflection = JSON.parse(savedReflection);

    return {
      dateKey,
      mood: parsedReflection.mood || "",
      note: parsedReflection.note || "",
      updatedAt: parsedReflection.updatedAt || "",
    };
  } catch {
    return createEmptyReflection(dateKey);
  }
}

function DailyReflectionPanel() {
  const { tasks } = useTasks();
  const { showToast } = useToast();
  const { focusHistory } = useFocusHistory();

  const {
    todayKey,
    getCompletedTaskEntries,
  } = useDailyPlan();

  const [reflection, setReflection] = useState(() =>
    loadReflection(todayKey),
  );

  useEffect(() => {
    if (reflection.dateKey === todayKey) {
      return;
    }

    setReflection(loadReflection(todayKey));
  }, [todayKey, reflection.dateKey]);

  const completedTasks = useMemo(() => {
    const completedIds = getCompletedTaskEntries(todayKey).map(
      (entry) => entry.taskId,
    );

    return completedIds
      .map((taskId) =>
        tasks.find((task) => String(task.id) === String(taskId)),
      )
      .filter(Boolean);
  }, [tasks, todayKey, getCompletedTaskEntries]);

  const focusMinutes = useMemo(() => {
    return focusHistory
      .filter((session) => {
        const sessionDate = new Date(session.date);

        return (
          !Number.isNaN(sessionDate.getTime()) &&
          toDateKey(sessionDate) === todayKey
        );
      })
      .reduce(
        (sum, session) => sum + (Number(session.durationMinutes) || 0),
        0,
      );
  }, [focusHistory, todayKey]);

  const focusSessions = useMemo(() => {
    return focusHistory.filter((session) => {
      const sessionDate = new Date(session.date);

      return (
        !Number.isNaN(sessionDate.getTime()) &&
        toDateKey(sessionDate) === todayKey
      );
    }).length;
  }, [focusHistory, todayKey]);

  function handleMoodChange(mood) {
    setReflection((previousReflection) => ({
      ...previousReflection,
      mood,
    }));
  }

  function handleNoteChange(event) {
    setReflection((previousReflection) => ({
      ...previousReflection,
      note: event.target.value,
    }));
  }

  function handleSave() {
    const updatedReflection = {
      ...reflection,
      dateKey: todayKey,
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(
      `${STORAGE_PREFIX}${todayKey}`,
      JSON.stringify(updatedReflection),
    );

    setReflection(updatedReflection);

    showToast({
      message: "Dnevni osvrt je sačuvan.",
      type: "success",
    });
  }

  return (
    <section className="daily-reflection-panel">
      <div className="daily-reflection-heading">
        <div>
          <p className="page-eyebrow">DNEVNI OSVRT</p>
          <h2>Kako je prošlo učenje danas?</h2>
          <p>
            Kratko zabeleži utisak dok je dan još svež — sutra ćeš lakše
            prilagoditi plan.
          </p>
        </div>

        <div className="daily-reflection-date">
          <i className="bi bi-calendar-check"></i>
          Danas
        </div>
      </div>

      <div className="daily-reflection-summary">
        <article>
          <i className="bi bi-check2-circle"></i>

          <div>
            <strong>{completedTasks.length}</strong>
            <span>
              {completedTasks.length === 1
                ? "završena obaveza"
                : "završene obaveze"}
            </span>
          </div>
        </article>

        <article>
          <i className="bi bi-stopwatch"></i>

          <div>
            <strong>{focusMinutes}</strong>
            <span>minuta fokusa</span>
          </div>
        </article>

        <article>
          <i className="bi bi-lightning-charge"></i>

          <div>
            <strong>{focusSessions}</strong>
            <span>
              {focusSessions === 1 ? "fokus sesija" : "fokus sesije"}
            </span>
          </div>
        </article>
      </div>

      {completedTasks.length > 0 && (
        <div className="daily-reflection-completed-tasks">
          <span>ZAVRŠENO DANAS</span>

          <div>
            {completedTasks.slice(0, 4).map((task) => (
              <small key={task.id}>
                <i className="bi bi-check-lg"></i>
                {task.title}
              </small>
            ))}
          </div>
        </div>
      )}

      <div className="daily-reflection-body">
        <div className="daily-reflection-moods">
          <span>Kako se osećaš nakon današnjeg rada?</span>

          <div>
            {moodOptions.map((mood) => (
              <button
                type="button"
                key={mood.value}
                className={
                  reflection.mood === mood.value
                    ? "daily-reflection-mood-active"
                    : ""
                }
                onClick={() => handleMoodChange(mood.value)}
                aria-pressed={reflection.mood === mood.value}
              >
                <i className={`bi ${mood.icon}`}></i>
                {mood.label}
              </button>
            ))}
          </div>
        </div>

        <label className="daily-reflection-note">
          <span>Šta je danas išlo dobro, a šta želiš sutra da popraviš?</span>

          <textarea
            value={reflection.note}
            onChange={handleNoteChange}
            placeholder="Na primer: Završio sam zadatak iz PP, ali sutra moram ranije da krenem sa HCI materijalom..."
            maxLength={500}
          />

          <small>{reflection.note.length}/500</small>
        </label>

        <button
          type="button"
          className="daily-reflection-save-button"
          onClick={handleSave}
        >
          <i className="bi bi-check2-circle"></i>
          Sačuvaj osvrt
        </button>
      </div>
    </section>
  );
}

export default DailyReflectionPanel;