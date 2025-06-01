"use client"

import { motion } from "framer-motion"
import "../styles/loanding-screen.css"

const LoadingScreen = () => {
  return (
    <div className="loading-screen">
      <div className="loading-content">
        <motion.div
          className="loading-logo"
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "loop",
          }}
        >
          LP
        </motion.div>
        <motion.div
          className="loading-spinner"
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
        <p className="loading-text">Cargando...</p>
      </div>
    </div>
  )
}

export default LoadingScreen
