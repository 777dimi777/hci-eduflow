import { useEffect, useRef, useState } from "react";
import { useStudentProfile } from "../context/StudentProfileContext";
import { useToast } from "../context/ToastContext";
function getFirstName(fullName) {
  return String(fullName || "Student")
    .trim()
    .split(/\s+/)[0];
}

function getAvatarLetter(fullName) {
  return getFirstName(fullName).charAt(0).toUpperCase() || "S";
}

function Topbar() {
  const { studentProfile, updateStudentProfile } = useStudentProfile();
  const { showToast } = useToast();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [draftProfile, setDraftProfile] = useState(studentProfile);

  const profileMenuRef = useRef(null);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setIsProfileMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  function handleOpenEditor() {
    setDraftProfile(studentProfile);
    setIsEditorOpen(true);
    setIsProfileMenuOpen(false);
  }

  function handleInputChange(event) {
    const { name, value } = event.target;

    setDraftProfile((previousProfile) => ({
      ...previousProfile,
      [name]: value,
    }));
  }

  function handleSaveProfile(event) {
    event.preventDefault();

    if (!draftProfile.fullName.trim()) {
      showToast({
        message: "Unesi ime studenta pre čuvanja profila.",
        type: "warning",
      });

      return;
    }

    updateStudentProfile(draftProfile);
    setIsEditorOpen(false);

    showToast({
      message: "Profil studenta je uspešno ažuriran.",
      type: "success",
    });
  }
  function handleThemeToggle() {
    const nextTheme = preferences.theme === "dark" ? "light" : "dark";

    updatePreference("theme", nextTheme);

    showToast({
      message:
        nextTheme === "light"
          ? "Uključen je dnevni prikaz."
          : "Uključen je noćni prikaz.",
      type: "info",
    });
  }
  return (
    <>
      <header className="topbar">
        <div className="mobile-brand">
          <i className="bi bi-mortarboard-fill"></i>
          <span>EduFlow</span>
        </div>

        <div className="topbar-search">
          <i className="bi bi-search"></i>

          <input
            type="text"
            placeholder="Pretraži predmete, obaveze..."
            aria-label="Pretraga"
          />
        </div>

        <div className="topbar-actions">
          
          <button
            type="button"
            className="topbar-icon-button"
            aria-label="Obaveštenja"
            title="Obaveštenja"
          >
            <i className="bi bi-bell"></i>
            <span className="notification-dot"></span>
          </button>

          <div className="topbar-profile-menu" ref={profileMenuRef}>
            <button
              type="button"
              className="profile-preview profile-preview-button"
              onClick={() =>
                setIsProfileMenuOpen((previousValue) => !previousValue)
              }
              aria-expanded={isProfileMenuOpen}
              aria-label="Otvori meni profila"
            >
              <div className="profile-avatar">
                {getAvatarLetter(studentProfile.fullName)}
              </div>

              <div className="profile-text">
                <strong>{getFirstName(studentProfile.fullName)}</strong>
                <span>{studentProfile.role}</span>
              </div>

              <i className="bi bi-chevron-down profile-chevron"></i>
            </button>

            {isProfileMenuOpen && (
              <section className="student-profile-dropdown">
                <div className="student-profile-dropdown-heading">
                  <div className="student-profile-large-avatar">
                    {getAvatarLetter(studentProfile.fullName)}
                  </div>

                  <div>
                    <strong>{studentProfile.fullName}</strong>
                    <span>{studentProfile.role}</span>
                  </div>
                </div>

                <div className="student-profile-dropdown-info">
                  <span>
                    <i className="bi bi-mortarboard"></i>
                    {studentProfile.program}
                  </span>

                  <span>
                    <i className="bi bi-calendar3"></i>
                    {studentProfile.studyYear}
                  </span>
                </div>

                <button
                  type="button"
                  className="student-profile-edit-button"
                  onClick={handleOpenEditor}
                >
                  <i className="bi bi-pencil-square"></i>
                  Izmeni profil
                </button>
              </section>
            )}
          </div>
        </div>
      </header>

      {isEditorOpen && (
        <div
          className="student-profile-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsEditorOpen(false);
            }
          }}
        >
          <section
            className="student-profile-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Izmena profila studenta"
          >
            <div className="student-profile-modal-heading">
              <div>
                <p className="page-eyebrow">PROFIL STUDENTA</p>
                <h2>Izmeni podatke</h2>
                <p>Ovi podaci se prikazuju u zaglavlju EduFlow aplikacije.</p>
              </div>

              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                aria-label="Zatvori izmenu profila"
                title="Zatvori"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <form onSubmit={handleSaveProfile}>
              <div className="student-profile-form-grid">
                <label>
                  <span>Ime i prezime</span>
                  <input
                    name="fullName"
                    value={draftProfile.fullName}
                    onChange={handleInputChange}
                    placeholder="Na primer: Miloš Dimitrijević"
                  />
                </label>

                <label>
                  <span>Uloga</span>
                  <input
                    name="role"
                    value={draftProfile.role}
                    onChange={handleInputChange}
                    placeholder="Student"
                  />
                </label>

                <label>
                  <span>Fakultet</span>
                  <input
                    name="faculty"
                    value={draftProfile.faculty}
                    onChange={handleInputChange}
                    placeholder="Naziv fakulteta"
                  />
                </label>

                <label>
                  <span>Smer</span>
                  <input
                    name="program"
                    value={draftProfile.program}
                    onChange={handleInputChange}
                    placeholder="Na primer: Računarstvo i informatika"
                  />
                </label>

                <label>
                  <span>Godina studija</span>
                  <input
                    name="studyYear"
                    value={draftProfile.studyYear}
                    onChange={handleInputChange}
                    placeholder="Na primer: 3. godina"
                  />
                </label>
              </div>

              <div className="student-profile-form-actions">
                <button
                  type="button"
                  className="student-profile-cancel-button"
                  onClick={() => setIsEditorOpen(false)}
                >
                  Otkaži
                </button>

                <button type="submit" className="student-profile-save-button">
                  <i className="bi bi-check2-circle"></i>
                  Sačuvaj profil
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </>
  );
}

export default Topbar;
