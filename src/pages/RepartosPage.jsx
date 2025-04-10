import { useState, useEffect } from "react";
import Select from "react-select";
import { FaPlus, FaMinus } from "react-icons/fa";
import { getProductos } from "../services/productosService.js";
import { getClientesReparto } from "../services/clientesRepartoService.js";
import "../styles/RepartoPage.css";

const RegistroReparto = () => {
  // Estado para cliente, lista de clientes, productos totales y productos seleccionados
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientList, setClientList] = useState([]);
  const [allProductos, setAllProductos] = useState([]);
  const [productosSeleccionados, setProductosSeleccionados] = useState([]);
  const [estadoPago, setEstadoPago] = useState("Pagado");

  // Estados nuevos para el producto temporalmente seleccionado
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [tempQuantity, setTempQuantity] = useState(1);

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

  // Mapeo para react-select de productos
  const optionsProductos = allProductos.map((prod) => ({
    value: prod.id,
    label: prod.nombre,
    precio: Number(prod.precio),
  }));

  // Mapeo para react-select de clientes
  const optionsClientes = clientList.map((client) => ({
    value: client.id,
    label: client.nombre,
  }));

  // Cuando seleccionamos un producto en el Select, lo guardamos en el estado temporal
  const handleSelectProducto = (selectedOption) => {
    if (!selectedOption) {
      setSelectedProduct(null);
      return;
    }
    // Se reinicia la cantidad a 1 (o la que prefieras como predeterminada)
    setSelectedProduct(selectedOption);
    setTempQuantity(1);
  };

  // Funciones para incrementar/decrementar la cantidad del producto temporal
  const handleDecrementTemp = () => {
    setTempQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  };

  const handleIncrementTemp = () => {
    setTempQuantity((prev) => prev + 1);
  };

  // Función para “Agregar al pedido”
  const handleAgregarAlPedido = () => {
    if (!selectedProduct) return;
    // Chequeamos si el producto ya existe en la lista
    const exists = productosSeleccionados.some(
      (p) => p.id === selectedProduct.value
    );
    if (!exists) {
      // Si no existe, lo agregamos
      setProductosSeleccionados((prev) => [
        ...prev,
        {
          id: selectedProduct.value,
          nombre: selectedProduct.label,
          precio: Number(selectedProduct.precio),
          cantidad: tempQuantity,
        },
      ]);
    } else {
      // Si ya existe, podríamos:
      // - sumar la cantidad, o
      // - simplemente avisar que ya está en el pedido
      // Aquí haremos que se sume la cantidad:
      setProductosSeleccionados((prev) =>
        prev.map((prod) =>
          prod.id === selectedProduct.value
            ? { ...prod, cantidad: prod.cantidad + tempQuantity }
            : prod
        )
      );
    }

    // Limpiar la selección temporal
    setSelectedProduct(null);
    setTempQuantity(1);
  };

  // Funciones existentes para cambiar cantidades en el detalle
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
      const client = clientList.find((c) => c.id === selectedOption.value);
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
    // Aquí podrías enviar los datos al backend
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
                placeholder="Buscar cliente"
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
              placeholder="Buscar producto"
              isClearable
              value={selectedProduct}
            />
          </div>
          
          {/* 
            Sección que solo se muestra si hay un producto seleccionado
            para que el usuario ingrese la cantidad y agregue al pedido
          */}
          {selectedProduct && (
            <div className="product-selection">
              <p className="product-name">{selectedProduct.label}</p>
              <p className="product-price">
                ${selectedProduct.precio.toFixed(2)}
              </p>

              <div className="temp-quantity">
                <button
                  type="button"
                  className="quantity-button"
                  onClick={handleDecrementTemp}
                >
                  <FaMinus />
                </button>
                <input
                  type="number"
                  className="quantity-input"
                  min="1"
                  value={tempQuantity}
                  onChange={(e) => setTempQuantity(Number(e.target.value))}
                />
                <button
                  type="button"
                  className="quantity-button"
                  onClick={handleIncrementTemp}
                >
                  <FaPlus />
                </button>
              </div>

              <button
                type="button"
                className="add-product-button"
                onClick={handleAgregarAlPedido}
              >
                Agregar al Pedido
              </button>
            </div>
          )}

          {/* Listado de productos ya agregados al pedido */}
          <h3>Detalle del Pedido</h3>
          {productosSeleccionados.map((prod) => (
            <div key={prod.id} className="product-item">
              <div className="product-info">
                <p className="product-name">{prod.nombre}</p>
                <p className="product-price">
                  ${Number(prod.precio).toFixed(2)} x {prod.cantidad}
                </p>
                <p className="product-subtotal">
                  Subtotal: ${(prod.precio * prod.cantidad).toFixed(2)}
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
                  onChange={(e) => handleDirectQuantityChange(prod.id, e.target.value)}
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
