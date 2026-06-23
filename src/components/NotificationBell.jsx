import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useExamSchedules } from "../context/ExamScheduleContext";
import { useSubjects } from "../context/SubjectContext";
import { useTasks } from "../context/TaskContext";

const STORAGE_KEY = "eduflow-read-notifications";

function loadReadNotificationIds() {
  try {
    const savedIds = JSON.parse(localStorage.getItem(STORAGE_KEY));

    return Array.isArray(savedIds) ? savedIds : [];
  } catch {
    return [];
  }
}

function getDaysUntil(dateValue) {
  if (!dateValue) {
    return Number.POSITIVE_INFINITY;
  }

  const date = new Date(`${dateValue}T00:00:00`);
  const today = new Date();

  today.setHours(0, 0, 0, 0);

  if (Number.isNaN(date.getTime())) {
    return Number.POSITIVE_INFINITY;
  }

  return Math.round((date - today) / (1000 * 60 * 60 * 24));
}

function NotificationBell() {
  const { tasks } = useTasks();
  const { subjects } = useSubjects();
  const { schedules } = useExamSchedules();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [readNotificationIds, setReadNotificationIds] = useState(
    loadReadNotificationIds,
  );

  const notificationRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(readNotificationIds),
    );
  }, [readNotificationIds]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    function handleOutsideClick(event) {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const subjectMap = useMemo(() => {
    return new Map(
      subjects.map((subject) => [Number(subject.id), subject]),
    );
  }, [subjects]);

  const notifications = useMemo(() => {
    const taskNotifications = tasks
      .filter((task) => task.status !== "done" && task.dueDate)
      .map((task) => {
        const daysUntil = getDaysUntil(task.dueDate);
        const subject = subjectMap.get(Number(task.subjectId));

        if (daysUntil > 1) {
          return null;
        }

        const subjectLabel = subject
          ? `${subject.code} — ${subject.name}`
          : "Obaveza";

        if (daysUntil < 0) {
          return {
            id: `task-${task.id}-overdue`,
            type: "danger",
            icon: "bi-exclamation-triangle-fill",
            title: "Rok je prošao",
            message: `„${task.title}“ kasni ${Math.abs(daysUntil)} dana.`,
            meta: subjectLabel,
            to: "/tasks",
            priority: 0,
          };
        }

        if (daysUntil === 0) {
          return {
            id: `task-${task.id}-today`,
            type: "warning",
            icon: "bi-calendar-x-fill",
            title: "Rok je danas",
            message: `Danas je rok za: „${task.title}“.`,
            meta: subjectLabel,
            to: "/tasks",
            priority: 1,
          };
        }

        return {
          id: `task-${task.id}-tomorrow`,
          type: "info",
          icon: "bi-calendar-event-fill",
          title: "Rok je sutra",
          message: `Sutra je rok za: „${task.title}“.`,
          meta: subjectLabel,
          to: "/tasks",
          priority: 2,
        };
      })
      .filter(Boolean);

    const examNotifications = schedules
      .flatMap((schedule) =>
        (schedule.entries || []).map((entry) => ({
          ...entry,
          scheduleId: schedule.id,
          scheduleTitle: schedule.title,
        })),
      )
      .map((entry) => {
        const daysUntil = getDaysUntil(entry.dateIso);

        if (daysUntil < 0 || daysUntil > 1) {
          return null;
        }

        const linkedSubject = subjectMap.get(Number(entry.subjectId));

        return {
          id: `exam-${entry.scheduleId}-${entry.id || entry.subjectName}-${daysUntil}`,
          type: daysUntil === 0 ? "warning" : "info",
          icon: "bi-mortarboard-fill",
          title: daysUntil === 0 ? "Ispit je danas" : "Ispit je sutra",
          message: `${entry.subjectName}${entry.time ? ` · ${entry.time}` : ""}`,
          meta: linkedSubject
            ? `${linkedSubject.code} — ${linkedSubject.name}`
            : entry.scheduleTitle,
          to: "/calendar",
          priority: daysUntil === 0 ? 1 : 2,
        };
      })
      .filter(Boolean);

    return [...taskNotifications, ...examNotifications].sort(
      (firstNotification, secondNotification) =>
        firstNotification.priority - secondNotification.priority,
    );
  }, [tasks, schedules, subjectMap]);

  const unreadNotifications = notifications.filter(
    (notification) => !readNotificationIds.includes(notification.id),
  );

  function markNotificationAsRead(notificationId) {
    setReadNotificationIds((previousIds) => [
      ...new Set([...previousIds, notificationId]),
    ]);
  }

  function handleNotificationClick(notification) {
    markNotificationAsRead(notification.id);
    setIsOpen(false);
    navigate(notification.to);
  }

  function handleMarkAllAsRead() {
    setReadNotificationIds((previousIds) => [
      ...new Set([
        ...previousIds,
        ...notifications.map((notification) => notification.id),
      ]),
    ]);
  }

  return (
    <div className="notification-menu-wrapper" ref={notificationRef}>
      <button
        type="button"
        className="topbar-icon-button notification-bell-button"
        onClick={() => setIsOpen((previousValue) => !previousValue)}
        aria-label="Otvori obaveštenja"
        aria-expanded={isOpen}
        title="Obaveštenja"
      >
        <i className="bi bi-bell"></i>

        {unreadNotifications.length > 0 && (
          <span className="notification-badge">
            {unreadNotifications.length > 9
              ? "9+"
              : unreadNotifications.length}
          </span>
        )}
      </button>

      {isOpen && (
        <section
          className="notifications-dropdown"
          role="dialog"
          aria-label="Obaveštenja"
        >
          <div className="notifications-dropdown-heading">
            <div>
              <p>OBAVEŠTENJA</p>
              <h3>Važni rokovi</h3>
            </div>

            {unreadNotifications.length > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
              >
                Označi sve kao pročitano
              </button>
            )}
          </div>

          {notifications.length > 0 ? (
            <div className="notifications-list">
              {notifications.slice(0, 8).map((notification) => {
                const isUnread = !readNotificationIds.includes(
                  notification.id,
                );

                return (
                  <button
                    type="button"
                    className={[
                      "notification-item",
                      `notification-item-${notification.type}`,
                      isUnread ? "notification-item-unread" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <span className="notification-item-icon">
                      <i className={`bi ${notification.icon}`}></i>
                    </span>

                    <span className="notification-item-content">
                      <strong>{notification.title}</strong>
                      <span>{notification.message}</span>
                      <small>{notification.meta}</small>
                    </span>

                    {isUnread && (
                      <span className="notification-item-dot"></span>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="notifications-empty">
              <i className="bi bi-bell-slash"></i>
              <strong>Nema novih obaveštenja</strong>
              <span>Rokovi za danas i sutra su pod kontrolom.</span>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

export default NotificationBell;