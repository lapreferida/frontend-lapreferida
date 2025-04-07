// src/pages/ProductosPage.jsx
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { FaTrash, FaEdit, FaUserPlus } from "react-icons/fa";
import { NumericFormat } from "react-number-format";
import {
  getProductos,
  createProducto,
  updateProducto,
  deleteProducto,
} from "../services/productosService";
import Pagination from "../components/Pagination";
import "../styles/dosColumnas.css";

const ProductosPage = () => {
  // --- Formulario ---
  const [codigo, setCodigo] = useState("");
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [unidadMedida, setUnidadMedida] = useState("");
  const [precio, setPrecio] = useState("");

  // --- Listado y edición ---
  const [productos, setProductos] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // --- Búsqueda y paginación ---
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Formatea número a moneda ARS
  const formatCurrency = (value) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(value);

  // Carga inicial
  const fetchProductos = async () => {
    try {
      const data = await getProductos();
      setProductos(data);
    } catch (error) {
      console.error("Error al obtener los productos:", error);
      Swal.fire("Error", "No se pudieron cargar los productos", "error");
    }
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  // --- Handlers del formulario ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!codigo || !nombre || !unidadMedida || !precio) {
      Swal.fire("Error", "Complete los campos obligatorios", "error");
      return;
    }
    const productoData = {
      codigo,
      nombre,
      descripcion,
      unidad_medida: unidadMedida,
      precio,
    };
    try {
      if (isEditing) {
        await updateProducto(editingId, productoData);
        Swal.fire("Éxito", "Producto actualizado correctamente", "success");
      } else {
        await createProducto(productoData);
        Swal.fire("Éxito", "Producto creado correctamente", "success");
      }
      // limpiar
      setCodigo("");
      setNombre("");
      setDescripcion("");
      setUnidadMedida("");
      setPrecio("");
      setIsEditing(false);
      setEditingId(null);
      fetchProductos();
    } catch (error) {
      console.error(error);
      Swal.fire("Error", error.message || "Error al procesar la solicitud", "error");
    }
  };

  const handleEdit = (p) => {
    setCodigo(p.codigo);
    setNombre(p.nombre);
    setDescripcion(p.descripcion);
    setUnidadMedida(p.unidad_medida);
    setPrecio(p.precio);
    setIsEditing(true);
    setEditingId(p.id);
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "¿Eliminar producto?",
      text: "Esta acción eliminará el producto de la base de datos.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteProducto(id);
          Swal.fire("Eliminado", "El producto ha sido eliminado", "success");
          fetchProductos();
        } catch (error) {
          console.error(error);
          Swal.fire("Error", error.message || "Error al eliminar el producto", "error");
        }
      }
    });
  };

  // --- Filtrado ---
  const filteredProductos = productos.filter((p) => {
    const term = searchTerm.trim().toLowerCase();
    return (
      !term ||
      p.codigo.toLowerCase().includes(term) ||
      p.nombre.toLowerCase().includes(term) ||
      (p.descripcion && p.descripcion.toLowerCase().includes(term))
    );
  });

  // --- Paginación ---
  const totalItems = filteredProductos.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const currentItems = filteredProductos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Si el usuario cambia la búsqueda, volvemos a la página 1
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  return (
    <main className="container productos-container">
      <h1>Gestión de Productos</h1>
      <div className="content-wrapper-dc">
        {/* === Formulario === */}
        <div className="form-container-dc">
          <h2>{isEditing ? "Editar Producto" : "Nuevo Producto"}</h2>
          <form onSubmit={handleSubmit} className="producto-form">
            <div className="form-grid-dc">
              <div className="form-group-dc">
                <label>Código</label>
                <input
                  type="text"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  placeholder="Código del producto"
                  required
                />
              </div>
              <div className="form-group-dc">
                <label>Nombre</label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Nombre del producto"
                  required
                />
              </div>
              <div className="form-group-dc">
                <label>Descripción</label>
                <input
                  type="text"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Descripción del producto"
                />
              </div>
              <div className="form-group-dc">
                <label>Unidad de Medida</label>
                <select
                  value={unidadMedida}
                  onChange={(e) => setUnidadMedida(e.target.value)}
                  required
                >
                  <option value="">Seleccione una opción</option>
                  <option value="unidad">Unidad</option>
                  <option value="kg">Kg</option>
                </select>
              </div>
              <div className="form-group-dc">
                <label>Precio</label>
                <NumericFormat
                  value={precio}
                  thousandSeparator="."
                  decimalSeparator=","
                  decimalScale={2}
                  fixedDecimalScale
                  prefix="$ "
                  placeholder="$ 0"
                  onValueChange={(values) => setPrecio(values.value)}
                  className="input-currency"
                  required
                />
              </div>
            </div>
            <div className="btn-container-dc">
              <button type="submit" className="btn-submit-dc">
                {isEditing ? "Actualizar" : "Crear Producto"}
              </button>
              {isEditing && (
                <button
                  type="button"
                  className="btn-cancel-dc"
                  onClick={() => {
                    setIsEditing(false);
                    setEditingId(null);
                    setCodigo("");
                    setNombre("");
                    setDescripcion("");
                    setUnidadMedida("");
                    setPrecio("");
                  }}
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        {/* === Tabla y controles === */}
        <div className="table-container">
          {/* Buscador único */}
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
          {/* Tabla */}
          <table className="table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Unidad Medida</th>
                <th>Precio</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((producto) => (
                  <tr key={producto.id}>
                    <td>{producto.codigo}</td>
                    <td>{producto.nombre}</td>
                    <td>{producto.descripcion}</td>
                    <td>{producto.unidad_medida}</td>
                    <td>{formatCurrency(producto.precio)}</td>
                    <td>
                      <button
                        className="action-button editar"
                        onClick={() => handleEdit(producto)}
                        title="Editar Producto"
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="action-button eliminar"
                        onClick={() => handleDelete(producto.id)}
                        title="Eliminar Producto"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="no-results">
                    No se encontraron productos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Paginación */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </main>
  );
};

export default ProductosPage;
