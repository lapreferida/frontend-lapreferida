"use client"

import { useState, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import SideBar from "./SideBar"
import { useLocation } from "react-router-dom"
import "../styles/layout-modern.css"

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
}

const Layout = ({ children }) => {
  const location = useLocation()
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

  // Manejar cambios de tamaño de ventana
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768
      setIsMobile(mobile)

      // En dispositivos móviles, cerrar automáticamente el sidebar
      if (mobile && isSidebarOpen) {
        setIsSidebarOpen(false)
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [isSidebarOpen])

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  return (
    <div className="layout-modern">
      <SideBar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      <main className={`content-modern ${isSidebarOpen ? "with-sidebar" : "minimized-sidebar"}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="page-content-modern"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}

export default Layout
