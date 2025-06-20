import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { motion } from 'framer-motion';
import {
    Calendar,
    Clock,
    Heart,
    User,
    Stethoscope,
    FileText,
    Save,
    ArrowLeft,
    AlertCircle,
    CheckCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import LoadingSpinner from '../common/LoadingSpinner';
import ConfirmModal, { useConfirmModal } from '../common/ConfirmModal';
import citasService from '../../services/citasService';
import mascotasService from '../../services/mascotasService';
import usuariosService from '../../services/usuariosService';
import { TIPOS_SERVICIO, HORARIOS_TRABAJO } from '../../utils/constants';
import toast from 'react-hot-toast';

const CitaForm = () => {
    const { id } = useParams();
    const isEditing = Boolean(id);
    const navigate = useNavigate();
    const { user, hasRole } = useAuth();
    const { setCurrentPage } = useApp();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [mascotas, setMascotas] = useState([]);
    const [veterinarios, setVeterinarios] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [horariosDisponibles, setHorariosDisponibles] = useState([]);
    const [selectedVeterinario, setSelectedVeterinario] = useState('');
    const [selectedFecha, setSelectedFecha] = useState('');
    const { showConfirm, ConfirmModal } = useConfirmModal();

    const {
        control,
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors, isDirty },
        reset
    } = useForm({
        defaultValues: {
            mascotaId: '',
            veterinarioId: '',
            usuarioId: user?.id || '',
            fecha: '',
            hora: '',
            tipoServicio: '',
            notas: '',
            estado: 'pendiente'
        }
    });

    const watchedVeterinario = watch('veterinarioId');
    const watchedFecha = watch('fecha');

    // Configurar página actual
    useEffect(() => {
        setCurrentPage(isEditing ? 'Editar Cita' : 'Nueva Cita');
    }, [setCurrentPage, isEditing]);

    // Cargar datos iniciales
    useEffect(() => {
        loadInitialData();
    }, [id, user]);

    // Cargar horarios cuando cambie veterinario o fecha
    useEffect(() => {
        if (watchedVeterinario && watchedFecha) {
            loadHorariosDisponibles(watchedVeterinario, watchedFecha);
        } else {
            setHorariosDisponibles([]);
        }
    }, [watchedVeterinario, watchedFecha]);

    const loadInitialData = async () => {
        try {
            setLoading(true);

            await Promise.all([
                loadMascotas(),
                loadVeterinarios(),
                loadUsuarios()
            ]);

            if (isEditing) {
                await loadCita();
            }
        } catch (error) {
            console.error('Error loading initial data:', error);
            toast.error('Error al cargar los datos');
        } finally {
            setLoading(false);
        }
    };

    const loadMascotas = async () => {
        try {
            let mascotasData;

            if (hasRole('usuario')) {
                // Usuario solo ve sus mascotas
                mascotasData = await mascotasService.getMascotasByPropietario(user.id);
            } else {
                // Admin y veterinario ven todas las mascotas
                mascotasData = await mascotasService.getMascotas();
            }

            setMascotas(mascotasData);
        } catch (error) {
            console.error('Error loading mascotas:', error);
        }
    };

    const loadVeterinarios = async () => {
        try {
            const veterinariosData = await usuariosService.getVeterinarios(true);
            setVeterinarios(veterinariosData);
        } catch (error) {
            console.error('Error loading veterinarios:', error);
        }
    };

    const loadUsuarios = async () => {
        try {
            if (hasRole('admin') || hasRole('recepcionista')) {
                const usuariosData = await usuariosService.getUsuariosByRol('usuario');
                setUsuarios(usuariosData);
            }
        } catch (error) {
            console.error('Error loading usuarios:', error);
        }
    };

    const loadCita = async () => {
        try {
            const cita = await citasService.getCitaById(id);

            // Verificar permisos
            if (hasRole('usuario') && cita.usuarioId !== user.id) {
                toast.error('No tienes permisos para editar esta cita');
                navigate('/citas');
                return;
            }

            if (hasRole('veterinario') && cita.veterinarioId !== user.id) {
                toast.error('No tienes permisos para editar esta cita');
                navigate('/citas');
                return;
            }

            // Cargar datos en el formulario
            reset({
                mascotaId: cita.mascotaId,
                veterinarioId: cita.veterinarioId,
                usuarioId: cita.usuarioId,
                fecha: cita.fecha,
                hora: cita.hora,
                tipoServicio: cita.tipoServicio,
                notas: cita.notas || '',
                estado: cita.estado
            });

            setSelectedVeterinario(cita.veterinarioId);
            setSelectedFecha(cita.fecha);
        } catch (error) {
            console.error('Error loading cita:', error);
            toast.error('Error al cargar la cita');
            navigate('/citas');
        }
    };

    const loadHorariosDisponibles = async (veterinarioId, fecha) => {
        try {
            const horarios = await citasService.getHorariosDisponibles(veterinarioId, fecha);
            setHorariosDisponibles(horarios);
        } catch (error) {
            console.error('Error loading horarios:', error);
            setHorariosDisponibles(HORARIOS_TRABAJO); // Fallback a horarios por defecto
        }
    };

    const onSubmit = async (data) => {
        try {
            setSaving(true);

            // Validar disponibilidad antes de guardar
            if (!isEditing || (data.veterinarioId !== selectedVeterinario || data.fecha !== selectedFecha || data.hora !== watch('hora'))) {
                const disponible = await citasService.verificarDisponibilidad(
                    data.veterinarioId,
                    data.fecha,
                    data.hora
                );

                if (!disponible.disponible) {
                    toast.error('El horario seleccionado no está disponible');
                    return;
                }
            }

            if (isEditing) {
                await citasService.updateCita(id, data);
                toast.success('Cita actualizada exitosamente');
            } else {
                await citasService.createCita(data);
                toast.success('Cita creada exitosamente');
            }

            navigate('/citas');
        } catch (error) {
            console.error('Error saving cita:', error);
            const errorMessage = error.error || 'Error al guardar la cita';
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
                onConfirm: () => navigate('/citas')
            });
        } else {
            navigate('/citas');
        }
    };

    // Validar fecha mínima (hoy)
    const today = new Date().toISOString().split('T')[0];

    if (loading) {
        return <LoadingSpinner text={isEditing ? 'Cargando cita...' : 'Cargando formulario...'} />;
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
                            {isEditing ? 'Editar Cita' : 'Nueva Cita'}
                        </h1>
                        <p className="text-sm text-gray-500">
                            {isEditing ? 'Modifica los datos de la cita' : 'Programa una nueva cita veterinaria'}
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
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">

                    {/* Información del propietario */}
                    {(hasRole('admin') || hasRole('recepcionista')) && (
                        <div className="border-b border-gray-200 pb-6">
                            <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                <User className="w-5 h-5 mr-2 text-blue-600" />
                                Propietario
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="form-group">
                                    <label className="form-label">
                                        Propietario *
                                    </label>
                                    <select
                                        {...register('usuarioId', {
                                            required: 'Selecciona un propietario'
                                        })}
                                        className={`input ${errors.usuarioId ? 'input-error' : ''}`}
                                    >
                                        <option value="">Seleccionar propietario...</option>
                                        {usuarios.map(usuario => (
                                            <option key={usuario.id} value={usuario.id}>
                                                {usuario.nombre} - {usuario.email}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.usuarioId && (
                                        <p className="form-error">{errors.usuarioId.message}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Información de la mascota */}
                    <div className="border-b border-gray-200 pb-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                            <Heart className="w-5 h-5 mr-2 text-pink-600" />
                            Mascota
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="form-group">
                                <label className="form-label">
                                    Mascota *
                                </label>
                                <select
                                    {...register('mascotaId', {
                                        required: 'Selecciona una mascota'
                                    })}
                                    className={`input ${errors.mascotaId ? 'input-error' : ''}`}
                                >
                                    <option value="">Seleccionar mascota...</option>
                                    {mascotas.map(mascota => (
                                        <option key={mascota.id} value={mascota.id}>
                                            {mascota.nombre} - {mascota.especie} ({mascota.raza})
                                        </option>
                                    ))}
                                </select>
                                {errors.mascotaId && (
                                    <p className="form-error">{errors.mascotaId.message}</p>
                                )}

                                {mascotas.length === 0 && (
                                    <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                        <div className="flex items-center">
                                            <AlertCircle className="w-4 h-4 text-yellow-600 mr-2" />
                                            <span className="text-sm text-yellow-800">
                        No tienes mascotas registradas.{' '}
                                                <a href="/mascotas/nueva" className="underline hover:text-yellow-900">
                          Registra una mascota primero
                        </a>
                      </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Información del veterinario y servicio */}
                    <div className="border-b border-gray-200 pb-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                            <Stethoscope className="w-5 h-5 mr-2 text-green-600" />
                            Veterinario y Servicio
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="form-group">
                                <label className="form-label">
                                    Veterinario *
                                </label>
                                <select
                                    {...register('veterinarioId', {
                                        required: 'Selecciona un veterinario'
                                    })}
                                    className={`input ${errors.veterinarioId ? 'input-error' : ''}`}
                                    onChange={(e) => {
                                        setValue('veterinarioId', e.target.value);
                                        setSelectedVeterinario(e.target.value);
                                        setValue('hora', ''); // Limpiar hora cuando cambie veterinario
                                    }}
                                >
                                    <option value="">Seleccionar veterinario...</option>
                                    {veterinarios.map(veterinario => (
                                        <option key={veterinario.id} value={veterinario.id}>
                                            Dr. {veterinario.nombre} - {veterinario.especialidades?.join(', ')}
                                        </option>
                                    ))}
                                </select>
                                {errors.veterinarioId && (
                                    <p className="form-error">{errors.veterinarioId.message}</p>
                                )}
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    Tipo de Servicio *
                                </label>
                                <select
                                    {...register('tipoServicio', {
                                        required: 'Selecciona un tipo de servicio'
                                    })}
                                    className={`input ${errors.tipoServicio ? 'input-error' : ''}`}
                                >
                                    <option value="">Seleccionar servicio...</option>
                                    {Object.values(TIPOS_SERVICIO).map(servicio => (
                                        <option key={servicio} value={servicio}>
                                            {servicio.charAt(0).toUpperCase() + servicio.slice(1).replace('_', ' ')}
                                        </option>
                                    ))}
                                </select>
                                {errors.tipoServicio && (
                                    <p className="form-error">{errors.tipoServicio.message}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Fecha y hora */}
                    <div className="border-b border-gray-200 pb-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                            <Calendar className="w-5 h-5 mr-2 text-purple-600" />
                            Fecha y Hora
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="form-group">
                                <label className="form-label">
                                    Fecha *
                                </label>
                                <input
                                    type="date"
                                    min={today}
                                    {...register('fecha', {
                                        required: 'Selecciona una fecha',
                                        validate: value => {
                                            const selectedDate = new Date(value);
                                            const today = new Date();
                                            today.setHours(0, 0, 0, 0);
                                            return selectedDate >= today || 'La fecha no puede ser anterior a hoy';
                                        }
                                    })}
                                    className={`input ${errors.fecha ? 'input-error' : ''}`}
                                    onChange={(e) => {
                                        setValue('fecha', e.target.value);
                                        setSelectedFecha(e.target.value);
                                        setValue('hora', ''); // Limpiar hora cuando cambie fecha
                                    }}
                                />
                                {errors.fecha && (
                                    <p className="form-error">{errors.fecha.message}</p>
                                )}
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    Hora *
                                </label>
                                <select
                                    {...register('hora', {
                                        required: 'Selecciona una hora'
                                    })}
                                    className={`input ${errors.hora ? 'input-error' : ''}`}
                                    disabled={!watchedVeterinario || !watchedFecha}
                                >
                                    <option value="">
                                        {!watchedVeterinario || !watchedFecha
                                            ? 'Selecciona veterinario y fecha primero'
                                            : 'Seleccionar hora...'}
                                    </option>
                                    {horariosDisponibles.map(hora => (
                                        <option key={hora} value={hora}>
                                            {hora}
                                        </option>
                                    ))}
                                </select>
                                {errors.hora && (
                                    <p className="form-error">{errors.hora.message}</p>
                                )}

                                {watchedVeterinario && watchedFecha && horariosDisponibles.length === 0 && (
                                    <p className="text-sm text-yellow-600 mt-1">
                                        No hay horarios disponibles para esta fecha
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Notas adicionales */}
                    <div>
                        <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                            <FileText className="w-5 h-5 mr-2 text-gray-600" />
                            Información Adicional
                        </h2>

                        <div className="form-group">
                            <label className="form-label">
                                Notas o comentarios
                            </label>
                            <textarea
                                {...register('notas')}
                                rows={4}
                                className="input resize-none"
                                placeholder="Describe los síntomas, comportamiento o cualquier información relevante..."
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Esta información ayudará al veterinario a prepararse mejor para la consulta
                            </p>
                        </div>

                        {/* Estado (solo para admin/recepcionista en edición) */}
                        {isEditing && (hasRole('admin') || hasRole('recepcionista')) && (
                            <div className="form-group">
                                <label className="form-label">
                                    Estado de la Cita
                                </label>
                                <select
                                    {...register('estado')}
                                    className="input"
                                >
                                    <option value="pendiente">Pendiente</option>
                                    <option value="confirmada">Confirmada</option>
                                    <option value="en_curso">En Curso</option>
                                    <option value="completada">Completada</option>
                                    <option value="cancelada">Cancelada</option>
                                    <option value="no_asistio">No Asistió</option>
                                </select>
                            </div>
                        )}
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
                            disabled={saving || mascotas.length === 0}
                        >
                            {saving ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    {isEditing ? 'Actualizar Cita' : 'Crear Cita'}
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

export default CitaForm;