// frontend/pages/ventas/InformeZPage.js
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { NumericFormat } from 'react-number-format';

// Servicios
import { checkSession } from '../../services/authService';
import { getClientes } from '../../services/clientesService';
import { createInformeZ, getNextNumeroInformeZ } from '../../services/ventas/informeZService';
import { getPuntosVentas } from '../../services/ventas/puntoVentaService';

// Estilos
import '../../styles/ventas/informeZPage.css';

const InformeZPage = () => {
  const navigate = useNavigate();

  // Estados del usuario y del formulario
  const [user, setUser] = useState(null);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [numeroInforme, setNumeroInforme] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [puntosVentas, setPuntosVentas] = useState([]);
  const [selectedPuntoVenta, setSelectedPuntoVenta] = useState(null);
  const [observaciones, setObservaciones] = useState('');

  // Estados para el cálculo de montos por alícuota
  const [neto10_5, setNeto10_5] = useState('');
  const [neto21, setNeto21] = useState('');
  const [iva10_5, setIva10_5] = useState('0.00');
  const [iva21, setIva21] = useState('0.00');
  const [subtotal10_5, setSubtotal10_5] = useState('0.00');
  const [subtotal21, setSubtotal21] = useState('0.00');
  const [totalGeneral, setTotalGeneral] = useState('0.00');

  // Verificar sesión de usuario
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

  // Cargar clientes y buscar "consumidor final"
  useEffect(() => {
    getClientes()
      .then((data) => {
        const consumidorFinal = data.find(
          (cliente) => cliente.razon_social.toLowerCase() === 'consumidor final'
        );
        if (consumidorFinal) {
          setSelectedCliente({
            value: consumidorFinal.id,
            label: consumidorFinal.razon_social,
          });
        } else {
          Swal.fire(
            'Error',
            'El cliente "consumidor final" no está creado. Por favor, cree el cliente en la sección de clientes.',
            'error'
          ).then(() => {
            navigate('/clientes');
          });
        }
      })
      .catch((err) => console.error('Error al cargar clientes:', err));
  }, [navigate]);

  // Obtener el siguiente número de Informe Z
  useEffect(() => {
    getNextNumeroInformeZ()
      .then((data) => setNumeroInforme(data.nextNumeroInforme))
      .catch((error) =>
        console.error('Error al obtener el próximo número de informe:', error)
      );
  }, []);

  // Cargar puntos de venta
  useEffect(() => {
    getPuntosVentas()
      .then((data) => {
        setPuntosVentas(data);
        if (data.length > 0) {
          setSelectedPuntoVenta(data[0].id);
        }
      })
      .catch((err) => console.error('Error al cargar puntos de venta:', err));
  }, []);

  // Calcular IVA, subtotales y Total General a partir de los netos ingresados
  useEffect(() => {
    const parsedNeto10_5 = parseFloat(neto10_5) || 0;
    const parsedNeto21 = parseFloat(neto21) || 0;
    const calcIva10_5 = parsedNeto10_5 * 0.105;
    const calcIva21 = parsedNeto21 * 0.21;
    const newIva10_5 = Number(calcIva10_5.toFixed(2));
    const newIva21 = Number(calcIva21.toFixed(2));
    const calcSubtotal10_5 = parsedNeto10_5 + newIva10_5;
    const calcSubtotal21 = parsedNeto21 + newIva21;
    const newSubtotal10_5 = Number(calcSubtotal10_5.toFixed(2));
    const newSubtotal21 = Number(calcSubtotal21.toFixed(2));
    const newTotalGeneral = Number((newSubtotal10_5 + newSubtotal21).toFixed(2));

    setIva10_5(newIva10_5);
    setIva21(newIva21);
    setSubtotal10_5(newSubtotal10_5);
    setSubtotal21(newSubtotal21);
    setTotalGeneral(newTotalGeneral);
  }, [neto10_5, neto21]);

  // Manejo del envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedCliente) {
      Swal.fire(
        'Error',
        'No se encontró el cliente "consumidor final". Por favor, cree el cliente.',
        'error'
      );
      return;
    }
    if (!numeroInforme || !fecha) {
      Swal.fire('Error', 'Complete los campos obligatorios.', 'error');
      return;
    }
    if (!selectedPuntoVenta) {
      Swal.fire('Error', 'Seleccione un punto de venta.', 'error');
      return;
    }

    const informeData = {
      cliente_id: selectedCliente.value,
      usuario_id: user.id,
      punto_venta_id: selectedPuntoVenta,
      numero_informe: numeroInforme,
      fecha,
      neto_10_5: parseFloat(neto10_5) || 0,
      neto_21: parseFloat(neto21) || 0,
      iva_10_5: parseFloat(iva10_5),
      iva_21: parseFloat(iva21),
      subtotal_10_5: parseFloat(subtotal10_5),
      subtotal_21: parseFloat(subtotal21),
      total_general: parseFloat(totalGeneral),
      observaciones,
    };

    try {
      await createInformeZ(informeData);
      Swal.fire('Éxito', 'El Informe Z se registró exitosamente.', 'success');

      // Reiniciar formulario (excepto el cliente y el punto de venta)
      setNumeroInforme('');
      setFecha(new Date().toISOString().split('T')[0]);
      setNeto10_5('');
      setNeto21('');
      setObservaciones('');

      // Actualizar el próximo número de informe
      getNextNumeroInformeZ()
        .then((data) => setNumeroInforme(data.nextNumeroInforme))
        .catch((error) =>
          console.error('Error al actualizar el número de informe:', error)
        );
    } catch (error) {
      console.error(error);
      let errorMsg = "Error al registrar el informe";
      if (typeof error === 'object' && error !== null) {
        if (error.message) {
          errorMsg = error.message;
        } else if (error.errors && Array.isArray(error.errors)) {
          errorMsg = error.errors.map(err => err.msg).join(', ');
        } else {
          errorMsg = JSON.stringify(error);
        }
      } else {
        errorMsg = error.toString();
      }
      Swal.fire("Error", errorMsg, "error");
    }
  };

  return (
    <main className="container informez-container">
      <h1>Informe Z</h1>
      <form className="informez-form" onSubmit={handleSubmit}>
        <section className="informez-section">
          <h2>Información General</h2>
          {/* Nueva fila para agrupar Cliente, Punto de Venta, Número de Informe y Fecha */}
          <div className="informez-row">
            <div className="form-group cliente">
              <label htmlFor="cliente">Cliente</label>
              <input
                type="text"
                id="cliente"
                value={selectedCliente ? selectedCliente.label : ''}
                readOnly
              />
            </div>
            <div className="form-group punto-venta">
              <label htmlFor="puntoVenta">Pto. Venta</label>
              <select
                id="puntoVenta"
                value={selectedPuntoVenta || ''}
                onChange={(e) =>
                  setSelectedPuntoVenta(e.target.value ? Number(e.target.value) : null)
                }
                required
              >
                {puntosVentas.map((punto) => (
                  <option key={punto.id} value={punto.id} title={punto.nombre}>
                    {punto.numero}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group numero-informe">
              <label htmlFor="numeroInforme">N° Informe</label>
              <input
                type="text"
                id="numeroInforme"
                value={numeroInforme}
                onChange={(e) => setNumeroInforme(e.target.value)}
                placeholder="Ingrese número de informe"
                maxLength="50"
                required
              />
            </div>
            <div className="form-group fecha">
              <label htmlFor="fecha">Fecha</label>
              <input
                type="date"
                id="fecha"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Resto de los campos: netos, IVA, subtotales y Total General */}
          <div className="informez-datos-row">
            <div className="form-group">
              <label htmlFor="neto10_5">Neto (10,5%)</label>
              <NumericFormat
                id="neto10_5"
                thousandSeparator="."
                decimalSeparator=","
                decimalScale={2}
                fixedDecimalScale
                prefix="$ "
                placeholder="0.00"
                value={neto10_5}
                onValueChange={(values) => setNeto10_5(values.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="iva10_5">IVA Calculado (10,5%)</label>
              <NumericFormat
                id="iva10_5"
                thousandSeparator="."
                decimalSeparator=","
                decimalScale={2}
                fixedDecimalScale
                prefix="$ "
                value={iva10_5}
                displayType="input"
                readOnly
              />
            </div>
            <div className="form-group">
              <label htmlFor="subtotal10_5">Subtotal (10,5%)</label>
              <NumericFormat
                id="subtotal10_5"
                thousandSeparator="."
                decimalSeparator=","
                decimalScale={2}
                fixedDecimalScale
                prefix="$ "
                value={subtotal10_5}
                readOnly
              />
            </div>
          </div>
          <div className="informez-datos-row">
            <div className="form-group">
              <label htmlFor="neto21">Neto (21%)</label>
              <NumericFormat
                id="neto21"
                thousandSeparator="."
                decimalSeparator=","
                decimalScale={2}
                fixedDecimalScale
                prefix="$ "
                placeholder="0.00"
                value={neto21}
                onValueChange={(values) => setNeto21(values.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="iva21">IVA Calculado (21%)</label>
              <NumericFormat
                id="iva21"
                thousandSeparator="."
                decimalSeparator=","
                decimalScale={2}
                fixedDecimalScale
                prefix="$ "
                value={iva21}
                displayType="input"
                readOnly
              />
            </div>
            <div className="form-group">
              <label htmlFor="subtotal21">Subtotal (21%)</label>
              <NumericFormat
                id="subtotal21"
                thousandSeparator="."
                decimalSeparator=","
                decimalScale={2}
                fixedDecimalScale
                prefix="$ "
                value={subtotal21}
                readOnly
              />
            </div>
          </div>
          <div className="informez-datos-row">
            <div className="form-group">
              <label htmlFor="totalGeneral">Total General</label>
              <NumericFormat
                id="totalGeneral"
                thousandSeparator="."
                decimalSeparator=","
                decimalScale={2}
                fixedDecimalScale
                prefix="$ "
                value={totalGeneral}
                readOnly
              />
            </div>
          </div>
          <div className="form-group observaciones">
            <label htmlFor="observaciones">Observaciones</label>
            <textarea
              id="observaciones"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Ingrese observaciones adicionales"
            ></textarea>
          </div>
        </section>
        <div className="informez-btn-container">
          <button type="submit" className="informez-btn-submit">
            Registrar
          </button>
        </div>
      </form>
    </main>
  );
};

export default InformeZPage;
