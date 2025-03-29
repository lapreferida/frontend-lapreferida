import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.lapreferida.site/api/productos', // Ajusta el puerto y ruta según tu configuración
  withCredentials: true,
});

export const getProductos = async () => {
  try {
    const response = await api.get('/');
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const createProducto = async (productoData) => {
  try {
    const response = await api.post('/create', productoData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const updateProducto = async (id, productoData) => {
  try {
    const response = await api.put(`/${id}`, productoData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const deleteProducto = async (id) => {
  try {
    const response = await api.delete(`/${id}`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};
