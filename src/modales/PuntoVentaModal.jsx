import { useState, useEffect } from "react";
import { FaHashtag, FaStore, FaCog, FaMapMarkerAlt } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const PuntoVentaModal = ({ puntoVenta, onClose, onSave, errorMsg }) => {
  const [formData, setFormData] = useState({
    numero: puntoVenta?.numero || "",
    nombre: puntoVenta?.nombre || "",
    sistema: puntoVenta?.sistema || "",
    domicilio: puntoVenta?.domicilio || "",
  });
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    setFormData({
      numero: puntoVenta?.numero || "",
      nombre: puntoVenta?.nombre || "",
      sistema: puntoVenta?.sistema || "",
      domicilio: puntoVenta?.domicilio || "",
    });
    setLocalError("");
  }, [puntoVenta]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Para el campo "numero": permitir solo dígitos y limitar a 5 caracteres
    if (name === "numero") {
      if (!/^\d*$/.test(value)) return;
      if (value.length > 5) return;
    }
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validar que "numero" tenga exactamente 5 dígitos
    if (formData.numero.length !== 5) {
      setLocalError("El número debe tener exactamente 5 dígitos.");
      return;
    }
    setLocalError("");
    onSave({ id: puntoVenta?.id, ...formData });
  };

  return (
    <AnimatePresence>
      <motion.div
        className="modal__overlay puntoVenta-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="modal__content puntoVenta-modal-content"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h3>{puntoVenta ? "Editar Punto de Venta" : "Agregar Punto de Venta"}</h3>
          <hr className="puntoVenta-modal-separator" />
          <form onSubmit={handleSubmit} className="puntoVenta-modal-form-grid">
            <div className="puntoVenta-input-group">
              <span className="puntoVenta-input-icon">
                <FaHashtag />
              </span>
              <input
                type="text"
                name="numero"
                placeholder="Número del Punto de Venta"
                value={formData.numero}
                onChange={handleChange}
                maxLength={5} // Limita a 5 caracteres
                pattern="\d{5}" // Validación nativa para 5 dígitos
                required
              />
            </div>
            <div className="puntoVenta-input-group">
              <span className="puntoVenta-input-icon">
                <FaStore />
              </span>
              <input
                type="text"
                name="nombre"
                placeholder="Nombre del Punto de Venta"
                value={formData.nombre}
                onChange={handleChange}
                required
              />
            </div>
            <div className="puntoVenta-input-group">
              <span className="puntoVenta-input-icon">
                <FaCog />
              </span>
              <input
                type="text"
                name="sistema"
                placeholder="Sistema"
                value={formData.sistema}
                onChange={handleChange}
                required
              />
            </div>
            <div className="puntoVenta-input-group">
              <span className="puntoVenta-input-icon">
                <FaMapMarkerAlt />
              </span>
              <input
                type="text"
                name="domicilio"
                placeholder="Domicilio"
                value={formData.domicilio}
                onChange={handleChange}
                required
              />
            </div>
            {/* Se muestran los errores locales y de prop */}
            {localError && <span className="puntoVenta-error-label">{localError}</span>}
            {errorMsg && <span className="puntoVenta-error-label">{errorMsg}</span>}
            <div className="puntoVenta-modal-buttons">
              <button type="submit">Guardar</button>
              <button type="button" onClick={onClose}>
                Cancelar
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PuntoVentaModal;
