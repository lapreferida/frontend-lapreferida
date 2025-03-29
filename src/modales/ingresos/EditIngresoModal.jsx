import { motion, AnimatePresence } from "framer-motion";
import { NumericFormat } from "react-number-format";
import { 
  FaTimes, 
  FaSun, 
  FaMoon, 
  FaExchangeAlt, 
  FaUser, 
  FaTruck, 
  FaShoppingCart, 
  FaEllipsisH 
} from "react-icons/fa";

// Mapeo de iconos para cada tipo de ingreso
const typeIcons = {
  ingreso_manana: <FaSun className="edit-type-icon" />,
  ingreso_tarde: <FaMoon className="edit-type-icon" />,
  ingreso_transferencia: <FaExchangeAlt className="edit-type-icon" />,
  ingreso_gaston: <FaUser className="edit-type-icon" />,
  ingreso_reparto: <FaTruck className="edit-type-icon" />,
  ingreso_ventas: <FaShoppingCart className="edit-type-icon" />,
  ingreso_varios: <FaEllipsisH className="edit-type-icon" />,
};

const EditIngresoModal = ({
  isOpen,
  closeModal,
  editingIngreso,
  setEditingIngreso,
  handleSaveEdit,
  errorMsg,
  ingresoTypes,
  getDayName,
}) => {
  return (
    <AnimatePresence>
      {isOpen && editingIngreso && (
        <motion.div
          className="modal__overlay editIngresoModal__overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="modal__content editIngresoModal__content"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="modal-header-edit">
              <h3>Editar Ingreso</h3>
              <div className="header-right">
                <label className="modal-label-date">
                  {editingIngreso.fecha}
                </label>
              </div>
            </div>
            <form onSubmit={handleSaveEdit}>
              <div className="edit-ingreso-input-grid">
                {ingresoTypes.map((tipo) => (
                  <div key={tipo.key} className="edit-ingreso-input-group">
                    <label>
                      {typeIcons[tipo.key]}
                      {tipo.label}:
                    </label>
                    <NumericFormat
                      thousandSeparator="."
                      decimalSeparator=","
                      decimalScale={2}
                      fixedDecimalScale={true}
                      name={tipo.key}
                      placeholder="Importe"
                      value={editingIngreso[tipo.key]}
                      onValueChange={(values) =>
                        setEditingIngreso({
                          ...editingIngreso,
                          [tipo.key]: values.value,
                        })
                      }
                      required
                      className="modal-input-currency"
                    />
                  </div>
                ))}
              </div>
              {errorMsg && <p className="ingreso-error-msg">{errorMsg}</p>}
              <div className="edit-modal-buttons editIngresoModal__buttons">
                <button
                  type="button"
                  className="btn-modal-edit cancel"
                  onClick={closeModal}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-modal-edit continue">
                  Guardar
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EditIngresoModal;
