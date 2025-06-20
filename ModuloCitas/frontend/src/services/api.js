import axios from 'axios';
import toast from 'react-hot-toast';

// Configuración base de la API - usar rutas relativas para que funcione con Spring Boot
const API_BASE_URL = '';

// Crear instancia de axios
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para agregar el token a las peticiones
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            // Token expirado o inválido
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
            toast.error('Sesión expirada. Por favor, inicia sesión nuevamente.');
        } else if (error.response?.status === 403) {
            toast.error('No tienes permisos para realizar esta acción');
        } else if (error.response?.status >= 500) {
            toast.error('Error interno del servidor. Intenta nuevamente más tarde.');
        } else if (error.response?.data?.message) {
            toast.error(error.response.data.message);
        } else if (error.message === 'Network Error') {
            toast.error('Error de conexión. Verifica tu conexión a internet.');
        } else {
            toast.error('Ha ocurrido un error inesperado');
        }

        return Promise.reject(error);
    }
);

// Funciones de utilidad para las peticiones HTTP
export const apiRequest = {
    get: (url, config = {}) => api.get(url, config),
    post: (url, data = {}, config = {}) => api.post(url, data, config),
    put: (url, data = {}, config = {}) => api.put(url, data, config),
    patch: (url, data = {}, config = {}) => api.patch(url, data, config),
    delete: (url, config = {}) => api.delete(url, config),
};

// Función para establecer el token de autenticación
export const setAuthToken = (token) => {
    if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        localStorage.setItem('token', token);
    } else {
        delete api.defaults.headers.common['Authorization'];
        localStorage.removeItem('token');
    }
};

// Función para obtener el token actual
export const getAuthToken = () => {
    return localStorage.getItem('token');
};

// Función para verificar si el usuario está autenticado
export const isAuthenticated = () => {
    const token = getAuthToken();
    const user = localStorage.getItem('user');
    return !!(token && user);
};

// Función para obtener los datos del usuario
export const getCurrentUser = () => {
    try {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    } catch (error) {
        console.error('Error parsing user data:', error);
        return null;
    }
};

// Función para limpiar la sesión
export const clearAuth = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
};

export default api;