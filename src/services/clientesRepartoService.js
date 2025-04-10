import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.lapreferida.site/api/clientes-reparto', // Ajusta la URL y puerto según tu configuración
  withCredentials: true,
});

export const getClientesReparto = async () => {
  try {
    const response = await api.get('/');
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const createClienteReparto = async (clienteData) => {
  try {
    const response = await api.post('/create', clienteData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const updateClienteReparto = async (id, clienteData) => {
  try {
    const response = await api.put(`/${id}`, clienteData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const deleteClienteReparto = async (id) => {
  try {
    const response = await api.delete(`/${id}`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};
