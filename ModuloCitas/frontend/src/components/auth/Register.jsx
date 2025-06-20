import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, Phone, Heart, IdCard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { isValidEmail, isValidPhone } from '../../utils/helpers';

const Register = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { register: registerUser, isLoading, error } = useAuth();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
        setError
    } = useForm();

    const password = watch('password');

    const onSubmit = async (data) => {
        try {
            // Eliminar confirmPassword antes de enviar
            const { confirmPassword, ...userData } = data;
            await registerUser(userData);
            navigate('/dashboard');
        } catch (error) {
            if (error.validationErrors) {
                Object.keys(error.validationErrors).forEach(field => {
                    setError(field, {
                        type: 'manual',
                        message: error.validationErrors[field]
                    });
                });
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <motion.div
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center"
                >
                    <div className="mx-auto h-16 w-16 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center mb-4">
                        <Heart className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">
                        🐾 VetClinic
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Crea tu cuenta para empezar
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="bg-white py-8 px-6 shadow-soft rounded-xl"
                >
                    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                        {/* Error general */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-red-50 border border-red-200 rounded-lg p-4"
                            >
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-red-800">{error}</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Nombre de usuario */}
                        <div className="form-group">
                            <label htmlFor="username" className="form-label">
                                <User className="w-4 h-4 inline mr-2" />
                                Nombre de usuario
                            </label>
                            <div className="relative">
                                <input
                                    id="username"
                                    type="text"
                                    autoComplete="username"
                                    className={`input pl-10 ${errors.username ? 'input-error' : ''}`}
                                    placeholder="usuario123"
                                    {...register('username', {
                                        required: 'El nombre de usuario es requerido',
                                        minLength: {
                                            value: 3,
                                            message: 'Debe tener al menos 3 caracteres'
                                        },
                                        pattern: {
                                            value: /^[a-zA-Z0-9._]+$/,
                                            message: 'Solo letras, números, puntos y guiones bajos'
                                        }
                                    })}
                                />
                                <User className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                            </div>
                            {errors.username && (
                                <p className="form-error">{errors.username.message}</p>
                            )}
                        </div>

                        {/* Email */}
                        <div className="form-group">
                            <label htmlFor="email" className="form-label">
                                <Mail className="w-4 h-4 inline mr-2" />
                                Email
                            </label>
                            <div className="relative">
                                <input
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    className={`input pl-10 ${errors.email ? 'input-error' : ''}`}
                                    placeholder="tu@email.com"
                                    {...register('email', {
                                        required: 'El email es requerido',
                                        validate: value => isValidEmail(value) || 'Email inválido'
                                    })}
                                />
                                <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                            </div>
                            {errors.email && (
                                <p className="form-error">{errors.email.message}</p>
                            )}
                        </div>

                        {/* Nombre y Apellido */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="form-group">
                                <label htmlFor="firstName" className="form-label">
                                    Nombre
                                </label>
                                <input
                                    id="firstName"
                                    type="text"
                                    autoComplete="given-name"
                                    className={`input ${errors.firstName ? 'input-error' : ''}`}
                                    placeholder="Juan"
                                    {...register('firstName', {
                                        required: 'El nombre es requerido',
                                        minLength: {
                                            value: 2,
                                            message: 'Mínimo 2 caracteres'
                                        }
                                    })}
                                />
                                {errors.firstName && (
                                    <p className="form-error">{errors.firstName.message}</p>
                                )}
                            </div>

                            <div className="form-group">
                                <label htmlFor="lastName" className="form-label">
                                    Apellido
                                </label>
                                <input
                                    id="lastName"
                                    type="text"
                                    autoComplete="family-name"
                                    className={`input ${errors.lastName ? 'input-error' : ''}`}
                                    placeholder="Pérez"
                                    {...register('lastName', {
                                        required: 'El apellido es requerido',
                                        minLength: {
                                            value: 2,
                                            message: 'Mínimo 2 caracteres'
                                        }
                                    })}
                                />
                                {errors.lastName && (
                                    <p className="form-error">{errors.lastName.message}</p>
                                )}
                            </div>
                        </div>

                        {/* Teléfono */}
                        <div className="form-group">
                            <label htmlFor="telefono" className="form-label">
                                <Phone className="w-4 h-4 inline mr-2" />
                                Teléfono
                            </label>
                            <div className="relative">
                                <input
                                    id="telefono"
                                    type="tel"
                                    autoComplete="tel"
                                    className={`input pl-10 ${errors.telefono ? 'input-error' : ''}`}
                                    placeholder="+57 300 123 4567"
                                    {...register('telefono', {
                                        required: 'El teléfono es requerido',
                                        validate: value => isValidPhone(value) || 'Teléfono inválido'
                                    })}
                                />
                                <Phone className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                            </div>
                            {errors.telefono && (
                                <p className="form-error">{errors.telefono.message}</p>
                            )}
                        </div>

                        {/* Cédula */}
                        <div className="form-group">
                            <label htmlFor="cedula" className="form-label">
                                <IdCard className="w-4 h-4 inline mr-2" />
                                Cédula
                            </label>
                            <div className="relative">
                                <input
                                    id="cedula"
                                    type="text"
                                    className={`input pl-10 ${errors.cedula ? 'input-error' : ''}`}
                                    placeholder="12345678"
                                    {...register('cedula', {
                                        required: 'La cédula es requerida',
                                        pattern: {
                                            value: /^[0-9]{6,10}$/,
                                            message: 'Cédula debe tener entre 6 y 10 dígitos'
                                        }
                                    })}
                                />
                                <IdCard className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                            </div>
                            {errors.cedula && (
                                <p className="form-error">{errors.cedula.message}</p>
                            )}
                        </div>

                        {/* Contraseña */}
                        <div className="form-group">
                            <label htmlFor="password" className="form-label">
                                <Lock className="w-4 h-4 inline mr-2" />
                                Contraseña
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="new-password"
                                    className={`input pl-10 pr-10 ${errors.password ? 'input-error' : ''}`}
                                    placeholder="Mínimo 6 caracteres"
                                    {...register('password', {
                                        required: 'La contraseña es requerida',
                                        minLength: {
                                            value: 6,
                                            message: 'Debe tener al menos 6 caracteres'
                                        }
                                    })}
                                />
                                <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
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

                        {/* Confirmar contraseña */}
                        <div className="form-group">
                            <label htmlFor="confirmPassword" className="form-label">
                                <Lock className="w-4 h-4 inline mr-2" />
                                Confirmar contraseña
                            </label>
                            <div className="relative">
                                <input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    autoComplete="new-password"
                                    className={`input pl-10 pr-10 ${errors.confirmPassword ? 'input-error' : ''}`}
                                    placeholder="Repite tu contraseña"
                                    {...register('confirmPassword', {
                                        required: 'Confirma tu contraseña',
                                        validate: value => value === password || 'Las contraseñas no coinciden'
                                    })}
                                />
                                <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
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

                        {/* Términos y condiciones */}
                        <div className="flex items-center">
                            <input
                                id="acceptTerms"
                                type="checkbox"
                                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                {...register('acceptTerms', {
                                    required: 'Debes aceptar los términos y condiciones'
                                })}
                            />
                            <label htmlFor="acceptTerms" className="ml-2 block text-sm text-gray-900">
                                Acepto los{' '}
                                <Link to="/terms" className="text-green-600 hover:text-green-500">
                                    términos y condiciones
                                </Link>
                            </label>
                        </div>
                        {errors.acceptTerms && (
                            <p className="form-error">{errors.acceptTerms.message}</p>
                        )}

                        {/* Botón de registro */}
                        <div>
                            <motion.button
                                type="submit"
                                disabled={isLoading}
                                className="w-full btn-success relative"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                        Creando cuenta...
                                    </div>
                                ) : (
                                    'Crear Cuenta'
                                )}
                            </motion.button>
                        </div>
                    </form>

                    {/* Login */}
                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">¿Ya tienes cuenta?</span>
                            </div>
                        </div>

                        <div className="mt-6">
                            <Link
                                to="/login"
                                className="w-full flex justify-center py-2 px-4 border border-green-300 rounded-lg shadow-sm bg-white text-sm font-medium text-green-600 hover:bg-green-50 transition-colors"
                            >
                                Iniciar Sesión
                            </Link>
                        </div>
                    </div>
                </motion.div>

                {/* Footer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="text-center"
                >
                    <p className="text-xs text-gray-500">
                        © 2024 VetClinic. Sistema de Gestión Veterinaria.
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default Register;