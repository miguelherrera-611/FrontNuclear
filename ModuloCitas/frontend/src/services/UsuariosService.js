import { apiRequest } from './api';

class UsuariosService {
    constructor() {
        this.baseUrl = '/api/usuarios';
    }

    // Obtener todos los usuarios
    async getUsuarios(filters = {}) {
        try {
            const params = new URLSearchParams();

            Object.keys(filters).forEach(key => {
                if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
                    params.append(key, filters[key]);
                }
            });

            const queryString = params.toString();
            const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;

            const response = await apiRequest.get(url);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Obtener usuario por ID
    async getUsuarioById(id) {
        try {
            const response = await apiRequest.get(`${this.baseUrl}/${id}`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Crear nuevo usuario
    async createUsuario(usuarioData) {
        try {
            const response = await apiRequest.post(this.baseUrl, usuarioData);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Actualizar usuario
    async updateUsuario(id, usuarioData) {
        try {
            const response = await apiRequest.put(`${this.baseUrl}/${id}`, usuarioData);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Eliminar usuario
    async deleteUsuario(id) {
        try {
            const response = await apiRequest.delete(`${this.baseUrl}/${id}`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Obtener veterinarios
    async getVeterinarios(incluirDisponibilidad = false) {
        try {
            const url = incluirDisponibilidad
                ? `${this.baseUrl}/veterinarios?incluirDisponibilidad=true`
                : `${this.baseUrl}/veterinarios`;

            const response = await apiRequest.get(url);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Obtener veterinario por ID
    async getVeterinarioById(id) {
        try {
            const response = await apiRequest.get(`${this.baseUrl}/veterinarios/${id}`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Crear veterinario
    async createVeterinario(veterinarioData) {
        try {
            const response = await apiRequest.post(`${this.baseUrl}/veterinarios`, veterinarioData);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Actualizar veterinario
    async updateVeterinario(id, veterinarioData) {
        try {
            const response = await apiRequest.put(`${this.baseUrl}/veterinarios/${id}`, veterinarioData);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Obtener disponibilidad de veterinario
    async getDisponibilidadVeterinario(veterinarioId, fecha = null) {
        try {
            const url = fecha
                ? `${this.baseUrl}/veterinarios/${veterinarioId}/disponibilidad?fecha=${fecha}`
                : `${this.baseUrl}/veterinarios/${veterinarioId}/disponibilidad`;

            const response = await apiRequest.get(url);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Actualizar disponibilidad de veterinario
    async updateDisponibilidadVeterinario(veterinarioId, disponibilidadData) {
        try {
            const response = await apiRequest.put(
                `${this.baseUrl}/veterinarios/${veterinarioId}/disponibilidad`,
                disponibilidadData
            );
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Buscar usuarios
    async buscarUsuarios(termino, rol = null) {
        try {
            const params = new URLSearchParams();
            params.append('q', termino);
            if (rol) params.append('rol', rol);

            const response = await apiRequest.get(`${this.baseUrl}/buscar?${params.toString()}`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Cambiar estado del usuario (activar/desactivar)
    async cambiarEstado(id, activo) {
        try {
            const response = await apiRequest.patch(`${this.baseUrl}/${id}/estado`, {
                activo
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Cambiar rol del usuario
    async cambiarRol(id, nuevoRol) {
        try {
            const response = await apiRequest.patch(`${this.baseUrl}/${id}/rol`, {
                rol: nuevoRol
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Restablecer contraseña de usuario
    async restablecerPassword(id, nuevaPassword = null) {
        try {
            const data = nuevaPassword ? { password: nuevaPassword } : {};
            const response = await apiRequest.post(`${this.baseUrl}/${id}/restablecer-password`, data);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Subir foto de perfil
    async subirFotoPerfil(id, file) {
        try {
            const formData = new FormData();
            formData.append('foto', file);

            const response = await apiRequest.post(`${this.baseUrl}/${id}/foto`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Obtener estadísticas de usuarios
    async getEstadisticas() {
        try {
            const response = await apiRequest.get(`${this.baseUrl}/estadisticas`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Obtener actividad reciente del usuario
    async getActividadReciente(id, limite = 10) {
        try {
            const response = await apiRequest.get(`${this.baseUrl}/${id}/actividad?limite=${limite}`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Verificar disponibilidad de username/email
    async verificarDisponibilidad(campo, valor, excludeId = null) {
        try {
            const params = new URLSearchParams();
            params.append(campo, valor);
            if (excludeId) params.append('excludeId', excludeId);

            const response = await apiRequest.get(`${this.baseUrl}/verificar-disponibilidad?${params.toString()}`);
            return response.data;
        } catch (error) {
            return { disponible: false };
        }
    }

    // Obtener perfiles de usuario por rol
    async getUsuariosByRol(rol) {
        try {
            const response = await apiRequest.get(`${this.baseUrl}/por-rol/${rol}`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Enviar invitación por email
    async enviarInvitacion(email, rol) {
        try {
            const response = await apiRequest.post(`${this.baseUrl}/invitar`, {
                email,
                rol
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Importar usuarios desde CSV
    async importarUsuarios(file) {
        try {
            const formData = new FormData();
            formData.append('archivo', file);

            const response = await apiRequest.post(`${this.baseUrl}/importar`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Exportar usuarios a PDF
    async exportarPDF(filtros = {}) {
        try {
            const params = new URLSearchParams();
            Object.keys(filtros).forEach(key => {
                if (filtros[key] !== null && filtros[key] !== undefined && filtros[key] !== '') {
                    params.append(key, filtros[key]);
                }
            });

            const response = await apiRequest.get(`${this.baseUrl}/export/pdf?${params.toString()}`, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `usuarios_${new Date().toISOString().split('T')[0]}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            return { success: true };
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Validar datos de usuario
    validateUsuarioData(usuarioData, isEdit = false) {
        const errors = {};

        if (!usuarioData.username || usuarioData.username.trim().length < 3) {
            errors.username = 'El nombre de usuario debe tener al menos 3 caracteres';
        }

        if (!usuarioData.email || !this.isValidEmail(usuarioData.email)) {
            errors.email = 'Debe ingresar un email válido';
        }

        if (!isEdit && (!usuarioData.password || usuarioData.password.length < 6)) {
            errors.password = 'La contraseña debe tener al menos 6 caracteres';
        }

        if (usuarioData.password && usuarioData.confirmPassword &&
            usuarioData.password !== usuarioData.confirmPassword) {
            errors.confirmPassword = 'Las contraseñas no coinciden';
        }

        if (!usuarioData.firstName || usuarioData.firstName.trim().length < 2) {
            errors.firstName = 'El nombre debe tener al menos 2 caracteres';
        }

        if (!usuarioData.lastName || usuarioData.lastName.trim().length < 2) {
            errors.lastName = 'El apellido debe tener al menos 2 caracteres';
        }

        if (!usuarioData.rol) {
            errors.rol = 'Debe seleccionar un rol';
        }

        if (usuarioData.telefono && !this.isValidPhone(usuarioData.telefono)) {
            errors.telefono = 'Formato de teléfono inválido';
        }

        if (usuarioData.cedula && usuarioData.cedula.length < 6) {
            errors.cedula = 'La cédula debe tener al menos 6 dígitos';
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }

    // Validar datos de veterinario
    validateVeterinarioData(veterinarioData) {
        const errors = {};

        // Validaciones de usuario base
        const usuarioValidation = this.validateUsuarioData(veterinarioData);
        Object.assign(errors, usuarioValidation.errors);

        if (!veterinarioData.especialidades || veterinarioData.especialidades.length === 0) {
            errors.especialidades = 'Debe seleccionar al menos una especialidad';
        }

        if (!veterinarioData.numeroLicencia || veterinarioData.numeroLicencia.trim().length < 3) {
            errors.numeroLicencia = 'Debe ingresar el número de licencia profesional';
        }

        if (veterinarioData.añosExperiencia &&
            (isNaN(veterinarioData.añosExperiencia) || veterinarioData.añosExperiencia < 0)) {
            errors.añosExperiencia = 'Los años de experiencia deben ser un número positivo';
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }

    // Validar email
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Validar teléfono
    isValidPhone(phone) {
        const phoneRegex = /^[\+]?[1-9][\d]{7,14}$/;
        return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
    }

    // Obtener roles disponibles
    getRolesDisponibles() {
        return [
            { value: 'admin', label: 'Administrador' },
            { value: 'veterinario', label: 'Veterinario' },
            { value: 'usuario', label: 'Usuario' },
            { value: 'recepcionista', label: 'Recepcionista' }
        ];
    }

    // Obtener especialidades veterinarias
    getEspecialidadesVeterinarias() {
        return [
            'Medicina General',
            'Cirugía',
            'Cardiología',
            'Dermatología',
            'Oftalmología',
            'Neurología',
            'Oncología',
            'Ortopedia',
            'Medicina Interna',
            'Anestesiología',
            'Radiología',
            'Medicina de Emergencias',
            'Medicina Preventiva',
            'Nutrición Animal',
            'Comportamiento Animal'
        ];
    }

    // Manejar errores
    handleError(error) {
        if (error.response) {
            const { status, data } = error.response;

            switch (status) {
                case 400:
                    return {
                        error: data.message || 'Datos inválidos',
                        status: 400,
                        validationErrors: data.errors || {}
                    };
                case 404:
                    return {
                        error: 'Usuario no encontrado',
                        status: 404
                    };
                case 409:
                    return {
                        error: data.message || 'El usuario ya existe',
                        status: 409
                    };
                default:
                    return {
                        error: data.message || 'Error en el servidor',
                        status: status
                    };
            }
        }

        return {
            error: error.message || 'Error de conexión',
            status: 0
        };
    }
}

const usuariosService = new UsuariosService();
export default usuariosService;