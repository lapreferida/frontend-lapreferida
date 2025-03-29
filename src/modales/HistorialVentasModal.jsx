import { motion } from "framer-motion";
import {
  FaTimesCircle,
  FaCalendarAlt,
  FaUserAlt,
  FaMoneyBillAlt,
  FaCheck,
  FaCreditCard,
  FaUniversity,
  FaMoneyCheckAlt,
} from "react-icons/fa";
import { NumericFormat } from "react-number-format";
import { useNavigate } from "react-router-dom";

const HistorialModal = ({
  selectedVenta,
  closeModal,
  paymentInput,
  setPaymentInput,
  formaPago,
  setFormaPago,
  handlePagoSubmit,
  formatDate,
  formatCurrency,
  calcularPendiente,
}) => {
  const navigate = useNavigate();

  // Handler para ir a nota de crédito
  const handleNotaCredito = () => {
    // Se navega a "notas-creditos" pasando la información de la factura
    navigate("/notas-creditos", { state: { factura: selectedVenta } });
  };

  return (
    <motion.div
      className="modal__overlay historial-ventas-modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="modal__content historial-ventas-modal-content"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <button className="historial-ventas-modal-close" onClick={closeModal}>
          <FaTimesCircle />
        </button>
        <h2 className="historial-ventas-modal-title">
          Factura N° {selectedVenta.numero_factura}
        </h2>
        <div className="historial-ventas-modal-info grid-two-columns">
          <p>
            <FaCalendarAlt className="historial-ventas-info-icon" />
            <strong>Fecha:</strong> {formatDate(selectedVenta.fecha)}
          </p>
          <p>
            <FaUserAlt className="historial-ventas-info-icon" />
            <strong>Cliente:</strong> {selectedVenta.razon_social}
          </p>
          <p>
            <FaMoneyBillAlt className="historial-ventas-info-icon" />
            <strong>Neto:</strong> {formatCurrency(selectedVenta.neto)}
          </p>
          <p>
            <FaMoneyBillAlt className="historial-ventas-info-icon" />
            <strong>Descuento:</strong> {formatCurrency(selectedVenta.descuento)}
          </p>
          <p>
            <FaMoneyBillAlt className="historial-ventas-info-icon" />
            <strong>IVA:</strong> {formatCurrency(selectedVenta.iva)}
          </p>
          <p>
            <FaMoneyBillAlt className="historial-ventas-info-icon" />
            <strong>Otros Impuestos:</strong> {formatCurrency(selectedVenta.otros_impuestos)}
          </p>
          <p>
            <FaMoneyBillAlt className="historial-ventas-info-icon" />
            <strong>Subtotal:</strong> {formatCurrency(selectedVenta.subtotal)}
          </p>
          <p>
            <FaMoneyBillAlt className="historial-ventas-info-icon" />
            <strong>Total:</strong> {formatCurrency(selectedVenta.total)}
          </p>
          <p>
            <FaMoneyBillAlt className="historial-ventas-info-icon" />
            <strong>Abonado:</strong> {formatCurrency(selectedVenta.total_pagado)}
          </p>
          {selectedVenta.estado === "Pendiente" && (
            <p>
              <FaMoneyBillAlt className="historial-ventas-info-icon" />
              <strong>Pendiente:</strong> {formatCurrency(calcularPendiente(selectedVenta))}
            </p>
          )}
        </div>

        {/* Envolvemos ambos enlaces en un contenedor flex */}
        <div className="historial-ventas-links">
          {selectedVenta.total_pagado > 0 && (
            <button
              className="historial-ventas-link-button"
              onClick={() =>
                navigate("/pagos-historial", { state: { factura: selectedVenta.numero_factura } })
              }

            >
              Ver detalle de pagos
            </button>

          )}
          {selectedVenta.estado === "Pendiente" && (
            <button
              className="historial-ventas-link-button"
              onClick={handleNotaCredito}
            >
              Aplicar Nota de Crédito
            </button>
          )}
        </div>

        {selectedVenta.estado === "Pendiente" && (
          <form
            className="historial-ventas-modal-form"
            onSubmit={handlePagoSubmit}
          >
            <label
              htmlFor="paymentInput"
              className="historial-ventas-modal-label"
            >
              Ingresar monto a pagar:
            </label>
            <NumericFormat
              id="paymentInput"
              name="paymentInput"
              thousandSeparator="."
              decimalSeparator=","
              decimalScale={2}
              fixedDecimalScale={true}
              prefix="$ "
              placeholder="$ 0"
              value={paymentInput}
              onValueChange={({ value }) => setPaymentInput(value)}
              className="historial-ventas-modal-input"
              required
            />

            <div className="payment-options">
              <label
                className={`payment-option ${formaPago === "Efectivo" ? "active" : ""
                  }`}
              >
                <input
                  type="radio"
                  name="formaPago"
                  value="Efectivo"
                  checked={formaPago === "Efectivo"}
                  onChange={(e) => setFormaPago(e.target.value)}
                />
                <FaMoneyBillAlt className="payment-icon" />
                <span>Efectivo</span>
              </label>
              <label
                className={`payment-option ${formaPago === "Tarjeta" ? "active" : ""
                  }`}
              >
                <input
                  type="radio"
                  name="formaPago"
                  value="Tarjeta"
                  checked={formaPago === "Tarjeta"}
                  onChange={(e) => setFormaPago(e.target.value)}
                />
                <FaCreditCard className="payment-icon" />
                <span>Tarjeta</span>
              </label>
              <label
                className={`payment-option ${formaPago === "Transferencia" ? "active" : ""
                  }`}
              >
                <input
                  type="radio"
                  name="formaPago"
                  value="Transferencia"
                  checked={formaPago === "Transferencia"}
                  onChange={(e) => setFormaPago(e.target.value)}
                />
                <FaUniversity className="payment-icon" />
                <span>Transferencia</span>
              </label>
              <label
                className={`payment-option ${formaPago === "Cheques" ? "active" : ""
                  }`}
              >
                <input
                  type="radio"
                  name="formaPago"
                  value="Cheques"
                  checked={formaPago === "Cheques"}
                  onChange={(e) => setFormaPago(e.target.value)}
                />
                <FaMoneyCheckAlt className="payment-icon" />
                <span>Cheques</span>
              </label>
            </div>

            <div className="historial-ventas-modal-buttons-venta">
              <button
                type="submit"
                className="historial-ventas-modal-button-venta pago"
              >
                <FaCheck /> Registrar Pago
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
};

export default HistorialModal;
