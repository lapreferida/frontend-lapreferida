import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4486/api/remitos', // Ajusta según tu configuración
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
