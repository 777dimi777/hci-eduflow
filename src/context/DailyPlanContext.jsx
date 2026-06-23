import { createContext, useContext, useEffect, useState } from "react";
import { toDateKey } from "../utils/dateUtils";

const DailyPlanContext = createContext(null);

const STORAGE_KEY = "eduflow-daily-plans";
const MAX_DAILY_TASKS = 5;

function getTodayKey() {
  return toDateKey(new Date());
}

function createEmptyPlan() {
  return {
    plannedTaskIds: [],
    completedTasks: [],
  };
}

function normalizeTaskIds(values) {
  if (!Array.isArray(values)) {
    return [];
  }

  return [
    ...new Set(values.filter((value) => value !== null && value !== undefined)),
  ];
}

function normalizeCompletedTasks(values) {
  if (!Array.isArray(values)) {
    return [];
  }

  const uniqueTasks = new Map();

  values.forEach((value) => {
    const taskId =
      typeof value === "object" && value !== null ? value.taskId : value;

    if (taskId === null || taskId === undefined) {
      return;
    }

    const previousStatus =
      typeof value === "object" &&
      value !== null &&
      typeof value.previousStatus === "string"
        ? value.previousStatus
        : "todo";

    if (!uniqueTasks.has(taskId)) {
      uniqueTasks.set(taskId, {
        taskId,
        previousStatus,
      });
    }
  });

  return [...uniqueTasks.values()];
}

function normalizePlan(rawPlan) {
  if (Array.isArray(rawPlan)) {
    return {
      plannedTaskIds: normalizeTaskIds(rawPlan),
      completedTasks: [],
    };
  }

  if (!rawPlan || typeof rawPlan !== "object") {
    return createEmptyPlan();
  }

  const completedTasks = normalizeCompletedTasks(
    rawPlan.completedTasks || rawPlan.completedTaskIds,
  );

  const completedTaskIds = new Set(completedTasks.map((task) => task.taskId));

  return {
    plannedTaskIds: normalizeTaskIds(rawPlan.plannedTaskIds).filter(
      (taskId) => !completedTaskIds.has(taskId),
    ),
    completedTasks,
  };
}

function hasPlanData(plan) {
  return plan.plannedTaskIds.length > 0 || plan.completedTasks.length > 0;
}

function loadDailyPlans() {
  const savedPlans = localStorage.getItem(STORAGE_KEY);

  if (!savedPlans) {
    return {};
  }

  try {
    const parsedPlans = JSON.parse(savedPlans);
    const todayKey = getTodayKey();

    const rawTodayPlan =
      parsedPlans?.[todayKey] ||
      (parsedPlans?.plannedTaskIds || parsedPlans?.completedTasks
        ? parsedPlans
        : null);

    const todayPlan = normalizePlan(rawTodayPlan);

    return hasPlanData(todayPlan) ? { [todayKey]: todayPlan } : {};
  } catch {
    return {};
  }
}

