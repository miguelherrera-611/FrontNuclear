import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Calendar,
    Heart,
    Users,
    TrendingUp,
    Clock,
    AlertCircle,
    Plus,
    ChevronRight,
    Activity,
    Star,
    ShoppingBag,
    FileText,
    Phone,
    Mail
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import LoadingSpinner from '../common/LoadingSpinner';
import { formatDate, formatTime, formatPrice } from '../../utils/helpers';
import citasService from '../../services/citasService';
import mascotasService from '../../services/mascotasService';
import usuariosService from '../../services/usuariosService';
import tiendaService from '../../services/tiendaService';

const Dashboard = () => {
    const { user, hasRole } = useAuth();
    const { setCurrentPage } = useApp();
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState({
        stats: {},
        recentCitas: [],
        proximasCitas: [],
        mascotas: [],
        notifications: [],
        reportes: {}
    });

    // Configurar página actual
    useEffect(() => {
        setCurrentPage('Dashboard');
    }, [setCurrentPage]);

    // Cargar datos del dashboard
    useEffect(() => {
        loadDashboardData();
    }, [user]);

    const loadDashboardData = async () => {
        try {
            setLoading(true);

            if (hasRole('admin')) {
                await loadAdminData();
            } else if (hasRole('veterinario')) {
                await loadVeterinarioData();
            } else if (hasRole('usuario')) {
                await loadUserData();
            } else if (hasRole('recepcionista')) {
                await loadRecepcionistaData();
            }
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadAdminData = async () => {
        try {
            const [statsResponse, citasResponse, usuariosResponse, ventasResponse] = await Promise.all([
                citasService.getEstadisticas('mes'),
                citasService.getCitasDelDia(),
                usuariosService.getEstadisticas(),
                tiendaService.getEstadisticasVentas('mes')
            ]);

            setDashboardData({
                stats: {
                    totalCitas: statsResponse.total || 0,
                    citasHoy: citasResponse.length || 0,
                    totalUsuarios: usuariosResponse.total || 0,
                    ventasMes: ventasResponse.total || 0,
                    crecimiento: statsResponse.crecimiento || 0
                },
                recentCitas: citasResponse.slice(0, 5) || [],
                proximasCitas: [],
                notifications: [
                    {
                        id: 1,
                        type: 'info',
                        title: 'Sistema actualizado',
                        message: 'Nueva versión disponible con mejoras de rendimiento'
                    }
                ]
            });
        } catch (error) {
            console.error('Error loading admin data:', error);
        }
    };

    const loadVeterinarioData = async () => {
        try {
            const [citasHoy, proximasCitas, estadisticas] = await Promise.all([
                citasService.getCitasByVeterinario(user.id, new Date().toISOString().split('T')[0]),
                citasService.getCitasByVeterinario(user.id),
                citasService.getEstadisticas('semana')
            ]);

            setDashboardData({
                stats: {
                    citasHoy: citasHoy.length || 0,
                    citasSemana: estadisticas.semana || 0,
                    pacientesAtendidos: estadisticas.pacientes || 0,
                    horasDisponibles: 8
                },
                recentCitas: citasHoy.slice(0, 5) || [],
                proximasCitas: proximasCitas.filter(c => new Date(c.fecha) > new Date()).slice(0, 5) || [],
                notifications: [
                    {
                        id: 1,
                        type: 'warning',
                        title: 'Cita próxima',
                        message: 'Tienes una cita en 30 minutos'
                    }
                ]
            });
        } catch (error) {
            console.error('Error loading veterinario data:', error);
        }
    };

    const loadUserData = async () => {
        try {
            const [misMascotas, misCitas, proximasCitas] = await Promise.all([
                mascotasService.getMascotasByPropietario(user.id),
                citasService.getCitasByUsuario(user.id),
                citasService.getCitasByUsuario(user.id)
            ]);

            const citasPendientes = misCitas.filter(c => c.estado === 'pendiente' || c.estado === 'confirmada');
            const proximasFilter = proximasCitas.filter(c => new Date(c.fecha) > new Date()).slice(0, 3);

            setDashboardData({
                stats: {
                    totalMascotas: misMascotas.length || 0,
                    citasPendientes: citasPendientes.length || 0,
                    ultimaCita: misCitas.length > 0 ? misCitas[0].fecha : null
                },
                mascotas: misMascotas.slice(0, 4) || [],
                proximasCitas: proximasFilter || [],
                recentCitas: misCitas.slice(0, 3) || [],
                notifications: [
                    {
                        id: 1,
                        type: 'success',
                        title: '¡Bienvenido!',
                        message: 'Gestiona las citas y el cuidado de tus mascotas'
                    }
                ]
            });
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    };

    const loadRecepcionistaData = async () => {
        try {
            const [citasHoy, pendientes, usuarios] = await Promise.all([
                citasService.getCitasDelDia(),
                citasService.getCitas({ estado: 'pendiente' }),
                usuariosService.getUsuarios({ activo: true })
            ]);

            setDashboardData({
                stats: {
                    citasHoy: citasHoy.length || 0,
                    citasPendientes: pendientes.length || 0,
                    usuariosActivos: usuarios.length || 0
                },
                recentCitas: citasHoy.slice(0, 5) || [],
                notifications: [
                    {
                        id: 1,
                        type: 'info',
                        title: 'Citas pendientes',
                        message: `Hay ${pendientes.length} citas por confirmar`
                    }
                ]
            });
        } catch (error) {
            console.error('Error loading recepcionista data:', error);
        }
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        const name = user?.firstName || user?.username || 'Usuario';

        if (hour < 12) return `¡Buenos días, ${name}!`;
        if (hour < 18) return `¡Buenas tardes, ${name}!`;
        return `¡Buenas noches, ${name}!`;
    };

    const getRoleSpecificStats = () => {
        if (hasRole('admin')) {
            return [
                {
                    title: 'Total Citas',
                    value: dashboardData.stats.totalCitas || 0,
                    icon: Calendar,
                    color: 'text-blue-600',
                    bgColor: 'bg-blue-100',
                    trend: dashboardData.stats.crecimiento > 0 ? 'up' : 'down',
                    trendValue: `${Math.abs(dashboardData.stats.crecimiento || 0)}%`
                },
                {
                    title: 'Usuarios Registrados',
                    value: dashboardData.stats.totalUsuarios || 0,
                    icon: Users,
                    color: 'text-green-600',
                    bgColor: 'bg-green-100',
                    trend: 'up',
                    trendValue: '12%'
                },
                {
                    title: 'Ventas del Mes',
                    value: formatPrice(dashboardData.stats.ventasMes || 0),
                    icon: TrendingUp,
                    color: 'text-purple-600',
                    bgColor: 'bg-purple-100',
                    trend: 'up',
                    trendValue: '8%'
                },
                {
                    title: 'Citas Hoy',
                    value: dashboardData.stats.citasHoy || 0,
                    icon: Clock,
                    color: 'text-orange-600',
                    bgColor: 'bg-orange-100'
                }
            ];
        }

        if (hasRole('veterinario')) {
            return [
                {
                    title: 'Citas Hoy',
                    value: dashboardData.stats.citasHoy || 0,
                    icon: Calendar,
                    color: 'text-blue-600',
                    bgColor: 'bg-blue-100'
                },
                {
                    title: 'Citas Esta Semana',
                    value: dashboardData.stats.citasSemana || 0,
                    icon: Activity,
                    color: 'text-green-600',
                    bgColor: 'bg-green-100'
                },
                {
                    title: 'Pacientes Atendidos',
                    value: dashboardData.stats.pacientesAtendidos || 0,
                    icon: Heart,
                    color: 'text-pink-600',
                    bgColor: 'bg-pink-100'
                },
                {
                    title: 'Horas Disponibles',
                    value: dashboardData.stats.horasDisponibles || 0,
                    icon: Clock,
                    color: 'text-orange-600',
                    bgColor: 'bg-orange-100'
                }
            ];
        }

        if (hasRole('usuario')) {
            return [
                {
                    title: 'Mis Mascotas',
                    value: dashboardData.stats.totalMascotas || 0,
                    icon: Heart,
                    color: 'text-pink-600',
                    bgColor: 'bg-pink-100'
                },
                {
                    title: 'Citas Pendientes',
                    value: dashboardData.stats.citasPendientes || 0,
                    icon: Calendar,
                    color: 'text-blue-600',
                    bgColor: 'bg-blue-100'
                },
                {
                    title: 'Última Cita',
                    value: dashboardData.stats.ultimaCita ? formatDate(dashboardData.stats.ultimaCita) : 'N/A',
                    icon: Clock,
                    color: 'text-green-600',
                    bgColor: 'bg-green-100'
                }
            ];
        }

        // Recepcionista
        return [
            {
                title: 'Citas Hoy',
                value: dashboardData.stats.citasHoy || 0,
                icon: Calendar,
                color: 'text-blue-600',
                bgColor: 'bg-blue-100'
            },
            {
                title: 'Citas Pendientes',
                value: dashboardData.stats.citasPendientes || 0,
                icon: AlertCircle,
                color: 'text-yellow-600',
                bgColor: 'bg-yellow-100'
            },
            {
                title: 'Usuarios Activos',
                value: dashboardData.stats.usuariosActivos || 0,
                icon: Users,
                color: 'text-green-600',
                bgColor: 'bg-green-100'
            }
        ];
    };

    if (loading) {
        return <LoadingSpinner text="Cargando dashboard..." />;
    }

    const stats = getRoleSpecificStats();

    return (
        <div className="space-y-6">

            {/* Header de bienvenida */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white p-6"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold mb-2">{getGreeting()}</h1>
                        <p className="text-blue-100">
                            {hasRole('admin') && 'Panel de administración del sistema VetClinic'}
                            {hasRole('veterinario') && 'Tu agenda y pacientes te esperan'}
                            {hasRole('usuario') && 'Cuida la salud de tus mascotas'}
                            {hasRole('recepcionista') && 'Gestiona citas y atención al cliente'}
                        </p>
                    </div>
                    <div className="hidden sm:block">
                        <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                            <Heart className="w-8 h-8 text-white" />
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Estadísticas principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <motion.div
                            key={stat.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                                    {stat.trend && (
                                        <div className={`flex items-center mt-2 text-sm ${
                                            stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                            <TrendingUp className={`w-4 h-4 mr-1 ${
                                                stat.trend === 'down' ? 'transform rotate-180' : ''
                                            }`} />
                                            {stat.trendValue}
                                        </div>
                                    )}
                                </div>
                                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                                    <Icon className={`w-6 h-6 ${stat.color}`} />
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Contenido específico por rol */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Citas recientes/próximas */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white rounded-lg shadow-sm border border-gray-200"
                >
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900">
                                {hasRole('usuario') ? 'Próximas Citas' : 'Citas de Hoy'}
                            </h2>
                            <Link
                                to="/citas"
                                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
                            >
                                Ver todas
                                <ChevronRight className="w-4 h-4 ml-1" />
                            </Link>
                        </div>
                    </div>
                    <div className="p-6">
                        {(hasRole('usuario') ? dashboardData.proximasCitas : dashboardData.recentCitas).length > 0 ? (
                            <div className="space-y-4">
                                {(hasRole('usuario') ? dashboardData.proximasCitas : dashboardData.recentCitas).map((cita, index) => (
                                    <div key={cita.id || index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                            <Calendar className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900">
                                                {cita.mascota?.nombre || 'Mascota'} - {cita.tipoServicio || 'Consulta'}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {formatDate(cita.fecha)} • {formatTime(cita.hora)}
                                            </p>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            cita.estado === 'confirmada' ? 'bg-green-100 text-green-800' :
                                                cita.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-gray-100 text-gray-800'
                                        }`}>
                      {cita.estado}
                    </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500">No hay citas programadas</p>
                                <Link
                                    to="/citas/nueva"
                                    className="btn-primary mt-3 inline-flex items-center"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Agendar Cita
                                </Link>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Panel específico por rol */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white rounded-lg shadow-sm border border-gray-200"
                >
                    {hasRole('usuario') && (
                        <>
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-semibold text-gray-900">Mis Mascotas</h2>
                                    <Link
                                        to="/mascotas"
                                        className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
                                    >
                                        Ver todas
                                        <ChevronRight className="w-4 h-4 ml-1" />
                                    </Link>
                                </div>
                            </div>
                            <div className="p-6">
                                {dashboardData.mascotas.length > 0 ? (
                                    <div className="space-y-4">
                                        {dashboardData.mascotas.map((mascota, index) => (
                                            <div key={mascota.id || index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                                <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                                                    <Heart className="w-5 h-5 text-pink-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-900">{mascota.nombre}</p>
                                                    <p className="text-sm text-gray-500">
                                                        {mascota.especie} • {mascota.raza}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500">No tienes mascotas registradas</p>
                                        <Link
                                            to="/mascotas/nueva"
                                            className="btn-primary mt-3 inline-flex items-center"
                                        >
                                            <Plus className="w-4 h-4 mr-2" />
                                            Registrar Mascota
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {(hasRole('admin') || hasRole('veterinario') || hasRole('recepcionista')) && (
                        <>
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-900">Acciones Rápidas</h2>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-2 gap-3">
                                    <Link
                                        to="/citas/nueva"
                                        className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                                    >
                                        <Calendar className="w-6 h-6 text-blue-600 mb-2" />
                                        <span className="text-sm font-medium text-blue-900">Nueva Cita</span>
                                    </Link>

                                    {hasRole('admin') && (
                                        <Link
                                            to="/usuarios/nuevo"
                                            className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                                        >
                                            <Users className="w-6 h-6 text-green-600 mb-2" />
                                            <span className="text-sm font-medium text-green-900">Nuevo Usuario</span>
                                        </Link>
                                    )}

                                    <Link
                                        to="/mascotas/nueva"
                                        className="flex flex-col items-center p-4 bg-pink-50 rounded-lg hover:bg-pink-100 transition-colors"
                                    >
                                        <Heart className="w-6 h-6 text-pink-600 mb-2" />
                                        <span className="text-sm font-medium text-pink-900">Nueva Mascota</span>
                                    </Link>

                                    <Link
                                        to="/reportes"
                                        className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                                    >
                                        <FileText className="w-6 h-6 text-purple-600 mb-2" />
                                        <span className="text-sm font-medium text-purple-900">Reportes</span>
                                    </Link>
                                </div>
                            </div>
                        </>
                    )}
                </motion.div>
            </div>

            {/* Notificaciones */}
            {dashboardData.notifications.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-white rounded-lg shadow-sm border border-gray-200"
                >
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">Notificaciones</h2>
                    </div>
                    <div className="p-6">
                        <div className="space-y-4">
                            {dashboardData.notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`p-4 rounded-lg border-l-4 ${
                                        notification.type === 'success' ? 'bg-green-50 border-green-400' :
                                            notification.type === 'warning' ? 'bg-yellow-50 border-yellow-400' :
                                                notification.type === 'error' ? 'bg-red-50 border-red-400' :
                                                    'bg-blue-50 border-blue-400'
                                    }`}
                                >
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0">
                                            <AlertCircle className={`w-5 h-5 ${
                                                notification.type === 'success' ? 'text-green-600' :
                                                    notification.type === 'warning' ? 'text-yellow-600' :
                                                        notification.type === 'error' ? 'text-red-600' :
                                                            'text-blue-600'
                                            }`} />
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="text-sm font-medium text-gray-900">
                                                {notification.title}
                                            </h3>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {notification.message}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default Dashboard;