import { motion, AnimatePresence } from "framer-motion";
import { NumericFormat } from "react-number-format";
import { FaDollarSign, FaPercentage, FaMoneyBillWave } from "react-icons/fa";
import { useState, useEffect } from "react";
import "../styles/ventas/historialVentasPage.css";

const EditInformeZModal = ({
  isOpen,
  closeModal,
  editingInforme,
  setEditingInforme,
  handleSaveEdit,
  errorMsg,
}) => {
  // Función para recalcular los valores según los netos ingresados
  const recalcValores = (neto10_5, neto21) => {
    const parsedNeto10_5 = parseFloat(neto10_5) || 0;
    const parsedNeto21 = parseFloat(neto21) || 0;
    const newIva10_5 = Number((parsedNeto10_5 * 0.105).toFixed(2));
    const newIva21 = Number((parsedNeto21 * 0.21).toFixed(2));
    const newSubtotal10_5 = Number((parsedNeto10_5 + newIva10_5).toFixed(2));
    const newSubtotal21 = Number((parsedNeto21 + newIva21).toFixed(2));
    const newTotalGeneral = Number((newSubtotal10_5 + newSubtotal21).toFixed(2));
    return { newIva10_5, newIva21, newTotalGeneral };
  };

  // Manejar cambio en neto 10,5%
  const handleNeto10_5Change = (values) => {
    const newNeto10_5 = values.value;
    const { newIva10_5, newTotalGeneral } = recalcValores(newNeto10_5, editingInforme.neto_21);
    setEditingInforme({
      ...editingInforme,
      neto_10_5: newNeto10_5,
      iva_10_5: newIva10_5.toFixed(2),
      total_general: newTotalGeneral.toFixed(2),
    });
  };

  // Manejar cambio en neto 21%
  const handleNeto21Change = (values) => {
    const newNeto21 = values.value;
    const { newIva21, newTotalGeneral } = recalcValores(editingInforme.neto_10_5, newNeto21);
    setEditingInforme({
      ...editingInforme,
      neto_21: newNeto21,
      iva_21: newIva21.toFixed(2),
      total_general: newTotalGeneral.toFixed(2),
    });
  };

  // Formatear la fecha para mostrar solo "YYYY-MM-DD"
  const formattedDate =
    editingInforme && editingInforme.fecha
      ? editingInforme.fecha.includes("T")
        ? editingInforme.fecha.split("T")[0]
        : editingInforme.fecha
      : "";

  return (
    <AnimatePresence>
      {isOpen && editingInforme && (
        <motion.div
          className="modal__overlay editInformeZModal__overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="modal__content editInformeZModal__content"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="modal-header-edit">
              <h3>Editar Informe Z</h3>
              <div className="header-right">
                <label className="modal-label-date">{formattedDate}</label>
              </div>
            </div>
            <form onSubmit={handleSaveEdit}>
              <div className="edit-informe-input-grid">
                {/* Neto 10,5% */}
                <div className="edit-informe-input-group">
                  <label htmlFor="neto10_5">
                    <FaDollarSign className="edit-type-icon" />
                    Neto 10,5%:
                  </label>
                  <NumericFormat
                    id="neto10_5"
                    thousandSeparator="."
                    decimalSeparator=","
                    decimalScale={2}
                    fixedDecimalScale
                    value={editingInforme.neto_10_5}
                    onValueChange={handleNeto10_5Change}
                    required
                    className="modal-input-currency"
                  />
                </div>
                {/* IVA Calculado 10,5% (read-only) */}
                <div className="edit-informe-input-group">
                  <label htmlFor="iva10_5">
                    <FaPercentage className="edit-type-icon" />
                    IVA 10,5%:
                  </label>
                  <NumericFormat
                    id="iva10_5"
                    thousandSeparator="."
                    decimalSeparator=","
                    decimalScale={2}
                    fixedDecimalScale
                    value={editingInforme.iva_10_5}
                    readOnly
                    className="modal-input-currency"
                  />
                </div>
                {/* Neto 21% */}
                <div className="edit-informe-input-group">
                  <label htmlFor="neto21">
                    <FaDollarSign className="edit-type-icon" />
                    Neto 21%:
                  </label>
                  <NumericFormat
                    id="neto21"
                    thousandSeparator="."
                    decimalSeparator=","
                    decimalScale={2}
                    fixedDecimalScale
                    value={editingInforme.neto_21}
                    onValueChange={handleNeto21Change}
                    required
                    className="modal-input-currency"
                  />
                </div>
                {/* IVA Calculado 21% (read-only) */}
                <div className="edit-informe-input-group">
                  <label htmlFor="iva21">
                    <FaPercentage className="edit-type-icon" />
                    IVA 21%:
                  </label>
                  <NumericFormat
                    id="iva21"
                    thousandSeparator="."
                    decimalSeparator=","
                    decimalScale={2}
                    fixedDecimalScale
                    value={editingInforme.iva_21}
                    readOnly
                    className="modal-input-currency"
                  />
                </div>
                {/* Total General (read-only) */}
                <div className="edit-informe-input-group">
                  <label htmlFor="totalGeneral">
                    <FaMoneyBillWave className="edit-type-icon" />
                    Total General:
                  </label>
                  <NumericFormat
                    id="totalGeneral"
                    thousandSeparator="."
                    decimalSeparator=","
                    decimalScale={2}
                    fixedDecimalScale
                    value={editingInforme.total_general}
                    readOnly
                    className="modal-input-currency"
                  />
                </div>
              </div>
              {errorMsg && <p className="ingreso-error-msg">{errorMsg}</p>}
              <div className="edit-modal-buttons">
                <button type="button" className="btn-modal-edit cancel" onClick={closeModal}>
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

export default EditInformeZModal;
