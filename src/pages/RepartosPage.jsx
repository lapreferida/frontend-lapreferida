import React, { useState } from "react";
import { FaPlus, FaMinus } from "react-icons/fa"; 
import "./RegistroReparto.css";

const RegistroReparto = () => {
  // Estado local para cliente, productos, estado de pago y total
  const [selectedClient, setSelectedClient] = useState(null);
  const [products, setProducts] = useState([
    { id: 1, nombre: "Pan Baguette", precio: 2.5, cantidad: 0 },
    { id: 2, nombre: "Pan Integral", precio: 3.0, cantidad: 0 },
  ]);
  const [estadoPago, setEstadoPago] = useState("Pagado");
  const [clientList] = useState([
    { id: 1, nombre: "Panadería Central", direccion: "Av. Principal 123" },
    { id: 2, nombre: "El Buen Pan", direccion: "Calle Secundaria 456" },
  ]);

  // Maneja la selección del cliente
  const handleSelectClient = (clientId) => {
    const client = clientList.find((c) => c.id === parseInt(clientId, 10));
    setSelectedClient(client);
  };

  // Deselecciona al cliente (X)
  const handleRemoveClient = () => {
    setSelectedClient(null);
  };

  // Aumenta o disminuye cantidad del producto
  const handleChangeQuantity = (productId, increment = 1) => {
    setProducts((prev) =>
      prev.map((prod) => {
        if (prod.id === productId) {
          const nuevaCantidad = Math.max(prod.cantidad + increment, 0);
          return { ...prod, cantidad: nuevaCantidad };
        }
        return prod;
      })
    );
  };

  // Calcula el total a partir de las cantidades y precios
  const getTotal = () => {
    return products.reduce((acc, prod) => {
      return acc + prod.cantidad * prod.precio;
    }, 0);
  };

  // Maneja el envío de los datos (Registrar Reparto)
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedClient) {
      alert("Por favor, selecciona un cliente.");
      return;
    }
    // Se podrían enviar estos datos al backend
    const repartoData = {
      cliente: selectedClient,
      products: products.filter((p) => p.cantidad > 0), 
      estadoPago,
      total: getTotal(),
    };
    console.log("Datos de reparto:", repartoData);
    alert("¡Reparto registrado con éxito!");
    // Limpieza de campos si se desea
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
          {products.map((prod) => (
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
                <span className="quantity-value">{prod.cantidad}</span>
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
