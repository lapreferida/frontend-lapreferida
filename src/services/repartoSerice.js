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
