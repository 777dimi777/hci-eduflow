import { NavLink } from 'react-router'

const mainNavigation = [
  { to: '/dashboard', icon: 'bi-grid-1x2-fill', label: 'Dashboard' },
  { to: '/subjects', icon: 'bi-book', label: 'Predmeti' },
  { to: '/tasks', icon: 'bi-check2-square', label: 'Obaveze' },
  { to: '/calendar', icon: 'bi-calendar-event', label: 'Kalendar' },
  { to: '/materials', icon: 'bi-folder2-open', label: 'Materijali' },
  { to: '/statistics', icon: 'bi-bar-chart-line', label: 'Statistika' },
]

function Sidebar() {
  return (
    <aside className="eduflow-sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">
          <i className="bi bi-mortarboard-fill"></i>
        </div>

        <span className="sidebar-brand-text">EduFlow</span>
      </div>

      <p className="sidebar-section-label">MENI</p>

      <nav className="sidebar-navigation">
        {mainNavigation.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
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
          `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
        }
      >
        <i className="bi bi-file-earmark-pdf"></i>
        <span className="sidebar-link-text">Uvoz PDF-a</span>
      </NavLink>

      <NavLink
        to="/settings"
        className={({ isActive }) =>
          `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
        }
      >
        <i className="bi bi-gear"></i>
        <span className="sidebar-link-text">Podešavanja</span>
      </NavLink>

      <div className="sidebar-theme-status">
        <i className="bi bi-moon-stars"></i>
        <span>Tamna tema</span>
        <span className="theme-status-dot"></span>
      </div>
    </aside>
  )
}

export default Sidebar