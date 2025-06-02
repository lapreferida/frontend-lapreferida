import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import Select from 'react-select';
import { getClientes } from '../../services/clientesService';
import { createRemito, getNextNumeroRemito } from '../../services/ventas/remitosService';
import { getProductos } from '../../services/productosService'
import { NumericFormat } from 'react-number-format';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext'
import '../../styles/ventas/remitosPage.css';

const RemitosPage = () => {
  // Estados para Información General
  const [clientes, setClientes] = useState([]);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [razonSocial, setRazonSocial] = useState('');
  const [condicion, setCondicion] = useState('');
  const [direccion, setDireccion] = useState('');
  const [numeroRemito, setNumeroRemito] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [observaciones, setObservaciones] = useState('');

  // Estados para Productos y Detalle
  const [productos, setProductos] = useState([]);
  const [selectedProducto, setSelectedProducto] = useState(null);
  const [cantidad, setCantidad] = useState('');
  const [precioProducto, setPrecioProducto] = useState('');
  const [detalle, setDetalle] = useState([]);
  const [totalRemito, setTotalRemito] = useState(0);

  const { user } = useAuthContext();

  // Cargar clientes, productos y el siguiente número de remito al montar el componente
  useEffect(() => {
    getClientes()
      .then(data => setClientes(data))
      .catch(err => {
        console.error('Error al cargar clientes:', err);
        Swal.fire('Error', 'No se pudieron cargar los clientes', 'error');
      });
    getProductos()
      .then(data => setProductos(data))
      .catch(err => {
        console.error('Error al cargar productos:', err);
        Swal.fire('Error', 'No se pudieron cargar los productos', 'error');
      });
    // Obtener el siguiente número de remito
    obtenerSiguienteNumeroRemito();
  }, []);

  // Función para obtener y setear el siguiente número de remito
  const obtenerSiguienteNumeroRemito = () => {
    getNextNumeroRemito()
      .then(data => {
        setNumeroRemito(data.nextNumeroRemito);
      })
      .catch(err => {
        console.error('Error al obtener el siguiente número de remito:', err);
        Swal.fire('Error', 'No se pudo obtener el siguiente número de remito', 'error');
      });
  };

  // Opciones para React-Select
  const optionsClientes = clientes
    .filter(cliente => cliente.razon_social.toLowerCase() !== "consumidor final")
    .map(cliente => ({
      value: cliente.id,
      label: `${cliente.razon_social} - ${cliente.direccion}`
    }));

  // Incluye la descripción en el label
  const optionsProductos = productos.slice(68).map(prod => ({
    value: prod.id,
    label: `${prod.nombre} - $${prod.precio} - ${prod.descripcion}`
  }));

  // Cuando se selecciona un cliente, se completan los campos de info general
  const handleClienteChange = (selectedOption) => {
    setSelectedCliente(selectedOption);
    if (selectedOption) {
      const clienteData = clientes.find(c => c.id === selectedOption.value);
      setRazonSocial(clienteData.razon_social || '');
      setCondicion(clienteData.condicion || '');
      setDireccion(clienteData.direccion || '');
    } else {
      setRazonSocial('');
      setCondicion('');
      setDireccion('');
    }
  };

  // Obtener el producto seleccionado con todos sus datos
  const currentProduct = selectedProducto
    ? productos.find(p => p.id === selectedProducto.value)
    : null;

  // Actualiza el precio del input cuando se selecciona un producto
  useEffect(() => {
    if (selectedProducto && currentProduct) {
      setPrecioProducto(currentProduct.precio);
    } else {
      setPrecioProducto('');
    }
  }, [selectedProducto, currentProduct]);

  // Agregar producto al detalle usando el precio editable
  const handleAddProducto = () => {
    if (
      !selectedProducto ||
      !cantidad ||
      parseFloat(cantidad) <= 0 ||
      !precioProducto ||
      parseFloat(precioProducto) <= 0
    ) {
      Swal.fire('Error', 'Seleccione un producto y complete cantidad y precio válidos', 'error');
      return;
    }

    const cantidadNum = parseFloat(cantidad);
    const precioNum = parseFloat(precioProducto);
    const subtotal = precioNum * cantidadNum;

    // Verificar si el producto ya existe en el detalle
    const existingIndex = detalle.findIndex(item => item.producto_id === currentProduct.id);
    if (existingIndex !== -1) {
      // Si existe, se suma la cantidad y se actualiza el precio con el último ingresado
      const updatedItem = { ...detalle[existingIndex] };
      updatedItem.cantidad += cantidadNum;
      updatedItem.precio = precioNum;
      updatedItem.subtotal = updatedItem.cantidad * precioNum;
      const newDetalle = [...detalle];
      newDetalle[existingIndex] = updatedItem;
      setDetalle(newDetalle);
    } else {
      // Si no existe, se agrega como nuevo ítem
      const nuevoItem = {
        producto_id: currentProduct.id,
        nombre: currentProduct.nombre,
        cantidad: cantidadNum,
        precio: precioNum,
        subtotal,
        unidad_medida: currentProduct.unidad_medida
      };
      setDetalle([...detalle, nuevoItem]);
    }
    // Reiniciar la selección de producto, cantidad y precio
    setSelectedProducto(null);
    setCantidad('');
    setPrecioProducto('');
  };

  // Remover un producto del detalle
  const handleRemoveDetalle = (index) => {
    const newDetalle = [...detalle];
    newDetalle.splice(index, 1);
    setDetalle(newDetalle);
  };

  // Recalcular total cada vez que cambie el detalle
  useEffect(() => {
    const total = detalle.reduce((acc, item) => acc + item.subtotal, 0);
    setTotalRemito(total.toFixed(2));
  }, [detalle]);

  // Manejar envío del remito
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCliente || !numeroRemito || !fecha) {
      Swal.fire('Error', 'Complete los campos obligatorios', 'error');
      return;
    }
    if (detalle.length === 0) {
      Swal.fire('Error', 'Agregue al menos un producto al remito', 'error');
      return;
    }
    const remitoData = {
      cliente_id: selectedCliente.value,
      usuario_id: user.id,
      numero_remito: numeroRemito,
      fecha,
      observaciones,
      subtotal: parseFloat(totalRemito),
      detalle
    };

    try {
      await createRemito(remitoData);
      Swal.fire('Éxito', 'Remito registrado correctamente', 'success');
      // Reiniciar formulario y actualizar el número de remito
      setSelectedCliente(null);
      setRazonSocial('');
      setCondicion('');
      setDireccion('');
      setNumeroRemito('');
      setFecha(new Date().toISOString().split('T')[0]);
      setObservaciones('');
      setDetalle([]);
      setTotalRemito(0);
      // Actualizamos el número de remito para el próximo registro
      obtenerSiguienteNumeroRemito();
    } catch (error) {
      console.error('Error al registrar el remito:', error);
      Swal.fire('Error', error.message || 'Error al registrar el remito', 'error');
    }
  };

  return (
    <main className="container remitos-container">
      <div className="page-header">
        <h1>Remitos</h1>
        {user && user.rol === "admin" && (
          <Link
            to="/remitos-informes"
            className="btn btn-secondary history-btn"
            title="Ver informes de remitos"
          >
            Ver Informe
          </Link>
        )}
      </div>
      <form className="remitos-form" onSubmit={handleSubmit}>
        <div className="row-two-sections-remitos">
          {/* Columna Izquierda: Información General y Observaciones */}
          <div className="column-left">
            <section className="section info-section">
              <h2>Información General</h2>
              <div className="form-group">
                <label>Cliente</label>
                <Select
                  options={optionsClientes}
                  value={selectedCliente}
                  onChange={handleClienteChange}
                  placeholder="Seleccione un cliente"
                  className="custom-select-remitos"
                  isClearable
                  maxMenuHeight={100}
                />
              </div>
              <div className="info-row">
                <div className="form-group small">
                  <label>Razón Social</label>
                  <input type="text" value={razonSocial} readOnly placeholder="Razón Social" />
                </div>
                <div className="form-group small">
                  <label>Dirección</label>
                  <input type="text" value={direccion} readOnly placeholder="Dirección" />
                </div>
                <div className="form-group small">
                  <label>Condición</label>
                  <input type="text" value={condicion} readOnly placeholder="Condición" />
                </div>
              </div>
              <div className="info-row">
                <div className="form-group small">
                  <label>N° Remito</label>
                  <input
                    type="text"
                    value={numeroRemito}
                    onChange={(e) => setNumeroRemito(e.target.value)}
                    placeholder="Número de remito"
                    maxLength="8"
                    required
                  />
                </div>
                <div className="form-group small">
                  <label>Fecha</label>
                  <input
                    type="date"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    required
                  />
                </div>
              </div>
            </section>

            <section className="section observation-section-remitos">
              <h2>Observaciones</h2>
              <div className="form-group">
                <textarea
                  className="textArea-remitos"
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  placeholder="Ingrese observaciones"
                ></textarea>
              </div>
            </section>
          </div>

          {/* Columna Derecha: Productos y Detalle */}
          <div className="column-right">
            <section className="section product-section">
              <h2>Productos</h2>
              <div className="product-row">
                <div className="form-group full">
                  <label>Producto</label>
                  <Select
                    options={optionsProductos}
                    value={selectedProducto}
                    onChange={setSelectedProducto}
                    placeholder="Seleccione un producto"
                    isClearable
                    className="custom-select-remitos"
                    maxMenuHeight={100}
                  />
                </div>
              </div>
              <div className="product-row">
                <div className="form-group small">
                  <label>Cantidad</label>
                  {currentProduct && currentProduct.unidad_medida.toLowerCase() === "kg" ? (
                    <NumericFormat
                      value={cantidad}
                      onValueChange={(values) => {
                        setCantidad(values.floatValue !== undefined ? values.floatValue : '');
                      }}
                      placeholder="Cantidad (Kg)"
                      decimalScale={2}
                      fixedDecimalScale={true}
                      allowNegative={false}
                      customInput="input"
                      min="0.01"
                      step="0.01"
                    />
                  ) : (
                    <input
                      type="number"
                      step="1"
                      value={cantidad}
                      onChange={(e) => setCantidad(e.target.value)}
                      placeholder="Cantidad (Unidad)"
                      min="1"
                      onKeyPress={(e) => {
                        const char = String.fromCharCode(e.which);
                        if (!/[0-9]/.test(char)) {
                          e.preventDefault();
                        }
                      }}
                    />
                  )}
                </div>
                <div className="form-group small">
                  <label>Precio Unitario</label>
                  <NumericFormat
                    value={precioProducto}
                    onValueChange={(values) => {
                      setPrecioProducto(values.floatValue !== undefined ? values.floatValue : '');
                    }}
                    placeholder="Precio"
                    thousandSeparator="."
                    decimalSeparator=","
                    decimalScale={2}
                    fixedDecimalScale={true}
                    allowNegative={false}
                    customInput="input"
                    min="0.01"
                    step="0.01"
                  />
                </div>
                <div className="form-group small">
                  <button type="button" onClick={handleAddProducto} className="btn-add-product">
                    Agregar
                  </button>
                </div>
              </div>
            </section>

            <section className="section detail-section">
              <h2>Detalle</h2>
              <div className="detalle-table-container">
                <table className="detalle-table">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Cantidad</th>
                      <th>Precio Unitario</th>
                      <th>Subtotal</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detalle.length > 0 ? (
                      detalle.map((item, index) => (
                        <tr key={index}>
                          <td>{item.nombre}</td>
                          <td>{item.cantidad} {item.unidad_medida}</td>
                          <td>
                            {new Intl.NumberFormat("es-AR", {
                              style: "currency",
                              currency: "ARS",
                            }).format(item.precio)}
                          </td>
                          <td>
                            {new Intl.NumberFormat("es-AR", {
                              style: "currency",
                              currency: "ARS",
                            }).format(item.subtotal)}
                          </td>
                          <td>
                            <button
                              type="button"
                              onClick={() => handleRemoveDetalle(index)}
                              className="btn-remove"
                              title="Eliminar producto"
                            >
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="no-results">
                          No se han agregado productos.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="total-container">
                <span>Total Remito:</span>
                <label className="total-label">
                  <NumericFormat
                    value={totalRemito}
                    displayType="text"
                    thousandSeparator="."
                    decimalSeparator=","
                    decimalScale={2}
                    fixedDecimalScale={true}
                    prefix="$ "
                  />
                </label>
              </div>
            </section>
          </div>
        </div>
        <div className="form-actions">
          <button type="submit" className="btn-submit">
            Registrar Remito
          </button>
        </div>
      </form>
    </main>
  );
};

export default RemitosPage;
