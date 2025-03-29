import { useState, useEffect } from "react";
import { FaUserPlus, FaEdit, FaTrash } from "react-icons/fa";
import Swal from "sweetalert2";
// Servicios
import { getClientes, createCliente, updateCliente, deleteCliente } from "../../services/clientesService.js";

// Componentes
import ClienteModal from "../../modales/ClienteModal.jsx";
import Pagination from "../../components/Pagination.jsx";

const ClientesPage = () => {
  const [clientes, setClientes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  // En lugar de un valor fijo, definimos el estado para la cantidad de ítems por página
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const conditionMap = {
    RI: "Responsable Inscripto",
    EX: "Exento",
    CF: "Consumidor Final",
    MT: "Monotributista",
    OT: "Otro",
  };

  /* Carga de datos inicial */
  useEffect(() => {
    fetchClientes();
  }, []);

  // Agregamos el efecto para actualizar itemsPerPage según la altura de la ventana
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
      // Reiniciamos la página al cambiar la cantidad de ítems
      setCurrentPage(1);
    };

    updateItemsPerPage();
    window.addEventListener("resize", updateItemsPerPage);
    return () => window.removeEventListener("resize", updateItemsPerPage);
  }, []);

  /* Funciones de carga y manejo de clientes */
  const fetchClientes = async () => {
    setIsLoading(true);
    try {
      const data = await getClientes();
      setClientes(data);
      setErrorMsg("");
    } catch (error) {
      console.error("Error al obtener clientes:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar los clientes.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (cliente = null) => {
    setSelectedCliente(cliente);
    setErrorMsg("");
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setErrorMsg("");
    setModalOpen(false);
  };

  const handleSaveCliente = async (cliente) => {
    setIsLoading(true);
    try {
      if (cliente.id) {
        await updateCliente(cliente.id, cliente);
        setClientes((prevClientes) =>
          prevClientes.map((c) => (c.id === cliente.id ? cliente : c))
        );
        Swal.fire({
          icon: "success",
          title: "Cliente actualizado",
          text: "El cliente ha sido actualizado exitosamente.",
        });
      } else {
        const newCliente = await createCliente(cliente);
        setClientes((prevClientes) => [...prevClientes, newCliente]);
        Swal.fire({
          icon: "success",
          title: "Cliente creado",
          text: "El cliente ha sido creado exitosamente.",
        });
      }
      handleCloseModal();
    } catch (error) {
      console.error("Error al guardar el cliente:", error);
      setErrorMsg(
        error.response?.data?.message ||
          error.message ||
          "Error al guardar el cliente. Verifica la información."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCliente = (id) => {
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
          await deleteCliente(id);
          setClientes((prevClientes) =>
            prevClientes.filter((c) => c.id !== id)
          );
          Swal.fire(
            "Eliminado!",
            "El cliente ha sido eliminado exitosamente.",
            "success"
          );
        } catch (error) {
          console.error("Error al eliminar el cliente:", error);
          Swal.fire({
            icon: "error",
            title: "Error",
            text:
              error.response?.data?.message ||
              error.message ||
              "Hubo un error al eliminar el cliente. Por favor, inténtalo de nuevo.",
          });
        } finally {
          setIsLoading(false);
        }
      }
    });
  };

  /* Función de búsqueda */
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  /* Filtrado y paginación */
  const filteredClientes = clientes.filter((cliente) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    return (
      (cliente.razon_social || "").toLowerCase().includes(term) ||
      (cliente.cuit || "").toLowerCase().includes(term) ||
      (conditionMap[cliente.condicion] || "").toLowerCase().includes(term) ||
      ((cliente.gmail || "").toLowerCase().includes(term)) ||
      ((cliente.telefono || "").toLowerCase().includes(term)) ||
      ((cliente.direccion || "").toLowerCase().includes(term))
    );
  });

  const totalItems = filteredClientes.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const currentClientes = filteredClientes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Función para formatear la moneda argentina
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
    <main className="container">
      <h1>Gestión de Clientes</h1>

      <div className="header-container">
        <button className="add-button" onClick={() => handleOpenModal()}>
          <FaUserPlus /> Agregar Cliente
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

      {isLoading && <div className="loader"></div>}

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Razón Social</th>
              <th>CUIT</th>
              <th>Condición</th>
              <th>Gmail</th>
              <th>Teléfono</th>
              <th>Dirección</th>
              <th>Saldo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentClientes.length > 0 ? (
              currentClientes.map((cliente) => (
                <tr key={cliente.id}>
                  <td>{cliente.razon_social}</td>
                  <td>{cliente.cuit}</td>
                  <td>{conditionMap[cliente.condicion] || cliente.condicion}</td>
                  <td>{cliente.gmail}</td>
                  <td>{cliente.telefono}</td>
                  <td>{cliente.direccion}</td>
                  <td>{formatCurrency(cliente.saldo)}</td>
                  <td>
                    <button
                      className="action-button editar"
                      onClick={() => handleOpenModal(cliente)}
                      title="Editar"
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="action-button eliminar"
                      onClick={() => handleDeleteCliente(cliente.id)}
                      title="Eliminar"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="no-results">
                  No se encontraron clientes.
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
        <ClienteModal
          cliente={selectedCliente}
          onClose={handleCloseModal}
          onSave={handleSaveCliente}
          errorMsg={errorMsg}
        />
      )}
    </main>
  );
};

export default ClientesPage;
