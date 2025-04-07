import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { FaFileAlt, FaStickyNote, FaMoneyBillAlt } from "react-icons/fa";
import Swal from "sweetalert2";
import "../../styles/historialMovimientosPage.css";
import { checkSession } from "../../services/authService";
import { getMovimientosInformesZ } from "../../services/ventas/informeZService";
import { getMovimientosNotasCredito } from "../../services/ventas/notasCreditoService";
// Asegúrate de tener implementado e importado el servicio de ingresos
import { getMovimientosIngresos } from "../../services/ingresosService";
import Pagination from "../../components/Pagination";
import Loader from "../../components/Loader";

const HistorialMovimientosPage = () => {
  // Estado para el usuario y para la pestaña activa ("informes", "notas" o "ingresos")
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("informes");

  // Estados para los datos de cada sección
  const [movimientosInformes, setMovimientosInformes] = useState([]);
  const [movimientosNotas, setMovimientosNotas] = useState([]);
  const [movimientosIngresos, setMovimientosIngresos] = useState([]);

  // Estado para búsqueda (común para las 3 tablas)
  const [searchTerm, setSearchTerm] = useState("");

  // Estados de paginación (separados para cada pestaña)
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPageInformes, setCurrentPageInformes] = useState(1);
  const [currentPageNotas, setCurrentPageNotas] = useState(1);
  const [currentPageIngresos, setCurrentPageIngresos] = useState(1);

  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  // Ajustar la cantidad de ítems por página según la altura de la ventana
  useEffect(() => {
    const updateItemsPerPage = () => {
      const height = window.innerHeight;
      if (height <= 576) {
        setItemsPerPage(5);
      } else if (height <= 700) {
        setItemsPerPage(11);
      } else if (height <= 800) {
        setItemsPerPage(14);
      } else if (height <= 1200) {
        setItemsPerPage(9);
      } else {
        setItemsPerPage(14);
      }
      setCurrentPageInformes(1);
      setCurrentPageNotas(1);
      setCurrentPageIngresos(1);
    };

    updateItemsPerPage();
    window.addEventListener("resize", updateItemsPerPage);
    return () => window.removeEventListener("resize", updateItemsPerPage);
  }, []);

  // Leer el parámetro "search" de la URL, si existe
  useEffect(() => {
    const searchQuery = searchParams.get("search");
    if (searchQuery) {
      setSearchTerm(searchQuery);
    }
  }, [searchParams]);

  // Helpers para formatear fecha y hora
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return dateStr.includes("T") ? dateStr.split("T")[0] : dateStr;
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const isoString = dateStr.includes("T") ? dateStr : dateStr.replace(" ", "T");
    const dateObj = new Date(isoString);
    return dateObj.toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  // Filtrar movimientos de informes
  const filteredInformes = movimientosInformes.filter((item) => {
    const term = searchTerm.trim().toLowerCase();
    return (
      !term ||
      (item.accion && item.accion.toLowerCase().includes(term)) ||
      (item.descripcion && item.descripcion.toLowerCase().includes(term)) ||
      (item.usuario_nombre && item.usuario_nombre.toLowerCase().includes(term)) ||
      (item.informe_z_id && String(item.informe_z_id).toLowerCase().includes(term))
    );
  });

  // Filtrar movimientos de notas
  const filteredNotas = movimientosNotas.filter((item) => {
    const term = searchTerm.trim().toLowerCase();
    return (
      !term ||
      (item.accion && item.accion.toLowerCase().includes(term)) ||
      (item.descripcion && item.descripcion.toLowerCase().includes(term)) ||
      (item.usuario_nombre && item.usuario_nombre.toLowerCase().includes(term)) ||
      (item.nota_credito_id && String(item.nota_credito_id).toLowerCase().includes(term))
    );
  });

  // Filtrar movimientos de ingresos
  const filteredIngresos = movimientosIngresos.filter((item) => {
    const term = searchTerm.trim().toLowerCase();
    return (
      !term ||
      (item.accion && item.accion.toLowerCase().includes(term)) ||
      (item.descripcion && item.descripcion.toLowerCase().includes(term)) ||
      (item.usuario_id && String(item.usuario_id).toLowerCase().includes(term)) ||
      (item.ingreso_id && String(item.ingreso_id).toLowerCase().includes(term))
    );
  });

  // Paginación para cada sección
  const totalItemsInformes = filteredInformes.length;
  const totalPagesInformes = Math.ceil(totalItemsInformes / itemsPerPage);
  const currentItemsInformes = filteredInformes.slice(
    (currentPageInformes - 1) * itemsPerPage,
    currentPageInformes * itemsPerPage
  );

  const totalItemsNotas = filteredNotas.length;
  const totalPagesNotas = Math.ceil(totalItemsNotas / itemsPerPage);
  const currentItemsNotas = filteredNotas.slice(
    (currentPageNotas - 1) * itemsPerPage,
    currentPageNotas * itemsPerPage
  );

  const totalItemsIngresos = filteredIngresos.length;
  const totalPagesIngresos = Math.ceil(totalItemsIngresos / itemsPerPage);
  const currentItemsIngresos = filteredIngresos.slice(
    (currentPageIngresos - 1) * itemsPerPage,
    currentPageIngresos * itemsPerPage
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

  // Cargar datos de los tres endpoints
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const informesData = await getMovimientosInformesZ();
      const notasData = await getMovimientosNotasCredito();
      const ingresosData = await getMovimientosIngresos();
      setMovimientosInformes(informesData);
      setMovimientosNotas(notasData);
      setMovimientosIngresos(ingresosData);
    } catch (error) {
      console.error("Error al obtener los movimientos:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo cargar el historial de movimientos.",
      });
    } finally {
      setIsLoading(false);
      setCurrentPageInformes(1);
      setCurrentPageNotas(1);
      setCurrentPageIngresos(1);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Actualiza el término de búsqueda para las tres secciones
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPageInformes(1);
    setCurrentPageNotas(1);
    setCurrentPageIngresos(1);
  };

  return (
    <main className="container historial-container">
      <h1>Historial de Movimientos</h1>

      {/* Pestañas para navegar entre las 3 secciones */}
      <div className="tabs-container-movimientos">
        <button
          className={`tab-button ${activeTab === "informes" ? "active" : ""}`}
          onClick={() => setActiveTab("informes")}
        >
          <FaFileAlt className="tab-icon" />
          <span>Informes Z</span>
        </button>
        <button
          className={`tab-button ${activeTab === "notas" ? "active" : ""}`}
          onClick={() => setActiveTab("notas")}
        >
          <FaStickyNote className="tab-icon" />
          <span>Notas de Crédito</span>
        </button>
        <button
          className={`tab-button ${activeTab === "ingresos" ? "active" : ""}`}
          onClick={() => setActiveTab("ingresos")}
        >
          <FaMoneyBillAlt className="tab-icon" />
          <span>Ingresos</span>
        </button>
      </div>

      {/* Filtro de búsqueda */}
      <div className="header-container">
        <div className="search-wrapper">
          <input
            type="text"
            placeholder="Buscar movimientos"
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>
      </div>

      {isLoading ? (
        <Loader />
      ) : (
        <>
          {activeTab === "informes" && (
            <>
              <div className="table-container fade-in">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Hora</th>
                      <th>N° Informe</th>
                      <th>Acción</th>
                      <th>Descripción</th>
                      <th>Usuario</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItemsInformes.length > 0 ? (
                      currentItemsInformes.map((item) => (
                        <tr key={item.id}>
                          <td>{formatDate(item.fecha)}</td>
                          <td>{formatTime(item.fecha_formateada)}</td>
                          <td>{item.numero_informe}</td>
                          <td>{item.accion}</td>
                          <td title={item.descripcion}>
                            {item.descripcion &&
                              item.descripcion.length > 150
                              ? item.descripcion.slice(0, 150) + "..."
                              : item.descripcion}
                          </td>
                          <td>{item.usuario_nombre}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="no-results">
                          No se encontraron registros.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <Pagination
                currentPage={currentPageInformes}
                totalPages={totalPagesInformes}
                onPageChange={setCurrentPageInformes}
              />
            </>
          )}

          {activeTab === "notas" && (
            <>
              <div className="table-container fade-in">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Hora</th>
                      <th>N° Nota</th>
                      <th>Acción</th>
                      <th>Descripción</th>
                      <th>Usuario</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItemsNotas.length > 0 ? (
                      currentItemsNotas.map((item) => (
                        <tr key={item.id}>
                          <td>{formatDate(item.fecha)}</td>
                          <td>{formatTime(item.fecha_formateada)}</td>
                          <td>{item.numero_nota}</td>
                          <td>{item.accion}</td>
                          <td title={item.descripcion}>
                            {item.descripcion &&
                              item.descripcion.length > 150
                              ? item.descripcion.slice(0, 150) + "..."
                              : item.descripcion}
                          </td>
                          <td>{item.usuario_nombre}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="no-results">
                          No se encontraron registros.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <Pagination
                currentPage={currentPageNotas}
                totalPages={totalPagesNotas}
                onPageChange={setCurrentPageNotas}
              />
            </>
          )}

          {activeTab === "ingresos" && (
            <>
              <div className="table-container fade-in">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Hora</th>
                      <th>ID Ingreso</th>
                      <th>Acción</th>
                      <th>Descripción</th>
                      <th>Usuario</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItemsIngresos.length > 0 ? (
                      currentItemsIngresos.map((item) => (
                        <tr key={item.id}>
                          <td>{formatDate(item.fecha)}</td>
                          <td>{formatTime(item.fecha)}</td>
                          <td>{item.ingreso_id}</td>
                          <td>{item.accion}</td>
                          <td title={item.descripcion}>
                            {item.descripcion && item.descripcion.length > 150
                              ? item.descripcion.slice(0, 150) + "..."
                              : item.descripcion}
                          </td>
                          <td>{item.usuario_nombre}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="no-results">
                          No se encontraron registros.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <Pagination
                currentPage={currentPageIngresos}
                totalPages={totalPagesIngresos}
                onPageChange={setCurrentPageIngresos}
              />
            </>
          )}
        </>
      )}
    </main>
  );
};

export default HistorialMovimientosPage;
