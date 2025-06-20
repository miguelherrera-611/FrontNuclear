import { apiRequest } from './api';

class TiendaService {
    constructor() {
        this.baseUrl = '/api/tienda';
    }

    // PRODUCTOS

    // Obtener todos los productos
    async getProductos(filters = {}) {
        try {
            const params = new URLSearchParams();

            Object.keys(filters).forEach(key => {
                if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
                    params.append(key, filters[key]);
                }
            });

            const queryString = params.toString();
            const url = queryString ? `${this.baseUrl}/productos?${queryString}` : `${this.baseUrl}/productos`;

            const response = await apiRequest.get(url);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Obtener producto por ID
    async getProductoById(id) {
        try {
            const response = await apiRequest.get(`${this.baseUrl}/productos/${id}`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Crear producto
    async createProducto(productoData) {
        try {
            const response = await apiRequest.post(`${this.baseUrl}/productos`, productoData);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Actualizar producto
    async updateProducto(id, productoData) {
        try {
            const response = await apiRequest.put(`${this.baseUrl}/productos/${id}`, productoData);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Eliminar producto
    async deleteProducto(id) {
        try {
            const response = await apiRequest.delete(`${this.baseUrl}/productos/${id}`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Buscar productos
    async buscarProductos(termino) {
        try {
            const response = await apiRequest.get(`${this.baseUrl}/productos/buscar?q=${encodeURIComponent(termino)}`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Obtener productos por categoría
    async getProductosByCategoria(categoria) {
        try {
            const response = await apiRequest.get(`${this.baseUrl}/productos/categoria/${encodeURIComponent(categoria)}`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Obtener productos destacados
    async getProductosDestacados() {
        try {
            const response = await apiRequest.get(`${this.baseUrl}/productos/destacados`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Actualizar stock del producto
    async updateStock(id, nuevoStock) {
        try {
            const response = await apiRequest.patch(`${this.baseUrl}/productos/${id}/stock`, {
                stock: nuevoStock
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // CATEGORÍAS

    // Obtener categorías
    async getCategorias() {
        try {
            const response = await apiRequest.get(`${this.baseUrl}/categorias`);
            return response.data;
        } catch (error) {
            // Categorías por defecto si no hay conexión
            return [
                'Alimentos',
                'Medicamentos',
                'Juguetes',
                'Accesorios',
                'Higiene',
                'Camas y Transportadoras',
                'Collares y Correas',
                'Suplementos',
                'Otros'
            ];
        }
    }

    // CARRITO DE COMPRAS

    // Obtener carrito del usuario
    async getCarrito() {
        try {
            const response = await apiRequest.get(`${this.baseUrl}/carrito`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Agregar producto al carrito
    async agregarAlCarrito(productoId, cantidad = 1) {
        try {
            const response = await apiRequest.post(`${this.baseUrl}/carrito/agregar`, {
                productoId,
                cantidad
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Actualizar cantidad en el carrito
    async actualizarCantidadCarrito(itemId, cantidad) {
        try {
            const response = await apiRequest.put(`${this.baseUrl}/carrito/item/${itemId}`, {
                cantidad
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Eliminar producto del carrito
    async eliminarDelCarrito(itemId) {
        try {
            const response = await apiRequest.delete(`${this.baseUrl}/carrito/item/${itemId}`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Limpiar carrito
    async limpiarCarrito() {
        try {
            const response = await apiRequest.delete(`${this.baseUrl}/carrito`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // PEDIDOS

    // Crear pedido
    async crearPedido(datosPedido) {
        try {
            const response = await apiRequest.post(`${this.baseUrl}/pedidos`, datosPedido);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Obtener pedidos del usuario
    async getPedidos(filters = {}) {
        try {
            const params = new URLSearchParams();
            Object.keys(filters).forEach(key => {
                if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
                    params.append(key, filters[key]);
                }
            });

            const queryString = params.toString();
            const url = queryString ? `${this.baseUrl}/pedidos?${queryString}` : `${this.baseUrl}/pedidos`;

            const response = await apiRequest.get(url);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Obtener pedido por ID
    async getPedidoById(id) {
        try {
            const response = await apiRequest.get(`${this.baseUrl}/pedidos/${id}`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Cancelar pedido
    async cancelarPedido(id, motivo = '') {
        try {
            const response = await apiRequest.patch(`${this.baseUrl}/pedidos/${id}/cancelar`, {
                motivo
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Actualizar estado del pedido (solo admin)
    async actualizarEstadoPedido(id, nuevoEstado) {
        try {
            const response = await apiRequest.patch(`${this.baseUrl}/pedidos/${id}/estado`, {
                estado: nuevoEstado
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // PAGOS

    // Procesar pago
    async procesarPago(datosPago) {
        try {
            const response = await apiRequest.post(`${this.baseUrl}/pagos/procesar`, datosPago);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Verificar estado del pago
    async verificarPago(pagoId) {
        try {
            const response = await apiRequest.get(`${this.baseUrl}/pagos/${pagoId}/estado`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // ESTADÍSTICAS Y REPORTES

    // Obtener estadísticas de ventas
    async getEstadisticasVentas(periodo = 'mes') {
        try {
            const response = await apiRequest.get(`${this.baseUrl}/estadisticas/ventas?periodo=${periodo}`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Obtener productos más vendidos
    async getProductosMasVendidos(limite = 10) {
        try {
            const response = await apiRequest.get(`${this.baseUrl}/estadisticas/productos-mas-vendidos?limite=${limite}`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Obtener reporte de inventario
    async getReporteInventario() {
        try {
            const response = await apiRequest.get(`${this.baseUrl}/reportes/inventario`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // UTILIDADES

    // Calcular descuento
    calcularDescuento(precio, porcentajeDescuento) {
        if (!precio || !porcentajeDescuento) return 0;
        return (precio * porcentajeDescuento) / 100;
    }

    // Calcular precio con descuento
    calcularPrecioConDescuento(precio, porcentajeDescuento) {
        const descuento = this.calcularDescuento(precio, porcentajeDescuento);
        return precio - descuento;
    }

    // Calcular total del carrito
    calcularTotalCarrito(items) {
        return items.reduce((total, item) => {
            const precioConDescuento = this.calcularPrecioConDescuento(
                item.precio,
                item.descuento || 0
            );
            return total + (precioConDescuento * item.cantidad);
        }, 0);
    }

    // Calcular impuestos
    calcularImpuestos(subtotal, porcentajeImpuesto = 19) {
        return (subtotal * porcentajeImpuesto) / 100;
    }

    // Validar datos de producto
    validateProductoData(productoData) {
        const errors = {};

        if (!productoData.nombre || productoData.nombre.trim().length < 2) {
            errors.nombre = 'El nombre debe tener al menos 2 caracteres';
        }

        if (!productoData.categoria) {
            errors.categoria = 'Debe seleccionar una categoría';
        }

        if (!productoData.precio || productoData.precio <= 0) {
            errors.precio = 'El precio debe ser mayor a 0';
        }

        if (productoData.stock !== undefined && (isNaN(productoData.stock) || productoData.stock < 0)) {
            errors.stock = 'El stock debe ser un número positivo';
        }

        if (productoData.descuento && (productoData.descuento < 0 || productoData.descuento > 100)) {
            errors.descuento = 'El descuento debe estar entre 0 y 100';
        }

        if (!productoData.descripcion || productoData.descripcion.trim().length < 10) {
            errors.descripcion = 'La descripción debe tener al menos 10 caracteres';
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }

    // Validar datos de pedido
    validatePedidoData(pedidoData) {
        const errors = {};

        if (!pedidoData.items || pedidoData.items.length === 0) {
            errors.items = 'El carrito está vacío';
        }

        if (!pedidoData.direccionEntrega || pedidoData.direccionEntrega.trim().length < 10) {
            errors.direccionEntrega = 'Debe ingresar una dirección de entrega válida';
        }

        if (!pedidoData.telefono || pedidoData.telefono.trim().length < 7) {
            errors.telefono = 'Debe ingresar un teléfono válido';
        }

        if (!pedidoData.metodoPago) {
            errors.metodoPago = 'Debe seleccionar un método de pago';
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }

    // Formatear precio en pesos colombianos
    formatearPrecio(precio) {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(precio);
    }

    // Obtener estados de pedido disponibles
    getEstadosPedido() {
        return [
            { value: 'pendiente', label: 'Pendiente', color: 'warning' },
            { value: 'confirmado', label: 'Confirmado', color: 'primary' },
            { value: 'preparando', label: 'Preparando', color: 'info' },
            { value: 'enviado', label: 'Enviado', color: 'secondary' },
            { value: 'entregado', label: 'Entregado', color: 'success' },
            { value: 'cancelado', label: 'Cancelado', color: 'danger' }
        ];
    }

    // Obtener métodos de pago disponibles
    getMetodosPago() {
        return [
            { value: 'efectivo', label: 'Efectivo' },
            { value: 'tarjeta_credito', label: 'Tarjeta de Crédito' },
            { value: 'tarjeta_debito', label: 'Tarjeta de Débito' },
            { value: 'transferencia', label: 'Transferencia Bancaria' },
            { value: 'pse', label: 'PSE' },
            { value: 'nequi', label: 'Nequi' },
            { value: 'daviplata', label: 'Daviplata' }
        ];
    }

    // Verificar si un producto está disponible
    isProductoDisponible(producto) {
        return producto.activo && producto.stock > 0;
    }

    // Verificar si hay stock suficiente
    haySuficienteStock(producto, cantidadSolicitada) {
        return producto.stock >= cantidadSolicitada;
    }

    // Subir imagen de producto
    async subirImagenProducto(productoId, file) {
        try {
            const formData = new FormData();
            formData.append('imagen', file);

            const response = await apiRequest.post(`${this.baseUrl}/productos/${productoId}/imagen`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Obtener reseñas de producto
    async getReseñasProducto(productoId) {
        try {
            const response = await apiRequest.get(`${this.baseUrl}/productos/${productoId}/reseñas`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Agregar reseña de producto
    async agregarReseña(productoId, reseñaData) {
        try {
            const response = await apiRequest.post(`${this.baseUrl}/productos/${productoId}/reseñas`, reseñaData);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Aplicar cupón de descuento
    async aplicarCupon(codigoCupon) {
        try {
            const response = await apiRequest.post(`${this.baseUrl}/cupones/aplicar`, {
                codigo: codigoCupon
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Exportar reporte de ventas
    async exportarReporteVentas(filtros = {}) {
        try {
            const params = new URLSearchParams();
            Object.keys(filtros).forEach(key => {
                if (filtros[key] !== null && filtros[key] !== undefined && filtros[key] !== '') {
                    params.append(key, filtros[key]);
                }
            });

            const response = await apiRequest.get(`${this.baseUrl}/reportes/ventas/export?${params.toString()}`, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `reporte_ventas_${new Date().toISOString().split('T')[0]}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            return { success: true };
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Manejar errores
    handleError(error) {
        if (error.response) {
            const { status, data } = error.response;

            switch (status) {
                case 400:
                    return {
                        error: data.message || 'Datos inválidos',
                        status: 400,
                        validationErrors: data.errors || {}
                    };
                case 404:
                    return {
                        error: 'Producto no encontrado',
                        status: 404
                    };
                case 409:
                    return {
                        error: data.message || 'Stock insuficiente',
                        status: 409
                    };
                case 402:
                    return {
                        error: 'Error en el procesamiento del pago',
                        status: 402
                    };
                default:
                    return {
                        error: data.message || 'Error en el servidor',
                        status: status
                    };
            }
        }

        return {
            error: error.message || 'Error de conexión',
            status: 0
        };
    }
}

const tiendaService = new TiendaService();
export default tiendaService;