import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// Layouts
import AlumnoLayout from '../layouts/AlumnoLayout'
import AdministrativoLayout from '../layouts/AdministrativoLayout'
import AdminLayout from '../layouts/AdminLayout'

// Auth pages
import LoginPage from '../pages/auth/LoginPage'
import MicrosoftCallback from '../pages/auth/MicrosoftCallback'
import RoleSelectionPage from '../pages/auth/RoleSelectionPage'
import PendingApprovalPage from '../pages/auth/PendingApprovalPage'

// Alumno pages
import AlumnoDashboardPage from '../pages/alumno/DashboardPage'
import TramitesPage from '../pages/alumno/TramitesPage'
import SolicitarPage from '../pages/alumno/SolicitarPage'
import HistorialPage from '../pages/alumno/HistorialPage'

// Administrativo pages
import AdministrativoDashboardPage from '../pages/administrativo/DashboardPage'
import ReportesPage from '../pages/administrativo/ReportesPage'
import BandejaEntradaPage from '../pages/administrativo/BandejaEntradaPage'

// Admin pages
import AdminDashboardPage from '../pages/admin/DashboardPage'
import UsuariosPage from '../pages/admin/UsuariosPage'
import TiposTramitePage from '../pages/admin/TiposTramitePage'

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ── Públicas ────────────────────────────────── */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/auth/microsoft/callback" element={<MicrosoftCallback />} />
        <Route path="/auth/seleccionar-rol" element={<RoleSelectionPage />} />
        <Route path="/auth/pendiente" element={<PendingApprovalPage />} />

        {/* ── Alumno (protegido por AlumnoLayout) ─────── */}
        <Route path="/alumno" element={<AlumnoLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AlumnoDashboardPage />} />
          <Route path="solicitar" element={<SolicitarPage />} />
          <Route path="tramites" element={<TramitesPage />} />
          <Route path="historial" element={<HistorialPage />} />
        </Route>

        {/* ── Administrativo (protegido por AdministrativoLayout) */}
        <Route path="/administrativo" element={<AdministrativoLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdministrativoDashboardPage />} />
          <Route path="bandeja-de-entrada" element={<BandejaEntradaPage />} />
          <Route path="reportes" element={<ReportesPage />} />
        </Route>

        {/* ── Admin (protegido por AdminLayout) ────────── */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="usuarios" element={<UsuariosPage />} />
          <Route path="tramites" element={<TiposTramitePage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter
