// DiferenciaModal.jsx
import { motion, AnimatePresence } from "framer-motion";
import { FaSun, FaFileAlt, FaBalanceScale } from "react-icons/fa";
import "../../styles/ingresosPage.css";

const DiferenciaModal = ({ isOpen, onClose, ingreso, formatCurrency }) => {
  if (!isOpen || !ingreso) return null;

  // Sumar mañana, tarde y transferencia
  const totalMananaTardeTransfer =
    parseFloat(ingreso.ingreso_manana) +
    parseFloat(ingreso.ingreso_tarde) +
    parseFloat(ingreso.ingreso_transferencia);
  const totalInformes = parseFloat(ingreso.ingreso_informes);
  let diff = 0;
  let diffLabel = "";
  if (totalInformes === 0) {
    diff = 0;
    diffLabel = "No se ingresó total de informes";
  } else {
    diff = totalMananaTardeTransfer - totalInformes;
    diffLabel = diff > 0 ? "Sobrante" : diff < 0 ? "Faltante" : "Igualado";
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="modal__overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="modal__content modal4"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="modal-header-diferencia">
              <h2>Detalle de Diferencia</h2>
            </div>
            <div className="modal-body">
              <p>
                <FaSun className="icon-diferencia" />
                <strong>Mañana + Tarde + Transferencia:</strong>{" "}
                {formatCurrency(totalMananaTardeTransfer)}
              </p>
              <p>
                <FaFileAlt className="icon-diferencia" />
                <strong>Total Informes (Z):</strong>{" "}
                {totalInformes !== 0 ? formatCurrency(totalInformes) : "0"}
              </p>
              <p>
                <FaBalanceScale className="icon-diferencia" />
                <strong>Diferencia:</strong>{" "}
                {totalInformes !== 0
                  ? diff > 0
                    ? `+${formatCurrency(diff)}`
                    : formatCurrency(diff)
                  : "0"}{" "}
                ({diffLabel})
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn-modal-edit cancel" onClick={onClose}>
                Cerrar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DiferenciaModal;
