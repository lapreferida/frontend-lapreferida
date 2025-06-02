"use client"

// src/pages/ProductosPage.jsx
import { useState, useEffect } from "react"
import Swal from "sweetalert2"
import { FaTrash, FaEdit, FaPlus, FaSearch, FaTimes } from "react-icons/fa"
import { NumericFormat } from "react-number-format"
import { motion, AnimatePresence } from "framer-motion"
import { getProductos, createProducto, updateProducto, deleteProducto } from "../services/productosService"
import Pagination from "../components/Pagination"
import "../styles/productos-modern.css"

const ProductosPage = () => {
  // --- Formulario ---
  const [codigo, setCodigo] = useState("")
  const [nombre, setNombre] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [unidadMedida, setUnidadMedida] = useState("")
  const [precio, setPrecio] = useState("")

  // --- Listado y edición ---
  const [productos, setProductos] = useState([])
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [showModal, setShowModal] = useState(false)

  // --- Búsqueda y paginación ---
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Formatea número a moneda ARS
  const formatCurrency = (value) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(value)

  // Carga inicial
  const fetchProductos = async () => {
    try {
      const data = await getProductos()
      setProductos(data)
    } catch (error) {
      console.error("Error al obtener los productos:", error)
      Swal.fire("Error", "No se pudieron cargar los productos", "error")
    }
  }

  useEffect(() => {
    fetchProductos()
  }, [])

  // --- Handlers del formulario ---
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!codigo || !nombre || !unidadMedida || !precio) {
      Swal.fire("Error", "Complete los campos obligatorios", "error")
      return
    }
    const productoData = {
      codigo,
      nombre,
      descripcion,
      unidad_medida: unidadMedida,
      precio,
    }
    try {
      if (isEditing) {
        await updateProducto(editingId, productoData)
        Swal.fire("Éxito", "Producto actualizado correctamente", "success")
      } else {
        await createProducto(productoData)
        Swal.fire("Éxito", "Producto creado correctamente", "success")
      }
      // limpiar
      resetForm()
      fetchProductos()
    } catch (error) {
      console.error(error)
      Swal.fire("Error", error.message || "Error al procesar la solicitud", "error")
    }
  }

  const resetForm = () => {
    setCodigo("")
    setNombre("")
    setDescripcion("")
    setUnidadMedida("")
    setPrecio("")
    setIsEditing(false)
    setEditingId(null)
    setShowModal(false)
  }

  const handleEdit = (p) => {
    setCodigo(p.codigo)
    setNombre(p.nombre)
    setDescripcion(p.descripcion)
    setUnidadMedida(p.unidad_medida)
    setPrecio(p.precio)
    setIsEditing(true)
    setEditingId(p.id)
    setShowModal(true)
  }

  const handleNewProduct = () => {
    resetForm()
    setShowModal(true)
  }

  const handleDelete = (id) => {
    Swal.fire({
      title: "¿Eliminar producto?",
      text: "Esta acción eliminará el producto de la base de datos.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#6c757d",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteProducto(id)
          Swal.fire("Eliminado", "El producto ha sido eliminado", "success")
          fetchProductos()
        } catch (error) {
          console.error(error)
          Swal.fire("Error", error.message || "Error al eliminar el producto", "error")
        }
      }
    })
  }

  // --- Filtrado ---
  const filteredProductos = productos
    .filter((p) => {
      const term = searchTerm.trim().toLowerCase()
      return (
        !term ||
        p.codigo.toLowerCase().includes(term) ||
        p.nombre.toLowerCase().includes(term) ||
        (p.descripcion && p.descripcion.toLowerCase().includes(term))
      )
    })
    .slice(68) // Ocultar los primeros 68 productos

  // --- Paginación ---
  const totalItems = filteredProductos.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const currentItems = filteredProductos.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  // Si el usuario cambia la búsqueda, volvemos a la página 1
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  return (
    <div className="productos-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">Gestión de Productos</h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-new-product"
            onClick={handleNewProduct}
          >
            <FaPlus /> Nuevo Producto
          </motion.button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="search-section">
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Buscar productos por código, nombre o descripción..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input-modern"
          />
        </div>
        <div className="results-info">
          {filteredProductos.length} producto{filteredProductos.length !== 1 ? "s" : ""} encontrado
          {filteredProductos.length !== 1 ? "s" : ""}
          {productos.length > 68 && <span className="hidden-products-info"> (68 productos ocultos)</span>}
        </div>
      </div>

      {/* Table */}
      <div className="table-section">
        <div className="table-container-modern">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Unidad</th>
                <th>Precio</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {currentItems.length > 0 ? (
                  currentItems.map((producto, index) => (
                    <motion.tr
                      key={producto.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className="table-row"
                    >
                      <td className="code-cell">{producto.codigo}</td>
                      <td className="name-cell">{producto.nombre}</td>
                      <td className="description-cell">{producto.descripcion || "-"}</td>
                      <td className="unit-cell">
                        <span className="unit-badge">{producto.unidad_medida}</span>
                      </td>
                      <td className="price-cell">{formatCurrency(producto.precio)}</td>
                      <td className="actions-cell">
                        <div className="action-buttons">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="action-btn edit-btn"
                            onClick={() => handleEdit(producto)}
                            title="Editar Producto"
                          >
                            <FaEdit />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="action-btn delete-btn"
                            onClick={() => handleDelete(producto.id)}
                            title="Eliminar Producto"
                          >
                            <FaTrash />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="no-results-modern">
                      <div className="no-results-content">
                        <FaSearch className="no-results-icon" />
                        <p>No se encontraron productos</p>
                        <small>Intenta con otros términos de búsqueda</small>
                      </div>
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination-section">
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
            onClick={(e) => e.target === e.currentTarget && resetForm()}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="modal-content"
            >
              <div className="modal-header">
                <h2>{isEditing ? "Editar Producto" : "Nuevo Producto"}</h2>
                <button className="modal-close" onClick={resetForm}>
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="modal-form">
                <div className="form-grid-modern">
                  <div className="form-group-modern">
                    <label>Código *</label>
                    <input
                      type="text"
                      value={codigo}
                      onChange={(e) => setCodigo(e.target.value)}
                      placeholder="Código del producto"
                      required
                    />
                  </div>

                  <div className="form-group-modern">
                    <label>Nombre *</label>
                    <input
                      type="text"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      placeholder="Nombre del producto"
                      required
                    />
                  </div>

                  <div className="form-group-modern full-width">
                    <label>Descripción</label>
                    <input
                      type="text"
                      value={descripcion}
                      onChange={(e) => setDescripcion(e.target.value)}
                      placeholder="Descripción del producto"
                    />
                  </div>

                  <div className="form-group-modern">
                    <label>Unidad de Medida *</label>
                    <select value={unidadMedida} onChange={(e) => setUnidadMedida(e.target.value)} required>
                      <option value="">Seleccione una opción</option>
                      <option value="unidad">Unidad</option>
                      <option value="kg">Kg</option>
                    </select>
                  </div>

                  <div className="form-group-modern">
                    <label>Precio *</label>
                    <NumericFormat
                      value={precio}
                      thousandSeparator="."
                      decimalSeparator=","
                      decimalScale={2}
                      fixedDecimalScale
                      prefix="$ "
                      placeholder="$ 0,00"
                      onValueChange={(values) => setPrecio(values.value)}
                      className="input-currency-modern"
                      required
                    />
                  </div>
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn-cancel-modern" onClick={resetForm}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn-submit-modern">
                    {isEditing ? "Actualizar" : "Crear"} Producto
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ProductosPage
