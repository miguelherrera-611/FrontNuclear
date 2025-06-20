import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ShoppingCart,
    Plus,
    Minus,
    Trash2,
    ArrowLeft,
    CreditCard,
    Package,
    Truck,
    MapPin,
    Phone,
    Mail,
    User,
    AlertCircle,
    CheckCircle,
    RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import LoadingSpinner from '../common/LoadingSpinner';
import ConfirmModal, { useConfirmModal } from '../common/ConfirmModal';
import tiendaService from '../../services/tiendaService';
import { formatPrice } from '../../utils/helpers';
import toast from 'react-hot-toast';

const Carrito = () => {
    const { user } = useAuth();
    const { setCurrentPage } = useApp();
    const navigate = useNavigate();

    const [carrito, setCarrito] = useState(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [procesandoPago, setProcesandoPago] = useState(false);
    const [datosEntrega, setDatosEntrega] = useState({
        direccion: '',
        telefono: user?.telefono || '',
        email: user?.email || '',
        nombre: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : '',
        notas: ''
    });
    const { showConfirm, ConfirmModal } = useConfirmModal();

    // Configurar página actual
    useEffect(() => {
        setCurrentPage('Carrito de Compras');
    }, [setCurrentPage]);

    // Cargar carrito al montar
    useEffect(() => {
        loadCarrito();
    }, []);

    const loadCarrito = async () => {
        try {
            setLoading(true);
            const carritoData = await tiendaService.getCarrito();
            setCarrito(carritoData);
            setItems(carritoData?.productos || []);
        } catch (error) {
            console.error('Error loading carrito:', error);
            // Si no hay carrito, inicializar vacío
            setCarrito(null);
            setItems([]);
        } finally {
            setLoading(false);
        }
    };

    // Actualizar cantidad de producto
    const handleUpdateCantidad = async (itemId, nuevaCantidad) => {
        if (nuevaCantidad < 1) return;

        try {
            await tiendaService.actualizarCantidadCarrito(itemId, nuevaCantidad);
            await loadCarrito();
            toast.success('Cantidad actualizada');
        } catch (error) {
            console.error('Error updating quantity:', error);
            toast.error('Error al actualizar la cantidad');
        }
    };

    // Eliminar producto del carrito
    const handleEliminarProducto = (item) => {
        showConfirm({
            title: 'Eliminar Producto',
            message: `¿Estás seguro de que deseas eliminar "${item.producto?.nombre}" del carrito?`,
            confirmText: 'Eliminar',
            type: 'warning',
            onConfirm: async () => {
                try {
                    await tiendaService.eliminarDelCarrito(item.id);
                    await loadCarrito();
                    toast.success('Producto eliminado del carrito');
                } catch (error) {
                    console.error('Error removing item:', error);
                    toast.error('Error al eliminar el producto');
                }
            }
        });
    };

    // Limpiar todo el carrito
    const handleLimpiarCarrito = () => {
        showConfirm({
            title: 'Limpiar Carrito',
            message: '¿Estás seguro de que deseas eliminar todos los productos del carrito?',
            confirmText: 'Limpiar Todo',
            type: 'warning',
            onConfirm: async () => {
                try {
                    await tiendaService.limpiarCarrito();
                    await loadCarrito();
                    toast.success('Carrito limpiado');
                } catch (error) {
                    console.error('Error clearing cart:', error);
                    toast.error('Error al limpiar el carrito');
                }
            }
        });
    };

    // Calcular totales
    const calcularTotales = () => {
        const subtotal = items.reduce((total, item) => {
            return total + (item.producto?.precio * item.cantidad);
        }, 0);

        const impuestos = tiendaService.calcularImpuestos(subtotal);
        const envio = subtotal > 100000 ? 0 : 15000; // Envío gratis en compras > $100k
        const total = subtotal + impuestos + envio;

        return { subtotal, impuestos, envio, total };
    };

    // Validar datos de entrega
    const validarDatosEntrega = () => {
        const errors = {};

        if (!datosEntrega.nombre.trim()) {
            errors.nombre = 'El nombre es requerido';
        }
        if (!datosEntrega.direccion.trim()) {
            errors.direccion = 'La dirección es requerida';
        }
        if (!datosEntrega.telefono.trim()) {
            errors.telefono = 'El teléfono es requerido';
        }
        if (!datosEntrega.email.trim()) {
            errors.email = 'El email es requerido';
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    };

    // Procesar pago
    const handleProcesarPago = async () => {
        const validation = validarDatosEntrega();
        if (!validation.isValid) {
            Object.values(validation.errors).forEach(error => {
                toast.error(error);
            });
            return;
        }

        if (!carrito || items.length === 0) {
            toast.error('El carrito está vacío');
            return;
        }

        try {
            setProcesandoPago(true);

            // Generar link de pago usando el endpoint del carrito
            const response = await tiendaService.generarLinkPago(carrito.id, datosEntrega);

            if (response.link_pago) {
                toast.success('Redirigiendo al pago...');
                // Redirigir al link de pago
                window.open(response.link_pago, '_blank');
            } else {
                toast.error('Error al generar el link de pago');
            }
        } catch (error) {
            console.error('Error processing payment:', error);
            toast.error('Error al procesar el pago');
        } finally {
            setProcesandoPago(false);
        }
    };

    const totales = calcularTotales();

    if (loading) {
        return <LoadingSpinner text="Cargando carrito..." />;
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between"
            >
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => navigate('/tienda')}
                        className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">🛒 Carrito de Compras</h1>
                        <p className="text-sm text-gray-500">
                            {items.length > 0
                                ? `${items.length} ${items.length === 1 ? 'producto' : 'productos'} en tu carrito`
                                : 'Tu carrito está vacío'
                            }
                        </p>
                    </div>
                </div>

                {items.length > 0 && (
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => loadCarrito()}
                            className="btn-secondary flex items-center"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Actualizar
                        </button>
                        <button
                            onClick={handleLimpiarCarrito}
                            className="btn-danger flex items-center"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Limpiar Carrito
                        </button>
                    </div>
                )}
            </motion.div>

            {items.length === 0 ? (
                // Carrito vacío
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-12"
                >
                    <ShoppingCart className="w-24 h-24 text-gray-300 mx-auto mb-6" />
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">Tu carrito está vacío</h2>
                    <p className="text-gray-600 mb-8">
                        ¡Descubre nuestros productos y encuentra lo mejor para tu mascota!
                    </p>
                    <button
                        onClick={() => navigate('/tienda')}
                        className="btn-primary inline-flex items-center"
                    >
                        <Package className="w-4 h-4 mr-2" />
                        Ir a la Tienda
                    </button>
                </motion.div>
            ) : (
                // Carrito con productos
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Lista de productos */}
                    <div className="lg:col-span-2 space-y-4">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white rounded-lg shadow-sm border border-gray-200"
                        >
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-900">Productos en tu carrito</h2>
                            </div>

                            <div className="divide-y divide-gray-200">
                                {items.map((item) => (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="p-6 flex items-center space-x-4"
                                    >
                                        {/* Imagen del producto */}
                                        <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <Package className="w-8 h-8 text-gray-400" />
                                        </div>

                                        {/* Información del producto */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-lg font-medium text-gray-900 truncate">
                                                {item.producto?.nombre}
                                            </h3>
                                            <p className="text-sm text-gray-500 line-clamp-2">
                                                {item.producto?.descripcion}
                                            </p>
                                            <p className="text-sm text-blue-600 mt-1">
                                                {item.producto?.categoria}
                                            </p>
                                        </div>

                                        {/* Controles de cantidad */}
                                        <div className="flex items-center space-x-3">
                                            <button
                                                onClick={() => handleUpdateCantidad(item.id, item.cantidad - 1)}
                                                disabled={item.cantidad <= 1}
                                                className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>

                                            <span className="w-12 text-center font-medium">
                                                {item.cantidad}
                                            </span>

                                            <button
                                                onClick={() => handleUpdateCantidad(item.id, item.cantidad + 1)}
                                                disabled={item.cantidad >= item.producto?.stock}
                                                className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>

                                        {/* Precio */}
                                        <div className="text-right">
                                            <p className="text-lg font-semibold text-gray-900">
                                                {formatPrice(item.producto?.precio * item.cantidad)}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {formatPrice(item.producto?.precio)} c/u
                                            </p>
                                        </div>

                                        {/* Botón eliminar */}
                                        <button
                                            onClick={() => handleEliminarProducto(item)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Eliminar producto"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* Resumen del pedido */}
                    <div className="space-y-6">

                        {/* Totales */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                        >
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumen del Pedido</h2>

                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Subtotal:</span>
                                    <span className="font-medium">{formatPrice(totales.subtotal)}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-gray-600">Impuestos (19%):</span>
                                    <span className="font-medium">{formatPrice(totales.impuestos)}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-gray-600">Envío:</span>
                                    <span className="font-medium">
                                        {totales.envio === 0 ? (
                                            <span className="text-green-600">Gratis</span>
                                        ) : (
                                            formatPrice(totales.envio)
                                        )}
                                    </span>
                                </div>

                                <div className="border-t border-gray-200 pt-3">
                                    <div className="flex justify-between">
                                        <span className="text-lg font-semibold text-gray-900">Total:</span>
                                        <span className="text-lg font-bold text-green-600">
                                            {formatPrice(totales.total)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {totales.subtotal < 100000 && (
                                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <div className="flex items-center">
                                        <Truck className="w-4 h-4 text-blue-600 mr-2" />
                                        <span className="text-sm text-blue-800">
                                            Añade {formatPrice(100000 - totales.subtotal)} más para envío gratis
                                        </span>
                                    </div>
                                </div>
                            )}
                        </motion.div>

                        {/* Datos de entrega */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                        >
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                <MapPin className="w-5 h-5 inline mr-2" />
                                Datos de Entrega
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nombre completo *
                                    </label>
                                    <input
                                        type="text"
                                        value={datosEntrega.nombre}
                                        onChange={(e) => setDatosEntrega({...datosEntrega, nombre: e.target.value})}
                                        className="w-full input"
                                        placeholder="Tu nombre completo"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Dirección de entrega *
                                    </label>
                                    <input
                                        type="text"
                                        value={datosEntrega.direccion}
                                        onChange={(e) => setDatosEntrega({...datosEntrega, direccion: e.target.value})}
                                        className="w-full input"
                                        placeholder="Dirección completa"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Teléfono *
                                    </label>
                                    <input
                                        type="tel"
                                        value={datosEntrega.telefono}
                                        onChange={(e) => setDatosEntrega({...datosEntrega, telefono: e.target.value})}
                                        className="w-full input"
                                        placeholder="+57 300 123 4567"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email *
                                    </label>
                                    <input
                                        type="email"
                                        value={datosEntrega.email}
                                        onChange={(e) => setDatosEntrega({...datosEntrega, email: e.target.value})}
                                        className="w-full input"
                                        placeholder="tu@email.com"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Notas adicionales
                                    </label>
                                    <textarea
                                        value={datosEntrega.notas}
                                        onChange={(e) => setDatosEntrega({...datosEntrega, notas: e.target.value})}
                                        rows={3}
                                        className="w-full input resize-none"
                                        placeholder="Instrucciones especiales para la entrega..."
                                    />
                                </div>
                            </div>
                        </motion.div>

                        {/* Botón de pago */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <button
                                onClick={handleProcesarPago}
                                disabled={procesandoPago}
                                className="w-full btn-success text-lg py-4 flex items-center justify-center"
                            >
                                {procesandoPago ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                                        Procesando...
                                    </>
                                ) : (
                                    <>
                                        <CreditCard className="w-5 h-5 mr-3" />
                                        Proceder al Pago
                                    </>
                                )}
                            </button>

                            <p className="text-xs text-gray-500 text-center mt-2">
                                Al proceder al pago serás redirigido a nuestro procesador de pagos seguro
                            </p>
                        </motion.div>
                    </div>
                </div>
            )}

            {/* Modal de confirmación */}
            <ConfirmModal />
        </div>
    );
};

export default Carrito;