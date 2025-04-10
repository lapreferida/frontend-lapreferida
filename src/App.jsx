import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuthContext } from "./context/AuthContext";

// Páginas públicas y privadas
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import ClientesPage from "./pages/clientes/ClientesPage";

// Ventas y documentos
import FacturarVentaPage from "./pages/ventas/FacturarVentasPage";
import InformeZPage from "./pages/ventas/InformeZPage";
import NotasCreditosPage from "./pages/ventas/NotasCreditoPage";
import RemitosPage from "./pages/ventas/RemitosPage";

// Historial y reportes
import HistorialVentasPage from "./pages/ventas/HistorialVentasPage";
import HistorialPagosPage from "./pages/ventas/HistorialPagosPage";

// Otras áreas
import IngresosPage from "./pages/ingresos/IngresosPage";
import EgresosPage from "./pages/EgresosPage";

import Layout from "./components/Layout";
import PuntosVentasPage from "./pages/config/PuntosVentasPage";
import HistorialMovimientosPage from "./pages/config/HistorialMovimientosPage";
import ProductosPage from "./pages/ProductosPage";
import InformesRemitosPage from "./pages/ventas/InformesRemitosPage";
import RepartoPage from "./pages/RepartosPage";
import ClientesRepartoPage from "./pages/clientes/ClientesRepartoPage";

const App = () => {
  const { isAuthenticated } = useAuthContext();

  return (
    <Router>
      <Routes>
        {/* Rutas públicas */}
        <Route
          path="/auth"
          element={!isAuthenticated ? <AuthPage /> : <Navigate to="/dashboard" />}
        />

        {/* Rutas privadas */}
        <Route
          path="/dashboard"
          element={isAuthenticated ? (
            <Layout>
              <DashboardPage />
            </Layout>
          ) : (
            <Navigate to="/auth" />
          )}
        />

        <Route
          path="/clientes"
          element={isAuthenticated ? (
            <Layout>
              <ClientesPage />
            </Layout>
          ) : (
            <Navigate to="/auth" />
          )}
        />

        {/* Sección de ventas y documentos */}
        <Route
          path="/facturar-venta"
          element={isAuthenticated ? (
            <Layout>
              <FacturarVentaPage />
            </Layout>
          ) : (
            <Navigate to="/auth" />
          )}
        />
        <Route
          path="/informe-z"
          element={isAuthenticated ? (
            <Layout>
              <InformeZPage />
            </Layout>
          ) : (
            <Navigate to="/auth" />
          )}
        />
        <Route
          path="/notas-creditos"
          element={isAuthenticated ? (
            <Layout>
              <NotasCreditosPage />
            </Layout>
          ) : (
            <Navigate to="/auth" />
          )}
        />
        <Route
          path="/remitos"
          element={isAuthenticated ? (
            <Layout>
              <RemitosPage />
            </Layout>
          ) : (
            <Navigate to="/auth" />
          )}
        />
        <Route
          path="/remitos-informes"
          element={isAuthenticated ? (
            <Layout>
              <InformesRemitosPage />
            </Layout>
          ) : (
            <Navigate to="/auth" />
          )}
        />
        {/* Historial */}
        <Route
          path="/ventas-historial"
          element={isAuthenticated ? (
            <Layout>
              <HistorialVentasPage />
            </Layout>
          ) : (
            <Navigate to="/auth" />
          )}
        />
        <Route
          path="/pagos-historial"
          element={isAuthenticated ? (
            <Layout>
              <HistorialPagosPage />
            </Layout>
          ) : (
            <Navigate to="/auth" />
          )}
        />

        {/* Ingresos y egresos */}
        <Route
          path="/ingresos"
          element={isAuthenticated ? (
            <Layout>
              <IngresosPage />
            </Layout>
          ) : (
            <Navigate to="/auth" />
          )}
        />
        <Route
          path="/egresos"
          element={isAuthenticated ? (
            <Layout>
              <EgresosPage />
            </Layout>
          ) : (
            <Navigate to="/auth" />
          )}
        />
        <Route
          path="/puntos-ventas"
          element={isAuthenticated ? (
            <Layout>
              <PuntosVentasPage />
            </Layout>
          ) : (
            <Navigate to="/auth" />
          )}
        />
        <Route
          path="/productos"
          element={isAuthenticated ? (
            <Layout>
              <ProductosPage />
            </Layout>
          ) : (
            <Navigate to="/auth" />
          )}
        />
        <Route
          path="/historial-movimientos"
          element={isAuthenticated ? (
            <Layout>
              <HistorialMovimientosPage />
            </Layout>
          ) : (
            <Navigate to="/auth" />
          )}
        />
        <Route
          path="/reparto"
          element={isAuthenticated ? (
            <Layout>
              <RepartoPage />
            </Layout>
          ) : (
            <Navigate to="/auth" />
          )}
        />
        <Route
          path="/clientes-reparto"
          element={isAuthenticated ? (
            <Layout>
              <ClientesRepartoPage />
            </Layout>
          ) : (
            <Navigate to="/auth" />
          )}
        />
        {/* Manejo de rutas desconocidas */}
        <Route
          path="*"
          element={<Navigate to={isAuthenticated ? "/dashboard" : "/auth"} />}
        />
      </Routes>
    </Router>
  );
};

export default App;
