import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4486/api/informe-z', // Ajusta el puerto y la ruta según tu configuración
  withCredentials: true,
});

// Obtener todos los informes Z
export const getInformesZ = async () => {
  try {
    const response = await api.get('/');
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Obtener el historial de informes Z
export const getHistorialInformesZ = async () => {
  try {
    const response = await api.get('/historial');
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Crear un nuevo informe Z
export const createInformeZ = async (informeData) => {
  try {
    const response = await api.post('/create', informeData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Obtener el siguiente número de informe Z
export const getNextNumeroInformeZ = async () => {
  try {
    const response = await api.get('/nextNumber');
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Actualizar un informe Z
export const updateInformeZ = async (id, informeData) => {
  try {
    const response = await api.put(`/${id}`, informeData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Eliminar un informe Z
export const deleteInformeZ = async (id, usuario_id) => {
  try {
    const response = await api.delete(`/${id}`, { data: { usuario_id } });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Obtener los movimientos de informes Z
export const getMovimientosInformesZ = async (informe_z_id) => {
  try {
    let url = '/movimientos';
    if (informe_z_id) {
      url += `?informe_z_id=${informe_z_id}`;
    }
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};
