import React from 'react'
import ReactDOM from 'react-dom/client'
import '@fontsource/barlow/latin-400.css'
import '@fontsource/barlow/latin-600.css'
import '@fontsource/barlow/latin-700.css'
import '@fontsource/barlow/latin-800.css'
import '@fontsource/barlow/latin-900.css'
import '@fontsource/oxanium/latin-700.css'
import '@fontsource/oxanium/latin-800.css'
import App from './App.jsx'
import AdminApp from './AdminApp.jsx'
import './index.css'

const isAdminRoute = window.location.pathname === '/admin' || window.location.pathname.startsWith('/admin/')

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {isAdminRoute ? <AdminApp /> : <App />}
  </React.StrictMode>,
)
