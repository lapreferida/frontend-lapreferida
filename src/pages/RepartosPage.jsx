import { useState, useEffect } from "react";
import Select from "react-select";
import { FaPlus, FaMinus } from "react-icons/fa"; 
import { getProductos } from "../services/productosService.js"; // Ajusta la ruta si es necesario
import { getClientesReparto } from "../services/clientesRepartoService.js"; // Importa el servicio de clientes reparto
import "../styles/RepartoPage.css";

const RegistroReparto = () => {
  // Estado para cliente, lista de clientes, productos totales y productos seleccionados
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientList, setClientList] = useState([]); // Lista de clientes de reparto obtenida de la API
  const [allProductos, setAllProductos] = useState([]);
  const [productosSeleccionados, setProductosSeleccionados] = useState([]);
  const [estadoPago, setEstadoPago] = useState("Pagado");

  // Cargar productos desde el backend al montar el componente
  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const data = await getProductos();
        setAllProductos(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProductos();
  }, []);

  // Cargar clientes de reparto desde el backend
  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const data = await getClientesReparto();
        setClientList(data);
      } catch (error) {
        console.error("Error fetching clientes reparto:", error);
      }
    };

    fetchClientes();
  }, []);

  // Mapeo para react-select: se asegura de convertir el precio a número para productos
  const optionsProductos = allProductos.map((prod) => ({
    value: prod.id,
    label: prod.nombre,
    precio: Number(prod.precio),
  }));

  // Mapeo para react-select para clientes
  const optionsClientes = clientList.map((client) => ({
    value: client.id,
    label: client.nombre,
  }));

  // Al seleccionar un producto, se agrega a la lista de productos seleccionados si aún no existe
  const handleSelectProducto = (selectedOption) => {
    if (!selectedOption) return;
    const exists = productosSeleccionados.some(
      (p) => p.id === selectedOption.value
    );
    if (!exists) {
      setProductosSeleccionados((prev) => [
        ...prev,
        {
          id: selectedOption.value,
          nombre: selectedOption.label,
          precio: Number(selectedOption.precio),
          cantidad: 1, // cantidad inicial
        },
      ]);
    }
  };

  // Función para incrementar o decrementar la cantidad de un producto
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

  // Permite ingresar directamente la cantidad mediante un input
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

  // Calcula el total según cantidad y precio
  const getTotal = () => {
    return productosSeleccionados.reduce(
      (acc, prod) => acc + prod.cantidad * prod.precio,
      0
    );
  };

  // Manejo de selección y eliminación del cliente de reparto mediante react-select
  const handleSelectClient = (selectedOption) => {
    if (selectedOption) {
      const client = clientList.find(
        (c) => c.id === selectedOption.value
      );
      setSelectedClient(client);
    } else {
      setSelectedClient(null);
    }
  };

  const handleRemoveClient = () => {
    setSelectedClient(null);
  };

  // Envío del formulario de reparto
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
    const repartoData = {
      cliente: selectedClient,
      products: productosSeleccionados.filter((p) => p.cantidad > 0),
      estadoPago,
      total: getTotal(),
    };
    console.log("Datos de reparto:", repartoData);
    alert("¡Reparto registrado con éxito!");
    // Aquí podrías enviar los datos al backend mediante fetch o axios
  };

  return (
    <div className="container registro-reparto-container">
      <h1>Registro de Reparto</h1>
      <form onSubmit={handleSubmit} className="registro-form">
        {/* Sección Cliente */}
        <div className="registro-card">
          <h2>Cliente</h2>
          {!selectedClient ? (
            <div className="client-select">
              <Select
                options={optionsClientes}
                onChange={handleSelectClient}
                placeholder="Buscar y seleccionar cliente..."
                isClearable
              />
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
                <p className="product-price">
                  ${Number(prod.precio).toFixed(2)}
                </p>
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
