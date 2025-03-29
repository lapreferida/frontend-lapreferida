import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.lapreferida.site/api/puntos-ventas', // Ajusta el puerto y la ruta según tu configuración
  withCredentials: true,
});

export const getPuntosVentas = async () => {
  try {
    const response = await api.get('/');
    return response.data;
  } catch (error) {
    if (error.response) {
      throw error.response.data;
    } else {
      throw { message: error.message || 'Error desconocido' };
    }
  }
};

export const createPuntoVenta = async (puntoVenta) => {
  try {
    const response = await api.post('/create', puntoVenta);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw error.response.data;
    } else {
      throw { message: error.message || 'Error desconocido' };
    }
  }
};

export const updatePuntoVenta = async (id, puntoVenta) => {
  try {
    const response = await api.put(`/${id}`, puntoVenta);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw error.response.data;
    } else {
      throw { message: error.message || 'Error desconocido' };
    }
  }
};

export const deletePuntoVenta = async (id) => {
  try {
    const response = await api.delete(`/${id}`);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw error.response.data;
    } else {
      throw { message: error.message || 'Error desconocido' };
    }
  }
};
