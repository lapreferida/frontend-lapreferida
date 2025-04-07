import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { FaTrash, FaCalendarAlt, FaFileInvoiceDollar, FaFileAlt, FaEdit, FaStickyNote, FaShippingFast } from "react-icons/fa";
import Swal from "sweetalert2";
import "../../styles/ventas/historialVentasPage.css";
import { checkSession } from "../../services/authService";
import DateModal from "../../modales/DateModal";
import * as XLSX from "xlsx";

// Servicios para facturas
import {
  getHistorialFacturasVentas,
  registrarPagoFacturaVenta,
} from "../../services/ventas/facturaVentasService";

// Servicios para informes Z
import { getHistorialInformesZ, deleteInformeZ, updateInformeZ } from "../../services/ventas/informeZService";

// Servicios para notas de crédito
import { getNotasCredito, deleteNotaCredito } from "../../services/ventas/notasCreditoService";

// Servicio para remitos
import { getRemitos, deleteRemito } from "../../services/ventas/remitosService";

// Componentes
import Pagination from "../../components/Pagination";
import HistorialModal from "../../modales/HistorialVentasModal";
import EditInformeZModal from "../../modales/EditInformeZModal";
import Loader from "../../components/Loader";

const HistorialVentasPage = () => {
  // Estados para usuario y pestañas
  const [user, setUser] = useState(null);
  // Ahora se tienen cuatro tabs: "facturas", "informes", "notas" y "remitos"
  const [activeTab, setActiveTab] = useState("facturas");

  // Datos para cada historial
  const [facturas, setFacturas] = useState([]);
  const [informes, setInformes] = useState([]);
  const [notas, setNotas] = useState([]);
  const [remitos, setRemitos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState("");
  const [estadoFilter, setEstadoFilter] = useState("");

  // Estado para remitos seleccionados (por checkbox)
  const [selectedRemitos, setSelectedRemitos] = useState([]);

  // Estados para modal de pago (facturas)
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [paymentInput, setPaymentInput] = useState("");
  const [formaPago, setFormaPago] = useState("Efectivo");

  // Estados para modal de edición de Informe Z
  const [editInformeModalOpen, setEditInformeModalOpen] = useState(false);
  const [selectedInforme, setSelectedInforme] = useState(null);
  const [errorMsgInforme, setErrorMsgInforme] = useState("");

  // Paginación: se ajusta la cantidad de registros por página según la altura de la ventana
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Hook para leer parámetros de consulta (por ejemplo, ?factura=...)
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Función auxiliar para rellenar ceros (para números de nota y factura)
  const padNumber = (value, length) => {
    return String(value).padStart(length, "0");
  };

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

  // Al cargar el componente, si existe el parámetro "factura" en la URL, se establece en el searchTerm
  useEffect(() => {
    const facturaQuery = searchParams.get("factura");
    if (facturaQuery) {
      setSearchTerm(facturaQuery);
      // Aquí reemplazamos la URL, removiendo el parámetro "factura"
      navigate("/ventas-historial", { replace: true });
    }
  }, [searchParams, navigate]);

  // Funciones de formato
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return dateStr.includes("T") ? dateStr.split("T")[0] : dateStr;
  };

  const openDateModal = () => {
    setIsDateModalOpen(true);
  };

  const closeDateModal = () => {
    setIsDateModalOpen(false);
  };
  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
    setCurrentPage(1);
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
    setCurrentPage(1);
  };

  const clearDates = () => {
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
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

  // Función para filtrar los datos según búsqueda y estado
  const filteredData = (data) => {
    return data.filter((item) => {
      const term = searchTerm.trim().toLowerCase();
      const cliente =
        item.razon_social && item.direccion
          ? `${item.razon_social} - ${item.direccion}`.toLowerCase()
          : item.cliente_nombre
            ? item.cliente_nombre.toLowerCase()
            : "";
      const matchesSearch =
        !term ||
        (item.numero_factura && item.numero_factura.toLowerCase().includes(term)) ||
        (item.numero_informe && item.numero_informe.toLowerCase().includes(term)) ||
        (item.numero_nota && item.numero_nota.toLowerCase().includes(term)) ||
        (item.numero_remito && item.numero_remito.toLowerCase().includes(term)) ||
        (cliente && cliente.includes(term)) ||
        (item.estado && item.estado.toLowerCase().includes(term));
      const matchesEstado = !estadoFilter || item.estado === estadoFilter;

      // Filtrado por rango de fechas (asumiendo que item.fecha es la propiedad a comparar)
      let matchesDate = true;
      if (startDate) {
        const itemDate = new Date(item.fecha);
        const start = new Date(startDate);
        if (itemDate < start) {
          matchesDate = false;
        }
      }
      if (endDate) {
        const itemDate = new Date(item.fecha);
        const end = new Date(endDate);
        // Se suma un día para incluir la fecha final completa
        end.setDate(end.getDate() + 1);
        if (itemDate >= end) {
          matchesDate = false;
        }
      }
      return matchesSearch && matchesEstado && matchesDate;
    });
  };


  // Detectar el parámetro "tab" en la URL y actualizar la pestaña activa
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Datos para la paginación según la pestaña activa
  const dataToPaginate =
    activeTab === "facturas"
      ? filteredData(facturas)
      : activeTab === "informes"
        ? filteredData(informes)
        : activeTab === "notas"
          ? filteredData(notas)
          : activeTab === "remitos"
            ? filteredData(remitos)
            : [];
  const totalItems = dataToPaginate.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const currentItems = dataToPaginate.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const filteredFacturas = filteredData(facturas);
  const filteredInformes = filteredData(informes);

  // Totales
  const totalFacturas = filteredFacturas.reduce(
    (sum, item) => sum + parseFloat(item.total || 0),
    0
  );
  const totalInformes = filteredInformes.reduce(
    (sum, item) => sum + parseFloat(item.total_general || 0),
    0
  );

  // Obtener la sesión del usuario
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const sessionData = await checkSession();
        setUser(sessionData.user);
      } catch (error) {
        console.error("Error al obtener la sesión:", error);
      }
    };
    fetchSession();
  }, []);

  // Cargar datos según la pestaña activa
  useEffect(() => {
    fetchData();
  }, [activeTab]);

  // Handler para cambiar de pestaña, limpiar el searchTerm y la selección de remitos si no se está en esa pestaña
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab !== "facturas") {
      setSearchTerm("");
    }
    if (tab !== "remitos") {
      setSelectedRemitos([]);
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === "facturas") {
        const data = await getHistorialFacturasVentas();
        setFacturas(data);
      } else if (activeTab === "informes") {
        const data = await getHistorialInformesZ();
        setInformes(data);
      } else if (activeTab === "notas") {
        const data = await getNotasCredito();
        setNotas(data);
      } else if (activeTab === "remitos") {
        const data = await getRemitos();
        setRemitos(data);
      }
    } catch (error) {
      console.error("Error al obtener el historial:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo cargar el historial.",
      });
    } finally {
      setIsLoading(false);
      setCurrentPage(1);
    }
  };

  const handleDeleteInforme = (id) => {
    Swal.fire({
      title: "¿Eliminar informe?",
      text: "Esta acción eliminará el informe de la base de datos.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteInformeZ(id, user.id);
          Swal.fire("Eliminado", "El informe ha sido eliminado.", "success");
          fetchData();
        } catch (error) {
          console.error(error);
          const errorMsg =
            error.response && error.response.data && error.response.data.message
              ? error.response.data.message
              : error.message || "Error al eliminar el informe";
          Swal.fire("Error", errorMsg, "error");
        }
      }
    });
  };

  // Handler para eliminar una nota de crédito
  const handleDeleteNotaCredito = (id) => {
    Swal.fire({
      title: "¿Eliminar nota de crédito?",
      text: "Esta acción eliminará la nota de crédito de la base de datos.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteNotaCredito(id, user.id);
          Swal.fire("Eliminado", "La nota de crédito ha sido eliminada.", "success");
          fetchData();
        } catch (error) {
          console.error(error);
          const errorMsg =
            error.response?.data?.message ||
            error.message ||
            "Error al eliminar la nota de crédito";
          Swal.fire("Error", errorMsg, "error");
        }
      }
    });
  };

  // Nuevo handler para eliminar remitos
  const handleDeleteRemito = (id) => {
    Swal.fire({
      title: "¿Eliminar remito?",
      text: "Esta acción eliminará el remito de la base de datos.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteRemito(id, user.id);
          Swal.fire("Eliminado", "El remito ha sido eliminado.", "success");
          fetchData();
        } catch (error) {
          console.error(error);
          const errorMsg =
            error.response?.data?.message || error.message || "Error al eliminar el remito";
          Swal.fire("Error", errorMsg, "error");
        }
      }
    });
  };

  // Handlers para modal y acciones (facturas e informes) se mantienen igual...
  const handleSelectItem = (item) => {
    setSelectedItem(item);
    setPaymentInput("");
    setFormaPago("Efectivo");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedItem(null);
    setPaymentInput("");
    setFormaPago("Efectivo");
  };

  const calcularPendiente = (item) => {
    return item.total - item.total_pagado;
  };

  const handleDescargarExcel = () => {
    // Obtener todos los informes filtrados (sin paginación)
    const informesFiltrados = filteredData(informes);

    // Mapear los datos a objetos, formateando cada valor según corresponda
    const dataExcel = informesFiltrados.map((item) => ({
      Fecha: formatDate(item.fecha),
      "Pto Venta": item.punto_venta_numero,
      "N° Informe": item.numero_informe,
      Cliente: item.razon_social,
      "Neto 10,5%": formatCurrency(item.neto_10_5),
      "IVA 10,5%": formatCurrency(item.iva_10_5),
      "Neto 21%": formatCurrency(item.neto_21),
      "IVA 21%": formatCurrency(item.iva_21),
      "Total General": formatCurrency(item.total_general),
    }));

    // Calcular la suma de todos los "Total General" (como número)
    const totalSum = informesFiltrados.reduce(
      (acc, curr) => acc + parseFloat(curr.total_general),
      0
    );

    // Agregar una fila final que muestre el total, aplicando el formato de moneda argentina
    dataExcel.push({
      Fecha: "",
      "Pto Venta": "",
      "N° Informe": "",
      Cliente: "",
      "Neto 10,5%": "",
      "IVA 10,5%": "",
      "Neto 21%": "",
      "IVA 21%": "Total",
      "Total General": formatCurrency(totalSum),
    });

    // Crear la hoja de cálculo y el libro
    const worksheet = XLSX.utils.json_to_sheet(dataExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Informes");

    // Descargar el archivo Excel
    XLSX.writeFile(workbook, "informes.xlsx");
  };


  const handlePagoSubmit = async (e) => {
    e.preventDefault();
    if (!selectedItem || selectedItem.estado !== "Pendiente") return;
    if (!paymentInput.trim()) {
      Swal.fire("Error", "Debe ingresar un monto a pagar.", "error");
      return;
    }
    const montoPago = parseFloat(paymentInput);
    if (isNaN(montoPago) || montoPago <= 0) {
      Swal.fire("Error", "El monto debe ser un número mayor a 0.", "error");
      return;
    }
    const pendiente = calcularPendiente(selectedItem);
    if (montoPago > pendiente) {
      Swal.fire("Error", "El monto ingresado supera el monto pendiente.", "error");
      return;
    }
    if (!user) {
      Swal.fire("Error", "No se pudo identificar al usuario.", "error");
      return;
    }
    try {
      await registrarPagoFacturaVenta(selectedItem.id, {
        usuario_id: user.id,
        monto_pago: montoPago,
        forma_pago: formaPago,
      });
      Swal.fire("Pago registrado", "El pago se ha registrado correctamente", "success");
      closeModal();
      fetchData();
    } catch (error) {
      console.error(error);
      Swal.fire(
        "Error",
        error.response?.data?.message || "Error al registrar el pago",
        "error"
      );
    }
  };

  // Handlers para editar y eliminar informes (se mantienen igual)
  const openEditInformeModal = (informe) => {
    setSelectedInforme(informe);
    setErrorMsgInforme("");
    setEditInformeModalOpen(true);
  };

  const closeEditInformeModal = () => {
    setEditInformeModalOpen(false);
    setSelectedInforme(null);
  };

  const handleSaveEditInforme = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const updatedData = { ...selectedInforme, usuario_id: user.id };
      await updateInformeZ(selectedInforme.id, updatedData);
      Swal.fire("Éxito", "Informe actualizado correctamente", "success");
      closeEditInformeModal();
      fetchData();
    } catch (error) {
      console.error(error);
      setErrorMsgInforme(
        error.response?.data?.message || "Error al actualizar el informe"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handler de filtros
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleEstadoFilterChange = (e) => {
    setEstadoFilter(e.target.value);
    setCurrentPage(1);
  };

  // Actualización de getEstadoClass para facturas y remitos:
  const getEstadoClass = (estado) => {
    switch (estado) {
      case "Pendiente":
        return "status-pendiente";
      case "Pagado":
        return "status-pagado";
      case "Cancelado":
        return "status-cancelado";
      case "Confirmado":
        return "status-confirmado";
      default:
        return "";
    }
  };

  // Handler para seleccionar/deseleccionar un remito con validación
  const handleRemitoSelection = (id, isChecked) => {
    if (isChecked) {
      const newRemito = remitos.find((r) => r.id === id);
      if (!newRemito) return;
      // Si ya hay algún remito seleccionado, comprobar el cliente
      if (selectedRemitos.length > 0) {
        const firstSelected = remitos.find((r) => r.id === selectedRemitos[0]);
        if (firstSelected && newRemito && firstSelected.cliente_id !== newRemito.cliente_id) {
          Swal.fire({
            icon: 'warning',
            title: 'Selección inválida',
            text: 'Los remitos deben ser del mismo cliente.'
          });
          return; // No se agrega el remito si pertenece a otro cliente
        }
      }
      setSelectedRemitos((prev) => [...prev, id]);
    } else {
      setSelectedRemitos((prev) => prev.filter((item) => item !== id));
    }
  };

  // Handler para la acción "Facturar" sobre remitos seleccionados
  const handleFacturar = () => {
    // Filtrar los remitos seleccionados
    const remitosSeleccionados = remitos.filter((item) =>
      selectedRemitos.includes(item.id)
    );
    // Calcular la suma de sus subtotales
    const netoRemitos = remitosSeleccionados.reduce(
      (acc, curr) => acc + parseFloat(curr.subtotal),
      0
    );
    // Obtener el cliente del primer remito (todos son del mismo cliente)
    const remitoClienteId =
      remitosSeleccionados.length > 0 ? remitosSeleccionados[0].cliente_id : null;

    navigate("/facturar-venta", {
      state: {
        remitoIds: selectedRemitos,
        netoRemitos: netoRemitos.toFixed(2),
        remitoClienteId, // Se pasa el id del cliente
      },
    });
  };

  return (
    <main className="container historial-container">
      <h1>Historial</h1>

      {/* Pestañas: Facturas, Informes Z, Notas de Crédito y Remitos */}
      <div className="tabs-container">
        <button
          className={`tab-button ${activeTab === "facturas" ? "active" : ""}`}
          onClick={() => handleTabChange("facturas")}
        >
          <FaFileInvoiceDollar className="tab-icon" />
          <span>Facturas</span>
        </button>
        <button
          className={`tab-button ${activeTab === "informes" ? "active" : ""}`}
          onClick={() => handleTabChange("informes")}
        >
          <FaFileAlt className="tab-icon" />
          <span>Informes Z</span>
        </button>
        <button
          className={`tab-button ${activeTab === "notas" ? "active" : ""}`}
          onClick={() => handleTabChange("notas")}
        >
          <FaStickyNote className="tab-icon" />
          <span>Notas de Crédito</span>
        </button>
        <button
          className={`tab-button ${activeTab === "remitos" ? "active" : ""}`}
          onClick={() => handleTabChange("remitos")}
        >
          <FaShippingFast className="tab-icon" />
          <span>Remitos</span>
        </button>
      </div>

      {/* Filtros de búsqueda y estado */}
      <div className="header-container">
        <div className="search-wrapper">
          <input
            type="text"
            placeholder="Buscar"
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>
        <div className="header-right">
          {activeTab === "facturas" && (
            <>
              <span className="total-label">
                Total facturas: {formatCurrency(totalFacturas)}
              </span>
              <button className="historial-pagos-button" onClick={() => navigate("/pagos-historial")}>
                Ver pagos
              </button>
            </>
          )}
          {activeTab === "informes" && (
            <>
              <span className="total-label">
                Total informes: {formatCurrency(totalInformes)}
              </span>
              <button className="historial-pagos-button" onClick={handleDescargarExcel}>
                Descargar Excel
              </button>
            </>
          )}
          {activeTab === "remitos" && selectedRemitos.length > 0 && (
            <button className="facturar-button"
              onClick={handleFacturar}>
              Facturar
            </button>
          )}
          <div className="filter-wrapper">
            {activeTab === "facturas" && (
              <select
                value={estadoFilter}
                onChange={handleEstadoFilterChange}
                className="filter-select-ventas"
              >
                <option value="">Todos</option>
                <option value="Pendiente">Pendiente</option>
                <option value="Pagado">Pagado</option>
              </select>
            )}
            {activeTab === "remitos" && (
              <select
                value={estadoFilter}
                onChange={handleEstadoFilterChange}
                className="filter-select-ventas"
              >
                <option value="">Todos</option>
                <option value="Pendiente">Pendiente</option>
                <option value="Confirmado">Confirmado</option>
                <option value="Cancelado">Cancelado</option>
              </select>
            )}
          </div>
          <button
            className="date-modal-button"
            onClick={openDateModal}
            title="Filtrar por rango de fechas"
          >
            <FaCalendarAlt />
          </button>
        </div>
      </div>

      {isLoading ? (
        <Loader />
      ) : (
        <>
          <div className="table-container">
            {activeTab === "facturas" ? (
              <table className="table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Cliente</th>
                    <th>Pto Venta</th>
                    <th>N° Factura</th>
                    <th>Tipo Factura</th>
                    <th>Neto</th>
                    <th>Estado</th>
                    <th>Total</th>
                    <th>Abonado</th>
                    <th>Observaciones</th>
                    <th>Usuario</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.length > 0 ? (
                    currentItems.map((item) => (
                      // Se agrega onClick al <tr> para abrir el modal con esa factura
                      <tr
                        key={item.id}
                        onClick={() => handleSelectItem(item)}
                        style={{ cursor: "pointer" }}
                        title="Haga clic para ver detalles"
                      >
                        <td>{formatDate(item.fecha)}</td>
                        <td title={`${item.razon_social} - ${item.direccion}`}>
                          {`${item.razon_social} - ${item.direccion}`.length > 20
                            ? `${item.razon_social} - ${item.direccion}`.slice(0, 20) + "..."
                            : `${item.razon_social} - ${item.direccion}`}
                        </td>
                        <td>{item.numero_punto}</td>
                        <td>{item.numero_factura}</td>
                        <td>{item.tipo_factura}</td>
                        <td>{formatCurrency(item.neto)}</td>
                        <td>
                          <span className={getEstadoClass(item.estado)}>
                            {item.estado}
                          </span>
                        </td>
                        <td>{formatCurrency(item.total)}</td>
                        <td>{formatCurrency(item.total_pagado)}</td>
                        <td title={item.observaciones}>
                          {item.observaciones && item.observaciones.length > 20
                            ? item.observaciones.slice(0, 20) + "..."
                            : item.observaciones}
                        </td>
                        <td>{item.usuario_nombre}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="11" className="no-results">
                        No se encontraron registros.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            ) : activeTab === "informes" ? (
              <table className="table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Pto Venta</th>
                    <th>N° Informe</th>
                    <th>Cliente</th>
                    <th>Neto 10,5%</th>
                    <th>IVA 10,5%</th>
                    <th>Neto 21%</th>
                    <th>IVA 21%</th>
                    <th>Total General</th>
                    <th>Observaciones</th>
                    <th>Usuario</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.length > 0 ? (
                    currentItems.map((item) => (
                      <tr key={item.id}>
                        <td>{formatDate(item.fecha)}</td>
                        <td>{item.punto_venta_numero}</td>
                        <td>{item.numero_informe}</td>
                        <td>{item.razon_social}</td>
                        <td>{formatCurrency(item.neto_10_5)}</td>
                        <td>{formatCurrency(item.iva_10_5)}</td>
                        <td>{formatCurrency(item.neto_21)}</td>
                        <td>{formatCurrency(item.iva_21)}</td>
                        <td>{formatCurrency(item.total_general)}</td>
                        <td title={item.observaciones}>
                          {item.observaciones && item.observaciones.length > 20
                            ? item.observaciones.slice(0, 20) + "..."
                            : item.observaciones}
                        </td>
                        <td>{item.usuario_nombre}</td>
                        <td>
                          <button
                            className="action-button editar"
                            onClick={() => openEditInformeModal(item)}
                            title="Editar Informe"
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="action-button eliminar"
                            onClick={() => handleDeleteInforme(item.id)}
                            title="Eliminar Informe"
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="12" className="no-results">
                        No se encontraron registros.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            ) : activeTab === "notas" ? (
              <table className="table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>N° Nota</th>
                    <th>N° Factura</th>
                    <th>Cliente</th>
                    <th>Motivo</th>
                    <th>Monto</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.length > 0 ? (
                    currentItems.map((nota) => {
                      const puntoVenta = padNumber(nota.numero_punto, 5);
                      const facturaPart = padNumber(nota.numero_factura, 8);
                      const fullFacturaNumber = `${puntoVenta}-${facturaPart}`;
                      return (
                        <tr key={nota.id}>
                          <td>{formatDate(nota.fecha)}</td>
                          <td>{`${puntoVenta}-${padNumber(nota.numero_nota, 8)}`}</td>
                          <td>
                            <Link
                              className="invoice-link"
                              to={`/ventas-historial?factura=${encodeURIComponent(facturaPart)}&tab=facturas`}
                              title="Ver factura en historial"
                            >
                              {fullFacturaNumber}
                            </Link>
                          </td>
                          <td title={`${nota.razon_social} - ${nota.domicilio}`}>
                            {`${nota.razon_social} - ${nota.domicilio}`.length > 30
                              ? `${nota.razon_social} - ${nota.domicilio}`.slice(0, 30) + "..."
                              : `${nota.razon_social} - ${nota.domicilio}`}
                          </td>
                          <td title={nota.motivo}>
                            {nota.motivo.length > 20 ? nota.motivo.slice(0, 20) + "..." : nota.motivo}
                          </td>
                          <td>{formatCurrency(nota.monto)}</td>
                          <td>
                            <button
                              className="action-button eliminar"
                              onClick={() => handleDeleteNotaCredito(nota.id)}
                              title="Eliminar Nota de Crédito"
                            >
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="7" className="no-results">
                        No se encontraron registros.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            ) : activeTab === "remitos" ? (
              <table className="table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Cliente</th>
                    <th>N° Remito</th>
                    <th>Observaciones</th>
                    <th>Estado</th>
                    <th>Subtotal</th>
                    <th>Usuario</th>
                    <th>Seleccionar</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.length > 0 ? (
                    currentItems.map((item) => (
                      <tr key={item.id}>
                        <td>{formatDate(item.fecha)}</td>
                        <td title={`${item.razon_social} - ${item.direccion}`}>
                          {`${item.razon_social} - ${item.direccion}`.length > 30
                            ? `${item.razon_social} - ${item.direccion}`.slice(0, 30) + "..."
                            : `${item.razon_social} - ${item.direccion}`}
                        </td>
                        <td>{item.numero_remito}</td>
                        <td title={item.observaciones}>
                          {item.observaciones && item.observaciones.length > 20
                            ? item.observaciones.slice(0, 20) + "..."
                            : item.observaciones}
                        </td>
                        <td>
                          <span className={getEstadoClass(item.estado)}>
                            {item.estado}
                          </span>
                        </td>
                        <td>{formatCurrency(item.subtotal)}</td>
                        <td>{item.usuario_nombre}</td>
                        <td>
                          {/* Mostrar checkbox solo si el remito está en estado "Pendiente" */}
                          {item.estado === "Pendiente" && (
                            <input
                              type="checkbox"
                              checked={selectedRemitos.includes(item.id)}
                              onChange={(e) => handleRemitoSelection(item.id, e.target.checked)}
                            />
                          )}
                        </td>
                        {/* Columna de Acciones con botón de eliminar */}
                        <td>
                          <button
                            className="action-button eliminar"
                            onClick={() => handleDeleteRemito(item.id)}
                            title="Eliminar Remito"
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="no-results">
                        No se encontraron registros.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            ) : null}
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}

      {/* Modal de pago para facturas */}
      {modalOpen && selectedItem && (
        <HistorialModal
          selectedVenta={selectedItem}
          closeModal={closeModal}
          paymentInput={paymentInput}
          setPaymentInput={setPaymentInput}
          formaPago={formaPago}
          setFormaPago={setFormaPago}
          handlePagoSubmit={handlePagoSubmit}
          formatDate={formatDate}
          formatCurrency={formatCurrency}
          calcularPendiente={calcularPendiente}
        />
      )}

      {/* Modal de edición para Informe Z */}
      {editInformeModalOpen && selectedInforme && (
        <EditInformeZModal
          isOpen={editInformeModalOpen}
          closeModal={closeEditInformeModal}
          editingInforme={selectedInforme}
          setEditingInforme={setSelectedInforme}
          handleSaveEdit={handleSaveEditInforme}
          errorMsg={errorMsgInforme}
        />
      )}

      {isDateModalOpen && (
        <DateModal
          isOpen={isDateModalOpen}
          closeModal={closeDateModal}
          startDate={startDate}
          endDate={endDate}
          handleStartDateChange={handleStartDateChange}
          handleEndDateChange={handleEndDateChange}
          clearDates={clearDates}
        />
      )}

    </main>
  );
};

export default HistorialVentasPage;
