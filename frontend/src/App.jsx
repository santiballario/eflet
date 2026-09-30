import { Route, Routes } from 'react-router';
import { ProtectedRoute } from '@/auth/ProtectedRoute';
import { PublicOnlyRoute } from '@/auth/PublicOnlyRoute';
import { ROL } from '@/auth/roles';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { ConductorLayout } from '@/components/layout/ConductorLayout';
import { LoginPage } from '@/pages/LoginPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { DashboardPage } from '@/pages/admin/DashboardPage';
import { VehiculosPage } from '@/pages/admin/VehiculosPage';
import { VehiculoFormPage } from '@/pages/admin/VehiculoFormPage';
import { ConductoresPage } from '@/pages/admin/ConductoresPage';
import { ConductorFormPage } from '@/pages/admin/ConductorFormPage';
import { ViajesPage } from '@/pages/admin/ViajesPage';
import { ViajeNuevoPage } from '@/pages/admin/ViajeNuevoPage';
import { ViajeDetallePage } from '@/pages/admin/ViajeDetallePage';
import { MisViajesPage } from '@/pages/conductor/MisViajesPage';
import { HojaDeRutaPage } from '@/pages/conductor/HojaDeRutaPage';

function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        }
      />

      {/* Administrador: todas estas paginas se dibujan dentro de AdminLayout */}
      <Route
        element={
          <ProtectedRoute roles={[ROL.ADMIN]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<DashboardPage />} />
        <Route path="/viajes" element={<ViajesPage />} />
        <Route path="/viajes/nuevo" element={<ViajeNuevoPage />} />
        <Route path="/viajes/:id" element={<ViajeDetallePage />} />
        <Route path="/vehiculos" element={<VehiculosPage />} />
        <Route path="/vehiculos/nuevo" element={<VehiculoFormPage />} />
        <Route path="/vehiculos/:id/editar" element={<VehiculoFormPage />} />
        <Route path="/conductores" element={<ConductoresPage />} />
        <Route path="/conductores/nuevo" element={<ConductorFormPage />} />
        <Route path="/conductores/:id/editar" element={<ConductorFormPage />} />
      </Route>

      {/* Conductor: vista simple para el celular */}
      <Route
        element={
          <ProtectedRoute roles={[ROL.CONDUCTOR]}>
            <ConductorLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/mis-viajes" element={<MisViajesPage />} />
        <Route path="/mis-viajes/:id" element={<HojaDeRutaPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
