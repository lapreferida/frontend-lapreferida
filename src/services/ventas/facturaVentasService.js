// frontend/facturasVentasService.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4486/api/facturas-ventas', // Ajusta el puerto y la ruta según tu configuración
  withCredentials: true,
});

export const getFacturasVentas = async () => {
  try {
    const response = await api.get('/');
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const getHistorialFacturasVentas = async () => {
  try {
    const response = await api.get('/historial');
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const createFacturaVenta = async (facturaData) => {
  try {
    const response = await api.post('/create', facturaData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const registrarPagoFacturaVenta = async (id, pagoData) => {
  try {
    const response = await api.put(`/${id}/pago`, pagoData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const getNextNumeroFactura = async () => {
  try {
    const response = await api.get('/nextNumber');
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};
