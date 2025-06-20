import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Heart,
    Calendar,
    Edit,
    Trash2,
    Eye,
    MoreVertical,
    Camera,
    Phone,
    Mail,
    Chip
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { calculateAge, formatDate } from '../../utils/helpers';

const MascotaCard = ({
                         mascota,
                         onView,
                         onEdit,
                         onDelete,
                         onNewCita,
                         onUploadPhoto,
                         showActions = true
                     }) => {
    const { hasRole } = useAuth();
    const [showMenu, setShowMenu] = useState(false);

    const handleCardClick = (e) => {
        if (e.target.closest('.actions-menu')) return;
        onView(mascota);
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
        hover: { y: -5, transition: { duration: 0.2 } }
    };

    return (
        <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow duration-200"
            onClick={handleCardClick}
        >

            {/* Header con foto */}
            <div className="relative h-48 bg-gradient-to-br from-blue-50 to-purple-50 overflow-hidden">
                {mascota.foto ? (
                    <img
                        src={mascota.foto}
                        alt={mascota.nombre}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Heart className="w-16 h-16 text-gray-300" />
                    </div>
                )}

                {/* Badge de especie */}
                <div className="absolute top-3 left-3">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white bg-opacity-90 text-gray-800">
            {mascota.especie}
          </span>
                </div>

                {/* Badge de sexo */}
                <div className="absolute top-3 right-3">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              mascota.sexo === 'macho'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-pink-100 text-pink-800'
          }`}>
            {mascota.sexo?.charAt(0).toUpperCase() + mascota.sexo?.slice(1)}
          </span>
                </div>

                {/* Menú de acciones */}
                {showActions && (
                    <div className="absolute bottom-3 right-3 actions-menu">
                        <div className="relative">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowMenu(!showMenu);
                                }}
                                className="p-2 bg-white bg-opacity-90 rounded-full shadow-sm hover:bg-opacity-100 transition-all"
                            >
                                <MoreVertical className="w-4 h-4 text-gray-600" />
                            </button>

                            {/* Dropdown menu */}
                            {showMenu && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                    className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10"
                                >
                                    <div className="py-1">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onView(mascota);
                                                setShowMenu(false);
                                            }}
                                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                        >
                                            <Eye className="w-4 h-4 mr-3" />
                                            Ver detalles
                                        </button>

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onNewCita(mascota);
                                                setShowMenu(false);
                                            }}
                                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                        >
                                            <Calendar className="w-4 h-4 mr-3" />
                                            Nueva cita
                                        </button>

                                        {onEdit && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onEdit(mascota);
                                                    setShowMenu(false);
                                                }}
                                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                            >
                                                <Edit className="w-4 h-4 mr-3" />
                                                Editar
                                            </button>
                                        )}

                                        {onUploadPhoto && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onUploadPhoto(mascota);
                                                    setShowMenu(false);
                                                }}
                                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                            >
                                                <Camera className="w-4 h-4 mr-3" />
                                                Subir foto
                                            </button>
                                        )}

                                        {onDelete && hasRole('admin') && (
                                            <>
                                                <div className="border-t border-gray-100 my-1"></div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onDelete(mascota);
                                                        setShowMenu(false);
                                                    }}
                                                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                                >
                                                    <Trash2 className="w-4 h-4 mr-3" />
                                                    Eliminar
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </div>
                )}

                {/* Click outside handler */}
                {showMenu && (
                    <div
                        className="fixed inset-0 z-0"
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowMenu(false);
                        }}
                    />
                )}
            </div>

            {/* Contenido de la tarjeta */}
            <div className="p-4 space-y-3">

                {/* Nombre y raza */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {mascota.nombre}
                    </h3>
                    <p className="text-sm text-gray-500">
                        {mascota.raza}
                    </p>
                </div>

                {/* Información básica */}
                <div className="space-y-2">

                    {/* Edad */}
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Edad:</span>
                        <span className="text-gray-900 font-medium">
              {calculateAge(mascota.fechaNacimiento)}
            </span>
                    </div>

                    {/* Peso */}
                    {mascota.peso && (
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Peso:</span>
                            <span className="text-gray-900 font-medium">
                {mascota.peso} kg
              </span>
                        </div>
                    )}

                    {/* Microchip */}
                    {mascota.microchip && (
                        <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 flex items-center">
                <Chip className="w-3 h-3 mr-1" />
                Chip:
              </span>
                            <span className="text-gray-900 font-mono text-xs">
                {mascota.microchip}
              </span>
                        </div>
                    )}
                </div>

                {/* Información del propietario (solo para veterinarios/admin) */}
                {(hasRole('veterinario') || hasRole('admin') || hasRole('recepcionista')) && mascota.propietario && (
                    <div className="border-t border-gray-100 pt-3 space-y-2">
                        <h4 className="text-sm font-medium text-gray-900">Propietario</h4>
                        <div className="space-y-1">
                            <p className="text-sm text-gray-700 truncate">
                                {mascota.propietario.nombre}
                            </p>
                            {mascota.propietario.telefono && (
                                <div className="flex items-center text-xs text-gray-500">
                                    <Phone className="w-3 h-3 mr-1" />
                                    {mascota.propietario.telefono}
                                </div>
                            )}
                            {mascota.propietario.email && (
                                <div className="flex items-center text-xs text-gray-500 truncate">
                                    <Mail className="w-3 h-3 mr-1" />
                                    {mascota.propietario.email}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Última cita */}
                {mascota.ultimaCita && (
                    <div className="border-t border-gray-100 pt-3">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Última cita:</span>
                            <span className="text-gray-900">
                {formatDate(mascota.ultimaCita)}
              </span>
                        </div>
                    </div>
                )}

                {/* Indicadores de estado */}
                <div className="flex items-center justify-between pt-2">

                    {/* Indicador de vacunas */}
                    {mascota.vacunas && (
                        <div className="flex items-center text-xs text-green-600">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                            Vacunado
                        </div>
                    )}

                    {/* Indicador de alergias */}
                    {mascota.alergias && (
                        <div className="flex items-center text-xs text-yellow-600">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full mr-1"></div>
                            Alergias
                        </div>
                    )}

                    {/* Indicador de medicamentos */}
                    {mascota.medicamentos && (
                        <div className="flex items-center text-xs text-blue-600">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mr-1"></div>
                            Medicado
                        </div>
                    )}
                </div>

                {/* Botones de acción rápida */}
                <div className="flex space-x-2 pt-3 border-t border-gray-100">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onView(mascota);
                        }}
                        className="flex-1 btn-secondary text-sm py-2 flex items-center justify-center"
                    >
                        <Eye className="w-4 h-4 mr-1" />
                        Ver
                    </button>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onNewCita(mascota);
                        }}
                        className="flex-1 btn-primary text-sm py-2 flex items-center justify-center"
                    >
                        <Calendar className="w-4 h-4 mr-1" />
                        Cita
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default MascotaCard;

