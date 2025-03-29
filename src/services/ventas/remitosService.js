import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.lapreferida.site/api/remitos', // Ajusta según tu configuración
  withCredentials: true,
});

export const getRemitos = async () => {
  try {
    const response = await api.get('/');
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const createRemito = async (remitoData) => {
  try {
    const response = await api.post('/create', remitoData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const getNextNumeroRemito = async () => {
  try {
    const response = await api.get('/next-numero');
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const getRemitosDetalles = async (remitoIds) => {
  try {
    const response = await api.post('/detalles', { remitoIds });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const getRemitosReport = async (params) => {
  try {
    const response = await api.get('/report', { params });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const getRemitosSummary = async (cliente_id, start_date, end_date) => {
  try {
    const response = await api.get('/summary', {
      params: { cliente_id, start_date, end_date }
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// NUEVO: Servicio para eliminar un remito
export const deleteRemito = async (id, usuario_id) => {
  try {
    const response = await api.delete(`/${id}`, {
      data: { usuario_id }  // En axios se envía el body en la propiedad "data" en DELETE
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};
