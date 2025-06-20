import { apiRequest } from './api';

class MascotasService {
    constructor() {
        this.baseUrl = '/api/mascotas';
    }

    // Obtener todas las mascotas
    async getMascotas(filters = {}) {
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

    // Obtener mascota por ID
    async getMascotaById(id) {
        try {
            const response = await apiRequest.get(`${this.baseUrl}/${id}`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Crear nueva mascota
    async createMascota(mascotaData) {
        try {
            const response = await apiRequest.post(this.baseUrl, mascotaData);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Actualizar mascota
    async updateMascota(id, mascotaData) {
        try {
            const response = await apiRequest.put(`${this.baseUrl}/${id}`, mascotaData);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Eliminar mascota
    async deleteMascota(id) {
        try {
            const response = await apiRequest.delete(`${this.baseUrl}/${id}`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Obtener mascotas por propietario
    async getMascotasByPropietario(propietarioId) {
        try {
            const response = await apiRequest.get(`${this.baseUrl}/propietario/${propietarioId}`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Buscar mascotas
    async buscarMascotas(termino) {
        try {
            const response = await apiRequest.get(`${this.baseUrl}/buscar?q=${encodeURIComponent(termino)}`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Subir foto de mascota
    async subirFoto(mascotaId, file) {
        try {
            const formData = new FormData();
            formData.append('foto', file);

            const response = await apiRequest.post(`${this.baseUrl}/${mascotaId}/foto`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Obtener historial médico de la mascota
    async getHistorialMedico(mascotaId) {
        try {
            const response = await apiRequest.get(`${this.baseUrl}/${mascotaId}/historial`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Obtener vacunas de la mascota
    async getVacunas(mascotaId) {
        try {
            const response = await apiRequest.get(`${this.baseUrl}/${mascotaId}/vacunas`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Agregar vacuna
    async agregarVacuna(mascotaId, vacunaData) {
        try {
            const response = await apiRequest.post(`${this.baseUrl}/${mascotaId}/vacunas`, vacunaData);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Obtener tratamientos de la mascota
    async getTratamientos(mascotaId) {
        try {
            const response = await apiRequest.get(`${this.baseUrl}/${mascotaId}/tratamientos`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Agregar tratamiento
    async agregarTratamiento(mascotaId, tratamientoData) {
        try {
            const response = await apiRequest.post(`${this.baseUrl}/${mascotaId}/tratamientos`, tratamientoData);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Obtener citas de la mascota
    async getCitas(mascotaId) {
        try {
            const response = await apiRequest.get(`${this.baseUrl}/${mascotaId}/citas`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Obtener estadísticas de mascotas
    async getEstadisticas() {
        try {
            const response = await apiRequest.get(`${this.baseUrl}/estadisticas`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Obtener especies disponibles
    async getEspecies() {
        try {
            const response = await apiRequest.get(`${this.baseUrl}/especies`);
            return response.data;
        } catch (error) {
            return [
                'Perro', 'Gato', 'Conejo', 'Hámster', 'Ave', 'Pez', 'Reptil', 'Otro'
            ];
        }
    }

    // Obtener razas por especie
    async getRazasByEspecie(especie) {
        try {
            const response = await apiRequest.get(`${this.baseUrl}/razas?especie=${encodeURIComponent(especie)}`);
            return response.data;
        } catch (error) {
            // Razas por defecto si no hay conexión con el backend
            const razasDefault = {
                'Perro': ['Labrador', 'Golden Retriever', 'Pastor Alemán', 'Bulldog', 'Beagle', 'Poodle', 'Rottweiler', 'Mestizo', 'Otro'],
                'Gato': ['Persa', 'Siamés', 'Maine Coon', 'Bengalí', 'Ragdoll', 'British Shorthair', 'Mestizo', 'Otro'],
                'Conejo': ['Holandés', 'Lop', 'Angora', 'Rex', 'Otro'],
                'Ave': ['Canario', 'Periquito', 'Cockatiel', 'Loro', 'Otro'],
                'Pez': ['Dorado', 'Betta', 'Guppy', 'Tetra', 'Otro'],
                'Reptil': ['Iguana', 'Gecko', 'Tortuga', 'Serpiente', 'Otro']
            };

            return razasDefault[especie] || ['Otro'];
        }
    }

    // Calcular edad de la mascota
    calcularEdad(fechaNacimiento) {
        const nacimiento = new Date(fechaNacimiento);
        const hoy = new Date();

        let años = hoy.getFullYear() - nacimiento.getFullYear();
        let meses = hoy.getMonth() - nacimiento.getMonth();

        if (meses < 0) {
            años--;
            meses += 12;
        }

        if (años === 0) {
            return `${meses} ${meses === 1 ? 'mes' : 'meses'}`;
        } else if (años === 1 && meses === 0) {
            return '1 año';
        } else if (meses === 0) {
            return `${años} ${años === 1 ? 'año' : 'años'}`;
        } else {
            return `${años} ${años === 1 ? 'año' : 'años'} y ${meses} ${meses === 1 ? 'mes' : 'meses'}`;
        }
    }

    // Validar datos de mascota
    validateMascotaData(mascotaData) {
        const errors = {};

        if (!mascotaData.nombre || mascotaData.nombre.trim().length < 2) {
            errors.nombre = 'El nombre debe tener al menos 2 caracteres';
        }

        if (!mascotaData.especie) {
            errors.especie = 'Debe seleccionar una especie';
        }

        if (!mascotaData.raza) {
            errors.raza = 'Debe seleccionar una raza';
        }

        if (!mascotaData.fechaNacimiento) {
            errors.fechaNacimiento = 'Debe ingresar la fecha de nacimiento';
        } else {
            const fecha = new Date(mascotaData.fechaNacimiento);
            const hoy = new Date();

            if (fecha > hoy) {
                errors.fechaNacimiento = 'La fecha de nacimiento no puede ser futura';
            }
        }

        if (!mascotaData.sexo) {
            errors.sexo = 'Debe seleccionar el sexo';
        }

        if (!mascotaData.propietarioId) {
            errors.propietarioId = 'Debe asignar un propietario';
        }

        if (mascotaData.peso && (isNaN(mascotaData.peso) || mascotaData.peso <= 0)) {
            errors.peso = 'El peso debe ser un número positivo';
        }

        if (mascotaData.microchip && mascotaData.microchip.length > 15) {
            errors.microchip = 'El número de microchip no puede tener más de 15 caracteres';
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }

    // Exportar mascotas a PDF
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
            link.setAttribute('download', `mascotas_${new Date().toISOString().split('T')[0]}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            return { success: true };
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Verificar si la mascota tiene citas pendientes
    async tieneCitasPendientes(mascotaId) {
        try {
            const response = await apiRequest.get(`${this.baseUrl}/${mascotaId}/citas-pendientes`);
            return response.data.tieneCitas;
        } catch (error) {
            return false;
        }
    }

    // Obtener próximas vacunas por vencer
    async getProximasVacunas(mascotaId) {
        try {
            const response = await apiRequest.get(`${this.baseUrl}/${mascotaId}/proximas-vacunas`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Marcar mascota como perdida/encontrada
    async marcarPerdida(mascotaId, estado, detalles = '') {
        try {
            const response = await apiRequest.patch(`${this.baseUrl}/${mascotaId}/perdida`, {
                estado,
                detalles
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
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
                        error: 'Mascota no encontrada',
                        status: 404
                    };
                case 409:
                    return {
                        error: data.message || 'La mascota ya existe',
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

const mascotasService = new MascotasService();
export default mascotasService;