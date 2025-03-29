// frontend/pagosService.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4486/api/pagos-facturas', // Ajusta el puerto y ruta según tu configuración
  withCredentials: true,
});

export const getHistorialPagos = async () => {
  try {
    const response = await api.get('/');
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const deletePago = async (id) => {
  try {
    const response = await api.delete(`/${id}`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};
