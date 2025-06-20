import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Home,
    Calendar,
    Heart,
    Users,
    Stethoscope,
    ShoppingBag,
    FileText,
    Settings,
    BarChart3,
    Clock,
    UserPlus,
    Package,
    X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { ROLES } from '../../utils/constants';

const Sidebar = () => {
    const { user, hasRole } = useAuth();
    const { sidebarOpen, toggleSidebar } = useApp();
    const location = useLocation();

    // Configuración de menús por rol
    const menuItems = [
        {
            label: 'Dashboard',
            path: '/dashboard',
            icon: Home,
            roles: ['admin', 'veterinario', 'usuario', 'recepcionista']
        },
        {
            label: 'Citas',
            path: '/citas',
            icon: Calendar,
            roles: ['admin', 'veterinario', 'usuario', 'recepcionista']
        },
        {
            label: 'Mascotas',
            path: '/mascotas',
            icon: Heart,
            roles: ['admin', 'veterinario', 'usuario', 'recepcionista']
        },
        {
            label: 'Usuarios',
            path: '/usuarios',
            icon: Users,
            roles: ['admin', 'recepcionista']
        },
        {
            label: 'Veterinarios',
            path: '/veterinarios',
            icon: Stethoscope,
            roles: ['admin']
        },
        {
            label: 'Disponibilidad',
            path: '/disponibilidad',
            icon: Clock,
            roles: ['veterinario', 'admin']
        },
        {
            label: 'Historia Clínica',
            path: '/historia-clinica',
            icon: FileText,
            roles: ['veterinario', 'admin']
        },
        {
            label: 'Tienda',
            path: '/tienda',
            icon: ShoppingBag,
            roles: ['admin', 'veterinario', 'usuario', 'recepcionista']
        },
        {
            label: 'Productos',
            path: '/productos',
            icon: Package,
            roles: ['admin', 'recepcionista']
        },
        {
            label: 'Reportes',
            path: '/reportes',
            icon: BarChart3,
            roles: ['admin', 'veterinario']
        },
        {
            label: 'Configuración',
            path: '/settings',
            icon: Settings,
            roles: ['admin']
        }
    ];

    // Filtrar menús según el rol del usuario
    const filteredMenuItems = menuItems.filter(item =>
        item.roles.some(role => hasRole(role))
    );

    const isActiveRoute = (path) => {
        if (path === '/dashboard') {
            return location.pathname === '/' || location.pathname === '/dashboard';
        }
        return location.pathname.startsWith(path);
    };

    const sidebarVariants = {
        open: {
            x: 0,
            transition: {
                type: "spring",
                stiffness: 300,
                damping: 30
            }
        },
        closed: {
            x: "-100%",
            transition: {
                type: "spring",
                stiffness: 300,
                damping: 30
            }
        }
    };

    const overlayVariants = {
        open: {
            opacity: 1,
            display: "block"
        },
        closed: {
            opacity: 0,
            transitionEnd: {
                display: "none"
            }
        }
    };

    return (
        <>
            {/* Overlay para móvil */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div
                        initial="closed"
                        animate="open"
                        exit="closed"
                        variants={overlayVariants}
                        className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 lg:hidden"
                        onClick={toggleSidebar}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.div
                initial="closed"
                animate={sidebarOpen ? "open" : "closed"}
                variants={sidebarVariants}
                className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg lg:static lg:inset-0 lg:translate-x-0 lg:z-auto"
            >
                <div className="flex flex-col h-full">

                    {/* Header del sidebar */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 lg:hidden">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
                                <Heart className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-gray-900">VetClinic</span>
                        </div>
                        <button
                            onClick={toggleSidebar}
                            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Información del usuario */}
                    <div className="p-4 border-b border-gray-200">
                        <div className="flex items-center space-x-3">
                            {user?.avatar ? (
                                <img
                                    src={user.avatar}
                                    alt={user.username}
                                    className="w-10 h-10 rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                                    {user?.firstName?.charAt(0) || user?.username?.charAt(0) || 'U'}
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    {user?.fullName || `${user?.firstName} ${user?.lastName}`.trim() || user?.username}
                                </p>
                                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                                <span className={`inline-block mt-1 px-2 py-1 text-xs rounded-full ${
                                    user?.rol === 'admin' ? 'bg-purple-100 text-purple-800' :
                                        user?.rol === 'veterinario' ? 'bg-green-100 text-green-800' :
                                            user?.rol === 'recepcionista' ? 'bg-blue-100 text-blue-800' :
                                                'bg-gray-100 text-gray-800'
                                }`}>
                  {user?.rol?.charAt(0).toUpperCase() + user?.rol?.slice(1)}
                </span>
                            </div>
                        </div>
                    </div>

                    {/* Navegación principal */}
                    <nav className="flex-1 overflow-y-auto p-4">
                        <div className="space-y-1">
                            {filteredMenuItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = isActiveRoute(item.path);

                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => window.innerWidth < 1024 && toggleSidebar()}
                                        className={`sidebar-link ${isActive ? 'active' : ''}`}
                                    >
                                        <Icon className="w-5 h-5 mr-3" />
                                        <span className="font-medium">{item.label}</span>

                                        {/* Indicador de ruta activa */}
                                        {isActive && (
                                            <motion.div
                                                layoutId="activeIndicator"
                                                className="absolute right-0 w-1 h-8 bg-blue-600 rounded-l"
                                                initial={false}
                                                transition={{
                                                    type: "spring",
                                                    stiffness: 500,
                                                    damping: 30
                                                }}
                                            />
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </nav>

                    {/* Acciones rápidas */}
                    <div className="p-4 border-t border-gray-200">
                        <div className="space-y-2">

                            {/* Botón de nueva cita */}
                            {hasRole('usuario') || hasRole('recepcionista') || hasRole('admin') ? (
                                <Link
                                    to="/citas/nueva"
                                    onClick={() => window.innerWidth < 1024 && toggleSidebar()}
                                    className="flex items-center w-full px-3 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-200"
                                >
                                    <Calendar className="w-4 h-4 mr-2" />
                                    Nueva Cita
                                </Link>
                            ) : null}

                            {/* Botón de registrar usuario (solo admin/recepcionista) */}
                            {(hasRole('admin') || hasRole('recepcionista')) && (
                                <Link
                                    to="/usuarios/nuevo"
                                    onClick={() => window.innerWidth < 1024 && toggleSidebar()}
                                    className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    <UserPlus className="w-4 h-4 mr-2" />
                                    Nuevo Usuario
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Footer del sidebar */}
                    <div className="p-4 border-t border-gray-200">
                        <div className="text-center">
                            <p className="text-xs text-gray-500">
                                VetClinic v1.0.0
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                                © 2024 Todos los derechos reservados
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </>
    );
};

export default Sidebar;