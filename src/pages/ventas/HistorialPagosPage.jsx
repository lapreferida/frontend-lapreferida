import { useState, useEffect } from "react";
import { FaTrash, FaCalendarAlt } from "react-icons/fa";
import { useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import '../../styles/ventas/historialPagoPage.css'
import { getHistorialPagos, deletePago } from "../../services/pagosService.js";
import Pagination from "../../components/Pagination.jsx";
import DateModal from "../../modales/DateModal.jsx";

const HistorialPagosPage = () => {
  const [pagos, setPagos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState("fecha");
  const [sortDirection, setSortDirection] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);

  const location = useLocation();

  useEffect(() => {
    // Primero, revisamos si se pasó la factura mediante state
    if (location.state && location.state.factura) {
      setSearchTerm(location.state.factura);
    } else {
      // Si no viene por state, se puede seguir revisando en el query param (para mantener compatibilidad)
      const params = new URLSearchParams(location.search);
      const factura = params.get("factura");
      if (factura) {
        setSearchTerm(factura);
      }
    }

    // Para el parámetro de fecha se mantiene la lógica
    const params = new URLSearchParams(location.search);
    const fechaParam = params.get("fecha");
    if (fechaParam) {
      setStartDate(fechaParam);
      setEndDate(fechaParam);
    }
    fetchPagos();
  }, [location.search, location.state]);

  const fetchPagos = async () => {
    setIsLoading(true);
    try {
      const data = await getHistorialPagos();
      setPagos(data);
    } catch (error) {
      console.error("Error al obtener el historial de pagos:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo cargar el historial de pagos.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePago = (pagoId) => {
    Swal.fire({
      title: "¿Eliminar pago?",
      text: "Esta acción eliminará el pago del sistema.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar pago",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deletePago(pagoId);
          Swal.fire("Eliminado", "El pago ha sido eliminado.", "success");
          fetchPagos();
        } catch (error) {
          console.error(error);
          Swal.fire(
            "Error",
            error.response?.data?.message || "Error al eliminar el pago",
            "error"
          );
        }
      }
    });
  };

  // Filtrar pagos según búsqueda y rango de fechas
  const filterPagos = () => {
    return pagos.filter((pago) => {
      const term = searchTerm.trim().toLowerCase();
      const idString = pago.id ? pago.id.toString() : "";
      const ventaIdString = pago.venta_id ? pago.venta_id.toString() : "";

      const matchesSearch =
        !term ||
        idString.includes(term) ||
        (pago.numero_factura &&
          pago.numero_factura.toLowerCase().includes(term)) ||
        ventaIdString.includes(term);

      let matchesDate = true;
      const pagoDate = new Date(pago.fecha);
      if (startDate) {
        const start = new Date(startDate);
        if (pagoDate < start) {
          matchesDate = false;
        }
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setDate(end.getDate() + 1);
        if (pagoDate >= end) {
          matchesDate = false;
        }
      }
      return matchesSearch && matchesDate;
    });
  };


  // Ordenamiento
  const sortPagos = (pagosList) => {
    return pagosList.sort((a, b) => {
      let valueA, valueB;
      if (sortColumn === "fecha") {
        valueA = new Date(a.fecha);
        valueB = new Date(b.fecha);
      } else if (sortColumn === "monto") {
        valueA = parseFloat(a.monto);
        valueB = parseFloat(b.monto);
      } else {
        valueA = new Date(a.fecha);
        valueB = new Date(b.fecha);
      }
      if (valueA < valueB) {
        return sortDirection === "asc" ? -1 : 1;
      }
      if (valueA > valueB) {
        return sortDirection === "asc" ? 1 : -1;
      }
      return 0;
    });
  };

  // Aplicar filtros, ordenamiento y paginación
  const filteredPagos = sortPagos(filterPagos());
  const totalItems = filteredPagos.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const currentPagos = filteredPagos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleSortChange = (e) => {
    const value = e.target.value;
    const [column, direction] = value.split("-");
    setSortColumn(column);
    setSortDirection(direction);
  };

  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
    setCurrentPage(1);
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Abrir y cerrar modal de rango de fechas
  const openDateModal = () => {
    setIsDateModalOpen(true);
  };

  const closeDateModal = () => {
    setIsDateModalOpen(false);
  };

  // Botón para limpiar fechas desde el modal
  const clearDates = () => {
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return dateStr.includes("T") ? dateStr.split("T")[0] : dateStr;
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    })
      .format(value)
      .replace("ARS", "")
      .trim();
  };

  return (
    <main className="container pagos-container">
      <h1>Historial de Pagos</h1>
      <div className="header-container">
        <div className="left-header">
          <input
            type="text"
            placeholder="Buscar pago"
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>
        <div className="right-header">
          <button
            className="date-modal-button"
            onClick={openDateModal}
            title="Filtrar por rango de fechas"
          >
            <FaCalendarAlt />
          </button>
          <select onChange={handleSortChange} className="sort-select">
            <option value="fecha-desc">Fecha: Más recientes</option>
            <option value="fecha-asc">Fecha: Más antiguas</option>
            <option value="monto-desc">Monto: Mayor a menor</option>
            <option value="monto-asc">Monto: Menor a mayor</option>
          </select>
        </div>
      </div>

      {/* Componente DateModal */}
      <DateModal
        isOpen={isDateModalOpen}
        closeModal={closeDateModal}
        startDate={startDate}
        endDate={endDate}
        handleStartDateChange={handleStartDateChange}
        handleEndDateChange={handleEndDateChange}
        clearDates={clearDates}
      />

      {isLoading ? (
        <div className="loader">Cargando...</div>
      ) : (
        <>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>N° Pago</th>
                  <th>N° Factura</th>
                  <th>Fecha</th>
                  <th>Monto</th>
                  <th>Forma de Pago</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {currentPagos.length > 0 ? (
                  currentPagos.map((pago) => (
                    <tr key={pago.id}>
                      <td>{pago.id}</td>
                      <td>{pago.numero_factura ? pago.numero_factura : pago.venta_id}</td>
                      <td>{formatDate(pago.fecha)}</td>
                      <td>{formatCurrency(pago.monto)}</td>
                      <td>{pago.forma_pago}</td>
                      <td>
                        <button
                          className="action-button eliminar"
                          onClick={() => handleDeletePago(pago.id)}
                          title="Eliminar pago"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="no-results">
                      No se encontraron pagos.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </main>
  );
};

export default HistorialPagosPage;
