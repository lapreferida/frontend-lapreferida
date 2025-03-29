import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4486/api/notas-credito', // Ajusta el puerto y la ruta según tu configuración
  withCredentials: true,
});

export const getNotasCredito = async () => {
  try {
    const response = await api.get('/');
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const getNotaCreditoById = async (id) => {
  try {
    const response = await api.get(`/${id}`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const createNotaCredito = async (notaData) => {
  try {
    const response = await api.post('/create', notaData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const getNextNumeroNotaCredito = async () => {
  try {
    const response = await api.get('/nextNotaCredito');
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const deleteNotaCredito = async (id, userId) => {
  try {
    // Se envía el user_id en el cuerpo de la petición
    const response = await api.delete(`/${id}`, { data: { user_id: userId } });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Nueva función para obtener los movimientos de notas de crédito
export const getMovimientosNotasCredito = async (nota_credito_id) => {
  try {
    let url = '/movimientos';
    if (nota_credito_id) {
      url += `?nota_credito_id=${nota_credito_id}`;
    }
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};
