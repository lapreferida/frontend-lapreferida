import { useState, useEffect } from "react";
import Select from "react-select"; // Importa react-select
import { FaPlus, FaMinus } from "react-icons/fa"; 
import { getProductos } from "../services/productosService.js"; // Ajusta la ruta según corresponda
import "../styles/RepartoPage.css";

const RegistroReparto = () => {
  // Estado para cliente, lista de productos totales y productos seleccionados
  const [selectedClient, setSelectedClient] = useState(null);
  const [allProductos, setAllProductos] = useState([]);
  const [productosSeleccionados, setProductosSeleccionados] = useState([]);
  const [estadoPago, setEstadoPago] = useState("Pagado");

  // Lista de clientes de ejemplo
  const [clientList] = useState([
    { id: 1, nombre: "Panadería Central", direccion: "Av. Principal 123" },
    { id: 2, nombre: "El Buen Pan", direccion: "Calle Secundaria 456" },
  ]);

  // Se cargan los productos desde el backend cuando el componente se monta
  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const data = await getProductos();
        setAllProductos(data);
      } catch (error) {
        console.error("Error fetching products: ", error);
      }
    };

    fetchProductos();
  }, []);

  // Opciones para react-select (se muestra el nombre y se asigna el id)
  const optionsProductos = allProductos.map((prod) => ({
    value: prod.id,
    label: prod.nombre,
    precio: prod.precio,
    // Puedes pasar otros datos si es necesario (por ejemplo, código o unidad_medida)
  }));

  // Cuando se selecciona un producto desde el select, se agrega a la lista si aún no existe
  const handleSelectProducto = (selectedOption) => {
    if (!selectedOption) return;

    // Verificar si ya fue agregado
    const exists = productosSeleccionados.some(
      (p) => p.id === selectedOption.value
    );
    if (!exists) {
      setProductosSeleccionados((prev) => [
        ...prev,
        {
          id: selectedOption.value,
          nombre: selectedOption.label,
          precio: selectedOption.precio,
          cantidad: 1, // cantidad inicial
        },
      ]);
    }
  };

  // Manejo de cantidad (puede incrementarse o decrementarse)
  const handleChangeQuantity = (productoId, increment = 1) => {
    setProductosSeleccionados((prev) =>
      prev.map((prod) => {
        if (prod.id === productoId) {
          const nuevaCantidad = Math.max(prod.cantidad + increment, 0);
          return { ...prod, cantidad: nuevaCantidad };
        }
        return prod;
      })
    );
  };

  // Permite ingresar directamente la cantidad
  const handleDirectQuantityChange = (productoId, value) => {
    const nuevaCantidad = parseInt(value, 10) || 0;
    setProductosSeleccionados((prev) =>
      prev.map((prod) => {
        if (prod.id === productoId) {
          return { ...prod, cantidad: nuevaCantidad };
        }
        return prod;
      })
    );
  };

  // Calcula el total a partir de las cantidades y precios
  const getTotal = () => {
    return productosSeleccionados.reduce(
      (acc, prod) => acc + prod.cantidad * prod.precio,
      0
    );
  };

  // Maneja la selección del cliente
  const handleSelectClient = (clientId) => {
    const client = clientList.find((c) => c.id === parseInt(clientId, 10));
    setSelectedClient(client);
  };

  // Elimina el cliente seleccionado
  const handleRemoveClient = () => {
    setSelectedClient(null);
  };

  // Envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedClient) {
      alert("Por favor, selecciona un cliente.");
      return;
    }
    if (productosSeleccionados.length === 0) {
      alert("Por favor, selecciona al menos un producto.");
      return;
    }

    // Datos para enviar (se filtran aquellos productos con cantidad mayor a 0)
    const repartoData = {
      cliente: selectedClient,
      products: productosSeleccionados.filter((p) => p.cantidad > 0),
      estadoPago,
      total: getTotal(),
    };
    console.log("Datos de reparto:", repartoData);
    alert("¡Reparto registrado con éxito!");
    // Aquí llamarías a tu backend con fetch/axios
  };

  return (
    <div className="registro-reparto-container">
      <h1 className="registro-title">Registro de Reparto</h1>
      <form onSubmit={handleSubmit} className="registro-form">

        {/* Sección Cliente */}
        <div className="registro-card">
          <h2>Cliente</h2>
          {!selectedClient ? (
            <div className="client-select">
              <label htmlFor="clientSelect" className="label-hidden">
                Seleccionar cliente
              </label>
              <select
                id="clientSelect"
                onChange={(e) => handleSelectClient(e.target.value)}
                defaultValue=""
              >
                <option value="" disabled>
                  -- Seleccionar Cliente --
                </option>
                {clientList.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="selected-client">
              <div>
                <p className="client-name">{selectedClient.nombre}</p>
                <p className="client-address">{selectedClient.direccion}</p>
              </div>
              <button
                type="button"
                className="remove-client-button"
                onClick={handleRemoveClient}
              >
                ×
              </button>
            </div>
          )}
        </div>

        {/* Sección Productos */}
        <div className="registro-card">
          <h2>Productos</h2>
          {/* Select para buscar productos */}
          <div className="select-container">
            <Select
              options={optionsProductos}
              onChange={handleSelectProducto}
              placeholder="Buscar y seleccionar producto..."
              isClearable
            />
          </div>
          {/* Listado de productos seleccionados */}
          {productosSeleccionados.map((prod) => (
            <div key={prod.id} className="product-item">
              <div className="product-info">
                <p className="product-name">{prod.nombre}</p>
                <p className="product-price">${prod.precio.toFixed(2)}</p>
              </div>
              <div className="product-quantity">
                <button
                  type="button"
                  className="quantity-button"
                  onClick={() => handleChangeQuantity(prod.id, -1)}
                >
                  <FaMinus />
                </button>
                <input
                  type="number"
                  className="quantity-input"
                  value={prod.cantidad}
                  onChange={(e) =>
                    handleDirectQuantityChange(prod.id, e.target.value)
                  }
                  min="0"
                />
                <button
                  type="button"
                  className="quantity-button"
                  onClick={() => handleChangeQuantity(prod.id, 1)}
                >
                  <FaPlus />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Sección Estado de Pago */}
        <div className="registro-card">
          <h2>Estado de Pago</h2>
          <div className="payment-options">
            <label>
              <input
                type="radio"
                name="estadoPago"
                value="Pagado"
                checked={estadoPago === "Pagado"}
                onChange={(e) => setEstadoPago(e.target.value)}
              />
              Pagado
            </label>
            <label>
              <input
                type="radio"
                name="estadoPago"
                value="Pagar en 2 dias"
                checked={estadoPago === "Pagar en 2 dias"}
                onChange={(e) => setEstadoPago(e.target.value)}
              />
              Pagar en 2 días
            </label>
          </div>
        </div>

        {/* Pie: Mostrar total y botón de registrar */}
        <div className="registro-footer">
          <div className="total">
            <span>Total:</span>
            <strong>${getTotal().toFixed(2)}</strong>
          </div>
          <button type="submit" className="register-button">
            Registrar Reparto
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegistroReparto;
