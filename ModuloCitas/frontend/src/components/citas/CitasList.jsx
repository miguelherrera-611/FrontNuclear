import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Calendar,
    Plus,
    Filter,
    Download,
    Edit,
    Trash2,
    Eye,
    Clock,
    Search,
    RefreshCw,
    CheckCircle,
    XCircle,
    AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import DataTable, { StatusCell, DateCell, ActionsCell } from '../common/DataTable';
import SearchBar from '../common/SearchBar';
import Modal from '../common/Modal';
import ConfirmModal, { useConfirmModal } from '../common/ConfirmModal';
import LoadingSpinner from '../common/LoadingSpinner';
import citasService from '../../services/citasService';
import usuariosService from '../../services/usuariosService';
import mascotasService from '../../services/mascotasService';
import { formatDate, formatTime, getColorByStatus } from '../../utils/helpers';
import { ESTADOS_CITA, TIPOS_SERVICIO } from '../../utils/constants';
import toast from 'react-hot-toast';

const CitasList = () => {
    const { user, hasRole } = useAuth();
    const { setCurrentPage, setLoading } = useApp();
    const navigate = useNavigate();
    const [citas, setCitas] = useState([]);
    const [filteredCitas, setFilteredCitas] = useState([]);
    const [loading, setLoadingLocal] = useState(true);
    const [veterinarios, setVeterinarios] = useState([]);
    const [filters, setFilters] = useState({
        estado: '',
        fecha: '',
        veterinario: '',
        tipoServicio: ''
    });
    const [selectedCita, setSelectedCita] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const { showConfirm, ConfirmModal } = useConfirmModal();

    // Configurar página actual
    useEffect(() => {
        setCurrentPage('Citas');
    }, [setCurrentPage]);

    // Cargar datos iniciales
    useEffect(() => {
        loadInitialData();
    }, [user]);

    const loadInitialData = async () => {
        try {
            setLoadingLocal(true);
            setLoading('citas', true);

            await Promise.all([
                loadCitas(),
                loadVeterinarios()
            ]);
        } catch (error) {
            console.error('Error loading initial data:', error);
            toast.error('Error al cargar los datos');
        } finally {
            setLoadingLocal(false);
            setLoading('citas', false);
        }
    };

    const loadCitas = async () => {
        try {
            let citasData;

            if (hasRole('usuario')) {
                // Usuario solo ve sus propias citas
                citasData = await citasService.getCitasByUsuario(user.id);
            } else if (hasRole('veterinario')) {
                // Veterinario ve sus citas asignadas
                citasData = await citasService.getCitasByVeterinario(user.id);
            } else {
                // Admin y recepcionista ven todas las citas
                citasData = await citasService.getCitas();
            }

            setCitas(citasData);
            setFilteredCitas(citasData);
        } catch (error) {
            console.error('Error loading citas:', error);
            throw error;
        }
    };

    const loadVeterinarios = async () => {
        try {
            const veterinariosData = await usuariosService.getVeterinarios();
            setVeterinarios(veterinariosData);
        } catch (error) {
            console.error('Error loading veterinarios:', error);
        }
    };

    // Manejar búsqueda y filtros
    const handleSearch = (searchTerm, activeFilters) => {
        let filtered = [...citas];

        // Aplicar búsqueda por texto
        if (searchTerm) {
            filtered = filtered.filter(cita =>
                cita.mascota?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                cita.propietario?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                cita.veterinario?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                cita.tipoServicio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                cita.notas?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Aplicar filtros
        if (activeFilters.estado) {
            filtered = filtered.filter(cita => cita.estado === activeFilters.estado);
        }
        if (activeFilters.fecha) {
            filtered = filtered.filter(cita =>
                new Date(cita.fecha).toISOString().split('T')[0] === activeFilters.fecha
            );
        }
        if (activeFilters.veterinario) {
            filtered = filtered.filter(cita => cita.veterinarioId === activeFilters.veterinario);
        }
        if (activeFilters.tipoServicio) {
            filtered = filtered.filter(cita => cita.tipoServicio === activeFilters.tipoServicio);
        }

        setFilteredCitas(filtered);
        setFilters(activeFilters);
    };

    // Acciones de citas
    const handleViewCita = (cita) => {
        setSelectedCita(cita);
        setShowDetailModal(true);
    };

    const handleEditCita = (cita) => {
        navigate(`/citas/editar/${cita.id}`);
    };

    const handleDeleteCita = (cita) => {
        showConfirm({
            title: 'Eliminar Cita',
            message: `¿Estás seguro de que deseas eliminar la cita de ${cita.mascota?.nombre} programada para el ${formatDate(cita.fecha)}?`,
            confirmText: 'Eliminar',
            type: 'danger',
            onConfirm: async () => {
                try {
                    await citasService.deleteCita(cita.id);
                    toast.success('Cita eliminada exitosamente');
                    await loadCitas();
                } catch (error) {
                    console.error('Error deleting cita:', error);
                    toast.error('Error al eliminar la cita');
                }
            }
        });
    };

    const handleConfirmarCita = async (cita) => {
        try {
            await citasService.confirmarCita(cita.id);
            toast.success('Cita confirmada exitosamente');
            await loadCitas();
        } catch (error) {
            console.error('Error confirming cita:', error);
            toast.error('Error al confirmar la cita');
        }
    };

    const handleCancelarCita = (cita) => {
        showConfirm({
            title: 'Cancelar Cita',
            message: `¿Estás seguro de que deseas cancelar la cita de ${cita.mascota?.nombre}?`,
            confirmText: 'Cancelar Cita',
            type: 'warning',
            onConfirm: async () => {
                try {
                    await citasService.cancelarCita(cita.id, 'Cancelada por el usuario');
                    toast.success('Cita cancelada exitosamente');
                    await loadCitas();
                } catch (error) {
                    console.error('Error canceling cita:', error);
                    toast.error('Error al cancelar la cita');
                }
            }
        });
    };

    const handleCompletarCita = async (cita) => {
        try {
            await citasService.completarCita(cita.id);
            toast.success('Cita completada exitosamente');
            await loadCitas();
        } catch (error) {
            console.error('Error completing cita:', error);
            toast.error('Error al completar la cita');
        }
    };

    // Exportar citas
    const handleExport = async () => {
        try {
            await citasService.exportarPDF(filters);
            toast.success('Reporte exportado exitosamente');
        } catch (error) {
            console.error('Error exporting citas:', error);
            toast.error('Error al exportar el reporte');
        }
    };

    // Configuración de columnas para la tabla
    const columns = [
        {
            key: 'fecha',
            title: 'Fecha',
            render: (value) => <DateCell value={value} />,
            sortable: true
        },
        {
            key: 'hora',
            title: 'Hora',
            render: (value) => <span className="font-mono">{formatTime(value)}</span>,
            sortable: true
        },
        {
            key: 'mascota',
            title: 'Mascota',
            render: (_, row) => (
                <div>
                    <div className="font-medium text-gray-900">{row.mascota?.nombre}</div>
                    <div className="text-sm text-gray-500">{row.mascota?.especie}</div>
                </div>
            ),
            searchable: true
        },
        ...(hasRole('veterinario') || hasRole('admin') || hasRole('recepcionista') ? [{
            key: 'propietario',
            title: 'Propietario',
            render: (_, row) => (
                <div>
                    <div className="font-medium text-gray-900">{row.propietario?.nombre}</div>
                    <div className="text-sm text-gray-500">{row.propietario?.telefono}</div>
                </div>
            ),
            searchable: true
        }] : []),
        ...(hasRole('admin') || hasRole('recepcionista') || hasRole('usuario') ? [{
            key: 'veterinario',
            title: 'Veterinario',
            render: (_, row) => (
                <div className="font-medium text-gray-900">
                    Dr. {row.veterinario?.nombre}
                </div>
            ),
            searchable: true
        }] : []),
        {
            key: 'tipoServicio',
            title: 'Servicio',
            render: (value) => (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {value}
        </span>
            ),
            sortable: true
        },
        {
            key: 'estado',
            title: 'Estado',
            render: (value) => <StatusCell value={value} colorMap={{
                pendiente: 'bg-yellow-100 text-yellow-800',
                confirmada: 'bg-blue-100 text-blue-800',
                en_curso: 'bg-purple-100 text-purple-800',
                completada: 'bg-green-100 text-green-800',
                cancelada: 'bg-red-100 text-red-800',
                no_asistio: 'bg-gray-100 text-gray-800'
            }} />,
            filterable: true,
            filterType: 'select',
            filterOptions: Object.values(ESTADOS_CITA).map(estado => ({
                value: estado,
                label: estado.charAt(0).toUpperCase() + estado.slice(1).replace('_', ' ')
            })),
            sortable: true
        }
    ];

    // Acciones disponibles según el rol y estado de la cita
    const getActions = (cita) => {
        const actions = [];

        // Ver detalles (todos los roles)
        actions.push({
            icon: <Eye className="w-4 h-4" />,
            title: 'Ver detalles',
            onClick: () => handleViewCita(cita),
            className: 'text-blue-600 hover:text-blue-800'
        });

        // Editar (admin, recepcionista, propietario si está pendiente)
        if (hasRole('admin') || hasRole('recepcionista') ||
            (hasRole('usuario') && cita.estado === 'pendiente')) {
            actions.push({
                icon: <Edit className="w-4 h-4" />,
                title: 'Editar',
                onClick: () => handleEditCita(cita),
                className: 'text-indigo-600 hover:text-indigo-800'
            });
        }

        // Confirmar (admin, recepcionista, veterinario)
        if (cita.estado === 'pendiente' &&
            (hasRole('admin') || hasRole('recepcionista') || hasRole('veterinario'))) {
            actions.push({
                icon: <CheckCircle className="w-4 h-4" />,
                title: 'Confirmar',
                onClick: () => handleConfirmarCita(cita),
                className: 'text-green-600 hover:text-green-800'
            });
        }

        // Completar (veterinario)
        if (cita.estado === 'confirmada' && hasRole('veterinario')) {
            actions.push({
                icon: <CheckCircle className="w-4 h-4" />,
                title: 'Completar',
                onClick: () => handleCompletarCita(cita),
                className: 'text-green-600 hover:text-green-800'
            });
        }

        // Cancelar
        if (['pendiente', 'confirmada'].includes(cita.estado)) {
            actions.push({
                icon: <XCircle className="w-4 h-4" />,
                title: 'Cancelar',
                onClick: () => handleCancelarCita(cita),
                className: 'text-yellow-600 hover:text-yellow-800'
            });
        }

        // Eliminar (admin)
        if (hasRole('admin')) {
            actions.push({
                icon: <Trash2 className="w-4 h-4" />,
                title: 'Eliminar',
                onClick: () => handleDeleteCita(cita),
                className: 'text-red-600 hover:text-red-800'
            });
        }

        return actions;
    };

    // Configuración de filtros para SearchBar
    const searchFilters = [
        {
            key: 'estado',
            label: 'Estado',
            type: 'select',
            options: Object.values(ESTADOS_CITA).map(estado => ({
                value: estado,
                label: estado.charAt(0).toUpperCase() + estado.slice(1).replace('_', ' ')
            }))
        },
        {
            key: 'fecha',
            label: 'Fecha',
            type: 'date'
        },
        ...(veterinarios.length > 0 ? [{
            key: 'veterinario',
            label: 'Veterinario',
            type: 'select',
            options: veterinarios.map(vet => ({
                value: vet.id,
                label: `Dr. ${vet.nombre}`
            }))
        }] : []),
        {
            key: 'tipoServicio',
            label: 'Tipo de Servicio',
            type: 'select',
            options: Object.values(TIPOS_SERVICIO).map(tipo => ({
                value: tipo,
                label: tipo.charAt(0).toUpperCase() + tipo.slice(1).replace('_', ' ')
            }))
        }
    ];

    if (loading) {
        return <LoadingSpinner text="Cargando citas..." />;
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
                        {hasRole('usuario') ? 'Mis Citas' : 'Gestión de Citas'}
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        {hasRole('usuario')
                            ? 'Administra tus citas veterinarias'
                            : 'Administra todas las citas del sistema'
                        }
                    </p>
                </div>

                <div className="mt-4 sm:mt-0 flex space-x-3">
                    <button
                        onClick={() => loadCitas()}
                        className="btn-secondary flex items-center"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Actualizar
                    </button>

                    {(hasRole('admin') || hasRole('recepcionista') || hasRole('veterinario')) && (
                        <button
                            onClick={handleExport}
                            className="btn-secondary flex items-center"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Exportar
                        </button>
                    )}

                    <Link
                        to="/citas/nueva"
                        className="btn-primary flex items-center"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Nueva Cita
                    </Link>
                </div>
            </motion.div>

            {/* Barra de búsqueda */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <SearchBar
                    placeholder="Buscar por mascota, propietario, veterinario..."
                    onSearch={handleSearch}
                    onFilterChange={handleSearch}
                    filters={searchFilters}
                    showFilters={true}
                    showSuggestions={true}
                />
            </motion.div>

            {/* Tabla de citas */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <DataTable
                    data={filteredCitas}
                    columns={columns}
                    isLoading={loading}
                    searchable={false} // Ya tenemos SearchBar
                    filterable={false} // Ya tenemos SearchBar
                    sortable={true}
                    pagination={true}
                    pageSize={10}
                    onRowClick={handleViewCita}
                    onRefresh={loadCitas}
                    onExport={handleExport}
                    actions={getActions}
                    emptyMessage="No hay citas registradas"
                    className="bg-white"
                />
            </motion.div>

            {/* Modal de detalles */}
            <Modal
                isOpen={showDetailModal}
                onClose={() => setShowDetailModal(false)}
                title="Detalles de la Cita"
                size="large"
            >
                {selectedCita && (
                    <div className="p-6 space-y-6">

                        {/* Información básica */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">
                                    Información de la Cita
                                </h3>
                                <div className="space-y-3">
                                    <div>
                                        <span className="text-sm font-medium text-gray-500">Fecha:</span>
                                        <p className="text-sm text-gray-900">{formatDate(selectedCita.fecha)}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-gray-500">Hora:</span>
                                        <p className="text-sm text-gray-900">{formatTime(selectedCita.hora)}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-gray-500">Tipo de Servicio:</span>
                                        <p className="text-sm text-gray-900">{selectedCita.tipoServicio}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-gray-500">Estado:</span>
                                        <StatusCell value={selectedCita.estado} />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">
                                    Información de la Mascota
                                </h3>
                                <div className="space-y-3">
                                    <div>
                                        <span className="text-sm font-medium text-gray-500">Nombre:</span>
                                        <p className="text-sm text-gray-900">{selectedCita.mascota?.nombre}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-gray-500">Especie:</span>
                                        <p className="text-sm text-gray-900">{selectedCita.mascota?.especie}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-gray-500">Raza:</span>
                                        <p className="text-sm text-gray-900">{selectedCita.mascota?.raza}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-gray-500">Propietario:</span>
                                        <p className="text-sm text-gray-900">{selectedCita.propietario?.nombre}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Notas */}
                        {selectedCita.notas && (
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Notas</h3>
                                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                                    {selectedCita.notas}
                                </p>
                            </div>
                        )}

                        {/* Acciones */}
                        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="btn-secondary"
                            >
                                Cerrar
                            </button>
                            {selectedCita.estado === 'pendiente' && (hasRole('admin') || hasRole('recepcionista') || hasRole('usuario')) && (
                                <button
                                    onClick={() => {
                                        setShowDetailModal(false);
                                        handleEditCita(selectedCita);
                                    }}
                                    className="btn-primary"
                                >
                                    Editar Cita
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

export default CitasList;