import { useState, useEffect } from "react";
import { FaPlus, FaEdit } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import Swal from "sweetalert2";
import "../../styles/ingresosPage.css";
import {
  getIngresos,
  createIngreso,
  updateIngreso,
} from "../../services/ingresosService";

// Importar los componentes modales existentes
import AddIngresoStep1Modal from "../../modales/ingresos/AddIngresoStep1Modal";
import AddIngresoStep2Modal from "../../modales/ingresos/AddIngresoStep2Modal";
import EditIngresoModal from "../../modales/ingresos/EditIngresoModal";
// Importar el nuevo modal para diferencia
import DiferenciaModal from "../../modales/ingresos/DiferenciaModal";

import { checkSession } from "../../services/authService";
import Pagination from "../../components/Pagination";
import Loader from "../../components/Loader";

const ingresoTypes = [
  { key: "ingreso_manana", label: "Mañana" },
  { key: "ingreso_tarde", label: "Tarde" },
  { key: "ingreso_transferencia", label: "Transferencia" },
  { key: "ingreso_gaston", label: "Gastón" },
  { key: "ingreso_reparto", label: "Reparto" },
  { key: "ingreso_varios", label: "Varios" },
];

// Permitir seleccionar cualquiera de las opciones
const addIngresoTypes = ingresoTypes;

const IngresosPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // Estados principales
  const [ingresos, setIngresos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Estados para modales de agregar ingreso
  const [addStep1Open, setAddStep1Open] = useState(false);
  const [addStep2Open, setAddStep2Open] = useState(false);
  const [selectedType, setSelectedType] = useState("");
  const [newIngresoDate, setNewIngresoDate] = useState("");
  const [newIngresoAmount, setNewIngresoAmount] = useState("");

  // Estado para el modal de edición
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingIngreso, setEditingIngreso] = useState(null);

  // Estados para el modal de diferencia
  const [diferenciaModalOpen, setDiferenciaModalOpen] = useState(false);
  const [selectedIngreso, setSelectedIngreso] = useState(null);

  const swalOptions = { zIndex: 2000 };

  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Helpers para fechas
  const formatDate = (fecha) => {
    const normalized = fecha.includes("T") ? fecha.split("T")[0] : fecha;
    const [year, month, day] = normalized.split("-");
    return `${parseInt(day)}/${parseInt(month)}/${year}`;
  };

  const normalizeDate = (fecha) =>
    fecha.includes("T") ? fecha.split("T")[0] : fecha;

  // Función para obtener el nombre del día
  const getDayName = (fechaStr) => {
    const [year, month, day] = fechaStr.split("-");
    const dateObj = new Date(year, month - 1, day);
    const dayNames = [
      "Domingo",
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes",
      "Sábado",
    ];
    return dayNames[dateObj.getDay()];
  };

  // Verificar sesión y obtener usuario
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const sessionData = await checkSession();
        setUser(sessionData.user);
      } catch {
        navigate('/auth');
      }
    };
    fetchSession();
  }, [navigate]);

  useEffect(() => {
    fetchIngresos();
  }, []);

  // Ajustar cantidad de ítems según la altura de la ventana (similar a ClientesPage)
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
      setCurrentPage(1);
    };

    updateItemsPerPage();
    window.addEventListener("resize", updateItemsPerPage);
    return () => window.removeEventListener("resize", updateItemsPerPage);
  }, []);

  const fetchIngresos = async () => {
    try {
      setIsLoading(true);
      const data = await getIngresos();
      data.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      setIngresos(data);
      setErrorMsg("");
    } catch (error) {
      console.error("Error al obtener ingresos:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar los ingresos.",
        ...swalOptions,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Funciones para agregar ingreso
  const openAddIngresoModal = () => {
    setSelectedType("");
    const today = new Date().toISOString().split("T")[0];
    setNewIngresoDate(today);
    setNewIngresoAmount("");
    setErrorMsg("");
    setAddStep1Open(true);
  };

  const handleContinueAdd = () => {
    if (!selectedType) {
      setErrorMsg("Por favor, selecciona un tipo de ingreso.");
      return;
    }
    setErrorMsg("");
    setAddStep1Open(false);
    setAddStep2Open(true);
  };

  const handleAddIngreso = async () => {
    if (!newIngresoDate || !newIngresoAmount) {
      setErrorMsg("Debes completar la fecha y el importe.");
      return;
    }
    if (!user) {
      setErrorMsg("No se encontró el usuario en sesión.");
      return;
    }

    const ingresoData = {
      fecha: newIngresoDate,
      ingreso_manana: 0.0,
      ingreso_tarde: 0.0,
      ingreso_transferencia: 0.0,
      ingreso_gaston: 0.0,
      ingreso_reparto: 0.0,
      ingreso_varios: 0.0,
      usuario_id: user.id
    };

    ingresoData[selectedType] = parseFloat(newIngresoAmount).toFixed(2);

    try {
      setIsLoading(true);
      const nuevoIngreso = await createIngreso(ingresoData);
      setIngresos((prevIngresos) => {
        const index = prevIngresos.findIndex(
          (ing) => normalizeDate(ing.fecha) === normalizeDate(nuevoIngreso.fecha)
        );
        if (index !== -1) {
          const nuevosIngresos = [...prevIngresos];
          nuevosIngresos[index] = nuevoIngreso;
          return nuevosIngresos;
        } else {
          return [...prevIngresos, nuevoIngreso];
        }
      });

      Swal.fire({
        icon: "success",
        title: "Ingreso creado",
        text: "El ingreso se creó correctamente.",
        ...swalOptions,
      });
      setAddStep2Open(false);
      setErrorMsg("");
    } catch (error) {
      console.error("Error al crear ingreso:", error);
      const errorText = error.message || "No se pudo crear el ingreso.";
      setErrorMsg(errorText);
    } finally {
      setIsLoading(false);
    }
  };

  // Funciones para editar ingreso
  const openEditModal = (ingreso) => {
    const normalizedFecha = normalizeDate(ingreso.fecha);
    setEditingIngreso({ ...ingreso, fecha: normalizedFecha });
    setErrorMsg("");
    setEditModalOpen(true);
  };
  
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!user) {
      Swal.fire('Error', 'No se encontró el usuario en sesión.', 'error');
      return;
    }
    // Aseguramos incluir usuario_id en el objeto de edición.
    const ingresoEditado = {
      ...editingIngreso,
      usuario_id: user.id
    };

    try {
      setIsLoading(true);
      await updateIngreso(editingIngreso.id, ingresoEditado);
      setIngresos(
        ingresos.map((ing) =>
          ing.id === editingIngreso.id ? ingresoEditado : ing
        )
      );
      Swal.fire({
        icon: "success",
        title: "Ingreso actualizado",
        text: "El ingreso se actualizó correctamente.",
        zIndex: 2000,
      });
      setEditModalOpen(false);
    } catch (error) {
      console.error("Error al actualizar ingreso:", error);
      setErrorMsg(
        error.message ||
        "Error al guardar cambios. Verifica la información y vuelve a intentarlo."
      );
    } finally {
      setIsLoading(false);
    }
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

  // Funciones para el modal de diferencia
  const openDiferenciaModal = (ingreso) => {
    setSelectedIngreso(ingreso);
    setDiferenciaModalOpen(true);
  };

  const closeDiferenciaModal = () => {
    setDiferenciaModalOpen(false);
    setSelectedIngreso(null);
  };

  // Cálculos para la tabla
  const currentItems = ingresos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalItems = ingresos.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="container">
      <h1>Gestión de Ingresos</h1>
      <div className="header-container">
        <button className="add-button" onClick={openAddIngresoModal}>
          <FaPlus /> Agregar Ingreso
        </button>
      </div>

      {isLoading && <Loader />}

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Día</th>
              <th>Mañana</th>
              <th>Tarde</th>
              <th>Transferencia</th>
              <th>Gastón</th>
              <th>Reparto</th>
              <th>Ventas</th>
              <th>Varios</th>
              <th>Total</th>
              <th>Diferencia</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((ingreso) => {
                // Calcular cada valor usando 0 si es undefined
                const mañana = parseFloat(ingreso.ingreso_manana || 0);
                const tarde = parseFloat(ingreso.ingreso_tarde || 0);
                const transferencia = parseFloat(ingreso.ingreso_transferencia || 0);
                const gaston = parseFloat(ingreso.ingreso_gaston || 0);
                const reparto = parseFloat(ingreso.ingreso_reparto || 0);
                const ventas = parseFloat(ingreso.ingreso_ventas || 0);
                const varios = parseFloat(ingreso.ingreso_varios || 0);
                const total = mañana + tarde + transferencia + gaston + reparto + ventas + varios;
                const totalInformes = parseFloat(ingreso.ingreso_informes || 0);
                let diff = 0;
                if (totalInformes !== 0) {
                  diff = (mañana + tarde + transferencia) - totalInformes;
                }
                const diffDisplay =
                  totalInformes !== 0
                    ? diff > 0
                      ? `+${formatCurrency(diff)}`
                      : formatCurrency(diff)
                    : "0";
                return (
                  <tr key={ingreso.id}>
                    <td>{formatDate(ingreso.fecha)}</td>
                    <td>{getDayName(normalizeDate(ingreso.fecha))}</td>
                    <td>{formatCurrency(mañana)}</td>
                    <td>{formatCurrency(tarde)}</td>
                    <td>{formatCurrency(transferencia)}</td>
                    <td>{formatCurrency(gaston)}</td>
                    <td>{formatCurrency(reparto)}</td>
                    <td>
                      <span>{formatCurrency(ventas)}</span>
                    </td>
                    <td>{formatCurrency(varios)}</td>
                    <td>{formatCurrency(total)}</td>
                    <td
                      onClick={() => openDiferenciaModal(ingreso)}
                      style={{ cursor: "pointer" }}
                      title="Ver detalle de diferencia"
                    >
                      {diffDisplay}
                    </td>
                    <td>
                      <button
                        className="action-button editar"
                        onClick={() => openEditModal(ingreso)}
                      >
                        <FaEdit />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="12" className="no-results">
                  No hay registros de ingresos
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

      {/* Modales de agregar y editar */}
      <AddIngresoStep1Modal
        isOpen={addStep1Open}
        closeModal={() => setAddStep1Open(false)}
        selectedType={selectedType}
        setSelectedType={(tipo) => {
          setSelectedType(tipo);
          setErrorMsg("");
        }}
        addIngresoTypes={addIngresoTypes}  // Se pasa la lista completa de tipos
        handleContinueAdd={handleContinueAdd}
        errorMsg={errorMsg}
        userRole={user ? user.rol : "user"} // Se pasa el rol del usuario. Si no hay usuario, por defecto "user"
      />

      <AddIngresoStep2Modal
        isOpen={addStep2Open}
        closeModal={() => setAddStep2Open(false)}
        newIngresoDate={newIngresoDate}
        setNewIngresoDate={setNewIngresoDate}
        newIngresoAmount={newIngresoAmount}
        setNewIngresoAmount={setNewIngresoAmount}
        handleAddIngreso={handleAddIngreso}
        selectedType={selectedType}
        addIngresoTypes={addIngresoTypes}
        errorMsg={errorMsg}
      />

      <EditIngresoModal
        isOpen={editModalOpen}
        closeModal={() => setEditModalOpen(false)}
        editingIngreso={editingIngreso}
        setEditingIngreso={setEditingIngreso}
        handleSaveEdit={handleSaveEdit}
        errorMsg={errorMsg}
        ingresoTypes={ingresoTypes}
      />

      {diferenciaModalOpen && (
        <DiferenciaModal
          isOpen={diferenciaModalOpen}
          onClose={closeDiferenciaModal}
          ingreso={selectedIngreso}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
        />
      )}
    </div>
  );
};

export default IngresosPage;
