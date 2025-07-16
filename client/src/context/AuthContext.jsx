import { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

//Custom hook to use in other components
export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);

  const login = (userData) => {
    setCurrentUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/auth/me', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // to send HTTP-only cookies
        });

        if (response.ok) {
          const data = await response.json();
          login(data); 
        } else {
          logout();
        }
      } catch (error) {
        console.error('Error checking authentication status:', error);
        logout(); 
      } finally {
        setLoadingAuth(false); 
      }
    };

    checkAuthStatus();
  }, []); 

  const authContextValue = {
    currentUser,
    isAuthenticated,
    loadingAuth,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};
