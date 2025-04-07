import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FaHome,
  FaSignOutAlt,
  FaChevronLeft,
  FaChevronRight,
  FaAngleDown,
  FaAngleUp,
  FaDollarSign,
  FaShoppingCart,
  FaFileInvoiceDollar,
  FaUsers,
  FaChartBar,
  FaListAlt,
  FaCog,
  FaProductHunt,
  FaStore,
  FaHistory,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthContext } from "../context/AuthContext";
import { logout } from "../services/authService";
import "../styles/sidebar.css";

// Variantes para animar el ancho del sidebar
const sidebarVariants = {
  open: {
    width: 250,
    transition: { type: "spring", stiffness: 200, damping: 20 },
  },
  closed: {
    width: 60,
    transition: { type: "spring", stiffness: 200, damping: 20 },
  },
};

// Variantes para animar la aparición/desaparición de textos
const fadeVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
};

// Variantes para animar el submenú (expansión/contracción)
const submenuVariants = {
  collapsed: {
    height: 0,
    opacity: 0,
    transition: { duration: 0.3, when: "afterChildren" },
  },
  open: {
    height: "auto",
    opacity: 1,
    transition: { duration: 0.3, when: "beforeChildren" },
  },
};

const SideBar = ({ isOpen, toggleSidebar }) => {
  const [showVentas, setShowVentas] = useState(false);
  const [showConfiguraciones, setShowConfiguraciones] = useState(false);
  // Extraemos el usuario del contexto para saber su rol (se usa user.role)
  const { logout: logoutContext, user } = useAuthContext();
  const navigate = useNavigate();

  // Si el usuario es "user", mostramos el submenú de ventas automáticamente
  useEffect(() => {
    if (user) {
      // Para ambos roles abrimos ventas, y para admin también configuraciones
      setShowVentas(true);
      if (user.rol === "admin") {
        setShowConfiguraciones(true);
      } else {
        setShowConfiguraciones(false);
      }
    }
  }, [user]);

  const toggleSubMenu = (menu) => {
    if (menu === "ventas") {
      setShowVentas((prev) => !prev);
    } else if (menu === "configuraciones") {
      setShowConfiguraciones((prev) => !prev);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      logoutContext();
      navigate("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <motion.div
      className={`sidebar ${isOpen ? "open" : "closed"}`}
      variants={sidebarVariants}
      animate={isOpen ? "open" : "closed"}
    >
      {/* Encabezado */}
      <div className="sidebar-header">
        <div className="top-bar">
          <button
            className="toggle-button"
            onClick={(e) => {
              toggleSidebar();
              e.currentTarget.blur();
            }}
          >
            {isOpen ? <FaChevronLeft /> : <FaChevronRight />}
          </button>
        </div>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="title-container"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={fadeVariants}
            >
              <div className="title">
                <span>Panadería</span>
                <br />
                <span className="highlight">La Preferida</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Opciones del menú */}
      <div className="options-container">
        <ul className="menu">
          {/* Dashboard: siempre visible */}
          <Link to="/dashboard">
            <li className="menu-item">
              <div className="menu-link">
                <FaHome className="menu-icon" />
                {isOpen && (
                  <motion.span
                    className="menu-text"
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    variants={fadeVariants}
                  >
                    Dashboard
                  </motion.span>
                )}
              </div>
            </li>
          </Link>
          {/* Clientes: solo para admin */}
          {user && user.rol === "admin" && (
            <Link to="/clientes">
              <li className="menu-item">
                <div className="menu-link">
                  <FaUsers className="menu-icon" />
                  {isOpen && (
                    <motion.span
                      className="menu-text"
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      variants={fadeVariants}
                    >
                      Clientes
                    </motion.span>
                  )}
                </div>
              </li>
            </Link>
          )}

          {/* Ventas: para admin se muestran todas; para user solo Informe Z y Remitos */}
          {user && (
            <li className="menu-item" onClick={() => toggleSubMenu("ventas")}>
              <div className="menu-link">
                <FaChartBar className="menu-icon" />
                {isOpen && (
                  <motion.span
                    className="menu-text"
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    variants={fadeVariants}
                  >
                    Ventas
                  </motion.span>
                )}
              </div>
              {isOpen && (
                <div className="submenu-toggle">
                  {showVentas ? <FaAngleUp /> : <FaAngleDown />}
                </div>
              )}
            </li>
          )}
          <AnimatePresence initial={false}>
            {isOpen && user && (
              <motion.ul
                className="submenu"
                variants={submenuVariants}
                initial="collapsed"
                animate={showVentas ? "open" : "collapsed"}
                exit="collapsed"
              >
                {user.rol === "admin" && (
                  <Link to="/facturar-venta">
                    <li className="submenu-item">
                      <div className="submenu-link">
                        <FaFileInvoiceDollar className="submenu-icon" />
                        <span>Facturar Venta</span>
                      </div>
                    </li>
                  </Link>
                )}
                <Link to="/informe-z">
                  <li className="submenu-item">
                    <div className="submenu-link">
                      <FaChartBar className="submenu-icon" />
                      <span>Informe Z</span>
                    </div>
                  </li>
                </Link>
                <Link to="/remitos">
                  <li className="submenu-item">
                    <div className="submenu-link">
                      <FaShoppingCart className="submenu-icon" />
                      <span>Remitos</span>
                    </div>
                  </li>
                </Link>
                {user.rol === "admin" && (
                  <Link to="/ventas-historial">
                    <li className="submenu-item">
                      <div className="submenu-link">
                        <FaListAlt className="submenu-icon" />
                        <span>Historial</span>
                      </div>
                    </li>
                  </Link>
                )}
              </motion.ul>
            )}
          </AnimatePresence>

          {/* Ingresos: para ambos */}
          <Link to="/ingresos">
            <li className="menu-item">
              <div className="menu-link">
                <FaDollarSign className="menu-icon" />
                {isOpen && (
                  <motion.span
                    className="menu-text"
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    variants={fadeVariants}
                  >
                    Ingresos
                  </motion.span>
                )}
              </div>
            </li>
          </Link>

          {/* Configuraciones: solo para admin */}
          {user && user.rol === "admin" && (
            <>
              <li
                className="menu-item"
                onClick={() => toggleSubMenu("configuraciones")}
              >
                <div className="menu-link">
                  <FaCog className="menu-icon" />
                  {isOpen && (
                    <motion.span
                      className="menu-text"
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      variants={fadeVariants}
                    >
                      Configuraciones
                    </motion.span>
                  )}
                </div>
                {isOpen && (
                  <div className="submenu-toggle">
                    {showConfiguraciones ? <FaAngleUp /> : <FaAngleDown />}
                  </div>
                )}
              </li>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.ul
                    className="submenu"
                    variants={submenuVariants}
                    initial="collapsed"
                    animate={showConfiguraciones ? "open" : "collapsed"}
                    exit="collapsed"
                  >
                    <Link to="/puntos-ventas">
                      <li className="submenu-item">
                        <div className="submenu-link">
                          <FaStore className="submenu-icon" />
                          <span>Puntos de Ventas</span>
                        </div>
                      </li>
                    </Link>
                    <Link to="/productos">
                      <li className="submenu-item">
                        <div className="submenu-link">
                          <FaProductHunt className="submenu-icon" />
                          <span>Productos</span>
                        </div>
                      </li>
                    </Link>
                    <Link to="/historial-movimientos">
                      <li className="submenu-item">
                        <div className="submenu-link">
                          <FaHistory className="submenu-icon" />
                          <span>Historial de Movimientos</span>
                        </div>
                      </li>
                    </Link>
                  </motion.ul>
                )}
              </AnimatePresence>
            </>
          )}
        </ul>
      </div>

      {/* Footer: Botón de Salir */}
      <div className="logout-container">
        <button className="logout-button" onClick={handleLogout}>
          <FaSignOutAlt className="logout-icon" />
          {isOpen && (
            <motion.span
              className="logout-text"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={fadeVariants}
            >
              Salir
            </motion.span>
          )}
        </button>
      </div>
    </motion.div>
  );
};

export default SideBar;
