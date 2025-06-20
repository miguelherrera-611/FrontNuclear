import React, { createContext, useContext, useReducer, useEffect } from 'react';
import authService from '../services/authService';
import toast from 'react-hot-toast';

// Estados del contexto de autenticación
const initialState = {
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
};

// Tipos de acciones
const AUTH_ACTIONS = {
    LOGIN_SUCCESS: 'LOGIN_SUCCESS',
    LOGOUT: 'LOGOUT',
    SET_LOADING: 'SET_LOADING',
    SET_ERROR: 'SET_ERROR',
    CLEAR_ERROR: 'CLEAR_ERROR',
    UPDATE_USER: 'UPDATE_USER',
};

// Reducer para manejar los estados
const authReducer = (state, action) => {
    switch (action.type) {
        case AUTH_ACTIONS.LOGIN_SUCCESS:
            return {
                ...state,
                user: action.payload,
                isAuthenticated: true,
                isLoading: false,
                error: null,
            };
        case AUTH_ACTIONS.LOGOUT:
            return {
                ...state,
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: null,
            };
        case AUTH_ACTIONS.SET_LOADING:
            return {
                ...state,
                isLoading: action.payload,
            };
        case AUTH_ACTIONS.SET_ERROR:
            return {
                ...state,
                error: action.payload,
                isLoading: false,
            };
        case AUTH_ACTIONS.CLEAR_ERROR:
            return {
                ...state,
                error: null,
            };
        case AUTH_ACTIONS.UPDATE_USER:
            return {
                ...state,
                user: { ...state.user, ...action.payload },
            };
        default:
            return state;
    }
};

// Crear el contexto
const AuthContext = createContext(null);

// Hook personalizado para usar el contexto
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
};

// Proveedor del contexto
export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    // Verificar autenticación al cargar la aplicación
    useEffect(() => {
        const checkAuth = async () => {
            try {
                dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });

                if (authService.isAuthenticated()) {
                    const user = authService.getCurrentUser();

                    if (user) {
                        // Validar token con el servidor
                        try {
                            await authService.validateToken();
                            dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: user });
                        } catch (error) {
                            // Token inválido, limpiar sesión
                            authService.logout();
                            dispatch({ type: AUTH_ACTIONS.LOGOUT });
                        }
                    } else {
                        dispatch({ type: AUTH_ACTIONS.LOGOUT });
                    }
                } else {
                    dispatch({ type: AUTH_ACTIONS.LOGOUT });
                }
            } catch (error) {
                console.error('Error checking authentication:', error);
                dispatch({ type: AUTH_ACTIONS.LOGOUT });
            } finally {
                dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
            }
        };

        checkAuth();
    }, []);

    // Función para iniciar sesión
    const login = async (credentials) => {
        try {
            dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
            dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

            const response = await authService.login(credentials);
            const user = authService.getCurrentUser();

            dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: user });
            toast.success(`¡Bienvenido, ${user.username}!`);

            return response;
        } catch (error) {
            const errorMessage = error.error || error.message || 'Error al iniciar sesión';
            dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage });
            toast.error(errorMessage);
            throw error;
        } finally {
            dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
        }
    };

    // Función para registrarse
    const register = async (userData) => {
        try {
            dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
            dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

            const response = await authService.register(userData);
            const user = authService.getCurrentUser();

            dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: user });
            toast.success(`¡Registro exitoso! Bienvenido, ${user.username}!`);

            return response;
        } catch (error) {
            const errorMessage = error.error || error.message || 'Error al registrarse';
            dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage });
            toast.error(errorMessage);
            throw error;
        } finally {
            dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
        }
    };

    // Función para cerrar sesión
    const logout = () => {
        authService.logout();
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
        toast.success('Sesión cerrada exitosamente');
    };

    // Función para actualizar datos del usuario
    const updateUser = (userData) => {
        const currentUser = authService.getCurrentUser();
        const updatedUser = { ...currentUser, ...userData };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        dispatch({ type: AUTH_ACTIONS.UPDATE_USER, payload: userData });
    };

    // Función para limpiar errores
    const clearError = () => {
        dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
    };

    // Funciones de verificación de roles
    const hasRole = (role) => {
        return authService.hasRole(role);
    };

    const isAdmin = () => {
        return authService.isAdmin();
    };

    const isVeterinario = () => {
        return authService.isVeterinario();
    };

    const isUser = () => {
        return authService.isUser();
    };

    const value = {
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isLoading: state.isLoading,
        error: state.error,
        login,
        register,
        logout,
        updateUser,
        clearError,
        hasRole,
        isAdmin,
        isVeterinario,
        isUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};