import { useState, useEffect } from "react";
import Select from "react-select";
import { getProductos } from "../services/productosService.js";
import { getClientesReparto } from "../services/clientesRepartoService.js";
import "../styles/RepartoPage.css";

const RegistroReparto = () => {
  // Estados para cliente, productos y demás
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientList, setClientList] = useState([]);
  const [allProductos, setAllProductos] = useState([]);
  const [productosSeleccionados, setProductosSeleccionados] = useState([]);
  const [estadoPago, setEstadoPago] = useState("Pagado");

  // Estados para el producto temporalmente seleccionado
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [tempQuantity, setTempQuantity] = useState(1);

  // Cargar productos desde el backend
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

  // Cargar clientes desde el backend
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

  // Mapear productos y clientes para react-select
  const optionsProductos = allProductos.map((prod) => ({
    value: prod.id,
    label: prod.nombre,
    precio: Number(prod.precio),
  }));

  const optionsClientes = clientList.map((client) => ({
    value: client.id,
    label: client.nombre,
  }));

  // Al seleccionar un producto en el Select
  const handleSelectProducto = (selectedOption) => {
    if (!selectedOption) {
      setSelectedProduct(null);
      return;
    }
    setSelectedProduct(selectedOption);
    setTempQuantity(1);
  };

  // Función para “Agregar al Pedido”
  const handleAgregarAlPedido = () => {
    if (!selectedProduct) return;
    const exists = productosSeleccionados.some(
      (p) => p.id === selectedProduct.value
    );
    if (!exists) {
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
      setProductosSeleccionados((prev) =>
        prev.map((prod) =>
          prod.id === selectedProduct.value
            ? { ...prod, cantidad: prod.cantidad + tempQuantity }
            : prod
        )
      );
    }
    setSelectedProduct(null);
    setTempQuantity(1);
  };

  // Cálculo del total
  const getTotal = () =>
    productosSeleccionados.reduce(
      (acc, prod) => acc + prod.cantidad * prod.precio,
      0
    );

  // Selección de cliente mediante react-select
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
            <div className="form-group">
              <Select
                options={optionsClientes}
                onChange={handleSelectClient}
                placeholder="Buscar cliente"
                isClearable
                className="custom-select"
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
          <div className="form-group">
            <Select
              options={optionsProductos}
              onChange={handleSelectProducto}
              placeholder="Buscar producto"
              isClearable
              value={selectedProduct}
              className="custom-select"
            />
          </div>

          {/* Sección de ingreso para el producto seleccionado */}
          {selectedProduct && (
            <div className="product-selection">
              <div className="product-top">
                <p className="product-name">{selectedProduct.label}</p>
                <input
                  type="number"
                  className="quantity-input"
                  min="1"
                  value={tempQuantity}
                  onChange={(e) =>
                    setTempQuantity(Number(e.target.value) || 1)
                  }
                />
              </div>
              <p className="product-price">
                Precio: ${selectedProduct.precio.toFixed(2)}
              </p>
              <button
                type="button"
                className="add-product-button"
                onClick={handleAgregarAlPedido}
              >
                Agregar al Pedido
              </button>
            </div>
          )}

          {/* Detalle del Pedido */}
          <h3 className="titleDetalle">Detalle del Pedido</h3>
          {productosSeleccionados.map((prod) => (
            <div key={prod.id} className="product-item">
              <div className="product-info">
                <p className="product-name">{prod.nombre}</p>
              </div>
              <div className="product-detail">
                <p className="product-price">
                  ${Number(prod.precio).toFixed(2)} x {prod.cantidad}
                </p>
                <p className="product-subtotal">
                  Subtotal: ${(prod.precio * prod.cantidad).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Sección Estado de Pago */}
        <div className="registro-card">
          <h2>Estado de Pago</h2>
          <div className="radio-inputs">
            <label className="radio">
              <input
                type="radio"
                name="estadoPago"
                value="Pagado"
                checked={estadoPago === "Pagado"}
                onChange={(e) => setEstadoPago(e.target.value)}
              />
              <span className="name">Pagado</span>
            </label>
            <label className="radio">
              <input
                type="radio"
                name="estadoPago"
                value="Pago 2 días"
                checked={estadoPago === "Pago 2 días"}
                onChange={(e) => setEstadoPago(e.target.value)}
              />
              <span className="name">Pago 2 días</span>
            </label>
            <label className="radio">
              <input
                type="radio"
                name="estadoPago"
                value="Cuenta"
                checked={estadoPago === "Cuenta"}
                onChange={(e) => setEstadoPago(e.target.value)}
              />
              <span className="name">Cuenta</span>
            </label>
            <label className="radio">
              <input
                type="radio"
                name="estadoPago"
                value="Debe"
                checked={estadoPago === "Debe"}
                onChange={(e) => setEstadoPago(e.target.value)}
              />
              <span className="name">Debe</span>
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
