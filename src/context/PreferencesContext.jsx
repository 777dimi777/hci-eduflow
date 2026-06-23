import { createContext, useContext, useEffect, useState } from "react";

const PreferencesContext = createContext(null);

const STORAGE_KEY = "eduflow-preferences";

const defaultPreferences = {
  reducedMotion: false,
  largerText: false,
  enhancedFocus: false,
};

function loadPreferences() {
  const savedPreferences = localStorage.getItem(STORAGE_KEY);

  if (!savedPreferences) {
    return defaultPreferences;
  }

  try {
    const parsedPreferences = JSON.parse(savedPreferences);

    return {
      reducedMotion: Boolean(parsedPreferences.reducedMotion),
      largerText: Boolean(parsedPreferences.largerText),
      enhancedFocus: Boolean(parsedPreferences.enhancedFocus),
    };
  } catch {
    return defaultPreferences;
  }
}

export function PreferencesProvider({ children }) {
  const [preferences, setPreferences] = useState(loadPreferences);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));

    const root = document.documentElement;

    root.classList.toggle(
      "eduflow-reduced-motion",
      preferences.reducedMotion,
    );

    root.classList.toggle(
      "eduflow-larger-text",
      preferences.largerText,
    );

    root.classList.toggle(
      "eduflow-enhanced-focus",
      preferences.enhancedFocus,
    );
  }, [preferences]);

  function updatePreference(preferenceName, value) {
    setPreferences((previousPreferences) => ({
      ...previousPreferences,
      [preferenceName]: value,
    }));
  }

  function resetPreferences() {
    setPreferences(defaultPreferences);
  }

  return (
    <PreferencesContext.Provider
      value={{
        preferences,
        updatePreference,
        resetPreferences,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);

  if (!context) {
    throw new Error(
      "usePreferences mora da se koristi unutar PreferencesProvider komponente.",
    );
  }

  return context;
}