import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { FaTrash, FaEdit } from "react-icons/fa";
import { NumericFormat } from "react-number-format";
import { getProductos, createProducto, updateProducto, deleteProducto } from "../services/productosService";
import "../styles/dosColumnas.css";

const ProductosPage = () => {
  // Estados para el formulario de producto
  const [codigo, setCodigo] = useState("");
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [unidadMedida, setUnidadMedida] = useState(""); // ahora se usará con select
  const [precio, setPrecio] = useState("");

  // Estados para manejar el listado y la edición
  const [productos, setProductos] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Cargar productos desde la API
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

  // Manejar el envío del formulario
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
        // Actualizamos producto
        await updateProducto(editingId, productoData);
        Swal.fire("Éxito", "Producto actualizado correctamente", "success");
      } else {
        // Creamos nuevo producto
        await createProducto(productoData);
        Swal.fire("Éxito", "Producto creado correctamente", "success");
      }
      // Limpiamos el formulario
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
      const errorMessage = error.message || "Error al procesar la solicitud";
      Swal.fire("Error", errorMessage, "error");
    }
  };

  // Cargar los datos en el formulario para editar
  const handleEdit = (producto) => {
    setCodigo(producto.codigo);
    setNombre(producto.nombre);
    setDescripcion(producto.descripcion);
    setUnidadMedida(producto.unidad_medida); // se asigna el valor ya guardado (ya sea "unidad" o "kg")
    setPrecio(producto.precio);
    setIsEditing(true);
    setEditingId(producto.id);
  };

  // Confirmar y eliminar producto
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
          const errorMsg = error.message || "Error al eliminar el producto";
          Swal.fire("Error", errorMsg, "error");
        }
      }
    });
  };

  return (
    <main className="container productos-container">
      <h1>Gestión de Productos</h1>
      <div className="content-wrapper-dc">
        {/* Formulario en la columna izquierda */}
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
                  fixedDecimalScale={true}
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

        {/* Tabla en la columna derecha */}
        <div className="table-container">
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
              {productos.length > 0 ? (
                productos.map((producto) => (
                  <tr key={producto.id}>
                    <td>{producto.codigo}</td>
                    <td>{producto.nombre}</td>
                    <td>{producto.descripcion}</td>
                    <td>{producto.unidad_medida}</td>
                    <td>
                      {new Intl.NumberFormat("es-AR", {
                        style: "currency",
                        currency: "ARS",
                      }).format(producto.precio)}
                    </td>
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
        </div>
      </div>
    </main>
  );
};

export default ProductosPage;
