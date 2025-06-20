import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ShoppingBag,
    Plus,
    Search,
    Filter,
    ShoppingCart,
    Heart,
    Star,
    Package,
    Truck,
    Shield,
    RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import SearchBar from '../common/SearchBar';
import LoadingSpinner from '../common/LoadingSpinner';
import tiendaService from '../../services/tiendaService';
import { formatPrice } from '../../utils/helpers';
import { CATEGORIAS_PRODUCTOS } from '../../utils/constants';
import toast from 'react-hot-toast';

const ProductosList = () => {
    const { user, hasRole } = useAuth();
    const { setCurrentPage } = useApp();
    const navigate = useNavigate();

    const [productos, setProductos] = useState([]);
    const [filteredProductos, setFilteredProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [carrito, setCarrito] = useState(null);
    const [filters, setFilters] = useState({
        categoria: '',
        precio_min: '',
        precio_max: '',
        busqueda: ''
    });

    // Configurar página actual
    useEffect(() => {
        setCurrentPage('Tienda');
    }, [setCurrentPage]);

    // Cargar datos iniciales
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            await Promise.all([
                loadProductos(),
                loadCarrito()
            ]);
        } catch (error) {
            console.error('Error loading data:', error);
            toast.error('Error al cargar los datos');
        } finally {
            setLoading(false);
        }
    };

    const loadProductos = async () => {
        try {
            const productosData = await tiendaService.getProductos();
            setProductos(productosData);
            setFilteredProductos(productosData);
        } catch (error) {
            console.error('Error loading productos:', error);
            toast.error('Error al cargar los productos');
        }
    };

    const loadCarrito = async () => {
        try {
            const carritoData = await tiendaService.getCarrito();
            setCarrito(carritoData);
        } catch (error) {
            console.error('Error loading carrito:', error);
            // No mostrar error si no existe carrito
        }
    };

    // Manejar búsqueda y filtros
    const handleSearch = (searchTerm, activeFilters) => {
        let filtered = [...productos];

        // Aplicar búsqueda por texto
        if (searchTerm) {
            filtered = filtered.filter(producto =>
                producto.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                producto.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                producto.categoria?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Aplicar filtros
        if (activeFilters.categoria) {
            filtered = filtered.filter(producto => producto.categoria === activeFilters.categoria);
        }

        if (activeFilters.precio_min) {
            filtered = filtered.filter(producto => producto.precio >= parseFloat(activeFilters.precio_min));
        }

        if (activeFilters.precio_max) {
            filtered = filtered.filter(producto => producto.precio <= parseFloat(activeFilters.precio_max));
        }

        setFilteredProductos(filtered);
        setFilters(activeFilters);
    };

    // Agregar producto al carrito
    const handleAgregarAlCarrito = async (producto) => {
        try {
            if (!tiendaService.isProductoDisponible(producto)) {
                toast.error('Producto no disponible');
                return;
            }

            // Si no hay carrito, crear uno nuevo
            let carritoId = carrito?.id;
            if (!carritoId) {
                const nuevoCarrito = await tiendaService.crearCarrito();
                carritoId = nuevoCarrito.id;
                setCarrito(nuevoCarrito);
            }

            await tiendaService.agregarAlCarrito(producto.id, 1);
            await loadCarrito(); // Recargar carrito
            toast.success(`${producto.nombre} agregado al carrito`);
        } catch (error) {
            console.error('Error adding to cart:', error);
            toast.error('Error al agregar al carrito');
        }
    };

    // Configuración de filtros para SearchBar
    const searchFilters = [
        {
            key: 'categoria',
            label: 'Categoría',
            type: 'select',
            options: CATEGORIAS_PRODUCTOS.map(cat => ({
                value: cat,
                label: cat
            }))
        },
        {
            key: 'precio_min',
            label: 'Precio mínimo',
            type: 'number',
            placeholder: '0'
        },
        {
            key: 'precio_max',
            label: 'Precio máximo',
            type: 'number',
            placeholder: '999999'
        }
    ];

    if (loading) {
        return <LoadingSpinner text="Cargando productos..." />;
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
                    <h1 className="text-2xl font-bold text-gray-900">🛒 Tienda Veterinaria</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Encuentra todo lo que necesitas para el cuidado de tus mascotas
                    </p>
                </div>

                <div className="mt-4 sm:mt-0 flex items-center space-x-3">
                    <button
                        onClick={() => loadData()}
                        className="btn-secondary flex items-center"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Actualizar
                    </button>

                    <button
                        onClick={() => navigate('/carrito')}
                        className="btn-primary flex items-center relative"
                    >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Ver Carrito
                        {carrito?.productos?.length > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                {carrito.productos.length}
                            </span>
                        )}
                    </button>
                </div>
            </motion.div>

            {/* Barra de búsqueda */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <SearchBar
                    placeholder="Buscar productos por nombre, descripción o categoría..."
                    onSearch={handleSearch}
                    onFilterChange={handleSearch}
                    filters={searchFilters}
                    showFilters={true}
                    showSuggestions={false}
                />
            </motion.div>

            {/* Categorías destacadas */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
            >
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Categorías</h2>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => handleSearch('', {})}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                            !filters.categoria
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        Todos
                    </button>
                    {CATEGORIAS_PRODUCTOS.map(categoria => (
                        <button
                            key={categoria}
                            onClick={() => handleSearch('', { ...filters, categoria })}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                filters.categoria === categoria
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            {categoria}
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* Grid de productos */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                {filteredProductos.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredProductos.map((producto) => (
                            <motion.div
                                key={producto.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                whileHover={{ y: -5 }}
                                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200"
                            >
                                {/* Imagen del producto */}
                                <div className="h-48 bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
                                    <Package className="w-16 h-16 text-gray-300" />
                                </div>

                                {/* Contenido */}
                                <div className="p-4 space-y-3">
                                    {/* Categoría */}
                                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                                        {producto.categoria}
                                    </span>

                                    {/* Nombre */}
                                    <h3 className="font-semibold text-gray-900 text-lg line-clamp-2">
                                        {producto.nombre}
                                    </h3>

                                    {/* Descripción */}
                                    <p className="text-sm text-gray-600 line-clamp-2">
                                        {producto.descripcion}
                                    </p>

                                    {/* Precio y stock */}
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-2xl font-bold text-green-600">
                                                {formatPrice(producto.precio)}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                Stock: {producto.stock} unidades
                                            </p>
                                        </div>
                                    </div>

                                    {/* Botón agregar al carrito */}
                                    <button
                                        onClick={() => handleAgregarAlCarrito(producto)}
                                        disabled={!tiendaService.isProductoDisponible(producto)}
                                        className={`w-full py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center ${
                                            tiendaService.isProductoDisponible(producto)
                                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        }`}
                                    >
                                        <ShoppingCart className="w-4 h-4 mr-2" />
                                        {tiendaService.isProductoDisponible(producto)
                                            ? 'Agregar al Carrito'
                                            : 'No Disponible'
                                        }
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No se encontraron productos
                        </h3>
                        <p className="text-gray-500 mb-6">
                            {filters.categoria || filters.busqueda
                                ? 'Intenta ajustar los filtros de búsqueda'
                                : 'No hay productos disponibles en este momento'
                            }
                        </p>
                        {(filters.categoria || filters.busqueda) && (
                            <button
                                onClick={() => handleSearch('', {})}
                                className="btn-primary"
                            >
                                Limpiar Filtros
                            </button>
                        )}
                    </div>
                )}
            </motion.div>

            {/* Información adicional */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
                    <Truck className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                    <h3 className="font-medium text-gray-900 mb-2">Envío Gratis</h3>
                    <p className="text-sm text-gray-600">En compras superiores a $100.000</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
                    <Shield className="w-8 h-8 text-green-600 mx-auto mb-3" />
                    <h3 className="font-medium text-gray-900 mb-2">Calidad Garantizada</h3>
                    <p className="text-sm text-gray-600">Productos veterinarios certificados</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
                    <Heart className="w-8 h-8 text-pink-600 mx-auto mb-3" />
                    <h3 className="font-medium text-gray-900 mb-2">Para tu Mascota</h3>
                    <p className="text-sm text-gray-600">Lo mejor para el cuidado animal</p>
                </div>
            </motion.div>
        </div>
    );
};

export default ProductosList;