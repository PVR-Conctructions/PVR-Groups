import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../hooks/useApi';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('pvr_token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            fetchUser();
        } else {
            setLoading(false);
        }
    }, [token]);

    const fetchUser = async (retries = 3) => {
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                const res = await api.get('/auth/me');
                setUser(res.data.user);
                setLoading(false);
                return;
            } catch (err) {
                // If it's a real 401 (invalid/expired token), logout immediately
                if (err.response?.status === 401) {
                    logout();
                    setLoading(false);
                    return;
                }
                // Network error or timeout — retry if attempts remain
                if (attempt < retries) {
                    await new Promise(r => setTimeout(r, 1000 * attempt));
                    continue;
                }
                // All retries exhausted — keep existing token, don't log out
                // User can still navigate; API calls will re-check auth
                console.error('Failed to fetch user after retries:', err.message);
                setLoading(false);
            }
        }
    };

    const login = async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        if (res.data.requires2FA) {
            return res.data;
        }
        const { token: newToken, user: userData } = res.data;
        localStorage.setItem('pvr_token', newToken);
        setToken(newToken);
        setUser(userData);
        return userData;
    };

    const loginVerify2FA = async (email, password, authCode) => {
        const res = await api.post('/auth/login-verify', { email, password, token: authCode });
        const { token: newToken, user: userData } = res.data;
        localStorage.setItem('pvr_token', newToken);
        setToken(newToken);
        setUser(userData);
        return userData;
    };

    const register = async (name, email, phone, password) => {
        const res = await api.post('/auth/register', { name, email, phone, password });
        const { token: newToken, user: userData } = res.data;
        localStorage.setItem('pvr_token', newToken);
        setToken(newToken);
        setUser(userData);
        return userData;
    };

    const logout = () => {
        localStorage.removeItem('pvr_token');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, loginVerify2FA, register, logout, isAdmin: user?.role === 'admin' }}>
            {children}
        </AuthContext.Provider>
    );
};
