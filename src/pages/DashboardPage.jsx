import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { checkSession } from "../services/authService";
import { FaChartBar, FaShoppingCart, FaUsers, FaMoneyBillWave } from "react-icons/fa";
import "../styles/dashboard.css";
import Loader from "../components/Loader";

const DashboardPage = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const sessionData = await checkSession();
        setUser(sessionData.user);
      } catch (error) {
        navigate("/auth");
      }
    };

    fetchSession();
  }, [navigate]);

  if (!user) {
    return <Loader />;
  }

  return (
    <div className="container">
      <header className="dashboard-header">
        <h1>Bienvenido {user.nombre}</h1>
      </header>

      <div className="dashboard-content">
        <div className="metrics">
          {[
            { icon: <FaChartBar />, title: "Ventas", value: "$12,345" },
            { icon: <FaShoppingCart />, title: "Pedidos", value: "128" },
            { icon: <FaUsers />, title: "Clientes", value: "54" },
            { icon: <FaMoneyBillWave />, title: "Ganancias", value: "$8,765" },
          ].map((metric, index) => (
            <div key={index} className="card">
              <div className="card-icon">{metric.icon}</div>
              <div className="card-info">
                <h3>{metric.title}</h3>
                <p>{metric.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="charts">
          <div className="chart-card">
            <h3 className="titulos-sec-dashboard">Ventas Mensuales</h3>
            <div className="chart-placeholder">Gráfico de Ventas</div>
          </div>

          <div className="chart-card">
            <h3 className="titulos-sec-dashboard">Pedidos por Categoría</h3>
            <div className="chart-placeholder">Gráfico de Categorías</div>
          </div>
        </div>

        <div className="additional-section">
          <div className="tasks">
            <h3 className="titulos-sec-dashboard">Tareas Pendientes</h3>
            <ul>
              <li>Revisar inventario</li>
              <li>Confirmar pedidos pendientes</li>
              <li>Actualizar precios</li>
            </ul>
          </div>

          <div className="recent-orders">
            <h3 className="titulos-sec-dashboard">Últimos Pedidos</h3>
            <table>
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Fecha</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Juan Pérez</td>
                  <td>2025-01-15</td>
                  <td>$123.45</td>
                </tr>
                <tr>
                  <td>María López</td>
                  <td>2025-01-14</td>
                  <td>$67.89</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
