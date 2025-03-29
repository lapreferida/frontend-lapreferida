import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4486/api/clientes', // Ajusta el puerto y ruta según tu configuración
  withCredentials: true,
});

export const getClientes = async () => {
  try {
    const response = await api.get('/');
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const createCliente = async (clienteData) => {
  try {
    const response = await api.post('/create', clienteData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const updateCliente = async (id, clienteData) => {
  try {
    const response = await api.put(`/${id}`, clienteData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const deleteCliente = async (id) => {
  try {
    const response = await api.delete(`/${id}`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};
