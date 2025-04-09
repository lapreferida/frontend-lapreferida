import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import SideBar from "./SideBar";
import { useLocation } from 'react-router-dom';
import "../styles/layout.css";

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
};

const Layout = ({ children }) => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="layout">
      <SideBar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <main className={`content ${isSidebarOpen ? "with-sidebar" : "minimized-sidebar"}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="page-content"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Layout;
