// AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { checkSession } from '../services/authService';
import Loader from '../components/Loader';

const AuthContext = createContext();

export const useAuthContext = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Guardar el usuario
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
          setUser(session.user); // Guardar usuario
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch {
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false); // Ocultar loader al terminar la verificación
      }
    };

    initializeAuth();
  }, []);

  const login = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };
  const logout = () => {
    setUser(null);
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
        user, // Ahora el contexto expone el usuario completo
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
