import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { motion } from 'framer-motion';
import {
    Stethoscope,
    Save,
    ArrowLeft,
    Camera,
    User,
    Mail,
    Phone,
    IdCard,
    Award,
    FileText,
    Upload,
    Eye,
    EyeOff,
    Calendar
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import LoadingSpinner from '../common/LoadingSpinner';
import ConfirmModal, { useConfirmModal } from '../common/ConfirmModal';
import usuariosService from '../../services/usuariosService';
import { formatFileSize, isValidEmail, isValidPhone } from '../../utils/helpers';
import toast from 'react-hot-toast';

const VeterinarioForm = () => {
    const { id } = useParams();
    const isEditing = Boolean(id);
    const navigate = useNavigate();
    const { user, hasRole } = useAuth();
    const { setCurrentPage } = useApp();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [photoPreview, setPhotoPreview] = useState('');
    const [photoFile, setPhotoFile] = useState(null);
    const [especialidadesDisponibles] = useState(usuariosService.getEspecialidadesVeterinarias());
    const { showConfirm, ConfirmModal } = useConfirmModal();

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        control,
        formState: { errors, isDirty },
        reset
    } = useForm({
        defaultValues: {
            username: '',
            email: '',
            password: '',
            confirmPassword: '',
            firstName: '',
            lastName: '',
            telefono: '',
            cedula: '',
            rol: 'veterinario',
            activo: true,
            numeroLicencia: '',
            especialidades: [],
            añosExperiencia: '',
            biografia: '',
            horarioEntrada: '08:00',
            horarioSalida: '18:00',
            diasTrabajo: ['lunes', 'martes', 'miercoles', 'jueves', 'viernes']
        }
    });

    const password = watch('password');

    // Configurar página actual
    useEffect(() => {
        setCurrentPage(isEditing ? 'Editar Veterinario' : 'Nuevo Veterinario');
    }, [setCurrentPage, isEditing]);

    // Verificar permisos
    useEffect(() => {
        if (!hasRole('admin')) {
            toast.error('No tienes permisos para acceder a esta página');
            navigate('/veterinarios');
        }
    }, [hasRole, navigate]);

    // Cargar datos iniciales
    useEffect(() => {
        loadInitialData();
    }, [id]);

    const loadInitialData = async () => {
        try {
            setLoading(true);

            if (isEditing) {
                await loadVeterinario();
            }
        } catch (error) {
            console.error('Error loading initial data:', error);
            toast.error('Error al cargar los datos');
        } finally {
            setLoading(false);
        }
    };

    const loadVeterinario = async () => {
        try {
            const veterinario = await usuariosService.getVeterinarioById(id);

            // Cargar datos en el formulario
            reset({
                username: veterinario.username,
                email: veterinario.email,
                firstName: veterinario.firstName,
                lastName: veterinario.lastName,
                telefono: veterinario.telefono,
                cedula: veterinario.cedula,
                rol: 'veterinario',
                activo: veterinario.activo,
                numeroLicencia: veterinario.numeroLicencia || '',
                especialidades: veterinario.especialidades || [],
                añosExperiencia: veterinario.añosExperiencia || '',
                biografia: veterinario.biografia || '',
                horarioEntrada: veterinario.horarioEntrada || '08:00',
                horarioSalida: veterinario.horarioSalida || '18:00',
                diasTrabajo: veterinario.diasTrabajo || ['lunes', 'martes', 'miercoles', 'jueves', 'viernes']
            });

            if (veterinario.foto) {
                setPhotoPreview(veterinario.foto);
            }
        } catch (error) {
            console.error('Error loading veterinario:', error);
            toast.error('Error al cargar el veterinario');
            navigate('/veterinarios');
        }
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validar tamaño
        if (file.size > 5 * 1024 * 1024) {
            toast.error('La imagen no puede ser mayor a 5MB');
            return;
        }

        // Validar tipo
        if (!file.type.startsWith('image/')) {
            toast.error('Solo se permiten archivos de imagen');
            return;
        }

        setPhotoFile(file);

        // Crear preview
        const reader = new FileReader();
        reader.onload = (e) => {
            setPhotoPreview(e.target.result);
        };
        reader.readAsDataURL(file);
    };

    const onSubmit = async (data) => {
        try {
            setSaving(true);

            // Validar datos
            const validation = usuariosService.validateVeterinarioData(data);
            if (!validation.isValid) {
                Object.keys(validation.errors).forEach(key => {
                    toast.error(validation.errors[key]);
                });
                return;
            }

            // Verificar disponibilidad de username/email si es necesario
            if (!isEditing || data.username !== watch('username')) {
                const usernameAvailable = await usuariosService.verificarDisponibilidad('username', data.username);
                if (!usernameAvailable.disponible) {
                    toast.error('El nombre de usuario ya está en uso');
                    return;
                }
            }

            if (!isEditing || data.email !== watch('email')) {
                const emailAvailable = await usuariosService.verificarDisponibilidad('email', data.email);
                if (!emailAvailable.disponible) {
                    toast.error('El email ya está en uso');
                    return;
                }
            }

            let veterinarioData;

            if (isEditing) {
                // Remover campos de contraseña si no se van a cambiar
                const { password, confirmPassword, ...updateData } = data;
                veterinarioData = await usuariosService.updateVeterinario(id, updateData);
                toast.success('Veterinario actualizado exitosamente');
            } else {
                veterinarioData = await usuariosService.createVeterinario(data);
                toast.success('Veterinario registrado exitosamente');
            }

            // Subir foto si hay una seleccionada
            if (photoFile && veterinarioData.id) {
                try {
                    await usuariosService.subirFotoPerfil(veterinarioData.id, photoFile);
                } catch (photoError) {
                    console.error('Error uploading photo:', photoError);
                    toast.warning('Veterinario guardado, pero hubo un error al subir la foto');
                }
            }

            navigate('/veterinarios');
        } catch (error) {
            console.error('Error saving veterinario:', error);
            const errorMessage = error.error || 'Error al guardar el veterinario';
            toast.error(errorMessage);
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        if (isDirty || photoFile) {
            showConfirm({
                title: 'Cancelar cambios',
                message: '¿Estás seguro de que deseas cancelar? Los cambios no guardados se perderán.',
                confirmText: 'Sí, cancelar',
                cancelText: 'Continuar editando',
                type: 'warning',
                onConfirm: () => navigate('/veterinarios')
            });
        } else {
            navigate('/veterinarios');
        }
    };

    const handleEspecialidadChange = (especialidad, checked) => {
        const currentEspecialidades = watch('especialidades') || [];

        if (checked) {
            setValue('especialidades', [...currentEspecialidades, especialidad], { shouldDirty: true });
        } else {
            setValue('especialidades', currentEspecialidades.filter(esp => esp !== especialidad), { shouldDirty: true });
        }
    };

    const handleDiaTrabajoChange = (dia, checked) => {
        const currentDias = watch('diasTrabajo') || [];

        if (checked) {
            setValue('diasTrabajo', [...currentDias, dia], { shouldDirty: true });
        } else {
            setValue('diasTrabajo', currentDias.filter(d => d !== dia), { shouldDirty: true });
        }
    };

    if (loading) {
        return <LoadingSpinner text={isEditing ? 'Cargando veterinario...' : 'Cargando formulario...'} />;
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
                            {isEditing ? 'Editar Veterinario' : 'Registrar Nuevo Veterinario'}
                        </h1>
                        <p className="text-sm text-gray-500">
                            {isEditing ? 'Modifica la información del veterinario' : 'Completa los datos del nuevo veterinario'}
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

                    {/* Foto de perfil */}
                    <div className="text-center">
                        <div className="w-32 h-32 mx-auto rounded-full overflow-hidden bg-gray-200 mb-4 relative group">
                            {photoPreview ? (
                                <img
                                    src={photoPreview}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Stethoscope className="w-16 h-16 text-gray-400" />
                                </div>
                            )}

                            {/* Overlay para cambiar foto */}
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                <Camera className="w-8 h-8 text-white" />
                            </div>

                            <input
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                        </div>

                        <p className="text-sm text-gray-500">
                            {photoFile ? formatFileSize(photoFile.size) : 'Haz clic para subir una foto'}
                        </p>
                        <p className="text-xs text-gray-400">Máximo 5MB • JPG, PNG, GIF</p>
                    </div>

                    {/* Información personal */}
                    <div className="border-b border-gray-200 pb-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                            <User className="w-5 h-5 mr-2 text-blue-600" />
                            Información Personal
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Username */}
                            <div className="form-group">
                                <label className="form-label">
                                    Nombre de usuario *
                                </label>
                                <input
                                    type="text"
                                    {...register('username', {
                                        required: 'El nombre de usuario es requerido',
                                        minLength: {
                                            value: 3,
                                            message: 'Debe tener al menos 3 caracteres'
                                        }
                                    })}
                                    className={`input ${errors.username ? 'input-error' : ''}`}
                                    placeholder="usuario_veterinario"
                                />
                                {errors.username && (
                                    <p className="form-error">{errors.username.message}</p>
                                )}
                            </div>

                            {/* Email */}
                            <div className="form-group">
                                <label className="form-label">
                                    <Mail className="w-4 h-4 inline mr-1" />
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    {...register('email', {
                                        required: 'El email es requerido',
                                        validate: value => isValidEmail(value) || 'Email inválido'
                                    })}
                                    className={`input ${errors.email ? 'input-error' : ''}`}
                                    placeholder="veterinario@clinica.com"
                                />
                                {errors.email && (
                                    <p className="form-error">{errors.email.message}</p>
                                )}
                            </div>

                            {/* Nombre */}
                            <div className="form-group">
                                <label className="form-label">
                                    Nombres *
                                </label>
                                <input
                                    type="text"
                                    {...register('firstName', {
                                        required: 'Los nombres son requeridos',
                                        minLength: {
                                            value: 2,
                                            message: 'Debe tener al menos 2 caracteres'
                                        }
                                    })}
                                    className={`input ${errors.firstName ? 'input-error' : ''}`}
                                    placeholder="Juan Carlos"
                                />
                                {errors.firstName && (
                                    <p className="form-error">{errors.firstName.message}</p>
                                )}
                            </div>

                            {/* Apellido */}
                            <div className="form-group">
                                <label className="form-label">
                                    Apellidos *
                                </label>
                                <input
                                    type="text"
                                    {...register('lastName', {
                                        required: 'Los apellidos son requeridos',
                                        minLength: {
                                            value: 2,
                                            message: 'Debe tener al menos 2 caracteres'
                                        }
                                    })}
                                    className={`input ${errors.lastName ? 'input-error' : ''}`}
                                    placeholder="Pérez García"
                                />
                                {errors.lastName && (
                                    <p className="form-error">{errors.lastName.message}</p>
                                )}
                            </div>

                            {/* Teléfono */}
                            <div className="form-group">
                                <label className="form-label">
                                    <Phone className="w-4 h-4 inline mr-1" />
                                    Teléfono *
                                </label>
                                <input
                                    type="tel"
                                    {...register('telefono', {
                                        required: 'El teléfono es requerido',
                                        validate: value => isValidPhone(value) || 'Teléfono inválido'
                                    })}
                                    className={`input ${errors.telefono ? 'input-error' : ''}`}
                                    placeholder="+57 300 123 4567"
                                />
                                {errors.telefono && (
                                    <p className="form-error">{errors.telefono.message}</p>
                                )}
                            </div>

                            {/* Cédula */}
                            <div className="form-group">
                                <label className="form-label">
                                    <IdCard className="w-4 h-4 inline mr-1" />
                                    Cédula *
                                </label>
                                <input
                                    type="text"
                                    {...register('cedula', {
                                        required: 'La cédula es requerida',
                                        pattern: {
                                            value: /^[0-9]{6,10}$/,
                                            message: 'Cédula debe tener entre 6 y 10 dígitos'
                                        }
                                    })}
                                    className={`input ${errors.cedula ? 'input-error' : ''}`}
                                    placeholder="12345678"
                                />
                                {errors.cedula && (
                                    <p className="form-error">{errors.cedula.message}</p>
                                )}
                            </div>
                        </div>

                        {/* Contraseñas (solo en creación) */}
                        {!isEditing && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <div className="form-group">
                                    <label className="form-label">
                                        Contraseña *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            {...register('password', {
                                                required: 'La contraseña es requerida',
                                                minLength: {
                                                    value: 6,
                                                    message: 'Debe tener al menos 6 caracteres'
                                                }
                                            })}
                                            className={`input pr-10 ${errors.password ? 'input-error' : ''}`}
                                            placeholder="Contraseña segura"
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                    {errors.password && (
                                        <p className="form-error">{errors.password.message}</p>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label className="form-label">
                                        Confirmar contraseña *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            {...register('confirmPassword', {
                                                required: 'Confirma tu contraseña',
                                                validate: value => value === password || 'Las contraseñas no coinciden'
                                            })}
                                            className={`input pr-10 ${errors.confirmPassword ? 'input-error' : ''}`}
                                            placeholder="Repite la contraseña"
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        >
                                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                    {errors.confirmPassword && (
                                        <p className="form-error">{errors.confirmPassword.message}</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Información profesional */}
                    <div className="border-b border-gray-200 pb-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                            <Stethoscope className="w-5 h-5 mr-2 text-green-600" />
                            Información Profesional
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Número de licencia */}
                            <div className="form-group">
                                <label className="form-label">
                                    <Award className="w-4 h-4 inline mr-1" />
                                    Número de licencia profesional *
                                </label>
                                <input
                                    type="text"
                                    {...register('numeroLicencia', {
                                        required: 'El número de licencia es requerido',
                                        minLength: {
                                            value: 3,
                                            message: 'Debe tener al menos 3 caracteres'
                                        }
                                    })}
                                    className={`input ${errors.numeroLicencia ? 'input-error' : ''}`}
                                    placeholder="LIC-VET-12345"
                                />
                                {errors.numeroLicencia && (
                                    <p className="form-error">{errors.numeroLicencia.message}</p>
                                )}
                            </div>

                            {/* Años de experiencia */}
                            <div className="form-group">
                                <label className="form-label">
                                    Años de experiencia
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max="50"
                                    {...register('añosExperiencia', {
                                        min: {
                                            value: 0,
                                            message: 'Debe ser un número positivo'
                                        }
                                    })}
                                    className={`input ${errors.añosExperiencia ? 'input-error' : ''}`}
                                    placeholder="5"
                                />
                                {errors.añosExperiencia && (
                                    <p className="form-error">{errors.añosExperiencia.message}</p>
                                )}
                            </div>
                        </div>

                        {/* Especialidades */}
                        <div className="form-group mt-4">
                            <label className="form-label">
                                Especialidades *
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-2">
                                {especialidadesDisponibles.map((especialidad) => (
                                    <label key={especialidad} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={(watch('especialidades') || []).includes(especialidad)}
                                            onChange={(e) => handleEspecialidadChange(especialidad, e.target.checked)}
                                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">{especialidad}</span>
                                    </label>
                                ))}
                            </div>
                            {errors.especialidades && (
                                <p className="form-error">{errors.especialidades.message}</p>
                            )}
                        </div>

                        {/* Biografía */}
                        <div className="form-group mt-4">
                            <label className="form-label">
                                <FileText className="w-4 h-4 inline mr-1" />
                                Biografía profesional
                            </label>
                            <textarea
                                {...register('biografia')}
                                rows={4}
                                className="input resize-none"
                                placeholder="Describe la experiencia, formación académica y áreas de interés del veterinario..."
                            />
                        </div>
                    </div>

                    {/* Información de horarios */}
                    <div className="border-b border-gray-200 pb-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                            <Calendar className="w-5 h-5 mr-2 text-purple-600" />
                            Horarios de Trabajo
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Horario entrada */}
                            <div className="form-group">
                                <label className="form-label">
                                    Hora de entrada
                                </label>
                                <input
                                    type="time"
                                    {...register('horarioEntrada')}
                                    className="input"
                                />
                            </div>

                            {/* Horario salida */}
                            <div className="form-group">
                                <label className="form-label">
                                    Hora de salida
                                </label>
                                <input
                                    type="time"
                                    {...register('horarioSalida')}
                                    className="input"
                                />
                            </div>
                        </div>

                        {/* Días de trabajo */}
                        <div className="form-group mt-4">
                            <label className="form-label">
                                Días de trabajo
                            </label>
                            <div className="flex flex-wrap gap-3 mt-2">
                                {['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'].map((dia) => (
                                    <label key={dia} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={(watch('diasTrabajo') || []).includes(dia)}
                                            onChange={(e) => handleDiaTrabajoChange(dia, e.target.checked)}
                                            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                        />
                                        <span className="ml-2 text-sm text-gray-700 capitalize">{dia}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Estado */}
                        <div className="form-group mt-4">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    {...register('activo')}
                                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                />
                                <span className="ml-2 text-sm text-gray-700">Veterinario activo</span>
                            </label>
                        </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex justify-end space-x-4 pt-6">
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
                                    {isEditing ? 'Actualizar Veterinario' : 'Registrar Veterinario'}
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

export default VeterinarioForm;