import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import Swal from "sweetalert2";

// Importa la función que verifique la sesión del usuario
import { checkSession } from "../services/authService.js";
import { getProductos } from "../services/productosService.js";
import { getClientesReparto } from "../services/clientesRepartoService.js";
import { createReparto } from "../services/repartoSerice.js";
import "../styles/RepartoPage.css";

const RegistroReparto = () => {
  const navigate = useNavigate();

  // Estados del usuario, cliente, productos y demás
  const [user, setUser] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientList, setClientList] = useState([]);
  const [allProductos, setAllProductos] = useState([]);
  const [productosSeleccionados, setProductosSeleccionados] = useState([]);
  const [estadoPago, setEstadoPago] = useState("Pagado");

  // Estados para el producto temporalmente seleccionado
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [tempQuantity, setTempQuantity] = useState(1);

  // Verificar sesión de usuario al montar el componente
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const sessionData = await checkSession();
        setUser(sessionData.user);
      } catch {
        Swal.fire("Sesión expirada", "Por favor inicie sesión nuevamente", "warning");
        navigate("/auth");
      }
    };
    fetchSession();
  }, [navigate]);

  // Cargar productos
  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const data = await getProductos();
        setAllProductos(data);
      } catch (error) {
        console.error("Error fetching products:", error);
        Swal.fire("Error", "No se pudieron cargar los productos", "error");
      }
    };
    fetchProductos();
  }, []);

  // Cargar clientes
  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const data = await getClientesReparto();
        setClientList(data);
      } catch (error) {
        console.error("Error fetching clientes reparto:", error);
        Swal.fire("Error", "No se pudieron cargar los clientes", "error");
      }
    };
    fetchClientes();
  }, []);

  // Opciones para react-select
  const optionsProductos = allProductos.map((prod) => ({
    value: prod.id,
    label: prod.nombre,
    precio: Number(prod.precio),
  }));

  const optionsClientes = clientList.map((client) => ({
    value: client.id,
    label: client.nombre,
  }));

  // Manejo de selección de producto
  const handleSelectProducto = (selectedOption) => {
    if (!selectedOption) {
      setSelectedProduct(null);
      return;
    }
    setSelectedProduct(selectedOption);
    setTempQuantity(1);
  };

  // Agregar producto al pedido
  const handleAgregarAlPedido = () => {
    if (!selectedProduct) return;
    // Verificar si ya existe el producto en el pedido
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

  // Cálculo del total del pedido
  const getTotal = () =>
    productosSeleccionados.reduce(
      (acc, prod) => acc + prod.cantidad * prod.precio,
      0
    );

  // Seleccionar cliente
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

  // Manejo del envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedClient) {
      Swal.fire("Error", "Por favor, selecciona un cliente.", "error");
      return;
    }
    if (productosSeleccionados.length === 0) {
      Swal.fire("Error", "Por favor, selecciona al menos un producto.", "error");
      return;
    }
    if (!user) {
      Swal.fire("Error", "Usuario no encontrado.", "error");
      return;
    }

    const repartoData = {
      // Se envía el usuario logueado
      usuario_id: user.id,
      cliente: selectedClient,
      products: productosSeleccionados.filter((p) => p.cantidad > 0),
      estado_pago: estadoPago,
      observaciones: "", // Puedes agregar un input para observaciones si lo requieres
    };

    try {
      const result = await createReparto(repartoData);
      console.log("Reparto registrado:", result);
      Swal.fire("Éxito", "¡Reparto registrado con éxito!", "success");

      // Resetear estados para una nueva entrada
      setSelectedClient(null);
      setProductosSeleccionados([]);
      setEstadoPago("Pagado");
    } catch (error) {
      console.error("Error al registrar el reparto:", error);
      // Procesar error para mostrar un mensaje más descriptivo
      let errorMsg = "Error al registrar el reparto. Intenta nuevamente.";
      if (typeof error === "object" && error !== null) {
        if (error.message) {
          errorMsg = error.message;
        } else if (error.errors && Array.isArray(error.errors)) {
          errorMsg = error.errors.map((err) => err.msg).join(", ");
        }
      } else {
        errorMsg = error.toString();
      }
      Swal.fire("Error", errorMsg, "error");
    }
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
        </div>

        {/* Detalle del Pedido */}
        {productosSeleccionados.length > 0 && (
          <div className="registro-card">
            <h2>Detalle del Pedido</h2>
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
        )}

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

        {/* Pie: Total y Botón de Registro */}
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
