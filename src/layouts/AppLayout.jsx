import { Outlet } from 'react-router'

function AppLayout() {
  return (
    <div className="eduflow-app">
      <Outlet />
    </div>
  )
}

export default AppLayout