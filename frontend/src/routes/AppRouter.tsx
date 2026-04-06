import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LoginPage from '../pages/auth/LoginPage'

import AlumnoLayout from '../layouts/AlumnoLayout'
import AdministrativoLayout from '../layouts/AdministrativoLayout'
import AdminLayout from '../layouts/AdminLayout'

import AlumnoDashboardPage from '../pages/alumno/DashboardPage'
import TramitesPage from '../pages/alumno/TramitesPage'
import SolicitarPage from '../pages/alumno/SolicitarPage'
import HistorialPage from '../pages/alumno/HistorialPage'

import AdministrativoDashboardPage from '../pages/administrativo/DashboardPage'
import ReportesPage from '../pages/administrativo/ReportesPage'
import BandejaEntradaPage from '../pages/administrativo/BandejaEntradaPage'

import AdminDashboardPage from '../pages/admin/DashboardPage'
import MicrosoftCallback from '@/pages/auth/MicrosoftCallback'

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/alumno" element={<AlumnoLayout />}>
            <Route path="dashboard" element={<AlumnoDashboardPage />} />
            <Route path="tramites" element={<TramitesPage />} />
            <Route path="solicitar" element= {<SolicitarPage />} />
            <Route path="historial" element= {<HistorialPage />} />
        </Route>

        <Route path="/administrativo" element={<AdministrativoLayout />}>
            <Route path="dashboard" element={<AdministrativoDashboardPage />} />
            <Route path="bandeja-de-entrada" element={<BandejaEntradaPage/>} />
            <Route path="reportes" element={<ReportesPage/>} />
        </Route>
        
        <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboardPage />} />
        </Route>
        <Route path="/auth/microsoft/callback" element={<MicrosoftCallback />} />

      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter