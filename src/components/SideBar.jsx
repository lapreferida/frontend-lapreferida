"use client"

import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
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
  FaTruck,
} from "react-icons/fa"
import { motion, AnimatePresence } from "framer-motion"
import { useAuthContext } from "../context/AuthContext"
import { logout } from "../services/authService"
import "../styles/sidebar-modern.css"

// Variantes para animar el ancho del sidebar
const sidebarVariants = {
  open: {
    width: 250,
    transition: { type: "spring", stiffness: 200, damping: 20 },
  },
  closed: {
    width: 70,
    transition: { type: "spring", stiffness: 200, damping: 20 },
  },
}

// Variantes para animar la aparición/desaparición de textos
const fadeVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
}

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
}

const SideBar = ({ isOpen, toggleSidebar }) => {
  const [showVentas, setShowVentas] = useState(false)
  const [showConfiguraciones, setShowConfiguraciones] = useState(false)
  const [showReparto, setShowReparto] = useState(false)

  // Extraemos el usuario del contexto para saber su rol (se usa user.rol)
  const { logout: logoutContext, user } = useAuthContext()
  const navigate = useNavigate()

  const toggleSubMenu = (menu) => {
    if (menu === "ventas") {
      setShowVentas((prev) => !prev)
    } else if (menu === "configuraciones") {
      setShowConfiguraciones((prev) => !prev)
    } else if (menu === "reparto") {
      setShowReparto((prev) => !prev)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      logoutContext()
      navigate("/login")
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    }
  }

  return (
    <motion.div
      className={`sidebar-modern ${isOpen ? "open" : "closed"}`}
      variants={sidebarVariants}
      animate={isOpen ? "open" : "closed"}
      initial={false}
    >
      {/* Encabezado */}
      <div className="sidebar-header-modern">
        <div className="sidebar-logo-container">
          {isOpen ? (
            <motion.div
              className="sidebar-logo"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={fadeVariants}
            >
              <span className="logo-text">Panadería</span>
              <span className="logo-highlight">La Preferida</span>
            </motion.div>
          ) : (
            <motion.div className="sidebar-logo-small" initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
              <span>LP</span>
            </motion.div>
          )}
        </div>
        <button
          className="toggle-button-modern"
          onClick={(e) => {
            toggleSidebar()
            e.currentTarget.blur()
          }}
        >
          {isOpen ? <FaChevronLeft /> : <FaChevronRight />}
        </button>
      </div>

      {/* Opciones del menú */}
      <div className="sidebar-menu-container">
        <ul className="sidebar-menu">
          {/* Dashboard: siempre visible */}
          <li className="sidebar-menu-item">
            <Link to="/dashboard" className="sidebar-menu-link">
              <div className="sidebar-menu-icon">
                <FaHome />
              </div>
              {isOpen && (
                <motion.span
                  className="sidebar-menu-text"
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={fadeVariants}
                >
                  Dashboard
                </motion.span>
              )}
            </Link>
          </li>

          {/* Clientes: solo para admin */}
          {user && user.rol === "admin" && (
            <li className="sidebar-menu-item">
              <Link to="/clientes" className="sidebar-menu-link">
                <div className="sidebar-menu-icon">
                  <FaUsers />
                </div>
                {isOpen && (
                  <motion.span
                    className="sidebar-menu-text"
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    variants={fadeVariants}
                  >
                    Clientes
                  </motion.span>
                )}
              </Link>
            </li>
          )}

          {/* Ventas: para admin se muestran todas; para user solo Informe Z y Remitos */}
          {user && (
            <li className="sidebar-menu-item">
              <div className="sidebar-menu-link" onClick={() => toggleSubMenu("ventas")}>
                <div className="sidebar-menu-icon">
                  <FaChartBar />
                </div>
                {isOpen && (
                  <>
                    <motion.span
                      className="sidebar-menu-text"
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      variants={fadeVariants}
                    >
                      Ventas
                    </motion.span>
                    <div className="sidebar-submenu-toggle">{showVentas ? <FaAngleUp /> : <FaAngleDown />}</div>
                  </>
                )}
              </div>
              <AnimatePresence initial={false}>
                {isOpen && showVentas && (
                  <motion.ul
                    className="sidebar-submenu"
                    variants={submenuVariants}
                    initial="collapsed"
                    animate="open"
                    exit="collapsed"
                  >
                    {user.rol === "admin" && (
                      <li className="sidebar-submenu-item">
                        <Link to="/facturar-venta" className="sidebar-submenu-link">
                          <FaFileInvoiceDollar className="sidebar-submenu-icon" />
                          <span>Facturar Venta</span>
                        </Link>
                      </li>
                    )}
                    <li className="sidebar-submenu-item">
                      <Link to="/informe-z" className="sidebar-submenu-link">
                        <FaChartBar className="sidebar-submenu-icon" />
                        <span>Informe Z</span>
                      </Link>
                    </li>
                    <li className="sidebar-submenu-item">
                      <Link to="/remitos" className="sidebar-submenu-link">
                        <FaShoppingCart className="sidebar-submenu-icon" />
                        <span>Remitos</span>
                      </Link>
                    </li>
                    {user.rol === "admin" && (
                      <li className="sidebar-submenu-item">
                        <Link to="/ventas-historial" className="sidebar-submenu-link">
                          <FaListAlt className="sidebar-submenu-icon" />
                          <span>Historial</span>
                        </Link>
                      </li>
                    )}
                  </motion.ul>
                )}
              </AnimatePresence>
            </li>
          )}

          {/* Ingresos: para ambos */}
          <li className="sidebar-menu-item">
            <Link to="/ingresos" className="sidebar-menu-link">
              <div className="sidebar-menu-icon">
                <FaDollarSign />
              </div>
              {isOpen && (
                <motion.span
                  className="sidebar-menu-text"
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={fadeVariants}
                >
                  Ingresos
                </motion.span>
              )}
            </Link>
          </li>

          {/* Reparto: opción para roles admin y repartidor */}
          {user && (user.rol === "admin" || user.rol === "repartidor") && (
            <li className="sidebar-menu-item">
              <div className="sidebar-menu-link" onClick={() => toggleSubMenu("reparto")}>
                <div className="sidebar-menu-icon">
                  <FaTruck />
                </div>
                {isOpen && (
                  <>
                    <motion.span
                      className="sidebar-menu-text"
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      variants={fadeVariants}
                    >
                      Reparto
                    </motion.span>
                    <div className="sidebar-submenu-toggle">{showReparto ? <FaAngleUp /> : <FaAngleDown />}</div>
                  </>
                )}
              </div>
              <AnimatePresence initial={false}>
                {isOpen && showReparto && (
                  <motion.ul
                    className="sidebar-submenu"
                    variants={submenuVariants}
                    initial="collapsed"
                    animate="open"
                    exit="collapsed"
                  >
                    <li className="sidebar-submenu-item">
                      <Link to="/clientes-reparto" className="sidebar-submenu-link">
                        <FaUsers className="sidebar-submenu-icon" />
                        <span>Clientes Reparto</span>
                      </Link>
                    </li>
                    <li className="sidebar-submenu-item">
                      <Link to="/reparto" className="sidebar-submenu-link">
                        <FaTruck className="sidebar-submenu-icon" />
                        <span>Hacer Reparto</span>
                      </Link>
                    </li>
                    <li className="sidebar-submenu-item">
                      <Link to="/reparto-historial" className="sidebar-submenu-link">
                        <FaHistory className="sidebar-submenu-icon" />
                        <span>Historial de Repartos</span>
                      </Link>
                    </li>
                  </motion.ul>
                )}
              </AnimatePresence>
            </li>
          )}

          {/* Configuraciones: solo para admin */}
          {user && user.rol === "admin" && (
            <li className="sidebar-menu-item">
              <div className="sidebar-menu-link" onClick={() => toggleSubMenu("configuraciones")}>
                <div className="sidebar-menu-icon">
                  <FaCog />
                </div>
                {isOpen && (
                  <>
                    <motion.span
                      className="sidebar-menu-text"
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      variants={fadeVariants}
                    >
                      Configuraciones
                    </motion.span>
                    <div className="sidebar-submenu-toggle">
                      {showConfiguraciones ? <FaAngleUp /> : <FaAngleDown />}
                    </div>
                  </>
                )}
              </div>
              <AnimatePresence initial={false}>
                {isOpen && showConfiguraciones && (
                  <motion.ul
                    className="sidebar-submenu"
                    variants={submenuVariants}
                    initial="collapsed"
                    animate="open"
                    exit="collapsed"
                  >
                    <li className="sidebar-submenu-item">
                      <Link to="/puntos-ventas" className="sidebar-submenu-link">
                        <FaStore className="sidebar-submenu-icon" />
                        <span>Puntos de Ventas</span>
                      </Link>
                    </li>
                    <li className="sidebar-submenu-item">
                      <Link to="/productos" className="sidebar-submenu-link">
                        <FaProductHunt className="sidebar-submenu-icon" />
                        <span>Productos</span>
                      </Link>
                    </li>
                    <li className="sidebar-submenu-item">
                      <Link to="/historial-movimientos" className="sidebar-submenu-link">
                        <FaHistory className="sidebar-submenu-icon" />
                        <span>Historial de Movimientos</span>
                      </Link>
                    </li>
                  </motion.ul>
                )}
              </AnimatePresence>
            </li>
          )}
        </ul>
      </div>

      {/* Footer: Botón de Salir */}
      <div className="sidebar-footer">
        <button className="sidebar-logout-button" onClick={handleLogout}>
          <FaSignOutAlt className="sidebar-logout-icon" />
          {isOpen && (
            <motion.span
              className="sidebar-logout-text"
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
  )
}

export default SideBar
