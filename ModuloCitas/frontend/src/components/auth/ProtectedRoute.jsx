import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';

const ProtectedRoute = ({ children, roles = null }) => {
    const { isAuthenticated, isLoading, user, hasRole, hasAnyRole } = useAuth();
    const location = useLocation();

    // Mostrar loading mientras se verifica la autenticación
    if (isLoading) {
        return <LoadingSpinner />;
    }

    // Redirigir a login si no está autenticado
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Verificar roles si se especificaron
    if (roles) {
        const hasRequiredRole = Array.isArray(roles)
            ? hasAnyRole(roles)
            : hasRole(roles);

        if (!hasRequiredRole) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="max-w-md w-full mx-4">
                        <div className="bg-white rounded-lg shadow-md p-6 text-center">
                            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.99-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                Acceso Denegado
                            </h2>
                            <p className="text-gray-600 mb-4">
                                No tienes permisos para acceder a esta página.
                            </p>
                            <p className="text-sm text-gray-500 mb-6">
                                Roles requeridos: {Array.isArray(roles) ? roles.join(', ') : roles}
                            </p>
                            <button
                                onClick={() => window.history.back()}
                                className="btn-primary"
                            >
                                Volver
                            </button>
                        </div>
                    </div>
                </div>
            );
        }
    }

    // Renderizar el componente protegido
    return children;
};

export default ProtectedRoute;