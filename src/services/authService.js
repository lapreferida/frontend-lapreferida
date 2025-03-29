import axios from 'axios';

// Crear una instancia de Axios configurada para nuestro backend
const api = axios.create({
  baseURL: 'http://localhost:4486/api/auth', // Asegúrate de que la URL coincida con tu servidor backend
  withCredentials: true, // Esto permite el envío de cookies (incluido el token JWT)
});

// Función para registrar un nuevo usuario
export const register = async (userData) => {
  try {
    const response = await api.post('/register', userData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Función para hacer login
export const login = async (loginData) => {
  try {
    const response = await api.post('/login', loginData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Función para cerrar sesión
export const logout = async () => {
  try {
    await api.post('/logout');
  } catch (error) {
    throw error.response.data;
  }
};

// Función para verificar si la sesión está activa
export const checkSession = async () => {
  try {
    const response = await api.get('/check-session');
    return response.data;
  } catch  {
    // En caso de error (por ejemplo, 401 Unauthorized) retorna null
    return null;
  }
};