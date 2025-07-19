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
    const API_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL; 


    const login = (userData) => {
        setCurrentUser(userData);
        setIsAuthenticated(true);
    };

    const logout = async () => {
        setLoadingAuth(true);
        try {
            const response = await fetch(`${API_BASE_URL}/auth/logout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });

            if (!response.ok) {
                const errorData = await response.json();
            }

            setCurrentUser(null);
            setIsAuthenticated(false);
        } catch (error) {
            setCurrentUser(null);
            setIsAuthenticated(false);
        } finally {
            setLoadingAuth(false);
        }
    };

    useEffect(() => {
        const checkAuthStatus = async () => {
            setLoadingAuth(true); 
            try {
                const response = await fetch(`${API_BASE_URL}/auth/me`, {
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
