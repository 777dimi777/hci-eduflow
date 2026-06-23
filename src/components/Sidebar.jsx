import { NavLink } from "react-router";
import { usePreferences } from "../context/PreferencesContext";
import { useToast } from "../context/ToastContext";

const mainNavigation = [
{ to: "/dashboard", icon: "bi-grid-1x2-fill", label: "Dashboard" },
{ to: "/subjects", icon: "bi-book", label: "Predmeti" },
{ to: "/tasks", icon: "bi-check2-square", label: "Obaveze" },
{ to: "/calendar", icon: "bi-calendar-event", label: "Kalendar" },
{ to: "/materials", icon: "bi-folder2-open", label: "Materijali" },
{
to: "/pdf-import",
icon: "bi-calendar2-week",
label: "Rasporedi ispita",
},
{ to: "/exams", icon: "bi-patch-check", label: "Ispiti i prosek" },
{ to: "/grade-goal", icon: "bi-bullseye", label: "Cilj proseka" },
{ to: "/statistics", icon: "bi-bar-chart-line", label: "Statistika" },
];

function Sidebar() {
const { preferences, updatePreference } = usePreferences();
const { showToast } = useToast();

const isDarkTheme = preferences.theme !== "light";

function handleThemeToggle() {
const nextTheme = isDarkTheme ? "light" : "dark";

updatePreference("theme", nextTheme);

showToast({
  message:
    nextTheme === "light"
      ? "Uključen je dnevni prikaz."
      : "Uključen je noćni prikaz.",
  type: "info",
});

}

return ( <aside className="eduflow-sidebar"> <div className="sidebar-brand"> <div className="sidebar-brand-icon"> <i className="bi bi-mortarboard-fill"></i> </div>
    <span className="sidebar-brand-text">EduFlow</span>
  </div>

  <p className="sidebar-section-label">MENI</p>

  <nav className="sidebar-navigation">
    {mainNavigation.map((item) => (
      <NavLink
        key={item.to}
        to={item.to}
        className={({ isActive }) =>
          `sidebar-link ${isActive ? "sidebar-link-active" : ""}`
        }
      >
        <i className={`bi ${item.icon}`}></i>
        <span className="sidebar-link-text">{item.label}</span>
      </NavLink>
    ))}
  </nav>

  <div className="sidebar-divider"></div>

  <NavLink
    to="/pdf-import"
    className={({ isActive }) =>
      `sidebar-link ${isActive ? "sidebar-link-active" : ""}`
    }
  >
    <i className="bi bi-file-earmark-pdf"></i>
    <span className="sidebar-link-text">Uvoz PDF-a</span>
  </NavLink>

  <NavLink
    to="/settings"
    className={({ isActive }) =>
      `sidebar-link ${isActive ? "sidebar-link-active" : ""}`
    }
  >
    <i className="bi bi-gear"></i>
    <span className="sidebar-link-text">Podešavanja</span>
  </NavLink>

  <button
    type="button"
    className={[
      "sidebar-theme-toggle",
      isDarkTheme
        ? "sidebar-theme-toggle-dark"
        : "sidebar-theme-toggle-light",
    ].join(" ")}
    onClick={handleThemeToggle}
    aria-label={
      isDarkTheme
        ? "Uključi dnevni prikaz"
        : "Uključi noćni prikaz"
    }
    title={
      isDarkTheme
        ? "Klikni za dnevni prikaz"
        : "Klikni za noćni prikaz"
    }
  >
    <span className="sidebar-theme-toggle-icon">
      <i
        className={`bi ${
          isDarkTheme ? "bi-moon-stars-fill" : "bi-sun-fill"
        }`}
      ></i>
    </span>

    <span className="sidebar-theme-toggle-text">
      {isDarkTheme ? "Tamna tema" : "Dnevna tema"}
    </span>

    <span className="sidebar-theme-toggle-dot"></span>
  </button>
</aside>

);
}

export default Sidebar;
