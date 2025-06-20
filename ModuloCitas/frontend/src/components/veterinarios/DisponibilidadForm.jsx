import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { motion } from 'framer-motion';
import {
    Clock,
    Calendar,
    Save,
    Plus,
    Trash2,
    ArrowLeft,
    AlertCircle,
    CheckCircle
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useApp } from '../../../context/AppContext';
import LoadingSpinner from '../../common/LoadingSpinner';
import ConfirmModal, { useConfirmModal } from '../../common/ConfirmModal';
import usuariosService from '../../../services/usuariosService';
import { DIAS_SEMANA, HORARIOS_TRABAJO } from '../../../utils/constants';
import toast from 'react-hot-toast';

const DisponibilidadForm = () => {
    const navigate = useNavigate();
    const { user, hasRole } = useAuth();
    const { setCurrentPage } = useApp();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [disponibilidadActual, setDisponibilidadActual] = useState([]);
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
            disponibilidades: DIAS_SEMANA.map(dia => ({
                dia: dia.value,
                activo: false,
                horaInicio: '08:00',
                horaFin: '18:00',
                pausaInicio: '12:00',
                pausaFin: '13:00'
            }))
        }
    });

    const { fields, update } = useFieldArray({
        control,
        name: 'disponibilidades'
    });

    // Configurar página actual
    useEffect(() => {
        setCurrentPage('Disponibilidad');
    }, [setCurrentPage]);

    // Cargar disponibilidad actual
    useEffect(() => {
        loadDisponibilidad();
    }, [user]);

    const loadDisponibilidad = async () => {
        try {
            setLoading(true);

            const veterinarioId = hasRole('veterinario') ? user.id : user.id;
            const disponibilidad = await usuariosService.getDisponibilidadVeterinario(veterinarioId);

            if (disponibilidad && disponibilidad.length > 0) {
                setDisponibilidadActual(disponibilidad);

                // Mapear la disponibilidad a la estructura del formulario
                const disponibilidadMap = disponibilidad.reduce((acc, disp) => {
                    acc[disp.dia] = disp;
                    return acc;
                }, {});

                const formData = DIAS_SEMANA.map(dia => {
                    const dispExistente = disponibilidadMap[dia.value];
                    return {
                        dia: dia.value,
                        activo: !!dispExistente,
                        horaInicio: dispExistente?.horaInicio || '08:00',
                        horaFin: dispExistente?.horaFin || '18:00',
                        pausaInicio: dispExistente?.pausaInicio || '12:00',
                        pausaFin: dispExistente?.pausaFin || '13:00'
                    };
                });

                reset({ disponibilidades: formData });
            }
        } catch (error) {
            console.error('Error loading disponibilidad:', error);
            toast.error('Error al cargar la disponibilidad');
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data) => {
        try {
            setSaving(true);

            // Filtrar solo los días activos
            const disponibilidadesActivas = data.disponibilidades.filter(disp => disp.activo);

            // Validar horarios
            const validationErrors = validateHorarios(disponibilidadesActivas);
            if (validationErrors.length > 0) {
                validationErrors.forEach(error => toast.error(error));
                return;
            }

            const veterinarioId = hasRole('veterinario') ? user.id : user.id;
            await usuariosService.updateDisponibilidadVeterinario(veterinarioId, {
                disponibilidades: disponibilidadesActivas
            });

            toast.success('Disponibilidad actualizada exitosamente');

            if (hasRole('admin')) {
                navigate('/veterinarios');
            } else {
                navigate('/dashboard');
            }
        } catch (error) {
            console.error('Error saving disponibilidad:', error);
            const errorMessage = error.error || 'Error al guardar la disponibilidad';
            toast.error(errorMessage);
        } finally {
            setSaving(false);
        }
    };

    const validateHorarios = (disponibilidades) => {
        const errors = [];

        disponibilidades.forEach((disp, index) => {
            const horaInicio = new Date(`2000-01-01T${disp.horaInicio}`);
            const horaFin = new Date(`2000-01-01T${disp.horaFin}`);
            const pausaInicio = new Date(`2000-01-01T${disp.pausaInicio}`);
            const pausaFin = new Date(`2000-01-01T${disp.pausaFin}`);

            // Validar que hora fin sea mayor que hora inicio
            if (horaFin <= horaInicio) {
                errors.push(`${getDiaLabel(disp.dia)}: La hora de fin debe ser mayor que la hora de inicio`);
            }

            // Validar pausa
            if (pausaInicio >= pausaFin) {
                errors.push(`${getDiaLabel(disp.dia)}: La hora de fin de pausa debe ser mayor que la hora de inicio`);
            }

            // Validar que la pausa esté dentro del horario de trabajo
            if (pausaInicio <= horaInicio || pausaFin >= horaFin) {
                errors.push(`${getDiaLabel(disp.dia)}: La pausa debe estar dentro del horario de trabajo`);
            }
        });

        return errors;
    };

    const getDiaLabel = (diaValue) => {
        return DIAS_SEMANA.find(dia => dia.value === diaValue)?.label || diaValue;
    };

    const handleDiaToggle = (index, checked) => {
        update(index, { ...fields[index], activo: checked });
    };

    const handleCancel = () => {
        if (isDirty) {
            showConfirm({
                title: 'Cancelar cambios',
                message: '¿Estás seguro de que deseas cancelar? Los cambios no guardados se perderán.',
                confirmText: 'Sí, cancelar',
                cancelText: 'Continuar editando',
                type: 'warning',
                onConfirm: () => {
                    if (hasRole('admin')) {
                        navigate('/veterinarios');
                    } else {
                        navigate('/dashboard');
                    }
                }
            });
        } else {
            if (hasRole('admin')) {
                navigate('/veterinarios');
            } else {
                navigate('/dashboard');
            }
        }
    };

    if (loading) {
        return <LoadingSpinner text="Cargando disponibilidad..." />;
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
                            Configurar Disponibilidad
                        </h1>
                        <p className="text-sm text-gray-500">
                            Configura tus horarios de atención semanales
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Información importante */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-blue-50 border border-blue-200 rounded-lg p-4"
            >
                <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                        <h3 className="text-sm font-medium text-blue-900 mb-1">
                            Información importante
                        </h3>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li>• Los horarios configurados determinarán cuándo pueden agendarse citas contigo</li>
                            <li>• Puedes incluir una pausa para almuerzo en cada día</li>
                            <li>• Los cambios se aplicarán inmediatamente para nuevas citas</li>
                        </ul>
                    </div>
                </div>
            </motion.div>

            {/* Formulario */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200"
            >
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">

                    <div className="border-b border-gray-200 pb-4">
                        <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                            <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                            Horarios por Día
                        </h2>
                    </div>

                    <div className="space-y-6">
                        {fields.map((field, index) => {
                            const diaInfo = DIAS_SEMANA.find(dia => dia.value === field.dia);
                            const isActive = watch(`disponibilidades.${index}.activo`);

                            return (
                                <div
                                    key={field.id}
                                    className={`border rounded-lg p-4 transition-all ${
                                        isActive
                                            ? 'border-blue-200 bg-blue-50'
                                            : 'border-gray-200 bg-gray-50'
                                    }`}
                                >
                                    {/* Header del día */}
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center space-x-3">
                                            <input
                                                type="checkbox"
                                                checked={isActive}
                                                onChange={(e) => handleDiaToggle(index, e.target.checked)}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            />
                                            <h3 className={`text-lg font-medium ${
                                                isActive ? 'text-blue-900' : 'text-gray-500'
                                            }`}>
                                                {diaInfo?.label}
                                            </h3>
                                        </div>
                                        {isActive && (
                                            <div className="flex items-center text-green-600">
                                                <CheckCircle className="w-4 h-4 mr-1" />
                                                <span className="text-sm">Activo</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Horarios */}
                                    {isActive && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                            {/* Horario de trabajo */}
                                            <div className="space-y-3">
                                                <h4 className="text-sm font-medium text-gray-700 flex items-center">
                                                    <Clock className="w-4 h-4 mr-1" />
                                                    Horario de Trabajo
                                                </h4>

                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-500 mb-1">
                                                            Inicio
                                                        </label>
                                                        <select
                                                            {...register(`disponibilidades.${index}.horaInicio`)}
                                                            className="input text-sm"
                                                        >
                                                            {HORARIOS_TRABAJO.map(hora => (
                                                                <option key={hora} value={hora}>
                                                                    {hora}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-500 mb-1">
                                                            Fin
                                                        </label>
                                                        <select
                                                            {...register(`disponibilidades.${index}.horaFin`)}
                                                            className="input text-sm"
                                                        >
                                                            {HORARIOS_TRABAJO.map(hora => (
                                                                <option key={hora} value={hora}>
                                                                    {hora}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Pausa para almuerzo */}
                                            <div className="space-y-3">
                                                <h4 className="text-sm font-medium text-gray-700">
                                                    Pausa para Almuerzo
                                                </h4>

                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-500 mb-1">
                                                            Inicio
                                                        </label>
                                                        <select
                                                            {...register(`disponibilidades.${index}.pausaInicio`)}
                                                            className="input text-sm"
                                                        >
                                                            {HORARIOS_TRABAJO.map(hora => (
                                                                <option key={hora} value={hora}>
                                                                    {hora}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-500 mb-1">
                                                            Fin
                                                        </label>
                                                        <select
                                                            {...register(`disponibilidades.${index}.pausaFin`)}
                                                            className="input text-sm"
                                                        >
                                                            {HORARIOS_TRABAJO.map(hora => (
                                                                <option key={hora} value={hora}>
                                                                    {hora}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Resumen del día */}
                                    {isActive && (
                                        <div className="mt-3 pt-3 border-t border-blue-200">
                                            <p className="text-sm text-blue-700">
                                                <strong>Horario:</strong> {watch(`disponibilidades.${index}.horaInicio`)} - {watch(`disponibilidades.${index}.horaFin`)}
                                                {' | '}
                                                <strong>Pausa:</strong> {watch(`disponibilidades.${index}.pausaInicio`)} - {watch(`disponibilidades.${index}.pausaFin`)}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
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
                                    Guardar Disponibilidad
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

export default DisponibilidadForm;