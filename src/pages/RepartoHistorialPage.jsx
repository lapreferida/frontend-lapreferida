// frontend/RepartoHistorialPage.jsx
import { useState, useEffect } from "react";
import Swal from "sweetalert2";

// Componentes
import Loader from "../components/Loader.jsx";
import Pagination from "../components/Pagination.jsx";

// Servicios
import { getHistorialRepartosPorDia } from "../services/repartoService.js";

const RepartoHistorialPage = () => {
    // Estado para el historial, fecha filtrada, carga, paginación y errores
    const [historial, setHistorial] = useState([]);
    const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    // Estados para paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Se ejecuta cada vez que cambia la fecha seleccionada
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
            // Reiniciamos la página al cambiar la cantidad de ítems
            setCurrentPage(1);
        };

        updateItemsPerPage();
        window.addEventListener("resize", updateItemsPerPage);
        return () => window.removeEventListener("resize", updateItemsPerPage);
    }, []);
    
    // Función para obtener el historial de repartos para la fecha especificada
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

    // Manejo del cambio de fecha (filtro)
    const handleDateChange = (e) => {
        setFecha(e.target.value);
        setCurrentPage(1);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    // Configuración para paginación
    const totalItems = historial.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const currentHistorial = historial.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    return (
        <main className="container">
            <h1>Historial de Repartos</h1>

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
