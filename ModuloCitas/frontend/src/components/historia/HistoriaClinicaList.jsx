import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FileText,
    Plus,
    Edit,
    Trash2,
    Eye,
    Calendar,
    User,
    Stethoscope,
    Download,
    RefreshCw,
    Search,
    Filter,
    Heart
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useApp } from '../../../context/AppContext';
import DataTable, { StatusCell, DateCell } from '../../common/DataTable';
import SearchBar from '../../common/SearchBar';
import Modal from '../../common/Modal';
import ConfirmModal, { useConfirmModal } from '../../common/ConfirmModal';
import LoadingSpinner from '../../common/LoadingSpinner';
import { apiRequest } from '../../../services/api';
import { formatDate, formatTime } from '../../../utils/helpers';
import toast from 'react-hot-toast';

const HistoriaClinicaList = () => {
    const { user, hasRole } = useAuth();
    const { setCurrentPage, setLoading } = useApp();
    const navigate = useNavigate();
    const [historias, setHistorias] = useState([]);
    const [filteredHistorias, setFilteredHistorias] = useState([]);
    const [loading, setLoadingLocal] = useState(true);
    const [selectedHistoria, setSelectedHistoria] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [filters, setFilters] = useState({
        veterinario: '',
        paciente: '',
        fecha: ''
    });
    const { showConfirm, ConfirmModal } = useConfirmModal();

    // Configurar página actual
    useEffect(() => {
        setCurrentPage('Historia Clínica');
    }, [setCurrentPage]);

    // Cargar datos iniciales
    useEffect(() => {
        loadHistoriasClinicas();
    }, [user]);

    const loadHistoriasClinicas = async () => {
        try {
            setLoadingLocal(true);
            setLoading('historias', true);

            let historiasData;

            if (hasRole('veterinario')) {
                // Veterinario ve sus historias
                historiasData = await apiRequest.get(`/historiaClinica/veterinario/${user.id}`);
                historiasData = historiasData.data ? [historiasData.data] : [];
            } else if (hasRole('usuario')) {
                // Usuario ve las historias de sus mascotas
                const mascotas = await apiRequest.get(`/api/mascotas/propietario/${user.id}`);
                const todasHistorias = [];

                for (const mascota of mascotas.data) {
                    try {
                        const historia = await apiRequest.get(`/historiaClinica/paciente/${mascota.id}`);
                        if (historia.data) {
                            todasHistorias.push(historia.data);
                        }
                    } catch (error) {
                        // No hay historia para esta mascota, continuar
                    }
                }
                historiasData = todasHistorias;
            } else {
                // Admin ve todas las historias
                const response = await apiRequest.get('/historiaClinica');
                historiasData = response.data;
            }

            // Enriquecer datos con información adicional
            const historiasEnriquecidas = await Promise.all(
                historiasData.map(async (historia) => {
                    try {
                        // Obtener información de la mascota
                        let mascotaInfo = null;
                        try {
                            const mascotaResponse = await apiRequest.get(`/api/mascotas/${historia.idPaciente}`);
                            mascotaInfo = mascotaResponse.data;
                        } catch (error) {
                            console.warn('No se pudo obtener info de mascota:', historia.idPaciente);
                        }

                        // Obtener información del veterinario
                        let veterinarioInfo = null;
                        try {
                            const veterinarioResponse = await apiRequest.get(`/api/usuarios/veterinarios/${historia.idVeterinario}`);
                            veterinarioInfo = veterinarioResponse.data;
                        } catch (error) {
                            console.warn('No se pudo obtener info de veterinario:', historia.idVeterinario);
                        }

                        // Obtener información de la cita si existe
                        let citaInfo = null;
                        if (historia.idCita) {
                            try {
                                const citaResponse = await apiRequest.get(`/agenda/cita/${historia.idCita}`);
                                citaInfo = citaResponse.data;
                            } catch (error) {
                                console.warn('No se pudo obtener info de cita:', historia.idCita);
                            }
                        }

                        return {
                            ...historia,
                            mascota: mascotaInfo,
                            veterinario: veterinarioInfo,
                            cita: citaInfo
                        };
                    } catch (error) {
                        console.error('Error enriqueciendo historia:', error);
                        return historia;
                    }
                })
            );

            setHistorias(historiasEnriquecidas);
            setFilteredHistorias(historiasEnriquecidas);
        } catch (error) {
            console.error('Error loading historias clinicas:', error);
            toast.error('Error al cargar las historias clínicas');
        } finally {
            setLoadingLocal(false);
            setLoading('historias', false);
        }
    };

    // Manejar búsqueda y filtros
    const handleSearch = (searchTerm, activeFilters) => {
        let filtered = [...historias];

        // Aplicar búsqueda por texto
        if (searchTerm) {
            filtered = filtered.filter(historia =>
                historia.motivo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                historia.diagnostico?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                historia.tratamiento?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                historia.mascota?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                historia.veterinario?.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Aplicar filtros
        if (activeFilters.veterinario) {
            filtered = filtered.filter(historia =>
                historia.veterinario?.nombre?.toLowerCase().includes(activeFilters.veterinario.toLowerCase())
            );
        }
        if (activeFilters.paciente) {
            filtered = filtered.filter(historia =>
                historia.mascota?.nombre?.toLowerCase().includes(activeFilters.paciente.toLowerCase())
            );
        }
        if (activeFilters.fecha) {
            filtered = filtered.filter(historia =>
                new Date(historia.fecha).toISOString().split('T')[0] === activeFilters.fecha
            );
        }

        setFilteredHistorias(filtered);
        setFilters(activeFilters);
    };

    // Acciones de historia clínica
    const handleViewHistoria = (historia) => {
        setSelectedHistoria(historia);
        setShowDetailModal(true);
    };

    const handleEditHistoria = (historia) => {
        navigate(`/historia-clinica/editar/${historia.id}`);
    };

    const handleDeleteHistoria = (historia) => {
        showConfirm({
            title: 'Eliminar Historia Clínica',
            message: `¿Estás seguro de que deseas eliminar la historia clínica del ${formatDate(historia.fecha)}? Esta acción no se puede deshacer.`,
            confirmText: 'Eliminar',
            type: 'danger',
            onConfirm: async () => {
                try {
                    await apiRequest.delete(`/historiaClinica/eliminar/${historia.id}`);
                    toast.success('Historia clínica eliminada exitosamente');
                    await loadHistoriasClinicas();
                } catch (error) {
                    console.error('Error deleting historia:', error);
                    toast.error('Error al eliminar la historia clínica');
                }
            }
        });
    };

    // Exportar historias
    const handleExport = async () => {
        try {
            const response = await apiRequest.get('/historiaClinica/export/pdf', {
                responseType: 'blob',
                params: filters
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `historias_clinicas_${new Date().toISOString().split('T')[0]}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            toast.success('Reporte exportado exitosamente');
        } catch (error) {
            console.error('Error exporting historias:', error);
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
            title: 'Paciente',
            render: (_, row) => (
                <div>
                    <div className="font-medium text-gray-900 flex items-center">
                        <Heart className="w-4 h-4 mr-1 text-pink-500" />
                        {row.mascota?.nombre || 'No disponible'}
                    </div>
                    <div className="text-sm text-gray-500">
                        {row.mascota?.especie} - {row.mascota?.raza}
                    </div>
                </div>
            ),
            searchable: true,
            sortable: true
        },
        ...(hasRole('admin') || hasRole('recepcionista') ? [{
            key: 'veterinario',
            title: 'Veterinario',
            render: (_, row) => (
                <div className="font-medium text-gray-900 flex items-center">
                    <Stethoscope className="w-4 h-4 mr-1 text-green-500" />
                    Dr. {row.veterinario?.nombre || 'No disponible'}
                </div>
            ),
            searchable: true,
            sortable: true
        }] : []),
        {
            key: 'motivo',
            title: 'Motivo',
            render: (value) => (
                <div className="max-w-xs">
                    <p className="text-sm text-gray-900 truncate" title={value}>
                        {value || 'Sin especificar'}
                    </p>
                </div>
            ),
            searchable: true
        },
        {
            key: 'diagnostico',
            title: 'Diagnóstico',
            render: (value) => (
                <div className="max-w-xs">
                    <p className="text-sm text-gray-900 truncate" title={value}>
                        {value || 'Sin diagnóstico'}
                    </p>
                </div>
            ),
            searchable: true
        }
    ];

    // Acciones disponibles según el rol
    const getActions = (historia) => {
        const actions = [];

        // Ver detalles (todos los roles)
        actions.push({
            icon: <Eye className="w-4 h-4" />,
            title: 'Ver detalles',
            onClick: () => handleViewHistoria(historia),
            className: 'text-blue-600 hover:text-blue-800'
        });

        // Editar (veterinario que creó la historia, admin)
        if (hasRole('admin') ||
            (hasRole('veterinario') && historia.idVeterinario === user.id)) {
            actions.push({
                icon: <Edit className="w-4 h-4" />,
                title: 'Editar',
                onClick: () => handleEditHistoria(historia),
                className: 'text-indigo-600 hover:text-indigo-800'
            });
        }

        // Eliminar (solo admin)
        if (hasRole('admin')) {
            actions.push({
                icon: <Trash2 className="w-4 h-4" />,
                title: 'Eliminar',
                onClick: () => handleDeleteHistoria(historia),
                className: 'text-red-600 hover:text-red-800'
            });
        }

        return actions;
    };

    // Configuración de filtros para SearchBar
    const searchFilters = [
        {
            key: 'fecha',
            label: 'Fecha',
            type: 'date'
        },
        {
            key: 'veterinario',
            label: 'Veterinario',
            type: 'text',
            placeholder: 'Nombre del veterinario'
        },
        {
            key: 'paciente',
            label: 'Paciente',
            type: 'text',
            placeholder: 'Nombre del paciente'
        }
    ];

    if (loading) {
        return <LoadingSpinner text="Cargando historias clínicas..." />;
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
                        {hasRole('usuario') ? 'Historias Clínicas de mis Mascotas' : 'Historias Clínicas'}
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        {hasRole('usuario')
                            ? 'Revisa el historial médico de tus mascotas'
                            : 'Gestiona las historias clínicas del sistema'
                        }
                    </p>
                </div>

                <div className="mt-4 sm:mt-0 flex items-center space-x-3">
                    <button
                        onClick={() => loadHistoriasClinicas()}
                        className="btn-secondary flex items-center"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Actualizar
                    </button>

                    {(hasRole('admin') || hasRole('veterinario')) && (
                        <button
                            onClick={handleExport}
                            className="btn-secondary flex items-center"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Exportar
                        </button>
                    )}

                    {(hasRole('veterinario') || hasRole('admin')) && (
                        <Link
                            to="/historia-clinica/nueva"
                            className="btn-primary flex items-center"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Nueva Historia
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
                    placeholder="Buscar por motivo, diagnóstico, paciente, veterinario..."
                    onSearch={handleSearch}
                    onFilterChange={handleSearch}
                    filters={searchFilters}
                    showFilters={true}
                    showSuggestions={true}
                />
            </motion.div>

            {/* Tabla de historias clínicas */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <DataTable
                    data={filteredHistorias}
                    columns={columns}
                    isLoading={loading}
                    searchable={false}
                    filterable={false}
                    sortable={true}
                    pagination={true}
                    pageSize={10}
                    onRowClick={handleViewHistoria}
                    onRefresh={loadHistoriasClinicas}
                    onExport={handleExport}
                    actions={getActions}
                    emptyMessage="No hay historias clínicas registradas"
                    className="bg-white"
                />
            </motion.div>

            {/* Modal de detalles */}
            <Modal
                isOpen={showDetailModal}
                onClose={() => setShowDetailModal(false)}
                title="Historia Clínica Detallada"
                size="large"
            >
                {selectedHistoria && (
                    <div className="p-6 space-y-6">

                        {/* Información básica */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">
                                    Información General
                                </h3>
                                <div className="space-y-3">
                                    <div>
                                        <span className="text-sm font-medium text-gray-500">Fecha:</span>
                                        <p className="text-sm text-gray-900">{formatDate(selectedHistoria.fecha)}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-gray-500">Hora:</span>
                                        <p className="text-sm text-gray-900">{formatTime(selectedHistoria.hora)}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-gray-500">Paciente:</span>
                                        <p className="text-sm text-gray-900 flex items-center">
                                            <Heart className="w-4 h-4 mr-1 text-pink-500" />
                                            {selectedHistoria.mascota?.nombre || 'No disponible'}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-gray-500">Veterinario:</span>
                                        <p className="text-sm text-gray-900 flex items-center">
                                            <Stethoscope className="w-4 h-4 mr-1 text-green-500" />
                                            Dr. {selectedHistoria.veterinario?.nombre || 'No disponible'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">
                                    Información del Paciente
                                </h3>
                                {selectedHistoria.mascota ? (
                                    <div className="space-y-3">
                                        <div>
                                            <span className="text-sm font-medium text-gray-500">Especie:</span>
                                            <p className="text-sm text-gray-900">{selectedHistoria.mascota.especie}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium text-gray-500">Raza:</span>
                                            <p className="text-sm text-gray-900">{selectedHistoria.mascota.raza}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium text-gray-500">Propietario:</span>
                                            <p className="text-sm text-gray-900">{selectedHistoria.mascota.propietario?.nombre}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500">Información no disponible</p>
                                )}
                            </div>
                        </div>

                        {/* Detalles médicos */}
                        <div className="space-y-6">

                            {/* Motivo */}
                            <div>
                                <h4 className="text-lg font-medium text-gray-900 mb-2">
                                    Motivo de Consulta
                                </h4>
                                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                                    {selectedHistoria.motivo || 'No especificado'}
                                </p>
                            </div>

                            {/* Diagnóstico */}
                            <div>
                                <h4 className="text-lg font-medium text-gray-900 mb-2">
                                    Diagnóstico
                                </h4>
                                <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded-lg">
                                    {selectedHistoria.diagnostico || 'Sin diagnóstico'}
                                </p>
                            </div>

                            {/* Tratamiento */}
                            <div>
                                <h4 className="text-lg font-medium text-gray-900 mb-2">
                                    Tratamiento
                                </h4>
                                <p className="text-sm text-gray-700 bg-green-50 p-3 rounded-lg">
                                    {selectedHistoria.tratamiento || 'Sin tratamiento especificado'}
                                </p>
                            </div>

                            {/* Proceder */}
                            <div>
                                <h4 className="text-lg font-medium text-gray-900 mb-2">
                                    Proceder
                                </h4>
                                <p className="text-sm text-gray-700 bg-yellow-50 p-3 rounded-lg">
                                    {selectedHistoria.proceder || 'Sin procedimientos especificados'}
                                </p>
                            </div>

                            {/* Observaciones */}
                            <div>
                                <h4 className="text-lg font-medium text-gray-900 mb-2">
                                    Observaciones
                                </h4>
                                <p className="text-sm text-gray-700 bg-purple-50 p-3 rounded-lg">
                                    {selectedHistoria.observaciones || 'Sin observaciones adicionales'}
                                </p>
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
                            {(hasRole('admin') ||
                                (hasRole('veterinario') && selectedHistoria.idVeterinario === user.id)) && (
                                <button
                                    onClick={() => {
                                        setShowDetailModal(false);
                                        handleEditHistoria(selectedHistoria);
                                    }}
                                    className="btn-primary flex items-center"
                                >
                                    <Edit className="w-4 h-4 mr-2" />
                                    Editar Historia
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

export default HistoriaClinicaList;