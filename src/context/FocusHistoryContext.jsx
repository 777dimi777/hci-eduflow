import { createContext, useContext, useEffect, useState } from "react";

const FocusHistoryContext = createContext(null);

const STORAGE_KEY = "eduflow-focus-history";

function loadFocusHistory() {
  const savedHistory = localStorage.getItem(STORAGE_KEY);

  if (!savedHistory) {
    return [];
  }

  try {
    const parsedHistory = JSON.parse(savedHistory);

    if (!Array.isArray(parsedHistory)) {
      return [];
    }

    return parsedHistory.filter(
      (session) =>
        session &&
        typeof session === "object" &&
        session.id &&
        session.date &&
        Number(session.durationMinutes) > 0,
    );
  } catch {
    return [];
  }
}

export function FocusHistoryProvider({ children }) {
  const [focusHistory, setFocusHistory] = useState(loadFocusHistory);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(focusHistory));
  }, [focusHistory]);

  function addFocusSession({ durationMinutes, taskId = "" }) {
    const newSession = {
      id: `${Date.now()}-${Math.random()}`,
      date: new Date().toISOString(),
      durationMinutes: Number(durationMinutes) || 25,
      taskId: taskId || "",
    };

    setFocusHistory((previousHistory) => [
      ...previousHistory,
      newSession,
    ]);
  }

  return (
    <FocusHistoryContext.Provider
      value={{
        focusHistory,
        addFocusSession,
      }}
    >
      {children}
    </FocusHistoryContext.Provider>
  );
}

export function useFocusHistory() {
  const context = useContext(FocusHistoryContext);

  if (!context) {
    throw new Error(
      "useFocusHistory mora da se koristi unutar FocusHistoryProvider komponente.",
    );
  }

  return context;
}