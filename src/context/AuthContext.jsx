// AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { checkSession } from '../services/authService';
import Loader from '../components/Loader';

const AuthContext = createContext();

export const useAuthContext = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Guardar el usuario
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); 
  const [isLoading, setIsLoading] = useState(false); 
  const [redirectToDashboard, setRedirectToDashboard] = useState(false); 

  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      try {
        const session = await checkSession();
        if (session && session.user) {
          setUser(session.user); // Se espera que session.user incluya la propiedad 'rol'
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch {
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
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
    setRedirectToDashboard(false);
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <AuthContext.Provider
      value={{
        user, // Aquí se expone el objeto con "rol"
        isAuthenticated,
        login,
        logout,
        isLoading,
        setIsLoading,
        redirectToDashboard,
        setRedirectToDashboard,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
