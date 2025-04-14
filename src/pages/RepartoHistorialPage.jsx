// frontend/RepartoHistorialPage.jsx
import { useState, useEffect } from "react";
import Swal from "sweetalert2";

// Componentes
import Loader from "../components/Loader.jsx";
import Pagination from "../components/Pagination.jsx";

// Servicios
import { getHistorialRepartosPorDia } from "../services/repartoService.js";

const RepartoHistorialPage = () => {
  // Estados para el historial, fecha, búsqueda, carga, paginación y errores
  const [historial, setHistorial] = useState([]);
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Carga el historial cada vez que cambia la fecha
  useEffect(() => {
    fetchHistorial();
  }, [fecha]);

  // Actualiza itemsPerPage según la altura de la ventana
  useEffect(() => {
    const updateItemsPerPage = () => {
      const height = window.innerHeight;
      if (height <= 576) {
        setItemsPerPage(5);
      } else if (height <= 700) {
        setItemsPerPage(7);
      } else if (height <= 800) {
        setItemsPerPage(10);
      } else if (height <= 1200) {
        setItemsPerPage(12);
      } else {
        setItemsPerPage(14);
      }
      // Reiniciar la página al cambiar el número de ítems
      setCurrentPage(1);
    };

    updateItemsPerPage();
    window.addEventListener("resize", updateItemsPerPage);
    return () => window.removeEventListener("resize", updateItemsPerPage);
  }, []);

  // Función para obtener el historial de repartos para la fecha indicada
  const fetchHistorial = async () => {
    setIsLoading(true);
    try {
      const data = await getHistorialRepartosPorDia(fecha);
      setHistorial(data);
      setErrorMsg("");
    } catch (error) {
      console.error("Error al obtener historial de repartos:", error);
      setErrorMsg("No se pudo cargar el historial de repartos.");
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo cargar el historial de repartos.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Manejo del cambio en el input de búsqueda
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Manejo del cambio en la fecha
  const handleDateChange = (e) => {
    setFecha(e.target.value);
    setCurrentPage(1);
  };

  // Filtrado del historial según el nombre del cliente
  const filteredHistorial = historial.filter((item) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    return (item.cliente || "").toLowerCase().includes(term);
  });

  // Configuración de la paginación
  const totalItems = filteredHistorial.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const currentHistorial = filteredHistorial.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <main className="container">
      <h1>Historial de Repartos</h1>
      {/* Header con buscador a la izquierda y filtro por fecha a la derecha */}
      <div
        className="header-container"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <div className="search-wrapper" style={{ flex: 1, marginRight: "1rem" }}>
          <input
            type="text"
            placeholder="Buscar por cliente..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>
        <div className="date-filter" style={{ flexShrink: 0 }}>
          <label htmlFor="fecha" style={{ marginRight: "0.5rem" }}>
            Filtrar por día:
          </label>
          <input
            type="date"
            id="fecha"
            value={fecha}
            onChange={handleDateChange}
          />
        </div>
      </div>

      {isLoading && <Loader />}

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Productos</th>
              <th>Total</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {currentHistorial.length > 0 ? (
              currentHistorial.map((item, index) => (
                <tr key={index}>
                  <td>{item.cliente}</td>
                  <td>{item.productos}</td>
                  <td>{Number(item.total).toFixed(2)}</td>
                  <td>{item.estado}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="no-results">
                  No se encontraron registros para la fecha seleccionada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </main>
  );
};

export default RepartoHistorialPage;
