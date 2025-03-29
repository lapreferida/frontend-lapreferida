// AuthContext.jsx

import { createContext, useContext, useState, useEffect } from 'react';
import { checkSession } from '../services/authService';
import Loader from '../components/Loader';

const AuthContext = createContext();

export const useAuthContext = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // Carga inicial del contexto
  const [isLoading, setIsLoading] = useState(false); // Estado de carga global
  const [redirectToDashboard, setRedirectToDashboard] = useState(false); // Control de redirección

  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true); // Mostrar loader mientras se verifica la sesión
      try {
        const session = await checkSession();
        if (session && session.user) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch {
        setIsAuthenticated(false);
      } finally {
        setLoading(false); // Ocultar loader al terminar la verificación
      }
    };

    initializeAuth();
  }, []);

  const login = () => setIsAuthenticated(true);
  const logout = () => {
    setIsAuthenticated(false);
    setRedirectToDashboard(false); // Resetear redirección al cerrar sesión
  };

  if (loading) {
    // Mostrar loader general mientras el contexto se inicializa
    return <Loader />;
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        login,
        logout,
        isLoading,
        setIsLoading, // Permite modificar el loader desde otros componentes
        redirectToDashboard,
        setRedirectToDashboard, // Permite modificar el estado de redirección
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
