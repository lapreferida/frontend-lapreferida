import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { NumericFormat } from "react-number-format";
import Swal from "sweetalert2";
import {
  FaUser,
  FaMapMarkerAlt,
  FaIdBadge,
  FaFileInvoice,
  FaStore,
  FaFileAlt,
  FaCalendarAlt,
  FaCalendarCheck,
  FaStickyNote,
} from "react-icons/fa";
import {
  getNextNumeroNotaCredito,
  createNotaCredito,
} from "../../services/ventas/notasCreditoService";
import { getPuntosVentas } from "../../services/ventas/puntoVentaService";
import { checkSession } from "../../services/authService";
import "../../styles/ventas/notasCreditosPage.css";

const NotasCreditoPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { factura } = location.state || {};

  const [user, setUser] = useState(null);

  // Datos originales de la factura
  const [datosFactura, setDatosFactura] = useState(null);

  // Estados para campos editables en Detalles Financieros
  const [originalNeto, setOriginalNeto] = useState(0);
  const [editableNeto, setEditableNeto] = useState(0);
  // El descuento se mantiene inalterado (solo visualización)
  const [editableDescuento, setEditableDescuento] = useState(0);
  const [ivaPorcentaje, setIvaPorcentaje] = useState(0);

  // Estados para los totales recalculados (similares a FacturarVentasPage)
  const [subtotalState, setSubtotalState] = useState("0.00");
  const [ivaCalculadoState, setIvaCalculadoState] = useState("0.00");
  const [totalState, setTotalState] = useState("0.00");

  // Estados para la Nota de Crédito
  const [selectedPuntoVentaNota, setSelectedPuntoVentaNota] = useState("");
  const [numeroNotaCredito, setNumeroNotaCredito] = useState("");
  const [fechaNotaCredito, setFechaNotaCredito] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [motivo, setMotivo] = useState("");

  // Opciones para puntos de venta
  const [puntosVentas, setPuntosVentas] = useState([]);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const sessionData = await checkSession();
        setUser(sessionData.user);
      } catch {
        navigate("/auth");
      }
    };
    fetchSession();
  }, [navigate]);

  // Al cargar la factura, inicializamos los estados
  useEffect(() => {
    if (factura) {
      setDatosFactura(factura);
      const neto = parseFloat(factura.neto);
      const descuento = parseFloat(factura.descuento) || 0;
      setOriginalNeto(neto);
      setEditableNeto(neto);
      setEditableDescuento(descuento);

      // Calcular la tasa de IVA a partir de la factura original
      const baseOriginal = neto - descuento;
      const tasaCalculada =
        baseOriginal > 0 ? parseFloat(factura.iva) / baseOriginal : 0;
      if (Math.abs(tasaCalculada - 0.105) < 0.01) {
        setIvaPorcentaje(10.5);
      } else {
        setIvaPorcentaje(21);
      }
    }
  }, [factura]);

  // Cada vez que cambien el neto editable, el descuento o el IVA seleccionado,
  // se recalculan el subtotal, IVA calculado y total.
  useEffect(() => {
    const parsedEditableNeto = parseFloat(editableNeto) || 0;
    const parsedDescuento = parseFloat(editableDescuento) || 0;
    // Otros impuestos se toman de la factura original (no son modificables)
    const parsedOtros =
      datosFactura && datosFactura.otros_impuestos
        ? parseFloat(datosFactura.otros_impuestos)
        : 0;
    const newSubtotal = parsedEditableNeto - parsedDescuento;
    const newIvaCalculado = newSubtotal * (parseFloat(ivaPorcentaje) / 100);
    const newTotal = newSubtotal + newIvaCalculado + parsedOtros;
    setSubtotalState(newSubtotal.toFixed(2));
    setIvaCalculadoState(newIvaCalculado.toFixed(2));
    setTotalState(newTotal.toFixed(2));
  }, [editableNeto, editableDescuento, ivaPorcentaje, datosFactura]);

  // El monto de la nota de crédito se calcula como la diferencia entre el neto original y el neto editable
  const montoNotaCredito = originalNeto - editableNeto;

  // Cargar puntos de venta y asignar por defecto el segundo si existe
  useEffect(() => {
    getPuntosVentas()
      .then((data) => {
        setPuntosVentas(data);
        if (data.length > 1) {
          setSelectedPuntoVentaNota(data[1].id);
        }
      })
      .catch((err) =>
        console.error("Error al cargar puntos de venta:", err)
      );
  }, []);

  // Obtener el próximo número de nota de crédito
  useEffect(() => {
    getNextNumeroNotaCredito()
      .then((data) => setNumeroNotaCredito(data.nextNumeroNotaCredito))
      .catch((error) =>
        console.error("Error al obtener el próximo número de nota de crédito:", error)
      );
  }, []);

  if (!datosFactura) {
    return (
      <main className="container notas-credito-container">
        <h1>Notas de Crédito</h1>
        <p className="textNoCont">
          No se ha seleccionado ninguna factura. Por favor, vuelva al historial y
          seleccione una factura.
        </p>
      </main>
    );
  }

  // Función auxiliar para formatear fechas a YYYY-MM-DD
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toISOString().split("T")[0];
  };

  // Función auxiliar para mostrar valores o "-" si no hay dato.
  const mostrarDato = (dato) =>
    dato && dato !== "" ? dato : "-";

  // Función para truncar textos largos y agregar "..."
  const truncateText = (text, maxLength) => {
    if (!text) return "-";
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !selectedPuntoVentaNota ||
      !numeroNotaCredito ||
      !fechaNotaCredito 
    ) {
      Swal.fire(
        "Error",
        "Complete todos los campos obligatorios de la nota de crédito.",
        "error"
      );
      return;
    }

    // Preparar datos para la nota de crédito
    const notaCreditoData = {
      factura_id: datosFactura.id,
      punto_venta_id: selectedPuntoVentaNota,
      numero_nota: numeroNotaCredito,
      fecha: fechaNotaCredito,
      motivo,
      monto: montoNotaCredito,
      usuario_id: user.id,
    };

    try {
      await createNotaCredito(notaCreditoData);
      Swal.fire(
        "Éxito",
        "La nota de crédito se creó correctamente.",
        "success"
      );
      navigate("/ventas-historial");
    } catch (error) {
      console.error("Error al crear la nota de crédito:", error);
      Swal.fire(
        "Error",
        error.message || "Error al crear la nota de crédito.",
        "error"
      );
    }
  };

  return (
    <main className="container notas-credito-container">
      <h1>Notas de Crédito</h1>
      <form onSubmit={handleSubmit}>
        <div className="factura-container">
          {/* Columna Izquierda: Información General y Detalles Financieros */}
          <div className="column-left">
            {/* Información General */}
            <section className="informacion-general">
              <h2>Información General</h2>
              <div className="info-grid">
                <div className="info-item">
                  <FaUser className="small-icon" />
                  <span className="label">Cliente:</span>
                  <span className="value">
                    {mostrarDato(datosFactura.razon_social)}
                  </span>
                </div>
                <div className="info-item">
                  <FaMapMarkerAlt className="small-icon" />
                  <span className="label">Dirección:</span>
                  <span
                    className="value"
                    title={mostrarDato(datosFactura.direccion)}
                  >
                    {truncateText(datosFactura.direccion, 30)}
                  </span>
                </div>
                <div className="info-item">
                  <FaIdBadge className="small-icon" />
                  <span className="label">CUIT:</span>
                  <span className="value">
                    {mostrarDato(datosFactura.cuit)}
                  </span>
                </div>
                <div className="info-item">
                  <FaFileInvoice className="small-icon" />
                  <span className="label">Tipo de Factura:</span>
                  <span className="value">
                    {mostrarDato(datosFactura.tipo_factura)}
                  </span>
                </div>
                <div className="info-item">
                  <FaStore className="small-icon" />
                  <span className="label">Punto de Venta:</span>
                  <span className="value">
                    {mostrarDato(datosFactura.numero_punto)}
                  </span>
                </div>
                <div className="info-item">
                  <FaFileAlt className="small-icon" />
                  <span className="label">N° Factura:</span>
                  <span className="value">
                    {mostrarDato(datosFactura.numero_factura)}
                  </span>
                </div>
                <div className="info-item">
                  <FaCalendarAlt className="small-icon" />
                  <span className="label">Fecha Factura:</span>
                  <span className="value">
                    {formatDate(datosFactura.fecha)}
                  </span>
                </div>
                <div className="info-item">
                  <FaCalendarCheck className="small-icon" />
                  <span className="label">Fecha Imputación:</span>
                  <span className="value">
                    {formatDate(datosFactura.fecha_imputacion)}
                  </span>
                </div>
                <div className="info-item full-width">
                  <FaStickyNote className="small-icon" />
                  <span className="label">Observaciones:</span>
                  <span
                    className="value"
                    title={mostrarDato(datosFactura.observaciones)}
                  >
                    {truncateText(datosFactura.observaciones, 90)}
                  </span>
                </div>
              </div>
            </section>
            {/* Detalles Financieros */}
            <section className="detalles-financieros">
              <h2>Detalles Financieros</h2>
              <div className="input-grid">
                <div className="form-group">
                  <label>Neto:</label>
                  <NumericFormat
                    value={editableNeto}
                    thousandSeparator="."
                    decimalSeparator=","
                    decimalScale={2}
                    fixedDecimalScale={true}
                    prefix="$ "
                    onValueChange={({ value }) => {
                      const newValue = parseFloat(value) || 0;
                      if (newValue > originalNeto) {
                        Swal.fire(
                          "Error",
                          "El neto no puede ser mayor al valor original.",
                          "error"
                        );
                        // Si se intenta ingresar un valor mayor, se restaura el valor original
                        setEditableNeto(originalNeto);
                      } else {
                        setEditableNeto(newValue);
                      }
                    }}
                  />
                </div>
                <div className="form-group">
                  <label>Descuento:</label>
                  <NumericFormat
                    value={editableDescuento}
                    thousandSeparator="."
                    decimalSeparator=","
                    decimalScale={2}
                    fixedDecimalScale={true}
                    prefix="$ "
                    readOnly
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="ivaPorcentaje">IVA (%)</label>
                  <select
                    id="ivaPorcentaje"
                    value={ivaPorcentaje}
                    onChange={(e) =>
                      setIvaPorcentaje(parseFloat(e.target.value))
                    }
                    required
                  >
                    <option value={0}>Sin IVA</option>
                    <option value={10.5}>10,5%</option>
                    <option value={21}>21%</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>IVA Calculado:</label>
                  <NumericFormat
                    value={ivaCalculadoState}
                    displayType="input"
                    readOnly
                    thousandSeparator="."
                    decimalSeparator=","
                    decimalScale={2}
                    fixedDecimalScale={true}
                    prefix="$ "
                    className="input-currency-readonly"
                  />
                </div>
                <div className="form-group">
                  <label>Subtotal:</label>
                  <NumericFormat
                    value={subtotalState}
                    displayType="input"
                    readOnly
                    thousandSeparator="."
                    decimalSeparator=","
                    decimalScale={2}
                    fixedDecimalScale={true}
                    prefix="$ "
                    className="input-currency-readonly"
                  />
                </div>
                {/* Se muestran los demás campos de visualización */}
                <div className="form-group">
                  <label>Otros Impuestos:</label>
                  <NumericFormat
                    value={datosFactura.otros_impuestos}
                    displayType="input"
                    readOnly
                    thousandSeparator="."
                    decimalSeparator=","
                    decimalScale={2}
                    fixedDecimalScale={true}
                    prefix="$ "
                    className="input-currency-readonly"
                  />
                </div>
                <div className="form-group">
                  <label>Total:</label>
                  <NumericFormat
                    value={totalState}
                    displayType="input"
                    readOnly
                    thousandSeparator="."
                    decimalSeparator=","
                    decimalScale={2}
                    fixedDecimalScale={true}
                    prefix="$ "
                    className="input-currency-readonly"
                  />
                </div>
                <div className="form-group">
                  <label>Monto Pagado:</label>
                  <NumericFormat
                    value={datosFactura.total_pagado}
                    displayType="input"
                    readOnly
                    thousandSeparator="."
                    decimalSeparator=","
                    decimalScale={2}
                    fixedDecimalScale={true}
                    prefix="$ "
                    className="input-currency-readonly"
                  />
                </div>
              </div>
            </section>
          </div>

          {/* Columna Derecha: Nota de Crédito */}
          <div className="column-right">
            <section className="nota-credito">
              <h2>Nota de Crédito</h2>
              {/* Fila 1: Select para puntos de venta, N° nota y Fecha */}
              <div className="nota-row">
                <div className="form-group">
                  <label>Punto de Venta</label>
                  <select
                    value={selectedPuntoVentaNota}
                    onChange={(e) => setSelectedPuntoVentaNota(e.target.value)}
                    required
                  >
                    {puntosVentas.map((punto) => (
                      <option key={punto.id} value={punto.id}>
                        {punto.numero}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>N° Nota Crédito</label>
                  <input
                    type="text"
                    value={numeroNotaCredito}
                    onChange={(e) => setNumeroNotaCredito(e.target.value)}
                    placeholder="Ingrese número"
                    maxLength="8"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Fecha Nota Crédito</label>
                  <input
                    type="date"
                    value={fechaNotaCredito}
                    onChange={(e) => setFechaNotaCredito(e.target.value)}
                    required
                  />
                </div>
              </div>
              {/* Fila 2: Label con Total calculado para la Nota de Crédito (monto de la diferencia) */}
              <div className="nota-row total-row">
                <label>Total:</label>
                <span>
                  <NumericFormat
                    value={montoNotaCredito.toFixed(2)}
                    displayType="text"
                    thousandSeparator="."
                    decimalSeparator=","
                    decimalScale={2}
                    fixedDecimalScale={true}
                    prefix="$ "
                  />
                </span>
              </div>
              {/* Fila 3: Textarea para el motivo */}
              <div className="form-group">
                <label>Motivo:</label>
                <textarea
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder="Ingrese el motivo de la nota de crédito"
                ></textarea>
              </div>
            </section>
            <div className="btn-container">
              <button type="submit" className="btn-submit">
                Registrar Nota de Crédito
              </button>
            </div>
          </div>
        </div>
      </form>
    </main>
  );
};

export default NotasCreditoPage;
