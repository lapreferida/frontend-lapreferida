import { useState, useEffect } from "react";
import { FaUser, FaPhone, FaMapMarkerAlt } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import "../styles/clientesPage.css";

const ClienteRepartoModal = ({ cliente, onClose, onSave, errorMsg }) => {
  const [formData, setFormData] = useState({
    nombre: cliente?.nombre || "",
    telefono: cliente?.telefono || "",
    direccion: cliente?.direccion || "",
  });

  useEffect(() => {
    setFormData({
      nombre: cliente?.nombre || "",
      telefono: cliente?.telefono || "",
      direccion: cliente?.direccion || "",
    });
  }, [cliente]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ id: cliente?.id, ...formData });
  };

  return (
    <AnimatePresence>
      <motion.div
        className="modal__overlay cliente-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="modal__content cliente-modal-content"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h3>{cliente ? "Editar Cliente de Reparto" : "Agregar Cliente de Reparto"}</h3>
          <hr className="cliente-modal-separator" />
          <form onSubmit={handleSubmit} className="cliente-modal-form-grid">
            {/* Primera columna */}
            <div className="cliente-form-column">
              <div className="cliente-input-group">
                <span className="cliente-input-icon">
                  <FaUser />
                </span>
                <input
                  type="text"
                  name="nombre"
                  placeholder="Nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="cliente-input-group">
                <span className="cliente-input-icon">
                  <FaPhone />
                </span>
                <input
                  type="tel"
                  name="telefono"
                  placeholder="Teléfono"
                  value={formData.telefono}
                  onChange={handleChange}
                />
              </div>
            </div>
            {/* Segunda columna */}
            <div className="cliente-form-column">
              <div className="cliente-input-group">
                <span className="cliente-input-icon">
                  <FaMapMarkerAlt />
                </span>
                <input
                  type="text"
                  name="direccion"
                  placeholder="Dirección"
                  value={formData.direccion}
                  onChange={handleChange}
                />
              </div>
            </div>
            {errorMsg && <span className="cliente-error-label">{errorMsg}</span>}
            <div className="cliente-modal-buttons">
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

export default ClienteRepartoModal;
