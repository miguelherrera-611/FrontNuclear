import { apiRequest } from './api';

class CitasService {
    constructor() {
        this.baseUrl = '/agenda';
    }

    // Obtener todas las citas
    async getCitas(filters = {}) {
        try {
            const params = new URLSearchParams();

            // Agregar filtros a los parámetros
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

    // Obtener cita por ID
    async getCitaById(id) {
        try {
            const response = await apiRequest.get(`${this.baseUrl}/${id}`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Crear nueva cita
    async createCita(citaData) {
        try {
            const response = await apiRequest.post(this.baseUrl, citaData);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Actualizar cita
    async updateCita(id, citaData) {
        try {
            const response = await apiRequest.put(`${this.baseUrl}/${id}`, citaData);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Eliminar cita
    async deleteCita(id) {
        try {
            const response = await apiRequest.delete(`${this.baseUrl}/${id}`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Cancelar cita
    async cancelarCita(id, motivo = '') {
        try {
            const response = await apiRequest.patch(`${this.baseUrl}/${id}/cancelar`, {
                motivo
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Confirmar cita
    async confirmarCita(id) {
        try {
            const response = await apiRequest.patch(`${this.baseUrl}/${id}/confirmar`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Completar cita
    async completarCita(id, notas = '') {
        try {
            const response = await apiRequest.patch(`${this.baseUrl}/${id}/completar`, {
                notas
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Reprogramar cita
    async reprogramarCita(id, nuevaFecha, nuevaHora) {
        try {
            const response = await apiRequest.patch(`${this.baseUrl}/${id}/reprogramar`, {
                fecha: nuevaFecha,
                hora: nuevaHora
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Obtener citas por usuario
    async getCitasByUsuario(usuarioId) {
        try {
            const response = await apiRequest.get(`${this.baseUrl}/usuario/${usuarioId}`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Obtener citas por veterinario
    async getCitasByVeterinario(veterinarioId, fecha = null) {
        try {
            const url = fecha
                ? `${this.baseUrl}/veterinario/${veterinarioId}?fecha=${fecha}`
                : `${this.baseUrl}/veterinario/${veterinarioId}`;

            const response = await apiRequest.get(url);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Obtener citas por mascota
    async getCitasByMascota(mascotaId) {
        try {
            const response = await apiRequest.get(`${this.baseUrl}/mascota/${mascotaId}`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Obtener citas del día
    async getCitasDelDia(fecha = null) {
        try {
            const fechaParam = fecha || new Date().toISOString().split('T')[0];
            const response = await apiRequest.get(`${this.baseUrl}/dia/${fechaParam}`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Obtener citas de la semana
    async getCitasDeLaSemana(fechaInicio = null) {
        try {
            const url = fechaInicio
                ? `${this.baseUrl}/semana?inicio=${fechaInicio}`
                : `${this.baseUrl}/semana`;

            const response = await apiRequest.get(url);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Verificar disponibilidad
    async verificarDisponibilidad(veterinarioId, fecha, hora) {
        try {
            const response = await apiRequest.get(
                `${this.baseUrl}/disponibilidad/${veterinarioId}?fecha=${fecha}&hora=${hora}`
            );
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Obtener horarios disponibles
    async getHorariosDisponibles(veterinarioId, fecha) {
        try {
            const response = await apiRequest.get(
                `${this.baseUrl}/horarios-disponibles/${veterinarioId}?fecha=${fecha}`
            );
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Obtener estadísticas de citas
    async getEstadisticas(periodo = 'mes') {
        try {
            const response = await apiRequest.get(`${this.baseUrl}/estadisticas?periodo=${periodo}`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Buscar citas
    async buscarCitas(termino) {
        try {
            const response = await apiRequest.get(`${this.baseUrl}/buscar?q=${encodeURIComponent(termino)}`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Exportar citas a PDF
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

            // Crear URL del blob y descargar
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `citas_${new Date().toISOString().split('T')[0]}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            return { success: true };
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Obtener tipos de servicios
    async getTiposServicios() {
        try {
            const response = await apiRequest.get('/servicios');
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Obtener recordatorios de citas
    async getRecordatorios() {
        try {
            const response = await apiRequest.get(`${this.baseUrl}/recordatorios`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Enviar recordatorio de cita
    async enviarRecordatorio(citaId) {
        try {
            const response = await apiRequest.post(`${this.baseUrl}/${citaId}/recordatorio`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Obtener comentarios de una cita
    async getComentarios(citaId) {
        try {
            const response = await apiRequest.get(`${this.baseUrl}/${citaId}/comentarios`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Agregar comentario a una cita
    async agregarComentario(citaId, comentario) {
        try {
            const response = await apiRequest.post(`${this.baseUrl}/${citaId}/comentarios`, {
                comentario
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Validar datos de cita
    validateCitaData(citaData) {
        const errors = {};

        if (!citaData.mascotaId) {
            errors.mascotaId = 'Debe seleccionar una mascota';
        }

        if (!citaData.veterinarioId) {
            errors.veterinarioId = 'Debe seleccionar un veterinario';
        }

        if (!citaData.fecha) {
            errors.fecha = 'Debe seleccionar una fecha';
        } else {
            const fecha = new Date(citaData.fecha);
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);

            if (fecha < hoy) {
                errors.fecha = 'La fecha no puede ser anterior a hoy';
            }
        }

        if (!citaData.hora) {
            errors.hora = 'Debe seleccionar una hora';
        }

        if (!citaData.tipoServicio) {
            errors.tipoServicio = 'Debe seleccionar un tipo de servicio';
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
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
                        error: 'Cita no encontrada',
                        status: 404
                    };
                case 409:
                    return {
                        error: data.message || 'Conflicto de horario',
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

const citasService = new CitasService();
export default citasService;