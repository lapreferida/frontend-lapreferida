import { useState, useEffect } from 'react';
import { FaUserCircle, FaPlusCircle, FaCheckCircle } from 'react-icons/fa';
import '../styles/RepartoPage.css';

// Datos de ejemplo (normalmente se obtendrían de una API)
const clientesDummy = [
  { id: 1, nombre: 'Panadería Central', estado: 'Debe', productos: [] },
  { id: 2, nombre: 'Dulce Sabor', estado: 'Paga cada 2 días', productos: [] },
  { id: 3, nombre: 'El Buen Pan', estado: 'Pagado', productos: [] },
];

const productosDummy = [
  { id: 1, nombre: 'Baguette', precio: 1.50 },
  { id: 2, nombre: 'Croissant', precio: 1.20 },
  { id: 3, nombre: 'Muffin', precio: 0.90 },
];

const RepartoPage = () => {
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [repartoData, setRepartoData] = useState({ fecha: '', detalle: [] });

  // Se simula la carga de datos
  useEffect(() => {
    // En un caso real se harían peticiones a la API
    setClientes(clientesDummy);
    setProductos(productosDummy);
    // Inicializamos el detalle de reparto agregando cada cliente
    setRepartoData(prev => ({
      ...prev,
      detalle: clientesDummy.map(cliente => ({
        clienteId: cliente.id,
        clienteNombre: cliente.nombre,
        estado_pago: cliente.estado,
        productos: productosDummy.map(prod => ({
          productoId: prod.id,
          nombre: prod.nombre,
          cantidad: 0,
          precio_unitario: prod.precio,
          subtotal: 0
        })),
        total_cliente: 0,
        observaciones: ''
      }))
    }));
  }, []);

  // Función para actualizar cantidades y recalcular subtotales
  const handleCantidadChange = (clienteId, productoId, value) => {
    setRepartoData(prevState => {
      const updatedDetalle = prevState.detalle.map(detalle => {
        if (detalle.clienteId === clienteId) {
          const updatedProductos = detalle.productos.map(prod => {
            if (prod.productoId === productoId) {
              const cantidad = parseInt(value) || 0;
              const subtotal = cantidad * prod.precio_unitario;
              return { ...prod, cantidad, subtotal };
            }
            return prod;
          });
          const total_cliente = updatedProductos.reduce((acc, prod) => acc + prod.subtotal, 0);
          return { ...detalle, productos: updatedProductos, total_cliente };
        }
        return detalle;
      });
      return { ...prevState, detalle: updatedDetalle };
    });
  };

  // Función para marcar el estado de pago (alternando entre opciones)
  const toggleEstadoPago = (clienteId) => {
    setRepartoData(prevState => {
      const updatedDetalle = prevState.detalle.map(detalle => {
        if (detalle.clienteId === clienteId) {
          let nuevoEstado;
          if (detalle.estado_pago === 'Debe') nuevoEstado = 'Pagado';
          else if (detalle.estado_pago === 'Pagado') nuevoEstado = 'Paga cada 2 días';
          else nuevoEstado = 'Debe';
          return { ...detalle, estado_pago: nuevoEstado };
        }
        return detalle;
      });
      return { ...prevState, detalle: updatedDetalle };
    });
  };

  // Función para sumar totales de todos los clientes (total del día)
  const calcularTotalDia = () => {
    return repartoData.detalle.reduce((acc, detalle) => acc + detalle.total_cliente, 0);
  };

  // Simulación de guardar el reparto
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Datos de reparto a enviar:", repartoData);
    // Aquí se haría una llamada al backend vía fetch/axios
    alert('Reparto enviado correctamente');
  };

  return (
    <div className="reparto-container">
      <header className="reparto-header">
        <h1>Reparto de Pan</h1>
      </header>

      <form onSubmit={handleSubmit}>
        {repartoData.detalle.map(detalle => (
          <div key={detalle.clienteId} className="cliente-card-reparto">
            <div className="cliente-header-reparto">
              <FaUserCircle size={24} className="icon" />
              <h2>{detalle.clienteNombre}</h2>
              <button 
                type="button" 
                className="estado-btn-reparto"
                onClick={() => toggleEstadoPago(detalle.clienteId)}
              >
                {detalle.estado_pago}
              </button>
            </div>

            <div className="productos-list-reparto">
              {detalle.productos.map(prod => (
                <div key={prod.productoId} className="producto-item-reparto">
                  <span>{prod.nombre}</span>
                  <input 
                    type="number"
                    min="0"
                    value={prod.cantidad}
                    onChange={e => handleCantidadChange(detalle.clienteId, prod.productoId, e.target.value)}
                  />
                  <span className="precio-reparto">Subtotal: ${prod.subtotal.toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="cliente-total-reparto">
              <FaPlusCircle className="icon-total-reparto" />
              <span>Total: ${detalle.total_cliente.toFixed(2)}</span>
            </div>
          </div>
        ))}

        <div className="total-dia-reparto">
          <h2>Total del Día: ${calcularTotalDia().toFixed(2)}</h2>
        </div>
        <button type="submit" className="submit-btn-reparto">
          <FaCheckCircle size={20} className="icon-check" /> Confirmar Reparto
        </button>
      </form>
    </div>
  );
};

export default RepartoPage;
