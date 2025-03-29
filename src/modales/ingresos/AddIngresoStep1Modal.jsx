import { motion, AnimatePresence } from "framer-motion";
import { FaSun, FaMoon, FaExchangeAlt, FaUser, FaTruck, FaListUl } from "react-icons/fa";

// Mapeo de iconos para cada tipo de ingreso
const typeIcons = {
  ingreso_manana: <FaSun className="type-icon" />,
  ingreso_tarde: <FaMoon className="type-icon" />,
  ingreso_transferencia: <FaExchangeAlt className="type-icon" />,
  ingreso_gaston: <FaUser className="type-icon" />,
  ingreso_reparto: <FaTruck className="type-icon" />,
  ingreso_varios: <FaListUl className="type-icon" />,
};

const AddIngresoStep1Modal = ({
  isOpen,
  closeModal,
  selectedType,
  setSelectedType,
  addIngresoTypes,
  handleContinueAdd,
  errorMsg,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="modal__overlay addIngresoStep1Modal__overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="modal__content addIngresoStep1Modal__content"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="modal-header-ingreso1">
              <h3>Selecciona el Tipo de Ingreso</h3>
            </div>
            <div className="ingreso-type-selection addIngresoStep1Modal__type-selection">
              {addIngresoTypes.map((tipo) => (
                <motion.div
                  key={tipo.key}
                  className={`ingreso-type-option ${selectedType === tipo.key ? "selected" : ""}`}
                  onClick={() => {
                    setSelectedType(tipo.key);
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {typeIcons[tipo.key]}
                  <span>{tipo.label}</span>
                </motion.div>
              ))}
            </div>
            {errorMsg && (
              <p className="ingreso-error-msg" style={{ textAlign: "center", color: "red" }}>
                {errorMsg}
              </p>
            )}
            <div className="edit-modal-buttons addIngresoStep1Modal__buttons">
              <button className="btn-modal-edit cancel" onClick={closeModal}>
                Cancelar
              </button>
              <button className="btn-modal-edit continue" onClick={handleContinueAdd}>
                Continuar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddIngresoStep1Modal;
