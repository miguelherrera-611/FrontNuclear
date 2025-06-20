import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    ChevronUp,
    ChevronDown,
    Search,
    Filter,
    Download,
    RefreshCw,
    MoreVertical
} from 'lucide-react';
import { sortBy, filterBy, searchInArray } from '../../utils/helpers';
import Pagination from './Pagination';
import LoadingSpinner, { LoadingSkeleton } from './LoadingSpinner';

const DataTable = ({
                       data = [],
                       columns = [],
                       isLoading = false,
                       error = null,
                       searchable = true,
                       filterable = true,
                       sortable = true,
                       pagination = true,
                       pageSize = 10,
                       onRowClick,
                       onRefresh,
                       onExport,
                       emptyMessage = 'No hay datos disponibles',
                       className = '',
                       rowClassName = '',
                       showActions = true,
                       actions = []
                   }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({});
    const [showFilters, setShowFilters] = useState(false);

    // Obtener campos de búsqueda de las columnas
    const searchFields = useMemo(() => {
        return columns
            .filter(col => col.searchable !== false)
            .map(col => col.key);
    }, [columns]);

    // Procesar datos: buscar, filtrar y ordenar
    const processedData = useMemo(() => {
        let result = [...data];

        // Buscar
        if (searchTerm && searchFields.length > 0) {
            result = searchInArray(result, searchTerm, searchFields);
        }

        // Filtrar
        if (Object.keys(filters).length > 0) {
            result = filterBy(result, filters);
        }

        // Ordenar
        if (sortConfig.key) {
            result = sortBy(result, sortConfig.key, sortConfig.direction);
        }

        return result;
    }, [data, searchTerm, searchFields, filters, sortConfig]);

    // Paginación
    const totalPages = Math.ceil(processedData.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedData = pagination
        ? processedData.slice(startIndex, startIndex + pageSize)
        : processedData;

    // Manejar ordenamiento
    const handleSort = (key) => {
        if (!sortable) return;

        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    // Manejar filtros
    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
        setCurrentPage(1);
    };

    // Limpiar filtros
    const clearFilters = () => {
        setFilters({});
        setSearchTerm('');
        setCurrentPage(1);
    };

    // Renderizar celda
    const renderCell = (row, column) => {
        if (column.render) {
            return column.render(row[column.key], row);
        }

        const value = row[column.key];

        if (value === null || value === undefined) {
            return <span className="text-gray-400">-</span>;
        }

        return value;
    };

    // Renderizar acciones
    const renderActions = (row) => {
        if (!showActions || actions.length === 0) return null;

        return (
            <div className="flex items-center space-x-1">
                {actions.map((action, index) => (
                    <button
                        key={index}
                        onClick={(e) => {
                            e.stopPropagation();
                            action.onClick(row);
                        }}
                        className={`p-1 rounded transition-colors ${
                            action.className || 'text-gray-400 hover:text-gray-600'
                        }`}
                        title={action.title}
                    >
                        {action.icon}
                    </button>
                ))}
            </div>
        );
    };

    if (error) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="text-center">
                    <div className="text-red-500 mb-2">
                        <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <p className="text-gray-600">Error al cargar los datos</p>
                    <p className="text-sm text-red-500 mt-1">{error}</p>
                    {onRefresh && (
                        <button
                            onClick={onRefresh}
                            className="mt-3 btn-primary"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Reintentar
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>

            {/* Header de la tabla */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">

                    {/* Búsqueda */}
                    {searchable && (
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    )}

                    {/* Acciones */}
                    <div className="flex items-center space-x-2">

                        {/* Filtros */}
                        {filterable && (
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`btn-secondary ${showFilters ? 'bg-blue-50 text-blue-700' : ''}`}
                            >
                                <Filter className="w-4 h-4 mr-2" />
                                Filtros
                            </button>
                        )}

                        {/* Exportar */}
                        {onExport && (
                            <button
                                onClick={onExport}
                                className="btn-secondary"
                                disabled={isLoading}
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Exportar
                            </button>
                        )}

                        {/* Actualizar */}
                        {onRefresh && (
                            <button
                                onClick={onRefresh}
                                className="btn-secondary"
                                disabled={isLoading}
                            >
                                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Panel de filtros */}
                {showFilters && filterable && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 p-4 bg-gray-50 rounded-lg"
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {columns
                                .filter(col => col.filterable !== false)
                                .map(column => (
                                    <div key={column.key}>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {column.title}
                                        </label>
                                        {column.filterType === 'select' ? (
                                            <select
                                                value={filters[column.key] || ''}
                                                onChange={(e) => handleFilterChange(column.key, e.target.value)}
                                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                            >
                                                <option value="">Todos</option>
                                                {column.filterOptions?.map(option => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <input
                                                type="text"
                                                value={filters[column.key] || ''}
                                                onChange={(e) => handleFilterChange(column.key, e.target.value)}
                                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                                placeholder={`Filtrar por ${column.title.toLowerCase()}`}
                                            />
                                        )}
                                    </div>
                                ))}
                        </div>

                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={clearFilters}
                                className="btn-secondary text-sm"
                            >
                                Limpiar filtros
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Tabla */}
            <div className="overflow-x-auto">
                {isLoading ? (
                    <div className="p-6">
                        <LoadingSkeleton count={5} height="h-12" className="space-y-3" />
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        {/* Header */}
                        <thead className="bg-gray-50">
                        <tr>
                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                                        sortable && column.sortable !== false ? 'cursor-pointer hover:bg-gray-100' : ''
                                    }`}
                                    onClick={() => sortable && column.sortable !== false && handleSort(column.key)}
                                >
                                    <div className="flex items-center space-x-1">
                                        <span>{column.title}</span>
                                        {sortable && column.sortable !== false && (
                                            <div className="flex flex-col">
                                                <ChevronUp
                                                    className={`w-3 h-3 ${
                                                        sortConfig.key === column.key && sortConfig.direction === 'asc'
                                                            ? 'text-blue-600'
                                                            : 'text-gray-400'
                                                    }`}
                                                />
                                                <ChevronDown
                                                    className={`w-3 h-3 -mt-1 ${
                                                        sortConfig.key === column.key && sortConfig.direction === 'desc'
                                                            ? 'text-blue-600'
                                                            : 'text-gray-400'
                                                    }`}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </th>
                            ))}
                            {showActions && actions.length > 0 && (
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Acciones
                                </th>
                            )}
                        </tr>
                        </thead>

                        {/* Body */}
                        <tbody className="bg-white divide-y divide-gray-200">
                        {paginatedData.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={columns.length + (showActions && actions.length > 0 ? 1 : 0)}
                                    className="px-6 py-12 text-center text-gray-500"
                                >
                                    <div className="flex flex-col items-center">
                                        <svg className="w-12 h-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                        </svg>
                                        <p className="text-lg font-medium">{emptyMessage}</p>
                                        {searchTerm && (
                                            <p className="text-sm text-gray-400 mt-1">
                                                No se encontraron resultados para "{searchTerm}"
                                            </p>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            paginatedData.map((row, index) => (
                                <motion.tr
                                    key={row.id || index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2, delay: index * 0.05 }}
                                    className={`
                      hover:bg-gray-50 transition-colors
                      ${onRowClick ? 'cursor-pointer' : ''}
                      ${typeof rowClassName === 'function' ? rowClassName(row) : rowClassName}
                    `}
                                    onClick={() => onRowClick && onRowClick(row)}
                                >
                                    {columns.map((column) => (
                                        <td
                                            key={column.key}
                                            className={`px-6 py-4 whitespace-nowrap text-sm ${
                                                column.className || 'text-gray-900'
                                            }`}
                                        >
                                            {renderCell(row, column)}
                                        </td>
                                    ))}
                                    {showActions && actions.length > 0 && (
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {renderActions(row)}
                                        </td>
                                    )}
                                </motion.tr>
                            ))
                        )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Footer con paginación */}
            {pagination && !isLoading && paginatedData.length > 0 && (
                <div className="px-6 py-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                            Mostrando{' '}
                            <span className="font-medium">{startIndex + 1}</span>
                            {' '}-{' '}
                            <span className="font-medium">
                {Math.min(startIndex + pageSize, processedData.length)}
              </span>
                            {' '}de{' '}
                            <span className="font-medium">{processedData.length}</span>
                            {' '}resultados
                            {data.length !== processedData.length && (
                                <span className="text-gray-500">
                  {' '}(filtrado de {data.length} total)
                </span>
                            )}
                        </div>

                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

// Componente de celda personalizada para estado con badge
export const StatusCell = ({ value, colorMap = {} }) => {
    const defaultColors = {
        active: 'bg-green-100 text-green-800',
        inactive: 'bg-red-100 text-red-800',
        pending: 'bg-yellow-100 text-yellow-800',
        completed: 'bg-blue-100 text-blue-800'
    };

    const colors = { ...defaultColors, ...colorMap };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            colors[value] || 'bg-gray-100 text-gray-800'
        }`}>
      {value}
    </span>
    );
};

// Componente de celda para fecha
export const DateCell = ({ value }) => {
    if (!value) return <span className="text-gray-400">-</span>;

    const date = new Date(value);
    return (
        <span className="text-gray-900">
      {date.toLocaleDateString('es-CO', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
      })}
    </span>
    );
};

// Componente de celda para avatar con nombre
export const AvatarCell = ({ user, showEmail = false }) => {
    if (!user) return <span className="text-gray-400">-</span>;

    return (
        <div className="flex items-center">
            <div className="flex-shrink-0 h-8 w-8">
                {user.avatar ? (
                    <img className="h-8 w-8 rounded-full object-cover" src={user.avatar} alt={user.name} />
                ) : (
                    <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
            <span className="text-sm font-medium text-gray-700">
              {user.name?.charAt(0) || '?'}
            </span>
                    </div>
                )}
            </div>
            <div className="ml-3">
                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                {showEmail && user.email && (
                    <div className="text-sm text-gray-500">{user.email}</div>
                )}
            </div>
        </div>
    );
};

// Componente de celda para acciones rápidas
export const ActionsCell = ({ onEdit, onDelete, onView, row }) => (
    <div className="flex items-center space-x-2">
        {onView && (
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onView(row);
                }}
                className="text-blue-600 hover:text-blue-900 text-sm"
            >
                Ver
            </button>
        )}
        {onEdit && (
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onEdit(row);
                }}
                className="text-indigo-600 hover:text-indigo-900 text-sm"
            >
                Editar
            </button>
        )}
        {onDelete && (
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete(row);
                }}
                className="text-red-600 hover:text-red-900 text-sm"
            >
                Eliminar
            </button>
        )}
    </div>
);

export default DataTable;