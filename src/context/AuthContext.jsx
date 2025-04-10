// AuthContext.jsx
import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { checkSession } from '../services/authService';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import Loader from '../components/Loader';

const AuthContext = createContext();

export const useAuthContext = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); 
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); 
  const [redirectToDashboard, setRedirectToDashboard] = useState(false);
  const navigate = useNavigate();

  // Usamos useRef para mantener la referencia al timeout
  const sessionTimeoutRef = useRef(null);

  // Función para programar el cierre de sesión
  const scheduleSessionExpiration = (expiresAt) => {
    const currentTime = new Date().getTime();
    const timeLeft = expiresAt - currentTime;
    
    // Si el tiempo restante es negativo, la sesión ya expiró
    if (timeLeft <= 0) {
      handleSessionExpiration();
      return;
    }
    
    // Programar el timeout
    sessionTimeoutRef.current = setTimeout(() => {
      handleSessionExpiration();
    }, timeLeft);
  };

  // Función que se ejecuta cuando la sesión expira
  const handleSessionExpiration = async () => {
    await Swal.fire({
      icon: 'info',
      title: 'Sesión caducada',
      text: 'Tu sesión ha caducado, por favor inicia sesión nuevamente.',
      confirmButtonText: 'Aceptar'
    });
    logout(); // Realizamos el logout
    navigate('/auth'); // Redirigimos a la página de autenticación
  };

  // Inicializar autenticación al montar el componente
  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      try {
        const session = await checkSession();
        if (session && session.user) {
          setUser(session.user);
          setIsAuthenticated(true);
          // Si el backend envió expiresAt, lo guardamos y programamos el timeout
          if (session.expiresAt) {
            localStorage.setItem('sessionExpiration', session.expiresAt);
            scheduleSessionExpiration(session.expiresAt);
          }
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Al cargar la app, verificamos si existe una fecha de expiración en localStorage
    const savedExpiration = localStorage.getItem('sessionExpiration');
    if (savedExpiration) {
      scheduleSessionExpiration(Number(savedExpiration));
    }

    // Limpieza: al desmontar, limpiar el timeout
    return () => {
      if (sessionTimeoutRef.current) clearTimeout(sessionTimeoutRef.current);
    };
  }, []);

  // Función de login: se ejecuta al obtener la respuesta del backend
  const login = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    // Guardar expiresAt en localStorage
    localStorage.setItem('sessionExpiration', userData.expiresAt);
    scheduleSessionExpiration(userData.expiresAt);
  };

  // Función de logout: limpiar datos, timeout y localStorage
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('sessionExpiration');
    if (sessionTimeoutRef.current) clearTimeout(sessionTimeoutRef.current);
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        logout,
        redirectToDashboard,
        setRedirectToDashboard,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
