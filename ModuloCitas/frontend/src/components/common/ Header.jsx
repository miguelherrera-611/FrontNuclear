import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Menu,
    Bell,
    Search,
    User,
    Settings,
    LogOut,
    Heart,
    ShoppingCart,
    Calendar,
    MessageSquare
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { getInitials, formatTime } from '../../utils/helpers';

const Header = () => {
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const { user, logout } = useAuth();
    const {
        toggleSidebar,
        notifications,
        carrito,
        removeNotification,
        clearNotifications
    } = useApp();

    const navigate = useNavigate();
    const userMenuRef = useRef(null);
    const notificationsRef = useRef(null);

    // Cerrar menús al hacer click fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setShowUserMenu(false);
            }
            if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery('');
        }
    };

    const unreadNotifications = notifications.filter(n => !n.read).length;
    const cartItemsCount = carrito.items.reduce((total, item) => total + item.cantidad, 0);

    return (
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
            <div className="flex items-center justify-between h-16 px-4 sm:px-6">

                {/* Lado izquierdo - Logo y menú */}
                <div className="flex items-center space-x-4">
                    <button
                        onClick={toggleSidebar}
                        className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                        <Menu className="w-5 h-5" />
                    </button>

                    <Link to="/dashboard" className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
                            <Heart className="w-5 h-5 text-white" />
                        </div>
                        <span className="hidden sm:block text-xl font-bold text-gray-900">
              VetClinic
            </span>
                    </Link>
                </div>

                {/* Centro - Barra de búsqueda */}
                <div className="flex-1 max-w-lg mx-4">
                    <form onSubmit={handleSearch} className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar mascotas, citas, propietarios..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </form>
                </div>

                {/* Lado derecho - Acciones */}
                <div className="flex items-center space-x-2">

                    {/* Carrito de compras */}
                    <Link
                        to="/carrito"
                        className="relative p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                        <ShoppingCart className="w-5 h-5" />
                        {cartItemsCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {cartItemsCount > 9 ? '9+' : cartItemsCount}
              </span>
                        )}
                    </Link>

                    {/* Notificaciones */}
                    <div className="relative" ref={notificationsRef}>
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="relative p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                            <Bell className="w-5 h-5" />
                            {unreadNotifications > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadNotifications > 9 ? '9+' : unreadNotifications}
                </span>
                            )}
                        </button>

                        {/* Dropdown de notificaciones */}
                        <AnimatePresence>
                            {showNotifications && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
                                >
                                    <div className="p-4 border-b border-gray-200">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                Notificaciones
                                            </h3>
                                            {notifications.length > 0 && (
                                                <button
                                                    onClick={clearNotifications}
                                                    className="text-sm text-blue-600 hover:text-blue-700"
                                                >
                                                    Limpiar todo
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="max-h-80 overflow-y-auto">
                                        {notifications.length === 0 ? (
                                            <div className="p-4 text-center text-gray-500">
                                                No hay notificaciones
                                            </div>
                                        ) : (
                                            notifications.slice(0, 5).map((notification) => (
                                                <div
                                                    key={notification.id}
                                                    className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                                                        !notification.read ? 'bg-blue-50' : ''
                                                    }`}
                                                    onClick={() => removeNotification(notification.id)}
                                                >
                                                    <div className="flex items-start space-x-3">
                                                        <div className={`w-2 h-2 rounded-full mt-2 ${
                                                            notification.type === 'success' ? 'bg-green-500' :
                                                                notification.type === 'warning' ? 'bg-yellow-500' :
                                                                    notification.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                                                        }`} />
                                                        <div className="flex-1">
                                                            <p className="text-sm font-medium text-gray-900">
                                                                {notification.title}
                                                            </p>
                                                            <p className="text-sm text-gray-600">
                                                                {notification.message}
                                                            </p>
                                                            <p className="text-xs text-gray-400 mt-1">
                                                                {formatTime(notification.timestamp)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    {notifications.length > 5 && (
                                        <div className="p-4 border-t border-gray-200">
                                            <Link
                                                to="/notifications"
                                                className="block text-center text-sm text-blue-600 hover:text-blue-700"
                                                onClick={() => setShowNotifications(false)}
                                            >
                                                Ver todas las notificaciones
                                            </Link>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Acceso rápido a citas */}
                    <Link
                        to="/citas"
                        className="hidden sm:flex p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                        title="Mis Citas"
                    >
                        <Calendar className="w-5 h-5" />
                    </Link>

                    {/* Menú de usuario */}
                    <div className="relative" ref={userMenuRef}>
                        <button
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            {user?.avatar ? (
                                <img
                                    src={user.avatar}
                                    alt={user.username}
                                    className="w-8 h-8 rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                    {getInitials(user?.fullName || user?.username || 'U')}
                                </div>
                            )}
                            <span className="hidden sm:block text-sm font-medium text-gray-700">
                {user?.firstName || user?.username}
              </span>
                        </button>

                        {/* Dropdown del usuario */}
                        <AnimatePresence>
                            {showUserMenu && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
                                >
                                    <div className="p-4 border-b border-gray-200">
                                        <p className="text-sm font-medium text-gray-900">
                                            {user?.fullName || `${user?.firstName} ${user?.lastName}`.trim()}
                                        </p>
                                        <p className="text-xs text-gray-500">{user?.email}</p>
                                        <span className={`inline-block mt-1 px-2 py-1 text-xs rounded-full ${
                                            user?.rol === 'admin' ? 'bg-purple-100 text-purple-800' :
                                                user?.rol === 'veterinario' ? 'bg-green-100 text-green-800' :
                                                    'bg-blue-100 text-blue-800'
                                        }`}>
                      {user?.rol?.charAt(0).toUpperCase() + user?.rol?.slice(1)}
                    </span>
                                    </div>

                                    <div className="py-2">
                                        <Link
                                            to="/profile"
                                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            onClick={() => setShowUserMenu(false)}
                                        >
                                            <User className="w-4 h-4 mr-3" />
                                            Mi Perfil
                                        </Link>

                                        <Link
                                            to="/settings"
                                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            onClick={() => setShowUserMenu(false)}
                                        >
                                            <Settings className="w-4 h-4 mr-3" />
                                            Configuración
                                        </Link>

                                        <Link
                                            to="/help"
                                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            onClick={() => setShowUserMenu(false)}
                                        >
                                            <MessageSquare className="w-4 h-4 mr-3" />
                                            Ayuda
                                        </Link>
                                    </div>

                                    <div className="border-t border-gray-200 py-2">
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                                        >
                                            <LogOut className="w-4 h-4 mr-3" />
                                            Cerrar Sesión
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;