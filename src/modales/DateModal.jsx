import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaTrashAlt } from "react-icons/fa";

const DateModal = ({
  isOpen,
  closeModal,
  startDate,
  endDate,
  handleStartDateChange,
  handleEndDateChange,
  clearDates,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="modal__overlay dateModal__overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="modal__content dateModal__content"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <button className="modal__close dateModal__close-icon" onClick={closeModal}>
              <FaTimes />
            </button>
            <h2>Filtrar por rango de fechas</h2>
            <div className="dateModal__dates">
              <label>
                Desde:
                <input
                  type="date"
                  value={startDate}
                  onChange={handleStartDateChange}
                  className="dateModal__input"
                />
              </label>
              <label>
                Hasta:
                <input
                  type="date"
                  value={endDate}
                  onChange={handleEndDateChange}
                  className="dateModal__input"
                />
              </label>
            </div>
            <div className="dateModal__buttons">
              <button
                onClick={clearDates}
                className="dateModal__clear-button"
                title="Limpiar fechas"
              >
                <FaTrashAlt />
              </button>
              <button
                onClick={closeModal}
                className="dateModal__apply-button"
                title="Aplicar filtro"
              >
                Aplicar Filtro
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DateModal;
