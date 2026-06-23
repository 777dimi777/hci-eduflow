import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { useTasks } from "../context/TaskContext";
import { useToast } from "../context/ToastContext";
import { toDateKey } from "../utils/dateUtils";

const STORAGE_KEY = "eduflow-focus-timer";
const DEFAULT_DURATION = 25;

function getTodayKey() {
  return toDateKey(new Date());
}

function createInitialTimer() {
  return {
    savedDate: getTodayKey(),
    durationMinutes: DEFAULT_DURATION,
    remainingSeconds: DEFAULT_DURATION * 60,
    selectedTaskId: "",
    sessionsCompleted: 0,
  };
}

function loadTimer() {
  const fallback = createInitialTimer();
  const savedTimer = localStorage.getItem(STORAGE_KEY);

  if (!savedTimer) {
    return fallback;
  }

  try {
    const parsedTimer = JSON.parse(savedTimer);

    if (parsedTimer.savedDate !== fallback.savedDate) {
      return fallback;
    }

    const durationMinutes = [25, 45, 60].includes(
      Number(parsedTimer.durationMinutes),
    )
      ? Number(parsedTimer.durationMinutes)
      : DEFAULT_DURATION;

    const remainingSeconds = Math.max(
      0,
      Math.min(
        Number(parsedTimer.remainingSeconds) || durationMinutes * 60,
        durationMinutes * 60,
      ),
    );

    return {
      savedDate: fallback.savedDate,
      durationMinutes,
      remainingSeconds,
      selectedTaskId: parsedTimer.selectedTaskId || "",
      sessionsCompleted: Math.max(0, Number(parsedTimer.sessionsCompleted) || 0),
    };
  } catch {
    return fallback;
  }
}

function formatTimer(seconds) {
  const minutes = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");

  const remainingSeconds = (seconds % 60).toString().padStart(2, "0");

  return `${minutes}:${remainingSeconds}`;
}

function FocusTimerPanel() {
  const { tasks } = useTasks();
  const { showToast } = useToast();

  const [timer, setTimer] = useState(loadTimer);
  const [isRunning, setIsRunning] = useState(false);

  const activeTasks = useMemo(() => {
    return tasks
      .filter((task) => task.status !== "done")
      .sort((firstTask, secondTask) =>
        firstTask.dueDate.localeCompare(secondTask.dueDate),
      );
  }, [tasks]);

  const activeTask = activeTasks.find(
    (task) => String(task.id) === String(timer.selectedTaskId),
  );

  const progress = Math.min(
    100,
    Math.max(
      0,
      ((timer.durationMinutes * 60 - timer.remainingSeconds) /
        (timer.durationMinutes * 60)) *
        100,
    ),
  );

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...timer,
        savedDate: getTodayKey(),
      }),
    );
  }, [timer]);

  useEffect(() => {
    if (!isRunning) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setTimer((previousTimer) => ({
        ...previousTimer,
        remainingSeconds: Math.max(previousTimer.remainingSeconds - 1, 0),
      }));
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [isRunning]);

  useEffect(() => {
    if (timer.remainingSeconds !== 0 || !isRunning) {
      return;
    }

    setIsRunning(false);

    setTimer((previousTimer) => ({
      ...previousTimer,
      sessionsCompleted: previousTimer.sessionsCompleted + 1,
    }));

    showToast({
      message: activeTask
        ? `Fokus sesija za „${activeTask.title}“ je završena.`
        : "Fokus sesija je završena. Odmori nekoliko minuta.",
      type: "success",
      duration: 6000,
    });
  }, [timer.remainingSeconds, isRunning, activeTask, showToast]);

  function handleStartPause() {
    if (timer.remainingSeconds === 0) {
      setTimer((previousTimer) => ({
        ...previousTimer,
        remainingSeconds: previousTimer.durationMinutes * 60,
      }));
    }

    setIsRunning((previousValue) => !previousValue);
  }

  function handleReset() {
    setIsRunning(false);

    setTimer((previousTimer) => ({
      ...previousTimer,
      remainingSeconds: previousTimer.durationMinutes * 60,
    }));

    showToast({
      message: "Fokus tajmer je vraćen na početak.",
      type: "info",
    });
  }

  function handleDurationChange(durationMinutes) {
    setIsRunning(false);

    setTimer((previousTimer) => ({
      ...previousTimer,
      durationMinutes,
      remainingSeconds: durationMinutes * 60,
    }));
  }

  function handleTaskChange(event) {
    setTimer((previousTimer) => ({
      ...previousTimer,
      selectedTaskId: event.target.value,
    }));
  }

  return (
    <section className="focus-timer-panel">
      <div className="focus-timer-heading">
        <div>
          <p className="page-eyebrow">FOKUS SESIJA</p>
          <h2>Uči bez prekida</h2>
          <p>Izaberi obavezu, pokreni tajmer i radi samo na jednom koraku.</p>
        </div>

        <div className="focus-timer-session-count">
          <strong>{timer.sessionsCompleted}</strong>
          <span>današnjih sesija</span>
        </div>
      </div>

      <div className="focus-timer-layout">
        <div className="focus-timer-main">
          <div
            className="focus-timer-circle"
            style={{
              "--timer-progress": `${progress}%`,
            }}
          >
            <div>
              <span>{isRunning ? "FOKUS U TOKU" : "SPREMAN ZA RAD"}</span>
              <strong>{formatTimer(timer.remainingSeconds)}</strong>
              <small>{timer.durationMinutes} minuta</small>
            </div>
          </div>

          <div className="focus-timer-controls">
            <button
              type="button"
              className="focus-timer-primary-button"
              onClick={handleStartPause}
            >
              <i className={`bi ${isRunning ? "bi-pause-fill" : "bi-play-fill"}`}></i>
              {isRunning ? "Pauziraj" : "Pokreni fokus"}
            </button>

            <button
              type="button"
              className="focus-timer-reset-button"
              onClick={handleReset}
              title="Vrati tajmer na početak"
            >
              <i className="bi bi-arrow-counterclockwise"></i>
            </button>
          </div>
        </div>

        <div className="focus-timer-settings">
          <div className="focus-timer-setting-group">
            <span>Trajanje sesije</span>

            <div className="focus-timer-duration-options">
              {[25, 45, 60].map((duration) => (
                <button
                  type="button"
                  key={duration}
                  className={
                    timer.durationMinutes === duration
                      ? "focus-timer-duration-active"
                      : ""
                  }
                  onClick={() => handleDurationChange(duration)}
                >
                  {duration} min
                </button>
              ))}
            </div>
          </div>

          <label className="focus-timer-task-select">
            <span>Na čemu radiš?</span>

            <select
              value={timer.selectedTaskId}
              onChange={handleTaskChange}
            >
              <option value="">Opšti fokus / učenje</option>

              {activeTasks.map((task) => (
                <option key={task.id} value={task.id}>
                  {task.title}
                </option>
              ))}
            </select>
          </label>

          <div className="focus-timer-task-preview">
            <i className="bi bi-bullseye"></i>

            <div>
              <span>AKTIVNI FOKUS</span>
              <strong>
                {activeTask ? activeTask.title : "Izaberi obavezu ili uči opšte gradivo"}
              </strong>
            </div>
          </div>

          <Link to="/tasks" className="focus-timer-tasks-link">
            Upravljaj obavezama
            <i className="bi bi-arrow-right"></i>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default FocusTimerPanel;