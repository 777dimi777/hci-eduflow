import { Outlet } from 'react-router'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'

function AppLayout() {
  return (
    <div className="eduflow-app">
      <Sidebar />

      <div className="eduflow-main">
        <Topbar />

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AppLayout