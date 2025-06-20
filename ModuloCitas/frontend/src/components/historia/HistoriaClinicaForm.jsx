import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import {
    FileText,
    Save,
    ArrowLeft,
    Calendar,
    User,
    Stethoscope,
    Heart,
    AlertCircle,
    Clock
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useApp } from '../../../context/AppContext';
import LoadingSpinner from '../../common/LoadingSpinner';
import ConfirmModal, { useConfirmModal } from '../../common/ConfirmModal';
import { apiRequest } from '../../../services/api';
import { formatDate, formatTime } from '../../../utils/helpers';
import toast from 'react-hot-toast';

const HistoriaClinicaForm = () => {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const isEditing = Boolean(id);
    const navigate = useNavigate();
    const { user, hasRole } = useAuth();
    const { setCurrentPage } = useApp();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [citas, setCitas] = useState([]);
    const [mascotas, setMascotas] = useState([]);
    const [selectedCita, setSelectedCita] = useState(null);
    const [selectedMascota, setSelectedMascota] = useState(null);
    const { showConfirm, ConfirmModal } = useConfirmModal();

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors, isDirty },
        reset
    } = useForm({
        defaultValues: {
            idCita: searchParams.get('citaId') || '',
            idVeterinario: hasRole('veterinario') ? user.id : '',
            idPaciente: searchParams.get('mascotaId') || '',
            motivo: '',
            diagnostico: '',
            tratamiento: '',
            proceder: '',
            observaciones: ''
        }
    });

    const watchedCita = watch('idCita');
    const watchedPaciente = watch('idPaciente');

    // Configurar página actual
    useEffect(() => {
        setCurrentPage(isEditing ? 'Editar Historia Clínica' : 'Nueva Historia Clínica');
    }, [setCurrentPage, isEditing]);

    // Cargar datos iniciales
    useEffect(() => {
        loadInitialData();
    }, [id, user]);

    // Cargar información de cita cuando cambie
    useEffect(() => {
        if (watchedCita) {
            loadCitaInfo(watchedCita);
        }
    }, [watchedCita]);

    // Cargar información de mascota cuando cambie
    useEffect(() => {
        if (watchedPaciente) {
            loadMascotaInfo(watchedPaciente);
        }
    }, [watchedPaciente]);

    const loadInitialData = async () => {
        try {
            setLoading(true);

            await Promise.all([
                loadCitas(),
                loadMascotas()
            ]);

            if (isEditing) {
                await loadHistoriaClinica();
            } else {
                // Si viene de una cita específica, cargar sus datos
                const citaId = searchParams.get('citaId');
                if (citaId) {
                    setValue('idCita', citaId);
                    await loadCitaInfo(citaId);
                }

                // Si viene de una mascota específica
                const mascotaId = searchParams.get('mascotaId');
                if (mascotaId) {
                    setValue('idPaciente', mascotaId);
                    await loadMascotaInfo(mascotaId);
                }
            }
        } catch (error) {
            console.error('Error loading initial data:', error);
            toast.error('Error al cargar los datos');
        } finally {
            setLoading(false);
        }
    };

    const loadCitas = async () => {
        try {
            let citasData;

            if (hasRole('veterinario')) {
                // Veterinario ve solo sus citas completadas
                const response = await apiRequest.get(`/agenda/cita/veterinario/${user.id}`);
                citasData = response.data.filter(cita =>
                    cita.estado === 'ATENDIDA' || cita.estado === 'completada'
                );
            } else if (hasRole('admin')) {
                // Admin ve todas las citas completadas
                const response = await apiRequest.get('/agenda/cita/allCitas');
                citasData = response.data.filter(cita =>
                    cita.estado === 'ATENDIDA' || cita.estado === 'completada'
                );
            } else {
                citasData = [];
            }

            setCitas(citasData);
        } catch (error) {
            console.error('Error loading citas:', error);
            setCitas([]);
        }
    };

    const loadMascotas = async () => {
        try {
            const response = await apiRequest.get('/api/mascotas');
            setMascotas(response.data);
        } catch (error) {
            console.error('Error loading mascotas:', error);
            setMascotas([]);
        }
    };

    const loadCitaInfo = async (citaId) => {
        try {
            const response = await apiRequest.get(`/agenda/cita/${citaId}`);
            const citaInfo = response.data;

            setSelectedCita(citaInfo);

            // Auto-completar campos basados en la cita
            setValue('idVeterinario', citaInfo.idVeterinario);
            setValue('idPaciente', citaInfo.idPaciente);

            if (citaInfo.motivo) {
                setValue('motivo', citaInfo.motivo);
            }

            // Cargar info de la mascota
            await loadMascotaInfo(citaInfo.idPaciente);
        } catch (error) {
            console.error('Error loading cita info:', error);
            setSelectedCita(null);
        }
    };

    const loadMascotaInfo = async (mascotaId) => {
        try {
            const response = await apiRequest.get(`/api/mascotas/${mascotaId}`);
            setSelectedMascota(response.data);
        } catch (error) {
            console.error('Error loading mascota info:', error);
            setSelectedMascota(null);
        }
    };

    const loadHistoriaClinica = async () => {
        try {
            const response = await apiRequest.get(`/historiaClinica/historia/${id}`);
            const historia = response.data;

            // Verificar permisos
            if (hasRole('veterinario') && historia.idVeterinario !== user.id) {
                toast.error('No tienes permisos para editar esta historia clínica');
                navigate('/historia-clinica');
                return;
            }

            // Cargar datos en el formulario
            reset({
                idCita: historia.idCita || '',
                idVeterinario: historia.idVeterinario,
                idPaciente: historia.idPaciente,
                motivo: historia.motivo || '',
                diagnostico: historia.diagnostico || '',
                tratamiento: historia.tratamiento || '',
                proceder: historia.proceder || '',
                observaciones: historia.observaciones || ''
            });

            // Cargar información relacionada
            if (historia.idCita) {
                await loadCitaInfo(historia.idCita);
            }
            if (historia.idPaciente) {
                await loadMascotaInfo(historia.idPaciente);
            }
        } catch (error) {
            console.error('Error loading historia clinica:', error);
            toast.error('Error al cargar la historia clínica');
            navigate('/historia-clinica');
        }
    };

    const onSubmit = async (data) => {
        try {
            setSaving(true);

            // Validaciones
            if (!data.idPaciente) {
                toast.error('Debe seleccionar una mascota');
                return;
            }

            if (!data.motivo.trim()) {
                toast.error('Debe especificar el motivo de consulta');
                return;
            }

            if (!data.diagnostico.trim()) {
                toast.error('Debe especificar un diagnóstico');
                return;
            }

            // Preparar datos para envío
            const historiaData = {
                ...data,
                fecha: new Date().toISOString().split('T')[0],
                hora: new Date().toTimeString().split(' ')[0].substring(0, 5),
                idVeterinario: hasRole('veterinario') ? user.id : data.idVeterinario
            };

            if (isEditing) {
                await apiRequest.put(`/historiaClinica/editar/${id}`, historiaData);
                toast.success('Historia clínica actualizada exitosamente');
            } else {
                await apiRequest.post('/historiaClinica/crear', historiaData);
                toast.success('Historia clínica creada exitosamente');
            }

            navigate('/historia-clinica');
        } catch (error) {
            console.error('Error saving historia clinica:', error);
            const errorMessage = error.response?.data?.message || 'Error al guardar la historia clínica';
            toast.error(errorMessage);
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        if (isDirty) {
            showConfirm({
                title: 'Cancelar cambios',
                message: '¿Estás seguro de que deseas cancelar? Los cambios no guardados se perderán.',
                confirmText: 'Sí, cancelar',
                cancelText: 'Continuar editando',
                type: 'warning',
                onConfirm: () => navigate('/historia-clinica')
            });
        } else {
            navigate('/historia-clinica');
        }
    };

    if (loading) {
        return <LoadingSpinner text={isEditing ? 'Cargando historia clínica...' : 'Cargando formulario...'} />;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between"
            >
                <div className="flex items-center space-x-4">
                    <button
                        onClick={handleCancel}
                        className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {isEditing ? 'Editar Historia Clínica' : 'Nueva Historia Clínica'}
                        </h1>
                        <p className="text-sm text-gray-500">
                            {isEditing ? 'Modifica la información de la historia clínica' : 'Registra una nueva historia clínica'}
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Formulario */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200"
            >
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-8">

                    {/* Información de la cita (si aplica) */}
                    {selectedCita && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h3 className="text-lg font-medium text-blue-900 mb-2 flex items-center">
                                <Calendar className="w-5 h-5 mr-2" />
                                Información de la Cita
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div>
                                    <span className="font-medium text-blue-800">Fecha:</span>
                                    <p className="text-blue-700">{formatDate(selectedCita.fecha)}</p>
                                </div>
                                <div>
                                    <span className="font-medium text-blue-800">Hora:</span>
                                    <p className="text-blue-700">{formatTime(selectedCita.hora)}</p>
                                </div>
                                <div>
                                    <span className="font-medium text-blue-800">Estado:</span>
                                    <p className="text-blue-700">{selectedCita.estado}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Selección de cita */}
                    <div className="border-b border-gray-200 pb-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                            <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                            Cita Asociada (Opcional)
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="form-group">
                                <label className="form-label">
                                    Cita
                                </label>
                                <select
                                    {...register('idCita')}
                                    className="input"
                                >
                                    <option value="">Seleccionar cita (opcional)...</option>
                                    {citas.map(cita => (
                                        <option key={cita.idCita} value={cita.idCita}>
                                            {formatDate(cita.fecha)} - {formatTime(cita.hora)} - {cita.motivo}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-500 mt-1">
                                    Selecciona una cita si esta historia clínica está relacionada con una consulta específica
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Información del paciente */}
                    <div className="border-b border-gray-200 pb-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                            <Heart className="w-5 h-5 mr-2 text-pink-600" />
                            Paciente
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="form-group">
                                <label className="form-label">
                                    Mascota *
                                </label>
                                <select
                                    {...register('idPaciente', {
                                        required: 'Debe seleccionar una mascota'
                                    })}
                                    className={`input ${errors.idPaciente ? 'input-error' : ''}`}
                                >
                                    <option value="">Seleccionar mascota...</option>
                                    {mascotas.map(mascota => (
                                        <option key={mascota.id} value={mascota.id}>
                                            {mascota.nombre} - {mascota.especie} ({mascota.propietario?.nombre})
                                        </option>
                                    ))}
                                </select>
                                {errors.idPaciente && (
                                    <p className="form-error">{errors.idPaciente.message}</p>
                                )}
                            </div>

                            {selectedMascota && (
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <h4 className="text-sm font-medium text-gray-900 mb-2">Información del Paciente</h4>
                                    <div className="space-y-1 text-sm text-gray-600">
                                        <p><strong>Especie:</strong> {selectedMascota.especie}</p>
                                        <p><strong>Raza:</strong> {selectedMascota.raza}</p>
                                        <p><strong>Propietario:</strong> {selectedMascota.propietario?.nombre}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Información del veterinario */}
                    {hasRole('admin') && (
                        <div className="border-b border-gray-200 pb-6">
                            <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                <Stethoscope className="w-5 h-5 mr-2 text-green-600" />
                                Veterinario
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="form-group">
                                    <label className="form-label">
                                        Veterinario *
                                    </label>
                                    <select
                                        {...register('idVeterinario', {
                                            required: 'Debe seleccionar un veterinario'
                                        })}
                                        className={`input ${errors.idVeterinario ? 'input-error' : ''}`}
                                    >
                                        <option value="">Seleccionar veterinario...</option>
                                        {/* Aquí cargarías la lista de veterinarios */}
                                    </select>
                                    {errors.idVeterinario && (
                                        <p className="form-error">{errors.idVeterinario.message}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Información médica */}
                    <div>
                        <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                            <FileText className="w-5 h-5 mr-2 text-purple-600" />
                            Información Médica
                        </h2>

                        <div className="space-y-6">

                            {/* Motivo de consulta */}
                            <div className="form-group">
                                <label className="form-label">
                                    Motivo de Consulta *
                                </label>
                                <textarea
                                    {...register('motivo', {
                                        required: 'El motivo de consulta es requerido',
                                        minLength: {
                                            value: 10,
                                            message: 'El motivo debe tener al menos 10 caracteres'
                                        }
                                    })}
                                    rows={3}
                                    className={`input resize-none ${errors.motivo ? 'input-error' : ''}`}
                                    placeholder="Describe el motivo por el cual se realizó la consulta..."
                                />
                                {errors.motivo && (
                                    <p className="form-error">{errors.motivo.message}</p>
                                )}
                            </div>

                            {/* Diagnóstico */}
                            <div className="form-group">
                                <label className="form-label">
                                    Diagnóstico *
                                </label>
                                <textarea
                                    {...register('diagnostico', {
                                        required: 'El diagnóstico es requerido',
                                        minLength: {
                                            value: 10,
                                            message: 'El diagnóstico debe tener al menos 10 caracteres'
                                        }
                                    })}
                                    rows={4}
                                    className={`input resize-none ${errors.diagnostico ? 'input-error' : ''}`}
                                    placeholder="Escribe el diagnóstico médico del paciente..."
                                />
                                {errors.diagnostico && (
                                    <p className="form-error">{errors.diagnostico.message}</p>
                                )}
                            </div>

                            {/* Tratamiento */}
                            <div className="form-group">
                                <label className="form-label">
                                    Tratamiento
                                </label>
                                <textarea
                                    {...register('tratamiento')}
                                    rows={4}
                                    className="input resize-none"
                                    placeholder="Describe el tratamiento prescrito (medicamentos, dosis, frecuencia, etc.)..."
                                />
                            </div>

                            {/* Proceder */}
                            <div className="form-group">
                                <label className="form-label">
                                    Proceder
                                </label>
                                <textarea
                                    {...register('proceder')}
                                    rows={3}
                                    className="input resize-none"
                                    placeholder="Describe los procedimientos realizados o recomendados..."
                                />
                            </div>

                            {/* Observaciones */}
                            <div className="form-group">
                                <label className="form-label">
                                    Observaciones
                                </label>
                                <textarea
                                    {...register('observaciones')}
                                    rows={3}
                                    className="input resize-none"
                                    placeholder="Observaciones adicionales, recomendaciones, seguimiento..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Información importante */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-start">
                            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                            <div>
                                <h3 className="text-sm font-medium text-yellow-900 mb-1">
                                    Información importante
                                </h3>
                                <ul className="text-sm text-yellow-800 space-y-1">
                                    <li>• Esta historia clínica será registrada con la fecha y hora actual</li>
                                    <li>• Se enviará automáticamente una copia al propietario de la mascota</li>
                                    <li>• Toda la información será confidencial y solo accesible por personal autorizado</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="btn-secondary"
                            disabled={saving}
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            className="btn-primary flex items-center"
                            disabled={saving}
                        >
                            {saving ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    {isEditing ? 'Actualizar Historia' : 'Crear Historia Clínica'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </motion.div>

            {/* Modal de confirmación */}
            <ConfirmModal />
        </div>
    );
};

export default HistoriaClinicaForm;