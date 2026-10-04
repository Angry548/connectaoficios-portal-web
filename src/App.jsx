import {
  Navigate,
  Route,
  Routes,
} from 'react-router-dom'

import AdminLayout from './components/AdminLayout'
import ProtectedRoute from './components/ProtectedRoute'
import AdminPrincipalRoute from './components/AdminPrincipalRoute'

import LoginPage from './pages/LoginPage'
import ChangePasswordPage from './pages/ChangePasswordPage'

import DashboardPage from './pages/dashboard/DashboardPage'
import UsersPage from './pages/usuarios/UsersPage'
import ServicesPage from './pages/servicios/ServicesPage'
import ReportsPage from './pages/reportes/ReportsPage'
import StatisticsPage from './pages/estadisticas/StatisticsPage'
import AdministratorsPage from './pages/administradores/AdministratorsPage'

import './App.css'

export default function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <LoginPage />
        }
      />

      <Route
        element={
          <ProtectedRoute />
        }
      >
        <Route
          element={
            <AdminLayout />
          }
        >
          <Route
            path="/dashboard"
            element={
              <DashboardPage />
            }
          />

          <Route
            path="/usuarios"
            element={
              <UsersPage />
            }
          />

          <Route
            path="/servicios"
            element={
              <ServicesPage />
            }
          />

          <Route
            path="/reportes"
            element={
              <ReportsPage />
            }
          />

          <Route
            path="/estadisticas"
            element={
              <StatisticsPage />
            }
          />

          <Route
            element={
              <AdminPrincipalRoute />
            }
          >
            <Route
              path="/administradores"
              element={
                <AdministratorsPage />
              }
            />
          </Route>

          <Route
            path="/cambiar-contrasena"
            element={
              <ChangePasswordPage />
            }
          />
        </Route>
      </Route>

      <Route
        path="/"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />

      <Route
        path="*"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />
    </Routes>
  )
}