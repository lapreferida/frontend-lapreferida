import { useState, useEffect } from "react";
import Pagination from "../components/Pagination";
// Nuevas importaciones para generar PDF
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// Función para formatear fecha: 2025-03-19T00:00:00.000Z => 2025-03-19
const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toISOString().split("T")[0];
};

// Función para formatear precios en moneda argentina
const formatCurrency = (value) => {
    return new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        minimumFractionDigits: 2,
    }).format(value);
};

const InformeTableRemitos = ({ title, data, detailType, onRowClick, startDate, endDate }) => {
    // Se fija la cantidad de ítems por página a 6
    const itemsPerPage = 6;
    const [currentPage, setCurrentPage] = useState(1);

    // Reinicia la página actual cuando la data cambia
    useEffect(() => {
        setCurrentPage(1);
    }, [data]);

    const totalItems = data.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const currentData = data.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Función para generar el PDF con todos los registros y el rango de fechas
    const generatePDF = () => {
        const doc = new jsPDF();
        // Título centrado
        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        const pageWidth = doc.internal.pageSize.getWidth();
        doc.text(title, pageWidth / 2, 15, { align: "center" });

        // Mostrar el texto "Informe de remitos desde ... hasta ..." debajo del título
        doc.setFontSize(12);
        const informeTexto = `Informe de remitos desde ${formatDate(startDate)} hasta ${formatDate(endDate)}`;
        doc.text(informeTexto, pageWidth / 2, 25, { align: "center" });

        // Definir las columnas y filas según el tipo de detalle
        let columns = [];
        let rows = [];
        if (detailType !== "productos") {
            // Columnas para remitos (facturado, pendiente, emitido)
            columns = ["N° Remito", "Cliente", "Fecha", "Subtotal"];
            // Aquí se usan TODOS los registros, no solo la página actual.
            rows = data.map(item => [
                item.numero_remito,
                `${item.razon_social} - ${item.direccion}`,
                formatDate(item.fecha),
                formatCurrency(item.subtotal)
            ]);
        } else {
            // En el caso de productos, no se mostrará el botón (por control de la UI)
            return;
        }

        // Agregar la tabla con autoTable, iniciando debajo del título y el rango de fechas.
        autoTable(doc, {
            startY: 30,
            head: [columns],
            body: rows,
            styles: { cellPadding: 3, fontSize: 10 },
            headStyles: { fillColor: [41, 128, 185], textColor: 255 },
            theme: 'grid',
        });

        // Descargar el PDF con un nombre basado en el título
        doc.save(`${title.replace(/ /g, "_")}.pdf`);
    };


    return (
        <div className="table-container">
            <h2 className="titleDetalleRemito">{title}</h2>

            {/* Se muestra el botón solo si el detalle NO es de productos */}
            {detailType !== "productos" && (
                <div className="pdf-download-container" style={{ marginBottom: "10px", textAlign: "right" }}>
                    <button className="btn-descargar-pdf" onClick={generatePDF}>
                        Descargar PDF
                    </button>
                </div>
            )}

            <table className="table">
                <thead>
                    {detailType === "productos" ? (
                        <tr>
                            <th>Producto</th>
                            <th>Cantidad</th>
                            <th>N° Remito</th>
                            <th>Fecha</th>
                        </tr>
                    ) : (
                        <tr>
                            <th>N° Remito</th>
                            <th>Cliente</th>
                            <th>Fecha</th>
                            <th>Subtotal</th>
                        </tr>
                    )}
                </thead>
                <tbody>
                    {currentData.length > 0 ? (
                        currentData.map((item, index) =>
                            detailType === "productos" ? (
                                <tr key={`${item.numero_remito}-${index}`}>
                                    <td>{item.nombre}</td>
                                    <td>{item.cantidad}</td>
                                    <td>{item.numero_remito}</td>
                                    <td>{formatDate(item.fecha)}</td>
                                </tr>
                            ) : (
                                <tr
                                    key={item.id}
                                    onClick={() => onRowClick && onRowClick(item)}
                                    style={{ cursor: "pointer" }}
                                >
                                    <td>{item.numero_remito}</td>
                                    {/* Se concatena la razón social y la dirección */}
                                    <td>{`${item.razon_social} - ${item.direccion}`}</td>
                                    <td>{formatDate(item.fecha)}</td>
                                    <td>{formatCurrency(item.subtotal)}</td>
                                </tr>
                            )
                        )
                    ) : (
                        <tr>
                            <td colSpan="4" className="no-results">
                                No se encontraron registros.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
            {totalPages > 1 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            )}
        </div>
    );
};

export default InformeTableRemitos;
