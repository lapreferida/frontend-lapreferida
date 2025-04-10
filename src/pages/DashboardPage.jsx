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
      } catch {
        navigate("/auth");
      }
    };

    fetchSession();
  }, [navigate]);

  if (!user) {
    return <Loader />;
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Bienvenido {user.nombre}</h1>
      </header>

      <div className="dashboard-content">
        <div className="metrics">
          {[
            { icon: <FaChartBar />, title: "Ventas", value: "Proximamente" },
            { icon: <FaShoppingCart />, title: "Pedidos", value: "Proximamente" },
            { icon: <FaUsers />, title: "Clientes", value: "Proximamente" },
            { icon: <FaMoneyBillWave />, title: "Ganancias", value: "Proximamente" },
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
      </div>
    </div>
  );
};

export default DashboardPage;
