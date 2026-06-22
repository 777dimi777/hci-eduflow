import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import 'bootstrap-icons/font/bootstrap-icons.css'
import './index.css'
import App from './App.jsx'
import { SubjectProvider } from './context/SubjectContext'
import { TaskProvider } from './context/TaskContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <SubjectProvider>
        <TaskProvider>
          <App />
        </TaskProvider>
      </SubjectProvider>
    </BrowserRouter>
  </StrictMode>
)