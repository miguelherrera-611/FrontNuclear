import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    X,
    Filter,
    SlidersHorizontal,
    Calendar,
    User,
    Heart,
    Clock,
    Tag
} from 'lucide-react';
import { debounce } from '../../utils/helpers';

const SearchBar = ({
                       placeholder = "Buscar...",
                       onSearch,
                       onFilterChange,
                       filters = [],
                       suggestions = [],
                       showFilters = false,
                       showSuggestions = true,
                       className = '',
                       autoFocus = false,
                       clearOnSearch = false
                   }) => {
    const [query, setQuery] = useState('');
    const [showFilterPanel, setShowFilterPanel] = useState(false);
    const [showSuggestionsList, setShowSuggestionsList] = useState(false);
    const [activeFilters, setActiveFilters] = useState({});
    const [recentSearches, setRecentSearches] = useState([]);

    const searchRef = useRef(null);
    const filterPanelRef = useRef(null);
    const suggestionsRef = useRef(null);

    // Debounced search
    const debouncedSearch = debounce((searchQuery) => {
        if (onSearch) {
            onSearch(searchQuery, activeFilters);
        }
    }, 300);

    // Manejar cambios en el input
    const handleInputChange = (value) => {
        setQuery(value);
        setShowSuggestionsList(value.length > 0 && showSuggestions);
        debouncedSearch(value);
    };

    // Manejar submit del formulario
    const handleSubmit = (e) => {
        e.preventDefault();
        handleSearch(query);
    };

    // Ejecutar búsqueda
    const handleSearch = (searchQuery = query) => {
        if (searchQuery.trim()) {
            // Guardar en búsquedas recientes
            const newRecentSearches = [
                searchQuery,
                ...recentSearches.filter(s => s !== searchQuery)
            ].slice(0, 5);
            setRecentSearches(newRecentSearches);
            localStorage.setItem('recentSearches', JSON.stringify(newRecentSearches));
        }

        if (onSearch) {
            onSearch(searchQuery, activeFilters);
        }

        if (clearOnSearch) {
            setQuery('');
        }

        setShowSuggestionsList(false);
    };

    // Manejar filtros
    const handleFilterChange = (filterKey, value) => {
        const newFilters = {
            ...activeFilters,
            [filterKey]: value
        };

        // Remover filtro si está vacío
        if (!value || value === '') {
            delete newFilters[filterKey];
        }

        setActiveFilters(newFilters);

        if (onFilterChange) {
            onFilterChange(newFilters);
        }

        // Ejecutar búsqueda con nuevos filtros
        if (onSearch) {
            onSearch(query, newFilters);
        }
    };

    // Limpiar búsqueda
    const clearSearch = () => {
        setQuery('');
        setActiveFilters({});
        setShowSuggestionsList(false);
        if (onSearch) {
            onSearch('', {});
        }
        if (onFilterChange) {
            onFilterChange({});
        }
    };

    // Cargar búsquedas recientes al montar
    useEffect(() => {
        const saved = localStorage.getItem('recentSearches');
        if (saved) {
            try {
                setRecentSearches(JSON.parse(saved));
            } catch (error) {
                console.error('Error loading recent searches:', error);
            }
        }
    }, []);

    // Cerrar paneles al hacer click fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (filterPanelRef.current && !filterPanelRef.current.contains(event.target)) {
                setShowFilterPanel(false);
            }
            if (suggestionsRef.current && !suggestionsRef.current.contains(event.target) &&
                searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSuggestionsList(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Auto focus
    useEffect(() => {
        if (autoFocus && searchRef.current) {
            searchRef.current.focus();
        }
    }, [autoFocus]);

    // Filtrar sugerencias basadas en la query
    const filteredSuggestions = suggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 8);

    // Contar filtros activos
    const activeFilterCount = Object.keys(activeFilters).filter(key => activeFilters[key]).length;

    return (
        <div className={`relative ${className}`}>

            {/* Barra de búsqueda principal */}
            <form onSubmit={handleSubmit} className="relative">
                <div className="relative flex items-center">

                    {/* Input de búsqueda */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            ref={searchRef}
                            type="text"
                            value={query}
                            onChange={(e) => handleInputChange(e.target.value)}
                            onFocus={() => setShowSuggestionsList(query.length > 0 && showSuggestions)}
                            placeholder={placeholder}
                            className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        />

                        {/* Botón limpiar */}
                        {query && (
                            <button
                                type="button"
                                onClick={clearSearch}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* Botón de filtros */}
                    {showFilters && filters.length > 0 && (
                        <button
                            type="button"
                            onClick={() => setShowFilterPanel(!showFilterPanel)}
                            className={`ml-2 p-3 rounded-lg border transition-colors relative ${
                                showFilterPanel || activeFilterCount > 0
                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            <SlidersHorizontal className="w-5 h-5" />
                            {activeFilterCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {activeFilterCount}
                </span>
                            )}
                        </button>
                    )}
                </div>
            </form>

            {/* Panel de sugerencias */}
            <AnimatePresence>
                {showSuggestionsList && (filteredSuggestions.length > 0 || recentSearches.length > 0) && (
                    <motion.div
                        ref={suggestionsRef}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-80 overflow-y-auto"
                    >

                        {/* Sugerencias */}
                        {filteredSuggestions.length > 0 && (
                            <div className="p-2">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide px-2 py-1">
                                    Sugerencias
                                </p>
                                {filteredSuggestions.map((suggestion, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleSearch(suggestion)}
                                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center"
                                    >
                                        <Search className="w-4 h-4 text-gray-400 mr-2" />
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Búsquedas recientes */}
                        {recentSearches.length > 0 && (
                            <div className="p-2 border-t border-gray-100">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide px-2 py-1">
                                    Búsquedas recientes
                                </p>
                                {recentSearches.map((search, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleSearch(search)}
                                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center justify-between group"
                                    >
                                        <div className="flex items-center">
                                            <Clock className="w-4 h-4 text-gray-400 mr-2" />
                                            {search}
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const newRecent = recentSearches.filter(s => s !== search);
                                                setRecentSearches(newRecent);
                                                localStorage.setItem('recentSearches', JSON.stringify(newRecent));
                                            }}
                                            className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-gray-600 rounded"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </button>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Panel de filtros */}
            <AnimatePresence>
                {showFilterPanel && (
                    <motion.div
                        ref={filterPanelRef}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-40 p-4"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-gray-900">Filtros</h3>
                            <button
                                onClick={() => {
                                    setActiveFilters({});
                                    if (onFilterChange) onFilterChange({});
                                }}
                                className="text-sm text-blue-600 hover:text-blue-700"
                            >
                                Limpiar todo
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filters.map((filter) => (
                                <div key={filter.key} className="space-y-1">
                                    <label className="block text-sm font-medium text-gray-700">
                                        <div className="flex items-center space-x-2">
                                            {filter.icon && <filter.icon className="w-4 h-4" />}
                                            <span>{filter.label}</span>
                                        </div>
                                    </label>

                                    {filter.type === 'select' ? (
                                        <select
                                            value={activeFilters[filter.key] || ''}
                                            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">Todos</option>
                                            {filter.options?.map(option => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    ) : filter.type === 'date' ? (
                                        <input
                                            type="date"
                                            value={activeFilters[filter.key] || ''}
                                            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    ) : (
                                        <input
                                            type="text"
                                            value={activeFilters[filter.key] || ''}
                                            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                                            placeholder={filter.placeholder}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Filtros activos */}
            {activeFilterCount > 0 && (
                <div className="mt-3">
                    <div className="flex flex-wrap gap-2">
                        {Object.entries(activeFilters).map(([key, value]) => {
                            if (!value) return null;

                            const filter = filters.find(f => f.key === key);
                            const displayValue = filter?.type === 'select'
                                ? filter.options?.find(opt => opt.value === value)?.label || value
                                : value;

                            return (
                                <span
                                    key={key}
                                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                                >
                  {filter?.label}: {displayValue}
                                    <button
                                        onClick={() => handleFilterChange(key, '')}
                                        className="ml-1 p-0.5 rounded-full hover:bg-blue-200"
                                    >
                    <X className="w-3 h-3" />
                  </button>
                </span>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

// Búsqueda rápida simple
export const QuickSearch = ({
                                placeholder = "Búsqueda rápida...",
                                onSearch,
                                className = ''
                            }) => {
    const [query, setQuery] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch(query);
    };

    return (
        <form onSubmit={handleSubmit} className={`relative ${className}`}>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholder}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
        </form>
    );
};

export default SearchBar;