export function DailyPlanProvider({ children }) {
  const [todayKey, setTodayKey] = useState(getTodayKey);
  const [dailyPlans, setDailyPlans] = useState(loadDailyPlans);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      const nextDateKey = getTodayKey();

      setTodayKey((previousDateKey) =>
        previousDateKey === nextDateKey ? previousDateKey : nextDateKey,
      );
    }, 60000);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    setDailyPlans((previousPlans) => {
      const currentPlan = normalizePlan(previousPlans[todayKey]);

      if (!hasPlanData(currentPlan)) {
        return {};
      }

      return {
        [todayKey]: currentPlan,
      };
    });
  }, [todayKey]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dailyPlans));
  }, [dailyPlans]);

  function getPlan(dateKey) {
    return normalizePlan(dailyPlans[dateKey]);
  }

  function getPlanTaskIds(dateKey) {
    return getPlan(dateKey).plannedTaskIds;
  }

  function getCompletedTaskEntries(dateKey) {
    return getPlan(dateKey).completedTasks;
  }

  function addTaskToPlan(dateKey, taskId) {
    const currentPlan = normalizePlan(dailyPlans[dateKey]);

    if (currentPlan.plannedTaskIds.includes(taskId)) {
      return {
        added: false,
        reason: "exists",
      };
    }

    const nextTaskCount = currentPlan.plannedTaskIds.length + 1;

    const updatedPlan = {
      ...currentPlan,
      plannedTaskIds: [...currentPlan.plannedTaskIds, taskId],
    };

    setDailyPlans((previousPlans) => ({
      ...previousPlans,
      [dateKey]: updatedPlan,
    }));

    return {
      added: true,
      count: nextTaskCount,
      warning: nextTaskCount > MAX_DAILY_TASKS,
    };
  }

  function completeTaskInPlan(dateKey, taskId, previousStatus) {
    const currentPlan = getPlan(dateKey);

    if (!currentPlan.plannedTaskIds.includes(taskId)) {
      return { moved: false };
    }

    setDailyPlans((previousPlans) => {
      const plan = normalizePlan(previousPlans[dateKey]);

      return {
        ...previousPlans,
        [dateKey]: {
          plannedTaskIds: plan.plannedTaskIds.filter(
            (plannedTaskId) => plannedTaskId !== taskId,
          ),
          completedTasks: [
            ...plan.completedTasks,
            {
              taskId,
              previousStatus,
            },
          ],
        },
      };
    });

    return { moved: true };
  }

  function reopenTaskInPlan(dateKey, taskId) {
    const currentPlan = getPlan(dateKey);

    const completedTask = currentPlan.completedTasks.find(
      (task) => task.taskId === taskId,
    );

    if (!completedTask) {
      return { moved: false };
    }

    setDailyPlans((previousPlans) => {
      const plan = normalizePlan(previousPlans[dateKey]);

      return {
        ...previousPlans,
        [dateKey]: {
          plannedTaskIds: [...plan.plannedTaskIds, taskId],
          completedTasks: plan.completedTasks.filter(
            (task) => task.taskId !== taskId,
          ),
        },
      };
    });

    return {
      moved: true,
      previousStatus: completedTask.previousStatus,
    };
  }

  function removeTaskFromPlan(dateKey, taskId) {
    setDailyPlans((previousPlans) => {
      const plan = normalizePlan(previousPlans[dateKey]);

      return {
        ...previousPlans,
        [dateKey]: {
          plannedTaskIds: plan.plannedTaskIds.filter(
            (plannedTaskId) => plannedTaskId !== taskId,
          ),
          completedTasks: plan.completedTasks.filter(
            (task) => task.taskId !== taskId,
          ),
        },
      };
    });
  }

  function clearDailyPlan(dateKey) {
    setDailyPlans((previousPlans) => {
      const updatedPlans = { ...previousPlans };

      delete updatedPlans[dateKey];

      return updatedPlans;
    });
  }
  function removeTasksFromPlans(taskIds) {
    const taskIdSet = new Set(taskIds);

    setDailyPlans((previousPlans) => {
      const updatedPlans = {};

      Object.entries(previousPlans).forEach(([dateKey, rawPlan]) => {
        const plan = normalizePlan(rawPlan);

        const updatedPlan = {
          plannedTaskIds: plan.plannedTaskIds.filter(
            (taskId) => !taskIdSet.has(taskId),
          ),
          completedTasks: plan.completedTasks.filter(
            (task) => !taskIdSet.has(task.taskId),
          ),
        };

        if (hasPlanData(updatedPlan)) {
          updatedPlans[dateKey] = updatedPlan;
        }
      });

      return updatedPlans;
    });
  }
  return (
    <DailyPlanContext.Provider
      value={{
        todayKey,
        getPlanTaskIds,
        getCompletedTaskEntries,
        addTaskToPlan,
        completeTaskInPlan,
        reopenTaskInPlan,
        removeTaskFromPlan,
        clearDailyPlan,
        maxDailyTasks: MAX_DAILY_TASKS,
        removeTasksFromPlans,
      }}
    >
      {children}
    </DailyPlanContext.Provider>
  );
}

export function useDailyPlan() {
  const context = useContext(DailyPlanContext);

  if (!context) {
    throw new Error(
      "useDailyPlan mora da se koristi unutar DailyPlanProvider komponente.",
    );
  }

  return context;
}
