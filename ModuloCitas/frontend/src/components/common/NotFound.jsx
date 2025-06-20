import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Home,
    ArrowLeft,
    Search,
    Heart,
    Calendar,
    Users,
    ShoppingBag
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NotFound = ({
                      title = "404 - Página no encontrada",
                      subtitle = "Lo sentimos, la página que buscas no existe.",
                      showSuggestions = true,
                      showBackButton = true,
                      className = ''
                  }) => {
    const navigate = useNavigate();
    const { user, hasRole } = useAuth();

    // Sugerencias basadas en el rol del usuario
    const getSuggestions = () => {
        const baseSuggestions = [
            {
                title: 'Dashboard',
                description: 'Volver al panel principal',
                path: '/dashboard',
                icon: Home,
                color: 'text-blue-600 hover:text-blue-700'
            }
        ];

        if (hasRole('usuario')) {
            baseSuggestions.push(
                {
                    title: 'Mis Citas',
                    description: 'Ver o agendar nuevas citas',
                    path: '/citas',
                    icon: Calendar,
                    color: 'text-green-600 hover:text-green-700'
                },
                {
                    title: 'Mis Mascotas',
                    description: 'Gestionar información de mascotas',
                    path: '/mascotas',
                    icon: Heart,
                    color: 'text-pink-600 hover:text-pink-700'
                },
                {
                    title: 'Tienda',
                    description: 'Explorar productos para mascotas',
                    path: '/tienda',
                    icon: ShoppingBag,
                    color: 'text-purple-600 hover:text-purple-700'
                }
            );
        }

        if (hasRole('veterinario') || hasRole('admin')) {
            baseSuggestions.push(
                {
                    title: 'Agenda',
                    description: 'Ver citas programadas',
                    path: '/citas',
                    icon: Calendar,
                    color: 'text-green-600 hover:text-green-700'
                },
                {
                    title: 'Pacientes',
                    description: 'Gestionar mascotas',
                    path: '/mascotas',
                    icon: Heart,
                    color: 'text-pink-600 hover:text-pink-700'
                }
            );
        }

        if (hasRole('admin') || hasRole('recepcionista')) {
            baseSuggestions.push(
                {
                    title: 'Usuarios',
                    description: 'Administrar usuarios del sistema',
                    path: '/usuarios',
                    icon: Users,
                    color: 'text-indigo-600 hover:text-indigo-700'
                }
            );
        }

        return baseSuggestions.slice(0, 4); // Máximo 4 sugerencias
    };

    const suggestions = getSuggestions();

    const containerVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    const floatingVariants = {
        float: {
            y: [-10, 10, -10],
            transition: {
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
            }
        }
    };

    return (
        <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center p-4 ${className}`}>
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="max-w-2xl w-full text-center"
            >

                {/* Ilustración 404 */}
                <motion.div
                    variants={floatingVariants}
                    animate="float"
                    className="mb-8"
                >
                    <div className="relative">
                        {/* Número 404 grande */}
                        <div className="text-8xl sm:text-9xl font-bold text-gray-200 select-none">
                            404
                        </div>

                        {/* Icono de mascota en el centro */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                <Heart className="w-8 h-8 text-white" />
                            </div>
                        </div>

                        {/* Elementos decorativos flotantes */}
                        <motion.div
                            animate={{
                                x: [0, 20, 0],
                                y: [0, -10, 0],
                            }}
                            transition={{
                                duration: 4,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-400 rounded-full opacity-70"
                        />
                        <motion.div
                            animate={{
                                x: [0, -15, 0],
                                y: [0, 15, 0],
                            }}
                            transition={{
                                duration: 3.5,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: 1
                            }}
                            className="absolute -bottom-2 -left-6 w-6 h-6 bg-pink-400 rounded-full opacity-60"
                        />
                        <motion.div
                            animate={{
                                x: [0, 10, 0],
                                y: [0, -20, 0],
                            }}
                            transition={{
                                duration: 5,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: 0.5
                            }}
                            className="absolute top-1/2 -right-8 w-4 h-4 bg-green-400 rounded-full opacity-50"
                        />
                    </div>
                </motion.div>

                {/* Título y descripción */}
                <motion.div variants={itemVariants} className="mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                        {title}
                    </h1>
                    <p className="text-lg text-gray-600 mb-2">
                        {subtitle}
                    </p>
                    <p className="text-gray-500">
                        La página que intentas acceder no existe o ha sido movida.
                    </p>
                </motion.div>

                {/* Botones de acción */}
                <motion.div variants={itemVariants} className="mb-8">
                    <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">

                        {/* Botón volver */}
                        {showBackButton && (
                            <button
                                onClick={() => navigate(-1)}
                                className="btn-secondary flex items-center"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Volver atrás
                            </button>
                        )}

                        {/* Botón home */}
                        <Link
                            to="/dashboard"
                            className="btn-primary flex items-center"
                        >
                            <Home className="w-4 h-4 mr-2" />
                            Ir al inicio
                        </Link>
                    </div>
                </motion.div>

                {/* Sugerencias */}
                {showSuggestions && suggestions.length > 0 && (
                    <motion.div variants={itemVariants} className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">
                            ¿Quizás estás buscando esto?
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {suggestions.map((suggestion, index) => {
                                const Icon = suggestion.icon;
                                return (
                                    <motion.div
                                        key={suggestion.path}
                                        variants={itemVariants}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <Link
                                            to={suggestion.path}
                                            className="block p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200"
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div className={`${suggestion.color} transition-colors`}>
                                                    <Icon className="w-6 h-6" />
                                                </div>
                                                <div className="text-left">
                                                    <h3 className="font-medium text-gray-900">
                                                        {suggestion.title}
                                                    </h3>
                                                    <p className="text-sm text-gray-500">
                                                        {suggestion.description}
                                                    </p>
                                                </div>
                                            </div>
                                        </Link>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}

                {/* Información de contacto */}
                <motion.div variants={itemVariants} className="text-center">
                    <p className="text-gray-500 text-sm">
                        Si el problema persiste, puedes{' '}
                        <Link
                            to="/help"
                            className="text-blue-600 hover:text-blue-700 underline"
                        >
                            contactar con soporte
                        </Link>
                        {' '}o buscar en nuestra{' '}
                        <Link
                            to="/search"
                            className="text-blue-600 hover:text-blue-700 underline inline-flex items-center"
                        >
                            <Search className="w-3 h-3 mr-1" />
                            página de búsqueda
                        </Link>
                    </p>
                </motion.div>

                {/* Footer decorativo */}
                <motion.div
                    variants={itemVariants}
                    className="mt-12 pt-8 border-t border-gray-200"
                >
                    <div className="flex items-center justify-center space-x-2 text-gray-400">
                        <Heart className="w-4 h-4" />
                        <span className="text-sm">VetClinic - Sistema de Gestión Veterinaria</span>
                        <Heart className="w-4 h-4" />
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
};

// Componente 404 específico para rutas no encontradas
export const RouteNotFound = () => (
    <NotFound
        title="Ruta no encontrada"
        subtitle="La página que buscas no existe en el sistema."
    />
);

// Componente para recursos no encontrados
export const ResourceNotFound = ({
                                     resourceType = "recurso",
                                     resourceId,
                                     backPath = "/dashboard"
                                 }) => (
    <NotFound
        title={`${resourceType.charAt(0).toUpperCase() + resourceType.slice(1)} no encontrado`}
        subtitle={`El ${resourceType}${resourceId ? ` con ID ${resourceId}` : ''} no existe o no tienes permisos para acceder.`}
        showSuggestions={false}
        className="p-8"
    />
);

// Componente para acceso denegado
export const AccessDenied = ({
                                 requiredRole,
                                 backPath = "/dashboard"
                             }) => (
    <NotFound
        title="Acceso denegado"
        subtitle={`No tienes permisos para acceder a esta sección.${
            requiredRole ? ` Se requiere rol: ${requiredRole}` : ''
        }`}
        showSuggestions={true}
        className="p-8"
    />
);

export default NotFound;