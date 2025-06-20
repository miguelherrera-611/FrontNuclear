import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Heart,
    Plus,
    Edit,
    Trash2,
    Eye,
    Calendar,
    FileText,
    Download,
    RefreshCw,
    Upload,
    Search,
    Filter,
    Camera,
    Phone,
    Mail
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import DataTable, { StatusCell, DateCell } from '../common/DataTable';
import SearchBar from '../common/SearchBar';
import Modal from '../common/Modal';
import ConfirmModal, { useConfirmModal } from '../common/ConfirmModal';
import LoadingSpinner from '../common/LoadingSpinner';
import MascotaCard from './MascotaCard';
import mascotasService from '../../services/mascotasService';
import citasService from '../../services/citasService';
import { formatDate, calculateAge, formatFileSize } from '../../utils/helpers';
import { ESPECIES, SEXOS } from '../../utils/constants';
import toast from 'react-hot-toast';

const MascotasList = () => {
    const { user, hasRole } = useAuth();
    const { setCurrentPage, setLoading } = useApp();
    const navigate = useNavigate();
    const [mascotas, setMascotas] = useState([]);
    const [filteredMascotas, setFilteredMascotas] = useState([]);
    const [loading, setLoadingLocal] = useState(true);
    const [viewMode, setViewMode] = useState('table'); // 'table' | 'cards'
    const [selectedMascota, setSelectedMascota] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showPhotoModal, setShowPhotoModal] = useState(false);
    const [mascotaCitas, setMascotaCitas] = useState([]);
    const [filters, setFilters] = useState({
        especie: '',
        sexo: '',
        propietario: '',
        edad: ''
    });
    const { showConfirm, ConfirmModal } = useConfirmModal();

    // Configurar página actual
    useEffect(() => {
        setCurrentPage('Mascotas');
    }, [setCurrentPage]);

    // Cargar datos iniciales
    useEffect(() => {
        loadMascotas();
    }, [user]);

    const loadMascotas = async () => {
        try {
            setLoadingLocal(true);
            setLoading('mascotas', true);

            let mascotasData;

            if (hasRole('usuario')) {
                // Usuario solo ve sus mascotas
                mascotasData = await mascotasService.getMascotasByPropietario(user.id);
            } else {
                // Admin, veterinario y recepcionista ven todas las mascotas
                mascotasData = await mascotasService.getMascotas();
            }

            setMascotas(mascotasData);
            setFilteredMascotas(mascotasData);
        } catch (error) {
            console.error('Error loading mascotas:', error);
            toast.error('Error al cargar las mascotas');
        } finally {
            setLoadingLocal(false);
            setLoading('mascotas', false);
        }
    };

    // Manejar búsqueda y filtros
    const handleSearch = (searchTerm, activeFilters) => {
        let filtered = [...mascotas];

        // Aplicar búsqueda por texto
        if (searchTerm) {
            filtered = filtered.filter(mascota =>
                mascota.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                mascota.especie?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                mascota.raza?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                mascota.propietario?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                mascota.microchip?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Aplicar filtros
        if (activeFilters.especie) {
            filtered = filtered.filter(mascota => mascota.especie === activeFilters.especie);
        }
        if (activeFilters.sexo) {
            filtered = filtered.filter(mascota => mascota.sexo === activeFilters.sexo);
        }
        if (activeFilters.propietario) {
            filtered = filtered.filter(mascota =>
                mascota.propietario?.nombre?.toLowerCase().includes(activeFilters.propietario.toLowerCase())
            );
        }
        if (activeFilters.edad) {
            filtered = filtered.filter(mascota => {
                const edad = calculateAge(mascota.fechaNacimiento);
                return edad.includes(activeFilters.edad);
            });
        }

        setFilteredMascotas(filtered);
        setFilters(activeFilters);
    };

    // Acciones de mascotas
    const handleViewMascota = async (mascota) => {
        try {
            setSelectedMascota(mascota);

            // Cargar citas de la mascota
            const citas = await citasService.getCitasByMascota(mascota.id);
            setMascotaCitas(citas);

            setShowDetailModal(true);
        } catch (error) {
            console.error('Error loading mascota details:', error);
            toast.error('Error al cargar los detalles');
        }
    };

    const handleEditMascota = (mascota) => {
        navigate(`/mascotas/editar/${mascota.id}`);
    };

    const handleDeleteMascota = (mascota) => {
        showConfirm({
            title: 'Eliminar Mascota',
            message: `¿Estás seguro de que deseas eliminar a ${mascota.nombre}? Esta acción eliminará también todo su historial médico y no se puede deshacer.`,
            confirmText: 'Eliminar',
            type: 'danger',
            onConfirm: async () => {
                try {
                    // Verificar si tiene citas pendientes
                    const tieneCitas = await mascotasService.tieneCitasPendientes(mascota.id);
                    if (tieneCitas) {
                        toast.error('No se puede eliminar una mascota con citas pendientes');
                        return;
                    }

                    await mascotasService.deleteMascota(mascota.id);
                    toast.success('Mascota eliminada exitosamente');
                    await loadMascotas();
                } catch (error) {
                    console.error('Error deleting mascota:', error);
                    toast.error('Error al eliminar la mascota');
                }
            }
        });
    };

    const handleNewCita = (mascota) => {
        navigate(`/citas/nueva?mascotaId=${mascota.id}`);
    };

    const handleViewHistoria = (mascota) => {
        navigate(`/historia-clinica?mascotaId=${mascota.id}`);
    };

    const handleUploadPhoto = async (mascota, file) => {
        try {
            if (!file) return;

            if (file.size > 5 * 1024 * 1024) { // 5MB
                toast.error('La imagen no puede ser mayor a 5MB');
                return;
            }

            if (!file.type.startsWith('image/')) {
                toast.error('Solo se permiten archivos de imagen');
                return;
            }

            await mascotasService.subirFoto(mascota.id, file);
            toast.success('Foto actualizada exitosamente');
            await loadMascotas();
            setShowPhotoModal(false);
        } catch (error) {
            console.error('Error uploading photo:', error);
            toast.error('Error al subir la foto');
        }
    };

    // Exportar mascotas
    const handleExport = async () => {
        try {
            await mascotasService.exportarPDF(filters);
            toast.success('Reporte exportado exitosamente');
        } catch (error) {
            console.error('Error exporting mascotas:', error);
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
                            <Heart className="w-5 h-5 text-gray-400" />
                        )}
                    </div>
                </div>
            ),
            sortable: false
        },
        {
            key: 'nombre',
            title: 'Nombre',
            render: (value, row) => (
                <div>
                    <div className="font-medium text-gray-900">{value}</div>
                    <div className="text-sm text-gray-500">{row.microchip && `Chip: ${row.microchip}`}</div>
                </div>
            ),
            searchable: true,
            sortable: true
        },
        {
            key: 'especie',
            title: 'Especie/Raza',
            render: (_, row) => (
                <div>
                    <div className="font-medium text-gray-900">{row.especie}</div>
                    <div className="text-sm text-gray-500">{row.raza}</div>
                </div>
            ),
            searchable: true,
            sortable: true
        },
        {
            key: 'sexo',
            title: 'Sexo',
            render: (value) => (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    value === 'macho' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
                }`}>
          {value?.charAt(0).toUpperCase() + value?.slice(1)}
        </span>
            ),
            sortable: true
        },
        {
            key: 'fechaNacimiento',
            title: 'Edad',
            render: (value) => (
                <div>
                    <div className="text-sm text-gray-900">{calculateAge(value)}</div>
                    <div className="text-xs text-gray-500">{formatDate(value)}</div>
                </div>
            ),
            sortable: true
        },
        ...(hasRole('veterinario') || hasRole('admin') || hasRole('recepcionista') ? [{
            key: 'propietario',
            title: 'Propietario',
            render: (_, row) => (
                <div>
                    <div className="font-medium text-gray-900">{row.propietario?.nombre}</div>
                    <div className="text-sm text-gray-500 flex items-center">
                        <Phone className="w-3 h-3 mr-1" />
                        {row.propietario?.telefono}
                    </div>
                </div>
            ),
            searchable: true,
            sortable: true
        }] : []),
        {
            key: 'peso',
            title: 'Peso',
            render: (value) => value ? `${value} kg` : '-',
            sortable: true
        },
        {
            key: 'ultimaCita',
            title: 'Última Cita',
            render: (_, row) => (
                <div className="text-sm text-gray-500">
                    {row.ultimaCita ? formatDate(row.ultimaCita) : 'Sin citas'}
                </div>
            ),
            sortable: true
        }
    ];

    // Acciones disponibles según el rol
    const getActions = (mascota) => {
        const actions = [];

        // Ver detalles (todos los roles)
        actions.push({
            icon: <Eye className="w-4 h-4" />,
            title: 'Ver detalles',
            onClick: () => handleViewMascota(mascota),
            className: 'text-blue-600 hover:text-blue-800'
        });

        // Editar (propietario, admin, recepcionista)
        if (hasRole('admin') || hasRole('recepcionista') ||
            (hasRole('usuario') && mascota.propietarioId === user.id)) {
            actions.push({
                icon: <Edit className="w-4 h-4" />,
                title: 'Editar',
                onClick: () => handleEditMascota(mascota),
                className: 'text-indigo-600 hover:text-indigo-800'
            });
        }

        // Nueva cita
        actions.push({
            icon: <Calendar className="w-4 h-4" />,
            title: 'Nueva cita',
            onClick: () => handleNewCita(mascota),
            className: 'text-green-600 hover:text-green-800'
        });

        // Historia clínica (veterinario, admin)
        if (hasRole('veterinario') || hasRole('admin')) {
            actions.push({
                icon: <FileText className="w-4 h-4" />,
                title: 'Historia clínica',
                onClick: () => handleViewHistoria(mascota),
                className: 'text-purple-600 hover:text-purple-800'
            });
        }

        // Subir foto (propietario, admin, recepcionista)
        if (hasRole('admin') || hasRole('recepcionista') ||
            (hasRole('usuario') && mascota.propietarioId === user.id)) {
            actions.push({
                icon: <Camera className="w-4 h-4" />,
                title: 'Subir foto',
                onClick: () => {
                    setSelectedMascota(mascota);
                    setShowPhotoModal(true);
                },
                className: 'text-orange-600 hover:text-orange-800'
            });
        }

        // Eliminar (admin)
        if (hasRole('admin')) {
            actions.push({
                icon: <Trash2 className="w-4 h-4" />,
                title: 'Eliminar',
                onClick: () => handleDeleteMascota(mascota),
                className: 'text-red-600 hover:text-red-800'
            });
        }

        return actions;
    };

    // Configuración de filtros para SearchBar
    const searchFilters = [
        {
            key: 'especie',
            label: 'Especie',
            type: 'select',
            options: ESPECIES.map(especie => ({
                value: especie,
                label: especie
            }))
        },
        {
            key: 'sexo',
            label: 'Sexo',
            type: 'select',
            options: SEXOS.map(sexo => ({
                value: sexo.value,
                label: sexo.label
            }))
        },
        {
            key: 'propietario',
            label: 'Propietario',
            type: 'text',
            placeholder: 'Nombre del propietario'
        },
        {
            key: 'edad',
            label: 'Edad',
            type: 'select',
            options: [
                { value: 'mes', label: 'Menos de 1 año' },
                { value: '1 año', label: '1 año' },
                { value: '2 años', label: '2 años' },
                { value: '3 años', label: '3+ años' }
            ]
        }
    ];

    if (loading) {
        return <LoadingSpinner text="Cargando mascotas..." />;
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
                        {hasRole('usuario') ? 'Mis Mascotas' : 'Gestión de Mascotas'}
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        {hasRole('usuario')
                            ? 'Administra la información de tus mascotas'
                            : 'Administra todas las mascotas del sistema'
                        }
                    </p>
                </div>

                <div className="mt-4 sm:mt-0 flex items-center space-x-3">

                    {/* Toggle view mode */}
                    <div className="flex rounded-lg border border-gray-300">
                        <button
                            onClick={() => setViewMode('table')}
                            className={`px-3 py-2 text-sm font-medium rounded-l-lg transition-colors ${
                                viewMode === 'table'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            Tabla
                        </button>
                        <button
                            onClick={() => setViewMode('cards')}
                            className={`px-3 py-2 text-sm font-medium rounded-r-lg transition-colors border-l ${
                                viewMode === 'cards'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            Tarjetas
                        </button>
                    </div>

                    <button
                        onClick={() => loadMascotas()}
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
                        to="/mascotas/nueva"
                        className="btn-primary flex items-center"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Nueva Mascota
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
                    placeholder="Buscar por nombre, especie, raza, propietario..."
                    onSearch={handleSearch}
                    onFilterChange={handleSearch}
                    filters={searchFilters}
                    showFilters={true}
                    showSuggestions={true}
                />
            </motion.div>

            {/* Contenido principal */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                {viewMode === 'table' ? (
                    <DataTable
                        data={filteredMascotas}
                        columns={columns}
                        isLoading={loading}
                        searchable={false}
                        filterable={false}
                        sortable={true}
                        pagination={true}
                        pageSize={10}
                        onRowClick={handleViewMascota}
                        onRefresh={loadMascotas}
                        onExport={handleExport}
                        actions={getActions}
                        emptyMessage="No hay mascotas registradas"
                        className="bg-white"
                    />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredMascotas.length > 0 ? (
                            filteredMascotas.map((mascota) => (
                                <MascotaCard
                                    key={mascota.id}
                                    mascota={mascota}
                                    onView={() => handleViewMascota(mascota)}
                                    onEdit={() => handleEditMascota(mascota)}
                                    onDelete={() => handleDeleteMascota(mascota)}
                                    onNewCita={() => handleNewCita(mascota)}
                                    onUploadPhoto={() => {
                                        setSelectedMascota(mascota);
                                        setShowPhotoModal(true);
                                    }}
                                    showActions={hasRole('admin') || hasRole('recepcionista') ||
                                        (hasRole('usuario') && mascota.propietarioId === user.id)}
                                />
                            ))
                        ) : (
                            <div className="col-span-full text-center py-12">
                                <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    No hay mascotas registradas
                                </h3>
                                <p className="text-gray-500 mb-6">
                                    {hasRole('usuario')
                                        ? 'Registra tu primera mascota para comenzar'
                                        : 'No se encontraron mascotas con los filtros aplicados'
                                    }
                                </p>
                                <Link
                                    to="/mascotas/nueva"
                                    className="btn-primary inline-flex items-center"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Registrar Mascota
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </motion.div>

            {/* Modal de detalles */}
            <Modal
                isOpen={showDetailModal}
                onClose={() => setShowDetailModal(false)}
                title={`Detalles de ${selectedMascota?.nombre}`}
                size="large"
            >
                {selectedMascota && (
                    <div className="p-6 space-y-6">

                        {/* Información básica */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">

                                {/* Foto */}
                                <div className="text-center">
                                    <div className="w-32 h-32 mx-auto rounded-full overflow-hidden bg-gray-200 mb-4">
                                        {selectedMascota.foto ? (
                                            <img
                                                src={selectedMascota.foto}
                                                alt={selectedMascota.nombre}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Heart className="w-16 h-16 text-gray-400" />
                                            </div>
                                        )}
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900">{selectedMascota.nombre}</h3>
                                    <p className="text-gray-500">{selectedMascota.especie} • {selectedMascota.raza}</p>
                                </div>

                                {/* Información básica */}
                                <div className="space-y-3">
                                    <div>
                                        <span className="text-sm font-medium text-gray-500">Sexo:</span>
                                        <p className="text-sm text-gray-900 capitalize">{selectedMascota.sexo}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-gray-500">Fecha de Nacimiento:</span>
                                        <p className="text-sm text-gray-900">{formatDate(selectedMascota.fechaNacimiento)}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-gray-500">Edad:</span>
                                        <p className="text-sm text-gray-900">{calculateAge(selectedMascota.fechaNacimiento)}</p>
                                    </div>
                                    {selectedMascota.peso && (
                                        <div>
                                            <span className="text-sm font-medium text-gray-500">Peso:</span>
                                            <p className="text-sm text-gray-900">{selectedMascota.peso} kg</p>
                                        </div>
                                    )}
                                    {selectedMascota.microchip && (
                                        <div>
                                            <span className="text-sm font-medium text-gray-500">Microchip:</span>
                                            <p className="text-sm text-gray-900 font-mono">{selectedMascota.microchip}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">

                                {/* Información del propietario */}
                                {selectedMascota.propietario && (
                                    <div>
                                        <h4 className="text-lg font-medium text-gray-900 mb-3">Propietario</h4>
                                        <div className="space-y-2">
                                            <div>
                                                <span className="text-sm font-medium text-gray-500">Nombre:</span>
                                                <p className="text-sm text-gray-900">{selectedMascota.propietario.nombre}</p>
                                            </div>
                                            <div>
                                                <span className="text-sm font-medium text-gray-500">Teléfono:</span>
                                                <p className="text-sm text-gray-900 flex items-center">
                                                    <Phone className="w-3 h-3 mr-1" />
                                                    {selectedMascota.propietario.telefono}
                                                </p>
                                            </div>
                                            <div>
                                                <span className="text-sm font-medium text-gray-500">Email:</span>
                                                <p className="text-sm text-gray-900 flex items-center">
                                                    <Mail className="w-3 h-3 mr-1" />
                                                    {selectedMascota.propietario.email}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Historial de citas */}
                                <div>
                                    <h4 className="text-lg font-medium text-gray-900 mb-3">Historial de Citas</h4>
                                    {mascotaCitas.length > 0 ? (
                                        <div className="space-y-2 max-h-40 overflow-y-auto">
                                            {mascotaCitas.slice(0, 5).map((cita) => (
                                                <div key={cita.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                                    <div>
                                                        <p className="text-sm font-medium">{cita.tipoServicio}</p>
                                                        <p className="text-xs text-gray-500">{formatDate(cita.fecha)}</p>
                                                    </div>
                                                    <StatusCell value={cita.estado} />
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500">Sin historial de citas</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Notas */}
                        {selectedMascota.notas && (
                            <div>
                                <h4 className="text-lg font-medium text-gray-900 mb-2">Notas</h4>
                                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                                    {selectedMascota.notas}
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
                            <button
                                onClick={() => {
                                    setShowDetailModal(false);
                                    handleNewCita(selectedMascota);
                                }}
                                className="btn-success flex items-center"
                            >
                                <Calendar className="w-4 h-4 mr-2" />
                                Nueva Cita
                            </button>
                            {(hasRole('admin') || hasRole('recepcionista') ||
                                (hasRole('usuario') && selectedMascota.propietarioId === user.id)) && (
                                <button
                                    onClick={() => {
                                        setShowDetailModal(false);
                                        handleEditMascota(selectedMascota);
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

            {/* Modal de subir foto */}
            <Modal
                isOpen={showPhotoModal}
                onClose={() => setShowPhotoModal(false)}
                title={`Subir foto de ${selectedMascota?.nombre}`}
                size="medium"
            >
                <div className="p-6">
                    <div className="text-center">
                        <div className="w-32 h-32 mx-auto rounded-full overflow-hidden bg-gray-200 mb-4">
                            {selectedMascota?.foto ? (
                                <img
                                    src={selectedMascota.foto}
                                    alt={selectedMascota.nombre}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Camera className="w-16 h-16 text-gray-400" />
                                </div>
                            )}
                        </div>

                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                    handleUploadPhoto(selectedMascota, file);
                                }
                            }}
                            className="hidden"
                            id="photo-upload"
                        />

                        <label
                            htmlFor="photo-upload"
                            className="btn-primary inline-flex items-center cursor-pointer"
                        >
                            <Upload className="w-4 h-4 mr-2" />
                            Seleccionar Foto
                        </label>

                        <p className="text-xs text-gray-500 mt-2">
                            Máximo 5MB • JPG, PNG, GIF
                        </p>
                    </div>
                </div>
            </Modal>

            {/* Modal de confirmación */}
            <ConfirmModal />
        </div>
    );
};

export default MascotasList;