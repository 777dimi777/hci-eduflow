import { createContext, useContext, useEffect, useState } from "react";

const StudentProfileContext = createContext(null);

const STORAGE_KEY = "eduflow-student-profile";

const defaultProfile = {
  fullName: "Miloš Dimitrijević",
  role: "Student",
  faculty: "Elektronski fakultet u Nišu",
  program: "Računarstvo i informatika",
  studyYear: "3. godina",
};

function loadStudentProfile() {
  const savedProfile = localStorage.getItem(STORAGE_KEY);

  if (!savedProfile) {
    return defaultProfile;
  }

  try {
    const parsedProfile = JSON.parse(savedProfile);

    return {
      fullName: parsedProfile.fullName || defaultProfile.fullName,
      role: parsedProfile.role || defaultProfile.role,
      faculty: parsedProfile.faculty || defaultProfile.faculty,
      program: parsedProfile.program || defaultProfile.program,
      studyYear: parsedProfile.studyYear || defaultProfile.studyYear,
    };
  } catch {
    return defaultProfile;
  }
}

export function StudentProfileProvider({ children }) {
  const [studentProfile, setStudentProfile] = useState(loadStudentProfile);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(studentProfile));
  }, [studentProfile]);

  function updateStudentProfile(updatedProfile) {
    setStudentProfile({
      fullName: updatedProfile.fullName?.trim() || defaultProfile.fullName,
      role: updatedProfile.role?.trim() || defaultProfile.role,
      faculty: updatedProfile.faculty?.trim() || defaultProfile.faculty,
      program: updatedProfile.program?.trim() || defaultProfile.program,
      studyYear: updatedProfile.studyYear?.trim() || defaultProfile.studyYear,
    });
  }

  return (
    <StudentProfileContext.Provider
      value={{
        studentProfile,
        updateStudentProfile,
      }}
    >
      {children}
    </StudentProfileContext.Provider>
  );
}

export function useStudentProfile() {
  const context = useContext(StudentProfileContext);

  if (!context) {
    throw new Error(
      "useStudentProfile mora da se koristi unutar StudentProfileProvider komponente.",
    );
  }

  return context;
}