import { useState, useEffect } from "react";
import Select from "react-select";
import Swal from "sweetalert2";
import CountUp from "react-countup";

// Servicios
import { getClientes } from "../../services/clientesService";
import { getRemitosSummary, getRemitosReport } from "../../services/ventas/remitosService";

// Componentes
import CustomDateRangePicker from "../../components/CustomDateRangePicker";
import InformeTableRemitos from "../../components/InformeTableRemitos";
import RemitoDetailModal from "../../modales/RemitoDetailModal";

// Íconos
import { FaDollarSign, FaFileInvoice, FaBoxOpen, FaHourglassHalf } from "react-icons/fa";

import "../../styles/ventas/informesRemitosPage.css";

const InformesRemitosPage = () => {
  // Estados para filtros e informe
  const [clientes, setClientes] = useState([]);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [summary, setSummary] = useState({
    totalFacturado: 0,
    remitosEmitidos: 0,
    productosVendidos: 0,
    remitosPendientes: 0,
  });

  // Estados para detalle de remitos y modal
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [detailData, setDetailData] = useState([]);
  const [selectedRemito, setSelectedRemito] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Funciones de formateo que se pasarán al modal
  const formatFecha = (fecha) => new Date(fecha).toISOString().split("T")[0];
  const formatCurrency = (value) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 2,
    }).format(value);

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const data = await getClientes();
        setClientes(data);
      } catch (err) {
        console.error("Error al obtener clientes:", err);
        Swal.fire("Error", "No se pudo cargar la lista de clientes.", "error");
      }
    };
    fetchClientes();
  }, []);

  const optionsClientes = [
    { value: "0", label: "Todos los clientes" },
    ...clientes.map((cliente) => ({
      value: cliente.id,
      label: `${cliente.razon_social} - ${cliente.direccion}`,
    })),
  ];

  const handleRangeChange = (start, end) => {
    setStartDate(start);
    setEndDate(end);
  };

  const handleGenerarInforme = async () => {
    if (!selectedCliente || !startDate || !endDate) {
      Swal.fire(
        "Advertencia",
        "Debe seleccionar un cliente y un rango de fechas.",
        "warning"
      );
      return;
    }
    setIsLoading(true);
    setError("");

    try {
      const clienteId = selectedCliente.value; // Si es "0", el backend lo tratará como sin filtro.
      const resumen = await getRemitosSummary(
        clienteId,
        startDate.toISOString().split("T")[0],
        endDate.toISOString().split("T")[0]
      );
      setSummary(resumen);
      // Se reinician los datos de detalle y el remito seleccionado
      setDetailData([]);
      setSelectedDetail(null);
    } catch (err) {
      console.error("Error al generar informe:", err);
      setError("No se pudo generar el informe.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDetailClick = async (type) => {
    setSelectedDetail(type);
    try {
      const clienteId = selectedCliente.value; // Se usa el valor directamente
      // Armar el objeto de query para el backend
      const query = {
        cliente_id: clienteId,
        start_date: startDate.toISOString().split("T")[0],
        end_date: endDate.toISOString().split("T")[0],
      };
      if (type === "facturado") {
        query.estado = "Confirmado";
      } else if (type === "pendiente") {
        query.estado = "Pendiente";
      } else if (type === "productos") {
        query.detalleType = "productos";
      }
      // Para "emitido" no se envía filtro de estado.
      const data = await getRemitosReport(query);
      setDetailData(data);
    } catch (err) {
      console.error("Error al obtener detalle:", err);
      Swal.fire("Error", "No se pudo cargar el detalle.", "error");
    }
  };

  // Función para manejar el click en una fila y mostrar el modal
  const handleRowClick = (remito) => {
    setSelectedRemito(remito);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRemito(null);
  };

  return (
    <div className="container informes-remitos-page">
      <h1 className="title">Informe de Remitos</h1>

      {/* FILTROS */}
      <div className="filters-container">
        <div className="filters-row">
          <div className="form-group">
            <label className="filter-label">Cliente</label>
            <Select
              options={optionsClientes}
              value={selectedCliente}
              onChange={setSelectedCliente}
              placeholder="Seleccione un cliente"
              noOptionsMessage={() => "No existen clientes"}
              className="custom-select"
            />
          </div>
          <div className="form-group">
            <label className="filter-label">Rango de fechas</label>
            <CustomDateRangePicker
              startDate={startDate}
              endDate={endDate}
              onRangeChange={handleRangeChange}
            />
          </div>
          <div className="filter-item">
            <button className="btn-generar" onClick={handleGenerarInforme}>
              Generar
            </button>
          </div>
        </div>
      </div>

      {/* TARJETAS DE RESUMEN */}
      <div className="summary-cards">
        {isLoading && <div className="loader"></div>}
        {error && <div className="error-message">{error}</div>}

        <div className="summary-card" onClick={() => handleDetailClick("facturado")}>
          <div className="summary-card-icon">
            <FaDollarSign size={24} />
          </div>
          <div className="summary-card-title">Total Facturado</div>
          <div className="summary-card-value">
            $<CountUp start={0} end={summary.totalFacturado} duration={2} separator="." decimals={2} decimal="," />
          </div>
        </div>

        <div className="summary-card" onClick={() => handleDetailClick("emitido")}>
          <div className="summary-card-icon">
            <FaFileInvoice size={24} />
          </div>
          <div className="summary-card-title">Remitos Emitidos</div>
          <div className="summary-card-value">
            <CountUp start={0} end={summary.remitosEmitidos} duration={2} />
          </div>
        </div>

        <div className="summary-card" onClick={() => handleDetailClick("productos")}>
          <div className="summary-card-icon">
            <FaBoxOpen size={24} />
          </div>
          <div className="summary-card-title">Productos Vendidos</div>
          <div className="summary-card-value">
            <CountUp start={0} end={summary.productosVendidos} duration={2} />
          </div>
        </div>

        <div className="summary-card" onClick={() => handleDetailClick("pendiente")}>
          <div className="summary-card-icon">
            <FaHourglassHalf size={24} />
          </div>
          <div className="summary-card-title">Remitos Pendientes</div>
          <div className="summary-card-value">
            <CountUp start={0} end={summary.remitosPendientes} duration={2} />
          </div>
        </div>
      </div>

      {/* SECCIÓN DE DETALLE */}
      {selectedDetail && (
        <InformeTableRemitos
          title={
            selectedDetail === "facturado"
              ? "Detalle de Remitos Facturados"
              : selectedDetail === "pendiente"
              ? "Detalle de Remitos Pendientes"
              : selectedDetail === "emitido"
              ? "Detalle de Remitos Emitidos"
              : "Detalle de Productos Vendidos"
          }
          data={detailData}
          detailType={selectedDetail}
          onRowClick={selectedDetail === "productos" ? null : handleRowClick}
          startDate={startDate}  // Se pasan las fechas de búsqueda
          endDate={endDate}
        />
      )}

      {/* Modal con detalle del remito */}
      <RemitoDetailModal
        isOpen={isModalOpen}
        closeModal={closeModal}  // Función para cerrar el modal
        remito={selectedRemito}
        formatFecha={formatFecha}
        formatCurrency={formatCurrency}
      />
    </div>
  );
};

export default InformesRemitosPage;
