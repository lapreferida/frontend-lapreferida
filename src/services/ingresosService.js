import axios from 'axios';

// Crear una instancia de Axios configurada para nuestro backend
const api = axios.create({
  baseURL: 'https://api.lapreferida.site/api/ingresos', // Ajusta el puerto y ruta según tu configuración
  withCredentials: true, // Permite el envío de cookies (incluido el token JWT)
});

// Función para obtener todos los ingresos
export const getIngresos = async () => {
  try {
    const response = await api.get('/');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error al obtener ingresos' };
  }
};

// Función para crear un nuevo ingreso
export const createIngreso = async (ingresoData) => {
  try {
    const response = await api.post('/create', ingresoData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error al crear el ingreso' };
  }
};

// Función para actualizar un ingreso existente
export const updateIngreso = async (id, ingresoData) => {
  try {
    const response = await api.put(`/${id}`, ingresoData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error al actualizar el ingreso' };
  }
};

// Función para eliminar un ingreso
export const deleteIngreso = async (id) => {
  try {
    const response = await api.delete(`/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error al eliminar el ingreso' };
  }
};

// Función para obtener el detalle de ingresos
export const getMovimientosIngresos = async () => {
  try {
    const response = await api.get('/movimientos');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error al obtener los detalles del ingreso' };
  }
};