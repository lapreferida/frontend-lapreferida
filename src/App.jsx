import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { useAuthContext } from "./context/AuthContext"
import { Suspense, lazy } from "react"
import LoadingScreen from "./components/LoandingScreen"
import Layout from "./components/Layout"

// Importaciones perezosas para mejorar el rendimiento
const AuthPage = lazy(() => import("./pages/AuthPage"))
const DashboardPage = lazy(() => import("./pages/DashboardPage"))
const ClientesPage = lazy(() => import("./pages/clientes/ClientesPage"))
const FacturarVentaPage = lazy(() => import("./pages/ventas/FacturarVentasPage"))
const InformeZPage = lazy(() => import("./pages/ventas/InformeZPage"))
const NotasCreditosPage = lazy(() => import("./pages/ventas/NotasCreditoPage"))
const RemitosPage = lazy(() => import("./pages/ventas/RemitosPage"))
const HistorialVentasPage = lazy(() => import("./pages/ventas/HistorialVentasPage"))
const HistorialPagosPage = lazy(() => import("./pages/ventas/HistorialPagosPage"))
const IngresosPage = lazy(() => import("./pages/ingresos/IngresosPage"))
const EgresosPage = lazy(() => import("./pages/EgresosPage"))
const PuntosVentasPage = lazy(() => import("./pages/config/PuntosVentasPage"))
const HistorialMovimientosPage = lazy(() => import("./pages/config/HistorialMovimientosPage"))
const ProductosPage = lazy(() => import("./pages/ProductosPage"))
const InformesRemitosPage = lazy(() => import("./pages/ventas/InformesRemitosPage"))
const RepartoPage = lazy(() => import("./pages/RepartosPage"))
const ClientesRepartoPage = lazy(() => import("./pages/clientes/ClientesRepartoPage"))
const RepartoHistorialPage = lazy(() => import("./pages/RepartoHistorialPage"))

const App = () => {
  const { isAuthenticated } = useAuthContext()

  // Componente para rutas protegidas
  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated) {
      return <Navigate to="/auth" replace />
    }
    return (
      <Layout>
        <Suspense fallback={<LoadingScreen />}>{children}</Suspense>
      </Layout>
    )
  }

  return (
    <Router>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/auth" element={!isAuthenticated ? <AuthPage /> : <Navigate to="/dashboard" replace />} />

          {/* Rutas privadas */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/clientes"
            element={
              <ProtectedRoute>
                <ClientesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/facturar-venta"
            element={
              <ProtectedRoute>
                <FacturarVentaPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/informe-z"
            element={
              <ProtectedRoute>
                <InformeZPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notas-creditos"
            element={
              <ProtectedRoute>
                <NotasCreditosPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/remitos"
            element={
              <ProtectedRoute>
                <RemitosPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/remitos-informes"
            element={
              <ProtectedRoute>
                <InformesRemitosPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ventas-historial"
            element={
              <ProtectedRoute>
                <HistorialVentasPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pagos-historial"
            element={
              <ProtectedRoute>
                <HistorialPagosPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ingresos"
            element={
              <ProtectedRoute>
                <IngresosPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/egresos"
            element={
              <ProtectedRoute>
                <EgresosPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/puntos-ventas"
            element={
              <ProtectedRoute>
                <PuntosVentasPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/productos"
            element={
              <ProtectedRoute>
                <ProductosPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/historial-movimientos"
            element={
              <ProtectedRoute>
                <HistorialMovimientosPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reparto"
            element={
              <ProtectedRoute>
                <RepartoPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/clientes-reparto"
            element={
              <ProtectedRoute>
                <ClientesRepartoPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reparto-historial"
            element={
              <ProtectedRoute>
                <RepartoHistorialPage />
              </ProtectedRoute>
            }
          />

          {/* Manejo de rutas desconocidas */}
          <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/auth"} replace />} />
        </Routes>
      </Suspense>
    </Router>
  )
}

export default App
