// frontend/repartoService.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.lapreferida.site/api/reparto', // Ajusta la URL según tu configuración
  withCredentials: true,
});

// Crear un nuevo reparto
export const createReparto = async (repartoData) => {
  try {
    const response = await api.post('/create', repartoData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Obtener historial de repartos por día
export const getHistorialRepartosPorDia = async (fecha) => {
  try {
    // Se envía la fecha como parámetro de query.
    // Si no se envía fecha, el backend usará la fecha actual por defecto.
    const response = await api.get('/historial', { params: { fecha } });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};
