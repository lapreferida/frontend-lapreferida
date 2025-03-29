import { motion, AnimatePresence } from "framer-motion";
import { NumericFormat } from "react-number-format";
import { FaTimes, FaCalendarAlt, FaDollarSign } from "react-icons/fa";

const AddIngresoStep2Modal = ({
  isOpen,
  closeModal,
  newIngresoDate,
  setNewIngresoDate,
  newIngresoAmount,
  setNewIngresoAmount,
  handleAddIngreso,
  selectedType,
  addIngresoTypes,
  errorMsg  // nueva prop para mostrar error inline
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="modal__overlay addIngresoStep2Modal__overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="modal__content addIngresoStep2Modal__content"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="modal-header-ingreso2">
              <h3>
                Agregar{" "}
                {addIngresoTypes.find((tipo) => tipo.key === selectedType)?.label}
              </h3>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddIngreso();
              }}
            >
              <div className="input-group-ingreso2">
                <input
                  type="date"
                  value={newIngresoDate}
                  onChange={(e) => setNewIngresoDate(e.target.value)}
                  required
                  className="modal-input-ingreso2"
                />
              </div>
              <div className="input-group-ingreso2">
                <NumericFormat
                  autoFocus
                  thousandSeparator="."
                  decimalSeparator=","
                  decimalScale={2}
                  fixedDecimalScale={true}
                  placeholder="Importe"
                  value={newIngresoAmount}
                  onValueChange={(values) => setNewIngresoAmount(values.value)}
                  required
                  className="modal-input-ingreso2"
                />
              </div>
              {/* Mensaje de error inline en el modal */}
              {errorMsg && (
                <p className="ingreso-error-msg" style={{ textAlign: "center", color: "red" }}>
                  {errorMsg}
                </p>
              )}
              <div className="edit-modal-buttons addIngresoStep2Modal__buttons">
                <button
                  type="button"
                  className="btn-modal-edit cancel"
                  onClick={closeModal}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-modal-edit continue">
                  Agregar
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddIngresoStep2Modal;
