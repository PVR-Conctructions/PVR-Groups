import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen bg-dark-bg flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-gold-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
    if (adminOnly && user.role !== 'admin') return <Navigate to="/home" replace />;

    return children;
};

export default ProtectedRoute;
