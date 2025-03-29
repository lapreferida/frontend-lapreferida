// RemitoDetailModal.jsx
import { motion } from "framer-motion";
import { FaTimesCircle, FaCalendarAlt, FaUserAlt, FaMoneyBillAlt } from "react-icons/fa";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const RemitoDetailModal = ({ remito, closeModal, formatFecha, formatCurrency }) => {
  // Si no se pasó un remito, no renderiza nada.
  if (!remito) return null;

  // Agrega este log para ver en la consola los datos que llegan al modal.
  console.log("Datos del remito en modal:", remito);

  // Función para calcular precio unitario (evitando división por cero)
  const getPrecioUnitario = (detalle) => {
    return detalle.cantidad && detalle.cantidad > 0
      ? detalle.subtotal / detalle.cantidad
      : 0;
  };

  // Unificar detalle (puede venir en "detalle" o "detalles")
  const detalleData = remito.detalle || remito.detalles || [];

  // Función para generar y descargar el PDF sin observaciones
  const downloadPDF = () => {
    const doc = new jsPDF();

    // Título centrado
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.text("FERAGA HERMANOS S.R.L.", pageWidth / 2, 15, { align: "center" });

    // Número de remito en negrita y centrado
    doc.setFontSize(16);
    doc.text(`Remito N° ${remito.numero_remito}`, pageWidth / 2, 30, { align: "center" });

    let y = 40; // Posición inicial para la información

    // Información general: Fecha, Cliente y Total
    doc.setFontSize(12);
    
    doc.setFont("helvetica", "bold");
    doc.text("Fecha:", 10, y);
    doc.setFont("helvetica", "normal");
    doc.text(formatFecha(remito.fecha), 30, y);
    y += 10;

    doc.setFont("helvetica", "bold");
    doc.text("Cliente:", 10, y);
    doc.setFont("helvetica", "normal");
    doc.text(`${remito.razon_social} - ${remito.direccion}`, 30, y);
    y += 10;

    doc.setFont("helvetica", "bold");
    doc.text("Total:", 10, y);
    doc.setFont("helvetica", "normal");
    doc.text(formatCurrency(remito.subtotal), 30, y);
    y += 10;

    // Si existe detalle, agregar una tabla con jsPDF-AutoTable
    if (detalleData.length > 0) {
      y += 10;
      const columns = [
        { header: "Producto", dataKey: "producto" },
        { header: "Precio Unitario", dataKey: "precioUnitario" },
        { header: "Cantidad", dataKey: "cantidad" },
        { header: "Subtotal", dataKey: "subtotal" },
      ];

      const rows = detalleData.map((item) => ({
        producto: item.nombre || `Producto ${item.producto_id}`,
        precioUnitario: formatCurrency(getPrecioUnitario(item)),
        cantidad: item.cantidad,
        subtotal: formatCurrency(item.subtotal),
      }));

      autoTable(doc, {
        startY: y,
        head: [columns.map((col) => col.header)],
        body: rows.map((row) => Object.values(row)),
        styles: { cellPadding: 3, fontSize: 10 },
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        theme: "grid",
      });
    }

    // Descargar el PDF
    doc.save(`remito_${remito.numero_remito}.pdf`);
  };

  return (
    <motion.div
      className="modal__overlay remito-modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={closeModal}  // Cierra al hacer click fuera del contenido
    >
      <motion.div
        className="modal__content remito-modal-content"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={(e) => e.stopPropagation()}  // Evita la propagación del click
      >
        <button className="remito-modal-close" onClick={closeModal}>
          <FaTimesCircle />
        </button>
        <h2 className="remito-modal-title">
          <strong>Remito N° {remito.numero_remito}</strong>
        </h2>
        <div className="remito-modal-info">
          <p>
            <FaCalendarAlt className="remito-info-icon" />
            <strong>Fecha:</strong>{" "}
            <span>{formatFecha(remito.fecha)}</span>
          </p>
          <p>
            <FaUserAlt className="remito-info-icon" />
            <strong>Cliente:</strong>{" "}
            <span
              className="cliente-info"
              title={`${remito.razon_social} - ${remito.direccion}`}
            >
              {remito.razon_social} - {remito.direccion}
            </span>
          </p>
          <p>
            <FaMoneyBillAlt className="remito-info-icon" />
            <strong>Total:</strong>{" "}
            <span>{formatCurrency(remito.subtotal)}</span>
          </p>
        </div>
        {detalleData.length > 0 && (
          <div className="remito-modal-detail">
            <h3>Detalle del Remito</h3>
            <div className="detalle-table-container">
              <table className="detalle-table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Precio Unitario</th>
                    <th>Cantidad</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {detalleData.map((item, index) => (
                    <tr key={index}>
                      <td>{item.nombre || `Producto ${item.producto_id}`}</td>
                      <td>{formatCurrency(getPrecioUnitario(item))}</td>
                      <td>{item.cantidad}</td>
                      <td>{formatCurrency(item.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {/* Botón para descargar el PDF */}
        <div className="pdf-download-container" style={{ marginTop: "20px", textAlign: "center" }}>
          <button className="btn-descargar-pdf" onClick={downloadPDF}>
            Descargar PDF
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default RemitoDetailModal;
