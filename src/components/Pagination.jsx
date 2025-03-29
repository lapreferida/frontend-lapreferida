import { motion } from "framer-motion";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  // Si solo hay una página, no se muestra la paginación
  if (totalPages <= 1) return null;

  return (
    <div className="pagination">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="pagination-button"
      >
        Anterior
      </motion.button>
      <span className="pagination-current">
        {currentPage} de {totalPages}
      </span>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="pagination-button"
      >
        Siguiente
      </motion.button>
    </div>
  );
};

export default Pagination;
