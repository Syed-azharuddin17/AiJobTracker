import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('jwtToken'));
    const [userEmail, setUserEmail] = useState(localStorage.getItem('userEmail'));

    const login = (jwtToken, email) => {
        localStorage.setItem('jwtToken', jwtToken);
        localStorage.setItem('userEmail', email);
        setToken(jwtToken);
        setUserEmail(email);
    };

    const logout = () => {
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('userEmail');
        setToken(null);
        setUserEmail(null);
    };

    return (
        <AuthContext.Provider value={{ token, userEmail, login, logout, isAuthenticated: !!token }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);