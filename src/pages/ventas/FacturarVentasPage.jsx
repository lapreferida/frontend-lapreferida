// pages/ventas/FacturarVentasPage.jsx
import { useState, useEffect } from 'react';
import { FaMoneyBillAlt, FaCreditCard, FaUniversity, FaMoneyCheckAlt } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import { checkSession } from '../../services/authService';
import Swal from 'sweetalert2';
import Select from 'react-select';
import { NumericFormat } from 'react-number-format';
import '../../styles/ventas/ventasPage.css';

// Servicios
import { getClientes } from '../../services/clientesService';
import { createFacturaVenta, getNextNumeroFactura } from '../../services/ventas/facturaVentasService';
import { getPuntosVentas } from '../../services/ventas/puntoVentaService';
import { getRemitosDetalles } from '../../services/ventas/remitosService'; // función para obtener detalles

// Importar el componente de Carousel
import RemitosCarousel from '../../components/RemitosCarousel';

const FacturarVentasPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);

  // Estados para Información General y Financieros
  const [clientes, setClientes] = useState([]);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [tipoFactura, setTipoFactura] = useState('');
  const [numeroFactura, setNumeroFactura] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [puntosVentas, setPuntosVentas] = useState([]);
  const [selectedPuntoVenta, setSelectedPuntoVenta] = useState(2);
  const [fechaImputacion, setFechaImputacion] = useState(new Date().toISOString().split('T')[0]);

  const [neto, setNeto] = useState('');
  const [descuento, setDescuento] = useState('');
  const [ivaPorcentaje, setIvaPorcentaje] = useState(0);
  const [otrosImpuestos, setOtrosImpuestos] = useState('');
  const [subtotal, setSubtotal] = useState('0.00');
  const [ivaCalculado, setIvaCalculado] = useState('0.00');
  const [total, setTotal] = useState('0.00');

  // Estados para Pago y Observaciones
  const [formaPago, setFormaPago] = useState('Efectivo');
  const [observaciones, setObservaciones] = useState('');
  const [estadoPago, setEstadoPago] = useState('Pendiente'); // "Pendiente" o "Pagado"
  const [montoPagado, setMontoPagado] = useState('');

  // Estados para Factura desde Remitos
  const [remitoIds, setRemitoIds] = useState([]);
  const [esFacturaRemitos, setEsFacturaRemitos] = useState(false);
  const [remitosDetalles, setRemitosDetalles] = useState([]);

  // Mapeo de condiciones para asignar tipo de factura
  const invoiceMapping = {
    RI: "Factura A",
    MT: "Factura B",
    CF: "Factura B",
    EX: "Factura B",
    OT: "Otro",
  };

  // Verificar sesión
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const sessionData = await checkSession();
        setUser(sessionData.user);
      } catch {
        navigate('/auth');
      }
    };
    fetchSession();
  }, [navigate]);

  // Cargar clientes y puntos de venta
  useEffect(() => {
    getClientes()
      .then((data) => setClientes(data))
      .catch((err) => console.error('Error al cargar clientes:', err));
    getPuntosVentas()
      .then((data) => setPuntosVentas(data))
      .catch((err) => console.error('Error al cargar puntos de venta:', err));
  }, []);

  // Obtener el próximo número de factura
  useEffect(() => {
    getNextNumeroFactura()
      .then((data) => setNumeroFactura(data.nextNumeroFactura))
      .catch((error) =>
        console.error('Error al obtener el próximo número de factura:', error)
      );
  }, []);

  // Asignar tipo de factura según condición del cliente
  useEffect(() => {
    if (selectedCliente) {
      const clienteData = clientes.find(c => c.id === selectedCliente.value);
      if (clienteData && clienteData.condicion) {
        setTipoFactura(invoiceMapping[clienteData.condicion] || '');
      }
    }
  }, [selectedCliente, clientes]);

  // Recalcular totales financieros
  useEffect(() => {
    const parsedNeto = parseFloat(neto) || 0;
    const parsedDescuento = parseFloat(descuento) || 0;
    const parsedOtros = parseFloat(otrosImpuestos) || 0;
    const computedSubtotal = parsedNeto - parsedDescuento;
    const computedIva = computedSubtotal * (parseFloat(ivaPorcentaje) / 100);
    const computedTotal = computedSubtotal + computedIva + parsedOtros;
    setSubtotal(computedSubtotal.toFixed(2));
    setIvaCalculado(computedIva.toFixed(2));
    setTotal(computedTotal.toFixed(2));
  }, [neto, descuento, ivaPorcentaje, otrosImpuestos]);

  // Detectar si venimos de la selección de remitos
  useEffect(() => {
    if (location.state && location.state.remitoIds) {
      setRemitoIds(location.state.remitoIds);
      if (location.state.netoRemitos) {
        setNeto(location.state.netoRemitos);
      }
      if (location.state.remitoClienteId) {
        setEsFacturaRemitos(true);
      }
    }
  }, [location.state]);

  // Obtener detalles completos de los remitos a partir de remitoIds
  useEffect(() => {
    if (remitoIds && remitoIds.length > 0) {
      getRemitosDetalles(remitoIds)
        .then((data) => setRemitosDetalles(data))
        .catch((err) => console.error("Error al obtener detalles de remitos:", err));
    }
  }, [remitoIds]);

  // Cuando ya se cargaron los clientes, si es factura por remitos, preseleccionar el cliente
  useEffect(() => {
    if (esFacturaRemitos && location.state && location.state.remitoClienteId && clientes.length > 0) {
      const clientOption = clientes
        .filter(cliente => cliente.razon_social.toLowerCase() !== "consumidor final")
        .map(cliente => ({
          value: cliente.id,
          label: `${cliente.razon_social} - ${cliente.direccion}`
        }))
        .find(option => option.value === location.state.remitoClienteId);
      if (clientOption) {
        setSelectedCliente(clientOption);
      }
    }
  }, [clientes, esFacturaRemitos, location.state]);

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !selectedCliente ||
      !tipoFactura ||
      !numeroFactura ||
      !fecha ||
      !selectedPuntoVenta ||
      !fechaImputacion ||
      !neto
    ) {
      Swal.fire('Error', 'Por favor complete los campos obligatorios.', 'error');
      return;
    }
    if (estadoPago === 'Pagado' && (!montoPagado || parseFloat(montoPagado) <= 0)) {
      Swal.fire('Error', 'Por favor ingrese un monto pagado válido.', 'error');
      return;
    }

    const facturaData = {
      cliente_id: selectedCliente.value,
      usuario_id: user.id,
      punto_venta_id: selectedPuntoVenta,
      tipo_factura: tipoFactura,
      numero_factura: numeroFactura,
      fecha,
      fecha_imputacion: fechaImputacion,
      neto: parseFloat(neto),
      descuento: parseFloat(descuento) || 0,
      iva_porcentaje: parseFloat(ivaPorcentaje),
      otros_impuestos: parseFloat(otrosImpuestos) || 0,
      observaciones,
      estado: estadoPago,
      monto_pagado: estadoPago === 'Pagado' ? parseFloat(montoPagado) : 0,
      ...(estadoPago === 'Pagado' && { forma_pago: formaPago }),
      // Si se registró la factura a partir de remitos, incluimos sus IDs
      ...(esFacturaRemitos && { remito_ids: remitoIds })
    };

    try {
      await createFacturaVenta(facturaData);
      Swal.fire('Éxito', 'La factura se registró exitosamente.', 'success');

      // Reiniciar formulario
      setSelectedCliente(null);
      setTipoFactura('');
      setNumeroFactura('');
      setFecha(new Date().toISOString().split('T')[0]);
      setSelectedPuntoVenta(2);
      setFechaImputacion(new Date().toISOString().split('T')[0]);
      setNeto('');
      setDescuento('');
      setIvaPorcentaje(0);
      setOtrosImpuestos('');
      setObservaciones('');
      setEstadoPago('Pendiente');
      setMontoPagado('');
      setFormaPago('Efectivo');
      setEsFacturaRemitos(false);
      setRemitoIds([]);
      getNextNumeroFactura()
        .then((data) => setNumeroFactura(data.nextNumeroFactura))
        .catch((error) =>
          console.error('Error al actualizar el número de factura:', error)
        );
    } catch (error) {
      console.error('Error al registrar la factura:', error);
      Swal.fire('Error', error.message || 'Error al registrar la factura.', 'error');
    }
  };

  // Opciones para React-Select: Clientes
  const optionsClientes = clientes
    .filter(cliente => cliente.razon_social.toLowerCase() !== "consumidor final")
    .map(cliente => ({
      value: cliente.id,
      label: `${cliente.razon_social} - ${cliente.direccion}`
    }));

  // Opciones para Punto de Venta
  const optionsPuntosVentas = puntosVentas.map((punto) => ({
    value: punto.id,
    label: `${punto.numero} - ${punto.nombre}`,
  }));

  return (
    <main className="container ventas-container">
      <h1>Registrar Factura de Venta</h1>
      <form className="ventas-form" onSubmit={handleSubmit}>
        <div className="row-two-sections">
          {/* Columna Izquierda: Información General y Observaciones */}
          <div className="column-left">
            <section className="section info-section">
              <h2>Información General</h2>
              <div className="form-group">
                <label htmlFor="cliente">Cliente</label>
                <Select
                  id="cliente"
                  className="custom-select"
                  options={optionsClientes}
                  value={selectedCliente}
                  onChange={setSelectedCliente}
                  placeholder="Buscar cliente"
                  noOptionsMessage={() => "No existe ese cliente"}
                  isClearable={!esFacturaRemitos}  // Si es factura por remitos, no se puede limpiar
                  isDisabled={esFacturaRemitos}       // Se deshabilita si viene desde remitos
                  maxMenuHeight={100}
                />
              </div>
              <div className="form-group">
                <label htmlFor="tipoFactura">Tipo de Factura</label>
                <select
                  id="tipoFactura"
                  value={tipoFactura}
                  onChange={(e) => setTipoFactura(e.target.value)}
                  required
                >
                  <option value="Factura A">Factura A</option>
                  <option value="Factura B">Factura B</option>
                  <option value="Factura C">Factura C</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
              <div className="datos-adicionales-container">
                <div className="form-group punto-venta">
                  <label htmlFor="puntoVenta">Pto Venta</label>
                  <select
                    id="puntoVenta"
                    value={selectedPuntoVenta || ""}
                    onChange={(e) =>
                      setSelectedPuntoVenta(e.target.value ? Number(e.target.value) : null)
                    }
                    required
                    title={
                      optionsPuntosVentas.find(opt => opt.value === selectedPuntoVenta)?.label || ""
                    }
                  >
                    {optionsPuntosVentas.map((punto) => (
                      <option key={punto.value} value={punto.value} title={punto.label}>
                        {punto.label.split(" - ")[0]}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group numero-factura">
                  <label htmlFor="numeroFactura">N° Factura</label>
                  <input
                    type="text"
                    id="numeroFactura"
                    value={numeroFactura}
                    onChange={(e) => setNumeroFactura(e.target.value)}
                    placeholder="Ingrese número de factura"
                    maxLength="8"
                    required
                  />
                </div>

                <div className="form-group fecha">
                  <label htmlFor="fecha">Fecha Factura</label>
                  <input
                    type="date"
                    id="fecha"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group fecha-imputacion">
                  <label htmlFor="fechaImputacion">Fecha Imputación</label>
                  <input
                    type="date"
                    id="fechaImputacion"
                    value={fechaImputacion}
                    onChange={(e) => setFechaImputacion(e.target.value)}
                    required
                  />
                </div>
              </div>
            </section>
            <section className="section observation-section">
              <h2>Observaciones</h2>
              <div className="form-group">
                <textarea
                  id="observaciones"
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  placeholder="Ingrese observaciones adicionales"
                ></textarea>
              </div>
            </section>
          </div>

          {/* Columna Derecha: Detalles Financieros y Pago */}
          <div className="column-right">
            <section className="section finance-section">
              <h2>Detalles Financieros</h2>
              <div className="finance-grid">
                <div className="grid-row">
                  <div className="form-group">
                    <label htmlFor="neto">Neto</label>
                    <NumericFormat
                      id="neto"
                      thousandSeparator="."
                      decimalSeparator=","
                      decimalScale={2}
                      fixedDecimalScale={true}
                      prefix="$ "
                      placeholder="0.00"
                      value={neto}
                      onValueChange={(values) => setNeto(values.value)}
                      required
                      className="input-currency"
                      readOnly={esFacturaRemitos}  /* Si es factura desde remitos, no se puede modificar */
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="descuento">Descuento</label>
                    <NumericFormat
                      id="descuento"
                      thousandSeparator="."
                      decimalSeparator=","
                      decimalScale={2}
                      fixedDecimalScale={true}
                      prefix="$ "
                      placeholder="0.00"
                      value={descuento}
                      onValueChange={(values) => setDescuento(values.value)}
                      className="input-currency"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="ivaPorcentaje">IVA</label>
                    <select
                      id="ivaPorcentaje"
                      value={ivaPorcentaje}
                      onChange={(e) => setIvaPorcentaje(e.target.value)}
                      required
                    >
                      <option value={0}>Sin IVA</option>
                      <option value={10.5}>10,5%</option>
                      <option value={21}>21%</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="otrosImpuestos">Otros Impuestos</label>
                    <NumericFormat
                      id="otrosImpuestos"
                      thousandSeparator="."
                      decimalSeparator=","
                      decimalScale={2}
                      fixedDecimalScale={true}
                      prefix="$ "
                      placeholder="0.00"
                      value={otrosImpuestos}
                      onValueChange={(values) => setOtrosImpuestos(values.value)}
                      className="input-currency"
                    />
                  </div>
                </div>
                <div className="grid-row">
                  <div className="form-group">
                    <label htmlFor="subtotal">SubTotal</label>
                    <NumericFormat
                      id="subtotal"
                      thousandSeparator="."
                      decimalSeparator=","
                      decimalScale={2}
                      fixedDecimalScale={true}
                      prefix="$ "
                      value={subtotal}
                      displayType="input"
                      readOnly
                      className="input-currency-readonly"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="ivaCalculado">IVA Calculado</label>
                    <NumericFormat
                      id="ivaCalculado"
                      thousandSeparator="."
                      decimalSeparator=","
                      decimalScale={2}
                      fixedDecimalScale={true}
                      prefix="$ "
                      value={ivaCalculado}
                      displayType="input"
                      readOnly
                      className="input-currency-readonly"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="total">Total</label>
                    <NumericFormat
                      id="total"
                      thousandSeparator="."
                      decimalSeparator=","
                      decimalScale={2}
                      fixedDecimalScale={true}
                      prefix="$ "
                      value={total}
                      displayType="input"
                      readOnly
                      className="input-currency-readonly"
                    />
                  </div>
                </div>
              </div>
            </section>
            <section className="section payment-status-section">
              <h2>Pago</h2>
              <div className="form-group">
                <label htmlFor="estadoVenta">Estado de la Venta</label>
                <select
                  id="estadoVenta"
                  value={estadoPago}
                  onChange={(e) => setEstadoPago(e.target.value)}
                >
                  <option value="Pendiente">Pendiente</option>
                  <option value="Pagado">Pagado</option>
                </select>
              </div>
              {estadoPago === 'Pagado' && (
                <div className="form-group">
                  <label htmlFor="montoPagado">Monto Pagado</label>
                  <NumericFormat
                    id="montoPagado"
                    thousandSeparator="."
                    decimalSeparator=","
                    decimalScale={2}
                    fixedDecimalScale={true}
                    prefix="$ "
                    placeholder="0.00"
                    value={montoPagado}
                    onValueChange={(values) => setMontoPagado(values.value)}
                    className="input-currency"
                  />
                </div>
              )}
            </section>
            {estadoPago === 'Pagado' && (
              <section className="section payment-section">
                <h2>Forma de Pago</h2>
                <div className="payment-options">
                  <label className={`payment-option ${formaPago === 'Efectivo' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="formaPago"
                      value="Efectivo"
                      checked={formaPago === 'Efectivo'}
                      onChange={(e) => setFormaPago(e.target.value)}
                    />
                    <FaMoneyBillAlt className="payment-icon" />
                    <span>Efectivo</span>
                  </label>
                  <label className={`payment-option ${formaPago === 'Tarjeta' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="formaPago"
                      value="Tarjeta"
                      checked={formaPago === 'Tarjeta'}
                      onChange={(e) => setFormaPago(e.target.value)}
                    />
                    <FaCreditCard className="payment-icon" />
                    <span>Tarjeta</span>
                  </label>
                  <label className={`payment-option ${formaPago === 'Transferencia' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="formaPago"
                      value="Transferencia"
                      checked={formaPago === 'Transferencia'}
                      onChange={(e) => setFormaPago(e.target.value)}
                    />
                    <FaUniversity className="payment-icon" />
                    <span>Transferencia</span>
                  </label>
                  <label className={`payment-option ${formaPago === 'Cheques' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="formaPago"
                      value="Cheques"
                      checked={formaPago === 'Cheques'}
                      onChange={(e) => setFormaPago(e.target.value)}
                    />
                    <FaMoneyCheckAlt className="payment-icon" />
                    <span>Cheques</span>
                  </label>
                </div>
              </section>
            )}
            {esFacturaRemitos && (
              <section className="section remitos-section">
                <h2>Remitos Asociados</h2>
                {/* Se utiliza el Carousel para mostrar cada remito con sus detalles */}
                <RemitosCarousel remitos={remitosDetalles} />
              </section>
            )}
          </div>
        </div>
        <div className="btn-container">
          <button type="submit" className="btn-submit">Registrar Factura</button>
        </div>
      </form>
    </main>
  );
};

export default FacturarVentasPage;
