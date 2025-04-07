import { useState, useEffect } from "react";
import { FaStore, FaEdit, FaTrash } from "react-icons/fa";
import Swal from "sweetalert2";
// Servicios (debes crear las funciones en services/ventas/puntoVentaService.js)
import { getPuntosVentas, createPuntoVenta, updatePuntoVenta, deletePuntoVenta } from "../../services/ventas/puntoVentaService.js";
// Componentes
import PuntoVentaModal from "../../modales/PuntoVentaModal.jsx";
import Pagination from "../../components/Pagination.jsx";
import "../../styles/puntosVentasPage.css";
import Loader from "../../components/Loader.jsx";

const PuntosVentasPage = () => {
  const [puntosVentas, setPuntosVentas] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPuntoVenta, setSelectedPuntoVenta] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchPuntosVentas();
  }, []);

  const fetchPuntosVentas = async () => {
    setIsLoading(true);
    try {
      const data = await getPuntosVentas();
      setPuntosVentas(data);
      setErrorMsg("");
    } catch (error) {
      console.error("Error al obtener puntos de ventas:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar los puntos de venta.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (puntoVenta = null) => {
    setSelectedPuntoVenta(puntoVenta);
    setErrorMsg("");
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setErrorMsg("");
    setModalOpen(false);
  };

  const handleSavePuntoVenta = async (puntoVenta) => {
    setIsLoading(true);
    try {
      if (puntoVenta.id) {
        await updatePuntoVenta(puntoVenta.id, puntoVenta);
        setPuntosVentas((prevPuntos) =>
          prevPuntos.map((pv) => (pv.id === puntoVenta.id ? puntoVenta : pv))
        );
        Swal.fire({
          icon: "success",
          title: "Punto de Venta actualizado",
          text: "El punto de venta ha sido actualizado exitosamente.",
        });
      } else {
        const newPunto = await createPuntoVenta(puntoVenta);
        setPuntosVentas((prevPuntos) => [...prevPuntos, newPunto]);
        Swal.fire({
          icon: "success",
          title: "Punto de Venta creado",
          text: "El punto de venta ha sido creado exitosamente.",
        });
      }
      handleCloseModal();
    } catch (error) {
      console.error("Error al guardar el punto de venta:", error);
      setErrorMsg(
        error.response?.data?.message ||
          error.message ||
          "Error al guardar el punto de venta. Verifica la información."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePuntoVenta = (id) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "¡No podrás revertir esta acción!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, eliminar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        setIsLoading(true);
        try {
          await deletePuntoVenta(id);
          setPuntosVentas((prevPuntos) =>
            prevPuntos.filter((pv) => pv.id !== id)
          );
          Swal.fire(
            "Eliminado!",
            "El punto de venta ha sido eliminado exitosamente.",
            "success"
          );
        } catch (error) {
          console.error("Error al eliminar el punto de venta:", error);
          Swal.fire({
            icon: "error",
            title: "Error",
            text:
              error.response?.data?.message ||
              error.message ||
              "Hubo un error al eliminar el punto de venta. Por favor, inténtalo de nuevo.",
          });
        } finally {
          setIsLoading(false);
        }
      }
    });
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const filteredPuntosVentas = puntosVentas.filter((punto) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    return (
      (punto.numero || "").toLowerCase().includes(term) ||
      (punto.nombre || "").toLowerCase().includes(term) ||
      (punto.sistema || "").toLowerCase().includes(term) ||
      (punto.domicilio || "").toLowerCase().includes(term)
    );
  });

  const totalItems = filteredPuntosVentas.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const currentPuntosVentas = filteredPuntosVentas.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <main className="container">
      <h1>Gestión de Puntos de Venta</h1>

      <div className="header-container">
        <button className="add-button" onClick={() => handleOpenModal()}>
          <FaStore /> Agregar 
        </button>

        <div className="search-wrapper">
          <input
            type="text"
            placeholder="Buscar"
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>
      </div>

      {isLoading && <Loader/>}

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Número</th>
              <th>Nombre</th>
              <th>Sistema</th>
              <th>Domicilio</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentPuntosVentas.length > 0 ? (
              currentPuntosVentas.map((punto) => (
                <tr key={punto.id}>
                  <td>{punto.numero}</td>
                  <td>{punto.nombre}</td>
                  <td>{punto.sistema}</td>
                  <td>{punto.domicilio}</td>
                  <td>
                    <button
                      className="action-button editar"
                      onClick={() => handleOpenModal(punto)}
                      title="Editar"
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="action-button eliminar"
                      onClick={() => handleDeletePuntoVenta(punto.id)}
                      title="Eliminar"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="no-results">
                  No se encontraron puntos de venta.
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

      {modalOpen && (
        <PuntoVentaModal
          puntoVenta={selectedPuntoVenta}
          onClose={handleCloseModal}
          onSave={handleSavePuntoVenta}
          errorMsg={errorMsg}
        />
      )}
    </main>
  );
};

export default PuntosVentasPage;
