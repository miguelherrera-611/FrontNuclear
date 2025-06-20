import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import {
    Heart,
    Save,
    ArrowLeft,
    Camera,
    Calendar,
    Scale,
    Chip,
    FileText,
    User,
    AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import LoadingSpinner from '../common/LoadingSpinner';
import ConfirmModal, { useConfirmModal } from '../common/ConfirmModal';
import mascotasService from '../../services/mascotasService';
import usuariosService from '../../services/usuariosService';
import { ESPECIES, SEXOS, RAZAS_POR_ESPECIE } from '../../utils/constants';
import { calculateAge, formatFileSize } from '../../utils/helpers';
import toast from 'react-hot-toast';

const MascotaForm = () => {
    const { id } = useParams();
    const isEditing = Boolean(id);
    const navigate = useNavigate();
    const { user, hasRole } = useAuth();
    const { setCurrentPage } = useApp();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [usuarios, setUsuarios] = useState([]);
    const [selectedEspecie, setSelectedEspecie] = useState('');
    const [razasDisponibles, setRazasDisponibles] = useState([]);
    const [photoPreview, setPhotoPreview] = useState('');
    const [photoFile, setPhotoFile] = useState(null);
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
            nombre: '',
            especie: '',
            raza: '',
            sexo: '',
            fechaNacimiento: '',
            peso: '',
            microchip: '',
            propietarioId: hasRole('usuario') ? user?.id : '',
            notas: '',
            vacunas: '',
            alergias: '',
            medicamentos: ''
        }
    });

    const watchedEspecie = watch('especie');

    // Configurar página actual
    useEffect(() => {
        setCurrentPage(isEditing ? 'Editar Mascota' : 'Nueva Mascota');
    }, [setCurrentPage, isEditing]);

    // Cargar datos iniciales
    useEffect(() => {
        loadInitialData();
    }, [id, user]);

    // Actualizar razas cuando cambie la especie
    useEffect(() => {
        if (watchedEspecie) {
            const razas = RAZAS_POR_ESPECIE[watchedEspecie] || [];
            setRazasDisponibles(razas);
            setValue('raza', ''); // Limpiar raza cuando cambie especie
        }
    }, [watchedEspecie, setValue]);

    const loadInitialData = async () => {
        try {
            setLoading(true);

            // Cargar usuarios solo para admin y recepcionista
            if (hasRole('admin') || hasRole('recepcionista')) {
                await loadUsuarios();
            }

            if (isEditing) {
                await loadMascota();
            }
        } catch (error) {
            console.error('Error loading initial data:', error);
            toast.error('Error al cargar los datos');
        } finally {
            setLoading(false);
        }
    };

    const loadUsuarios = async () => {
        try {
            const usuariosData = await usuariosService.getUsuariosByRol('usuario');
            setUsuarios(usuariosData);
        } catch (error) {
            console.error('Error loading usuarios:', error);
        }
    };

    const loadMascota = async () => {
        try {
            const mascota = await mascotasService.getMascotaById(id);

            // Verificar permisos
            if (hasRole('usuario') && mascota.propietarioId !== user.id) {
                toast.error('No tienes permisos para editar esta mascota');
                navigate('/mascotas');
                return;
            }

            // Cargar datos en el formulario
            reset({
                nombre: mascota.nombre,
                especie: mascota.especie,
                raza: mascota.raza,
                sexo: mascota.sexo,
                fechaNacimiento: mascota.fechaNacimiento?.split('T')[0] || '',
                peso: mascota.peso || '',
                microchip: mascota.microchip || '',
                propietarioId: mascota.propietarioId,
                notas: mascota.notas || '',
                vacunas: mascota.vacunas || '',
                alergias: mascota.alergias || '',
                medicamentos: mascota.medicamentos || ''
            });

            setSelectedEspecie(mascota.especie);

            if (mascota.foto) {
                setPhotoPreview(mascota.foto);
            }
        } catch (error) {
            console.error('Error loading mascota:', error);
            toast.error('Error al cargar la mascota');
            navigate('/mascotas');
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
            const validation = mascotasService.validateMascotaData(data);
            if (!validation.isValid) {
                Object.keys(validation.errors).forEach(key => {
                    toast.error(validation.errors[key]);
                });
                return;
            }

            let mascotaData;

            if (isEditing) {
                mascotaData = await mascotasService.updateMascota(id, data);
                toast.success('Mascota actualizada exitosamente');
            } else {
                mascotaData = await mascotasService.createMascota(data);
                toast.success('Mascota registrada exitosamente');
            }

            // Subir foto si hay una seleccionada
            if (photoFile && mascotaData.id) {
                try {
                    await mascotasService.subirFoto(mascotaData.id, photoFile);
                } catch (photoError) {
                    console.error('Error uploading photo:', photoError);
                    toast.warning('Mascota guardada, pero hubo un error al subir la foto');
                }
            }

            navigate('/mascotas');
        } catch (error) {
            console.error('Error saving mascota:', error);
            const errorMessage = error.error || 'Error al guardar la mascota';
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
                onConfirm: () => navigate('/mascotas')
            });
        } else {
            navigate('/mascotas');
        }
    };

    // Calcular edad en tiempo real
    const watchedFechaNacimiento = watch('fechaNacimiento');
    const edad = watchedFechaNacimiento ? calculateAge(watchedFechaNacimiento) : '';

    if (loading) {
        return <LoadingSpinner text={isEditing ? 'Cargando mascota...' : 'Cargando formulario...'} />;
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
                            {isEditing ? 'Editar Mascota' : 'Registrar Nueva Mascota'}
                        </h1>
                        <p className="text-sm text-gray-500">
                            {isEditing ? 'Modifica la información de la mascota' : 'Completa los datos de tu mascota'}
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

                    {/* Foto de la mascota */}
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
                                    <Heart className="w-16 h-16 text-gray-400" />
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

                    {/* Propietario (solo para admin/recepcionista) */}
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
                                        {...register('propietarioId', {
                                            required: 'Selecciona un propietario'
                                        })}
                                        className={`input ${errors.propietarioId ? 'input-error' : ''}`}
                                    >
                                        <option value="">Seleccionar propietario...</option>
                                        {usuarios.map(usuario => (
                                            <option key={usuario.id} value={usuario.id}>
                                                {usuario.nombre} - {usuario.email}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.propietarioId && (
                                        <p className="form-error">{errors.propietarioId.message}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Información básica */}
                    <div className="border-b border-gray-200 pb-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                            <Heart className="w-5 h-5 mr-2 text-pink-600" />
                            Información Básica
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                            {/* Nombre */}
                            <div className="form-group">
                                <label className="form-label">
                                    Nombre *
                                </label>
                                <input
                                    type="text"
                                    {...register('nombre', {
                                        required: 'El nombre es requerido',
                                        minLength: {
                                            value: 2,
                                            message: 'El nombre debe tener al menos 2 caracteres'
                                        }
                                    })}
                                    className={`input ${errors.nombre ? 'input-error' : ''}`}
                                    placeholder="Nombre de la mascota"
                                />
                                {errors.nombre && (
                                    <p className="form-error">{errors.nombre.message}</p>
                                )}
                            </div>

                            {/* Especie */}
                            <div className="form-group">
                                <label className="form-label">
                                    Especie *
                                </label>
                                <select
                                    {...register('especie', {
                                        required: 'Selecciona una especie'
                                    })}
                                    className={`input ${errors.especie ? 'input-error' : ''}`}
                                    onChange={(e) => {
                                        setValue('especie', e.target.value);
                                        setSelectedEspecie(e.target.value);
                                    }}
                                >
                                    <option value="">Seleccionar especie...</option>
                                    {ESPECIES.map(especie => (
                                        <option key={especie} value={especie}>
                                            {especie}
                                        </option>
                                    ))}
                                </select>
                                {errors.especie && (
                                    <p className="form-error">{errors.especie.message}</p>
                                )}
                            </div>

                            {/* Raza */}
                            <div className="form-group">
                                <label className="form-label">
                                    Raza *
                                </label>
                                <select
                                    {...register('raza', {
                                        required: 'Selecciona una raza'
                                    })}
                                    className={`input ${errors.raza ? 'input-error' : ''}`}
                                    disabled={!selectedEspecie}
                                >
                                    <option value="">
                                        {!selectedEspecie ? 'Selecciona una especie primero' : 'Seleccionar raza...'}
                                    </option>
                                    {razasDisponibles.map(raza => (
                                        <option key={raza} value={raza}>
                                            {raza}
                                        </option>
                                    ))}
                                </select>
                                {errors.raza && (
                                    <p className="form-error">{errors.raza.message}</p>
                                )}
                            </div>

                            {/* Sexo */}
                            <div className="form-group">
                                <label className="form-label">
                                    Sexo *
                                </label>
                                <select
                                    {...register('sexo', {
                                        required: 'Selecciona el sexo'
                                    })}
                                    className={`input ${errors.sexo ? 'input-error' : ''}`}
                                >
                                    <option value="">Seleccionar sexo...</option>
                                    {SEXOS.map(sexo => (
                                        <option key={sexo.value} value={sexo.value}>
                                            {sexo.label}
                                        </option>
                                    ))}
                                </select>
                                {errors.sexo && (
                                    <p className="form-error">{errors.sexo.message}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Información física */}
                    <div className="border-b border-gray-200 pb-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                            <Scale className="w-5 h-5 mr-2 text-green-600" />
                            Información Física
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                            {/* Fecha de nacimiento */}
                            <div className="form-group">
                                <label className="form-label">
                                    Fecha de Nacimiento *
                                </label>
                                <input
                                    type="date"
                                    {...register('fechaNacimiento', {
                                        required: 'La fecha de nacimiento es requerida',
                                        validate: value => {
                                            const fecha = new Date(value);
                                            const hoy = new Date();
                                            return fecha <= hoy || 'La fecha no puede ser futura';
                                        }
                                    })}
                                    className={`input ${errors.fechaNacimiento ? 'input-error' : ''}`}
                                    max={new Date().toISOString().split('T')[0]}
                                />
                                {errors.fechaNacimiento && (
                                    <p className="form-error">{errors.fechaNacimiento.message}</p>
                                )}
                                {edad && (
                                    <p className="text-sm text-green-600 mt-1">Edad: {edad}</p>
                                )}
                            </div>

                            {/* Peso */}
                            <div className="form-group">
                                <label className="form-label">
                                    Peso (kg)
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    {...register('peso', {
                                        min: {
                                            value: 0,
                                            message: 'El peso debe ser positivo'
                                        }
                                    })}
                                    className={`input ${errors.peso ? 'input-error' : ''}`}
                                    placeholder="Ej: 5.5"
                                />
                                {errors.peso && (
                                    <p className="form-error">{errors.peso.message}</p>
                                )}
                            </div>

                            {/* Microchip */}
                            <div className="form-group">
                                <label className="form-label">
                                    <Chip className="w-4 h-4 inline mr-1" />
                                    Microchip
                                </label>
                                <input
                                    type="text"
                                    {...register('microchip', {
                                        maxLength: {
                                            value: 15,
                                            message: 'Máximo 15 caracteres'
                                        }
                                    })}
                                    className={`input ${errors.microchip ? 'input-error' : ''}`}
                                    placeholder="Número de microchip"
                                />
                                {errors.microchip && (
                                    <p className="form-error">{errors.microchip.message}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Información médica */}
                    <div>
                        <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                            <FileText className="w-5 h-5 mr-2 text-purple-600" />
                            Información Médica
                        </h2>

                        <div className="space-y-4">

                            {/* Vacunas */}
                            <div className="form-group">
                                <label className="form-label">
                                    Vacunas
                                </label>
                                <textarea
                                    {...register('vacunas')}
                                    rows={2}
                                    className="input resize-none"
                                    placeholder="Lista de vacunas aplicadas..."
                                />
                            </div>

                            {/* Alergias */}
                            <div className="form-group">
                                <label className="form-label">
                                    Alergias
                                </label>
                                <textarea
                                    {...register('alergias')}
                                    rows={2}
                                    className="input resize-none"
                                    placeholder="Alergias conocidas..."
                                />
                            </div>

                            {/* Medicamentos */}
                            <div className="form-group">
                                <label className="form-label">
                                    Medicamentos
                                </label>
                                <textarea
                                    {...register('medicamentos')}
                                    rows={2}
                                    className="input resize-none"
                                    placeholder="Medicamentos que toma actualmente..."
                                />
                            </div>

                            {/* Notas generales */}
                            <div className="form-group">
                                <label className="form-label">
                                    Notas adicionales
                                </label>
                                <textarea
                                    {...register('notas')}
                                    rows={3}
                                    className="input resize-none"
                                    placeholder="Información adicional relevante..."
                                />
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
                                    {isEditing ? 'Actualizar Mascota' : 'Registrar Mascota'}
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

export default MascotaForm;