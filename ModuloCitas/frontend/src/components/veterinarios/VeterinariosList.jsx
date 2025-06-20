import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Stethoscope,
    Plus,
    Edit,
    Trash2,
    Eye,
    Phone,
    Mail,
    Calendar,
    Clock,
    Download,
    RefreshCw,
    Star,
    Award,
    Search
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import DataTable, { StatusCell, DateCell } from '../common/DataTable';
import SearchBar from '../common/SearchBar';
import Modal from '../common/Modal';
import ConfirmModal, { useConfirmModal } from '../common/ConfirmModal';
import LoadingSpinner from '../common/LoadingSpinner';
import usuariosService from '../../services/usuariosService';
import { formatDate, formatTime } from '../../utils/helpers';
import toast from 'react-hot-toast';

const VeterinariosList = () => {
    const { user, hasRole } = useAuth();
    const { setCurrentPage, setLoading } = useApp();
    const navigate = useNavigate();
    const [veterinarios, setVeterinarios] = useState([]);
    const [filteredVeterinarios, setFilteredVeterinarios] = useState([]);
    const [loading, setLoadingLocal] = useState(true);
    const [selectedVeterinario, setSelectedVeterinario] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [filters, setFilters] = useState({
        especialidad: '',
        estado: '',
        disponibilidad: ''
    });
    const { showConfirm, ConfirmModal } = useConfirmModal();

    // Configurar página actual
    useEffect(() => {
        setCurrentPage('Veterinarios');
    }, [setCurrentPage]);

    // Cargar datos iniciales
    useEffect(() => {
        loadVeterinarios();
    }, [user]);

    const loadVeterinarios = async () => {
        try {
            setLoadingLocal(true);
            setLoading('veterinarios', true);

            const veterinariosData = await usuariosService.getVeterinarios(true);
            setVeterinarios(veterinariosData);
            setFilteredVeterinarios(veterinariosData);
        } catch (error) {
            console.error('Error loading veterinarios:', error);
            toast.error('Error al cargar los veterinarios');
        } finally {
            setLoadingLocal(false);
            setLoading('veterinarios', false);
        }
    };

    // Manejar búsqueda y filtros
    const handleSearch = (searchTerm, activeFilters) => {
        let filtered = [...veterinarios];

        // Aplicar búsqueda por texto
        if (searchTerm) {
            filtered = filtered.filter(veterinario =>
                veterinario.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                veterinario.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                veterinario.telefono?.includes(searchTerm) ||
                veterinario.especialidades?.some(esp =>
                    esp.toLowerCase().includes(searchTerm.toLowerCase())
                )
            );
        }

        // Aplicar filtros
        if (activeFilters.especialidad) {
            filtered = filtered.filter(veterinario =>
                veterinario.especialidades?.includes(activeFilters.especialidad)
            );
        }
        if (activeFilters.estado) {
            filtered = filtered.filter(veterinario =>
                veterinario.activo?.toString() === activeFilters.estado
            );
        }

        setFilteredVeterinarios(filtered);
        setFilters(activeFilters);
    };

    // Acciones de veterinarios
    const handleViewVeterinario = async (veterinario) => {
        try {
            const veterinarioDetalle = await usuariosService.getVeterinarioById(veterinario.id);
            setSelectedVeterinario(veterinarioDetalle);
            setShowDetailModal(true);
        } catch (error) {
            console.error('Error loading veterinario details:', error);
            toast.error('Error al cargar los detalles');
        }
    };

    const handleEditVeterinario = (veterinario) => {
        navigate(`/veterinarios/editar/${veterinario.id}`);
    };

    const handleDeleteVeterinario = (veterinario) => {
        showConfirm({
            title: 'Eliminar Veterinario',
            message: `¿Estás seguro de que deseas eliminar al Dr. ${veterinario.nombre}? Esta acción no se puede deshacer.`,
            confirmText: 'Eliminar',
            type: 'danger',
            onConfirm: async () => {
                try {
                    await usuariosService.deleteUsuario(veterinario.id);
                    toast.success('Veterinario eliminado exitosamente');
                    await loadVeterinarios();
                } catch (error) {
                    console.error('Error deleting veterinario:', error);
                    toast.error('Error al eliminar el veterinario');
                }
            }
        });
    };

    const handleToggleEstado = async (veterinario) => {
        try {
            await usuariosService.cambiarEstado(veterinario.id, !veterinario.activo);
            toast.success(`Veterinario ${!veterinario.activo ? 'activado' : 'desactivado'} exitosamente`);
            await loadVeterinarios();
        } catch (error) {
            console.error('Error toggling estado:', error);
            toast.error('Error al cambiar el estado');
        }
    };

    const handleViewDisponibilidad = (veterinario) => {
        navigate(`/disponibilidad?veterinarioId=${veterinario.id}`);
    };

    const handleViewCitas = (veterinario) => {
        navigate(`/citas?veterinarioId=${veterinario.id}`);
    };

    // Exportar veterinarios
    const handleExport = async () => {
        try {
            await usuariosService.exportarPDF(filters);
            toast.success('Reporte exportado exitosamente');
        } catch (error) {
            console.error('Error exporting veterinarios:', error);
            toast.error('Error al exportar el reporte');
        }
    };

    // Configuración de columnas para la tabla
    const columns = [
        {
            key: 'foto',
            title: 'Foto',
            render: (_, row) => (
                <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                        {row.foto ? (
                            <img
                                src={row.foto}
                                alt={row.nombre}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <Stethoscope className="w-5 h-5 text-gray-400" />
                        )}
                    </div>
                </div>
            ),
            sortable: false
        },
        {
            key: 'nombre',
            title: 'Veterinario',
            render: (value, row) => (
                <div>
                    <div className="font-medium text-gray-900">Dr. {value}</div>
                    <div className="text-sm text-gray-500">{row.numeroLicencia}</div>
                </div>
            ),
            searchable: true,
            sortable: true
        },
        {
            key: 'especialidades',
            title: 'Especialidades',
            render: (value) => (
                <div className="flex flex-wrap gap-1">
                    {(value || []).slice(0, 2).map((especialidad, index) => (
                        <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                        >
                            {especialidad}
                        </span>
                    ))}
                    {value && value.length > 2 && (
                        <span className="text-xs text-gray-500">+{value.length - 2} más</span>
                    )}
                </div>
            ),
            searchable: true
        },
        {
            key: 'telefono',
            title: 'Contacto',
            render: (_, row) => (
                <div className="text-sm">
                    <div className="flex items-center text-gray-900">
                        <Phone className="w-3 h-3 mr-1" />
                        {row.telefono}
                    </div>
                    <div className="flex items-center text-gray-500">
                        <Mail className="w-3 h-3 mr-1" />
                        {row.email}
                    </div>
                </div>
            ),
            searchable: true
        },
        {
            key: 'añosExperiencia',
            title: 'Experiencia',
            render: (value) => (
                <div className="text-center">
                    <div className="font-medium text-gray-900">{value || 0}</div>
                    <div className="text-xs text-gray-500">años</div>
                </div>
            ),
            sortable: true
        },
        {
            key: 'activo',
            title: 'Estado',
            render: (value) => (
                <StatusCell
                    value={value ? 'activo' : 'inactivo'}
                    colorMap={{
                        activo: 'bg-green-100 text-green-800',
                        inactivo: 'bg-red-100 text-red-800'
                    }}
                />
            ),
            sortable: true
        }
    ];

    // Acciones disponibles según el rol
    const getActions = (veterinario) => {
        const actions = [];

        // Ver detalles (admin)
        if (hasRole('admin')) {
            actions.push({
                icon: <Eye className="w-4 h-4" />,
                title: 'Ver detalles',
                onClick: () => handleViewVeterinario(veterinario),
                className: 'text-blue-600 hover:text-blue-800'
            });
        }

        // Editar (admin)
        if (hasRole('admin')) {
            actions.push({
                icon: <Edit className="w-4 h-4" />,
                title: 'Editar',
                onClick: () => handleEditVeterinario(veterinario),
                className: 'text-indigo-600 hover:text-indigo-800'
            });
        }

        // Ver disponibilidad
        actions.push({
            icon: <Clock className="w-4 h-4" />,
            title: 'Disponibilidad',
            onClick: () => handleViewDisponibilidad(veterinario),
            className: 'text-purple-600 hover:text-purple-800'
        });

        // Ver citas
        actions.push({
            icon: <Calendar className="w-4 h-4" />,
            title: 'Ver citas',
            onClick: () => handleViewCitas(veterinario),
            className: 'text-green-600 hover:text-green-800'
        });

        // Activar/Desactivar (admin)
        if (hasRole('admin')) {
            actions.push({
                icon: veterinario.activo ? <Trash2 className="w-4 h-4" /> : <Star className="w-4 h-4" />,
                title: veterinario.activo ? 'Desactivar' : 'Activar',
                onClick: () => handleToggleEstado(veterinario),
                className: veterinario.activo ? 'text-yellow-600 hover:text-yellow-800' : 'text-green-600 hover:text-green-800'
            });
        }

        // Eliminar (admin)
        if (hasRole('admin')) {
            actions.push({
                icon: <Trash2 className="w-4 h-4" />,
                title: 'Eliminar',
                onClick: () => handleDeleteVeterinario(veterinario),
                className: 'text-red-600 hover:text-red-800'
            });
        }

        return actions;
    };

    // Configuración de filtros para SearchBar
    const searchFilters = [
        {
            key: 'especialidad',
            label: 'Especialidad',
            type: 'select',
            options: usuariosService.getEspecialidadesVeterinarias().map(esp => ({
                value: esp,
                label: esp
            }))
        },
        {
            key: 'estado',
            label: 'Estado',
            type: 'select',
            options: [
                { value: 'true', label: 'Activo' },
                { value: 'false', label: 'Inactivo' }
            ]
        }
    ];

    if (loading) {
        return <LoadingSpinner text="Cargando veterinarios..." />;
    }

    return (
        <div className="space-y-6">

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
            >
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Gestión de Veterinarios
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Administra el equipo de veterinarios de la clínica
                    </p>
                </div>

                <div className="mt-4 sm:mt-0 flex items-center space-x-3">
                    <button
                        onClick={() => loadVeterinarios()}
                        className="btn-secondary flex items-center"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Actualizar
                    </button>

                    <button
                        onClick={handleExport}
                        className="btn-secondary flex items-center"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Exportar
                    </button>

                    {hasRole('admin') && (
                        <Link
                            to="/veterinarios/nuevo"
                            className="btn-primary flex items-center"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Nuevo Veterinario
                        </Link>
                    )}
                </div>
            </motion.div>

            {/* Barra de búsqueda */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <SearchBar
                    placeholder="Buscar por nombre, especialidad, teléfono..."
                    onSearch={handleSearch}
                    onFilterChange={handleSearch}
                    filters={searchFilters}
                    showFilters={true}
                    showSuggestions={true}
                />
            </motion.div>

            {/* Tabla de veterinarios */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <DataTable
                    data={filteredVeterinarios}
                    columns={columns}
                    isLoading={loading}
                    searchable={false}
                    filterable={false}
                    sortable={true}
                    pagination={true}
                    pageSize={10}
                    onRowClick={handleViewVeterinario}
                    onRefresh={loadVeterinarios}
                    onExport={handleExport}
                    actions={getActions}
                    emptyMessage="No hay veterinarios registrados"
                    className="bg-white"
                />
            </motion.div>

            {/* Modal de detalles */}
            <Modal
                isOpen={showDetailModal}
                onClose={() => setShowDetailModal(false)}
                title={`Dr. ${selectedVeterinario?.nombre}`}
                size="large"
            >
                {selectedVeterinario && (
                    <div className="p-6 space-y-6">

                        {/* Información básica */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="text-center">
                                    <div className="w-32 h-32 mx-auto rounded-full overflow-hidden bg-gray-200 mb-4">
                                        {selectedVeterinario.foto ? (
                                            <img
                                                src={selectedVeterinario.foto}
                                                alt={selectedVeterinario.nombre}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Stethoscope className="w-16 h-16 text-gray-400" />
                                            </div>
                                        )}
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900">
                                        Dr. {selectedVeterinario.nombre}
                                    </h3>
                                    <p className="text-gray-500">{selectedVeterinario.numeroLicencia}</p>
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <span className="text-sm font-medium text-gray-500">Email:</span>
                                        <p className="text-sm text-gray-900">{selectedVeterinario.email}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-gray-500">Teléfono:</span>
                                        <p className="text-sm text-gray-900">{selectedVeterinario.telefono}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-gray-500">Años de experiencia:</span>
                                        <p className="text-sm text-gray-900">{selectedVeterinario.añosExperiencia || 0} años</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-lg font-medium text-gray-900 mb-3">Especialidades</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {(selectedVeterinario.especialidades || []).map((especialidad, index) => (
                                            <span
                                                key={index}
                                                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
                                            >
                                                <Award className="w-3 h-3 mr-1" />
                                                {especialidad}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {selectedVeterinario.biografia && (
                                    <div>
                                        <h4 className="text-lg font-medium text-gray-900 mb-2">Biografía</h4>
                                        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                                            {selectedVeterinario.biografia}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Acciones */}
                        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="btn-secondary"
                            >
                                Cerrar
                            </button>
                            <button
                                onClick={() => {
                                    setShowDetailModal(false);
                                    handleViewDisponibilidad(selectedVeterinario);
                                }}
                                className="btn-primary flex items-center"
                            >
                                <Clock className="w-4 h-4 mr-2" />
                                Ver Disponibilidad
                            </button>
                            {hasRole('admin') && (
                                <button
                                    onClick={() => {
                                        setShowDetailModal(false);
                                        handleEditVeterinario(selectedVeterinario);
                                    }}
                                    className="btn-primary flex items-center"
                                >
                                    <Edit className="w-4 h-4 mr-2" />
                                    Editar
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </Modal>

            {/* Modal de confirmación */}
            <ConfirmModal />
        </div>
    );
};

export default VeterinariosList;