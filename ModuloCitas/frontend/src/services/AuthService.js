import { apiRequest, setAuthToken, getAuthToken, clearAuth } from './api';

class AuthService {
    constructor() {
        this.TOKEN_KEY = 'token';
        this.USER_KEY = 'user';
    }

    // Iniciar sesión
    async login(credentials) {
        try {
            const response = await apiRequest.post('/auth/login', credentials);
            const { token, user } = response.data;

            // Guardar token y usuario en localStorage
            localStorage.setItem(this.TOKEN_KEY, token);
            localStorage.setItem(this.USER_KEY, JSON.stringify(user));

            // Configurar token en axios
            setAuthToken(token);

            return { token, user };
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Registrarse
    async register(userData) {
        try {
            const response = await apiRequest.post('/auth/register', userData);
            const { token, user } = response.data;

            // Guardar token y usuario en localStorage
            localStorage.setItem(this.TOKEN_KEY, token);
            localStorage.setItem(this.USER_KEY, JSON.stringify(user));

            // Configurar token en axios
            setAuthToken(token);

            return { token, user };
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Cerrar sesión
    logout() {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
        clearAuth();
    }

    // Validar token con el servidor
    async validateToken() {
        try {
            const response = await apiRequest.get('/auth/validate');
            return response.data;
        } catch (error) {
            this.logout();
            throw this.handleError(error);
        }
    }

    // Refrescar token
    async refreshToken() {
        try {
            const response = await apiRequest.post('/auth/refresh');
            const { token } = response.data;

            localStorage.setItem(this.TOKEN_KEY, token);
            setAuthToken(token);

            return token;
        } catch (error) {
            this.logout();
            throw this.handleError(error);
        }
    }

    // Solicitar restablecimiento de contraseña
    async forgotPassword(email) {
        try {
            const response = await apiRequest.post('/auth/forgot-password', { email });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Restablecer contraseña
    async resetPassword(token, newPassword) {
        try {
            const response = await apiRequest.post('/auth/reset-password', {
                token,
                newPassword
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Cambiar contraseña (usuario autenticado)
    async changePassword(currentPassword, newPassword) {
        try {
            const response = await apiRequest.post('/auth/change-password', {
                currentPassword,
                newPassword
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Obtener perfil del usuario actual
    async getProfile() {
        try {
            const response = await apiRequest.get('/auth/profile');
            const user = response.data;

            // Actualizar usuario en localStorage
            localStorage.setItem(this.USER_KEY, JSON.stringify(user));

            return user;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Actualizar perfil del usuario
    async updateProfile(userData) {
        try {
            const response = await apiRequest.put('/auth/profile', userData);
            const user = response.data;

            // Actualizar usuario en localStorage
            localStorage.setItem(this.USER_KEY, JSON.stringify(user));

            return user;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Verificar si el usuario está autenticado
    isAuthenticated() {
        const token = this.getToken();
        const user = this.getCurrentUser();
        return !!(token && user);
    }

    // Obtener token actual
    getToken() {
        return localStorage.getItem(this.TOKEN_KEY);
    }

    // Obtener usuario actual
    getCurrentUser() {
        try {
            const user = localStorage.getItem(this.USER_KEY);
            return user ? JSON.parse(user) : null;
        } catch (error) {
            console.error('Error parsing user data:', error);
            return null;
        }
    }

    // Verificar si el usuario tiene un rol específico
    hasRole(role) {
        const user = this.getCurrentUser();
        if (!user || !user.roles) return false;

        // Si roles es un array
        if (Array.isArray(user.roles)) {
            return user.roles.some(userRole =>
                userRole.toLowerCase() === role.toLowerCase()
            );
        }

        // Si role es un string
        return user.roles.toLowerCase() === role.toLowerCase();
    }

    // Verificar si el usuario tiene alguno de los roles especificados
    hasAnyRole(roles) {
        return roles.some(role => this.hasRole(role));
    }

    // Verificar si es administrador
    isAdmin() {
        return this.hasRole('admin') || this.hasRole('administrator');
    }

    // Verificar si es veterinario
    isVeterinario() {
        return this.hasRole('veterinario') || this.hasRole('vet');
    }

    // Verificar si es usuario regular
    isUser() {
        return this.hasRole('user') || this.hasRole('cliente');
    }

    // Obtener permisos del usuario
    getPermissions() {
        const user = this.getCurrentUser();
        return user?.permissions || [];
    }

    // Verificar si tiene un permiso específico
    hasPermission(permission) {
        const permissions = this.getPermissions();
        return permissions.includes(permission);
    }

    // Manejar errores de autenticación
    handleError(error) {
        if (error.response) {
            // El servidor respondió con un error
            const { status, data } = error.response;

            switch (status) {
                case 401:
                    this.logout();
                    return {
                        error: 'Credenciales inválidas',
                        status: 401
                    };
                case 403:
                    return {
                        error: 'No tienes permisos para realizar esta acción',
                        status: 403
                    };
                case 422:
                    return {
                        error: data.message || 'Datos de entrada inválidos',
                        status: 422,
                        validationErrors: data.errors || {}
                    };
                case 429:
                    return {
                        error: 'Demasiados intentos. Intenta nuevamente más tarde',
                        status: 429
                    };
                default:
                    return {
                        error: data.message || 'Error en el servidor',
                        status: status
                    };
            }
        } else if (error.request) {
            // No hay respuesta del servidor
            return {
                error: 'No se pudo conectar con el servidor',
                status: 0
            };
        } else {
            // Error en la configuración de la petición
            return {
                error: error.message || 'Error desconocido',
                status: 0
            };
        }
    }

    // Obtener datos de usuario para la UI
    getUserDisplayInfo() {
        const user = this.getCurrentUser();
        if (!user) return null;

        return {
            id: user.id,
            username: user.username,
            email: user.email,
            fullName: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
            avatar: user.avatar || user.profilePicture,
            role: this.getPrimaryRole(),
            roles: user.roles,
            permissions: this.getPermissions(),
        };
    }

    // Obtener el rol principal del usuario
    getPrimaryRole() {
        const user = this.getCurrentUser();
        if (!user || !user.roles) return 'user';

        if (Array.isArray(user.roles)) {
            // Prioridad: admin > veterinario > user
            if (user.roles.some(role => role.toLowerCase().includes('admin'))) {
                return 'admin';
            }
            if (user.roles.some(role => role.toLowerCase().includes('vet'))) {
                return 'veterinario';
            }
            return 'user';
        }

        return user.roles.toLowerCase();
    }

    // Verificar si el token está por expirar
    isTokenExpiringSoon() {
        const token = this.getToken();
        if (!token) return true;

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const exp = payload.exp * 1000; // Convert to milliseconds
            const now = Date.now();
            const fiveMinutes = 5 * 60 * 1000;

            return (exp - now) < fiveMinutes;
        } catch (error) {
            return true;
        }
    }
}

// Crear una instancia única del servicio
const authService = new AuthService();

export default authService;