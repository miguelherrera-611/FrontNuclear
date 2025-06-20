import { format, parseISO, isValid, differenceInYears, differenceInMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { VALIDACIONES, FECHAS, COLORES_ESTADO } from './constants';

// ============= FUNCIONES DE FECHA Y HORA =============

/**
 * Formatea una fecha según el formato especificado
 * @param {string|Date} date - Fecha a formatear
 * @param {string} formatString - Formato de salida
 * @returns {string} Fecha formateada
 */
export const formatDate = (date, formatString = FECHAS.FORMATO_FECHA) => {
    if (!date) return '';

    try {
        const dateObj = typeof date === 'string' ? parseISO(date) : date;
        if (!isValid(dateObj)) return '';

        return format(dateObj, formatString, { locale: es });
    } catch (error) {
        console.error('Error formatting date:', error);
        return '';
    }
};

/**
 * Formatea una fecha con hora
 * @param {string|Date} date - Fecha a formatear
 * @returns {string} Fecha y hora formateada
 */
export const formatDateTime = (date) => {
    return formatDate(date, FECHAS.FORMATO_FECHA_HORA);
};

/**
 * Formatea solo la hora
 * @param {string|Date} time - Hora a formatear
 * @returns {string} Hora formateada
 */
export const formatTime = (time) => {
    if (!time) return '';

    try {
        // Si es una fecha completa, extraer solo la hora
        if (time.includes('T') || time.includes(' ')) {
            const dateObj = typeof time === 'string' ? parseISO(time) : time;
            return format(dateObj, FECHAS.FORMATO_HORA);
        }

        // Si ya es solo hora (HH:mm)
        return time;
    } catch (error) {
        console.error('Error formatting time:', error);
        return '';
    }
};

/**
 * Calcula la edad basada en la fecha de nacimiento
 * @param {string|Date} birthDate - Fecha de nacimiento
 * @returns {string} Edad formateada
 */
export const calculateAge = (birthDate) => {
    if (!birthDate) return '';

    try {
        const birth = typeof birthDate === 'string' ? parseISO(birthDate) : birthDate;
        const now = new Date();

        const years = differenceInYears(now, birth);
        const months = differenceInMonths(now, birth) % 12;

        if (years === 0) {
            return `${months} ${months === 1 ? 'mes' : 'meses'}`;
        } else if (years === 1 && months === 0) {
            return '1 año';
        } else if (months === 0) {
            return `${years} ${years === 1 ? 'año' : 'años'}`;
        } else {
            return `${years} ${years === 1 ? 'año' : 'años'} y ${months} ${months === 1 ? 'mes' : 'meses'}`;
        }
    } catch (error) {
        console.error('Error calculating age:', error);
        return '';
    }
};

/**
 * Verifica si una fecha es hoy
 * @param {string|Date} date - Fecha a verificar
 * @returns {boolean}
 */
export const isToday = (date) => {
    if (!date) return false;

    try {
        const dateObj = typeof date === 'string' ? parseISO(date) : date;
        const today = new Date();

        return dateObj.toDateString() === today.toDateString();
    } catch (error) {
        return false;
    }
};

/**
 * Obtiene el nombre del día de la semana
 * @param {string|Date} date - Fecha
 * @returns {string} Nombre del día
 */
export const getDayName = (date) => {
    return formatDate(date, 'EEEE');
};

// ============= FUNCIONES DE VALIDACIÓN =============

/**
 * Valida un email
 * @param {string} email - Email a validar
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
    if (!email) return false;
    return VALIDACIONES.EMAIL_REGEX.test(email);
};

/**
 * Valida un número de teléfono
 * @param {string} phone - Teléfono a validar
 * @returns {boolean}
 */
export const isValidPhone = (phone) => {
    if (!phone) return false;
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    return VALIDACIONES.TELEFONO_REGEX.test(cleanPhone);
};

/**
 * Valida una cédula
 * @param {string} cedula - Cédula a validar
 * @returns {boolean}
 */
export const isValidCedula = (cedula) => {
    if (!cedula) return false;
    return VALIDACIONES.CEDULA_REGEX.test(cedula);
};

/**
 * Valida una contraseña
 * @param {string} password - Contraseña a validar
 * @returns {object} Resultado de validación
 */
export const validatePassword = (password) => {
    if (!password) {
        return { isValid: false, message: 'La contraseña es requerida' };
    }

    if (password.length < VALIDACIONES.PASSWORD_MIN_LENGTH) {
        return {
            isValid: false,
            message: `La contraseña debe tener al menos ${VALIDACIONES.PASSWORD_MIN_LENGTH} caracteres`
        };
    }

    return { isValid: true, message: '' };
};

// ============= FUNCIONES DE FORMATO =============

/**
 * Formatea un precio en pesos colombianos
 * @param {number} price - Precio a formatear
 * @returns {string} Precio formateado
 */
export const formatPrice = (price) => {
    if (price === null || price === undefined || isNaN(price)) return '$0';

    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
    }).format(price);
};

/**
 * Formatea un número con separadores de miles
 * @param {number} number - Número a formatear
 * @returns {string} Número formateado
 */
export const formatNumber = (number) => {
    if (number === null || number === undefined || isNaN(number)) return '0';

    return new Intl.NumberFormat('es-CO').format(number);
};

/**
 * Capitaliza la primera letra de una cadena
 * @param {string} str - Cadena a capitalizar
 * @returns {string} Cadena capitalizada
 */
export const capitalize = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Capitaliza cada palabra de una cadena
 * @param {string} str - Cadena a capitalizar
 * @returns {string} Cadena con palabras capitalizadas
 */
export const capitalizeWords = (str) => {
    if (!str) return '';
    return str.split(' ').map(word => capitalize(word)).join(' ');
};

/**
 * Trunca una cadena a una longitud específica
 * @param {string} str - Cadena a truncar
 * @param {number} length - Longitud máxima
 * @returns {string} Cadena truncada
 */
export const truncateText = (str, length = 50) => {
    if (!str) return '';
    if (str.length <= length) return str;
    return str.substring(0, length) + '...';
};

// ============= FUNCIONES DE COLOR Y ESTADO =============

/**
 * Obtiene el color correspondiente a un estado
 * @param {string} estado - Estado
 * @returns {string} Clase de color
 */
export const getColorByStatus = (estado) => {
    return COLORES_ESTADO[estado] || 'secondary';
};

/**
 * Obtiene la clase CSS para un badge según el estado
 * @param {string} estado - Estado
 * @returns {string} Clase CSS
 */
export const getBadgeClass = (estado) => {
    const color = getColorByStatus(estado);
    return `badge-${color}`;
};

// ============= FUNCIONES DE ARRAYS Y OBJETOS =============

/**
 * Agrupa un array por una propiedad específica
 * @param {Array} array - Array a agrupar
 * @param {string} key - Propiedad por la cual agrupar
 * @returns {object} Objeto con elementos agrupados
 */
export const groupBy = (array, key) => {
    if (!Array.isArray(array)) return {};

    return array.reduce((groups, item) => {
        const group = item[key];
        if (!groups[group]) {
            groups[group] = [];
        }
        groups[group].push(item);
        return groups;
    }, {});
};

/**
 * Ordena un array por una propiedad específica
 * @param {Array} array - Array a ordenar
 * @param {string} key - Propiedad por la cual ordenar
 * @param {string} direction - Dirección ('asc' o 'desc')
 * @returns {Array} Array ordenado
 */
export const sortBy = (array, key, direction = 'asc') => {
    if (!Array.isArray(array)) return [];

    return [...array].sort((a, b) => {
        const aVal = a[key];
        const bVal = b[key];

        if (aVal < bVal) return direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return direction === 'asc' ? 1 : -1;
        return 0;
    });
};

/**
 * Filtra un array por múltiples criterios
 * @param {Array} array - Array a filtrar
 * @param {object} filters - Objeto con filtros
 * @returns {Array} Array filtrado
 */
export const filterBy = (array, filters) => {
    if (!Array.isArray(array)) return [];
    if (!filters || Object.keys(filters).length === 0) return array;

    return array.filter(item => {
        return Object.entries(filters).every(([key, value]) => {
            if (!value || value === '') return true;

            const itemValue = item[key];
            if (typeof itemValue === 'string') {
                return itemValue.toLowerCase().includes(value.toLowerCase());
            }

            return itemValue === value;
        });
    });
};

/**
 * Busca en un array por texto
 * @param {Array} array - Array donde buscar
 * @param {string} searchTerm - Término de búsqueda
 * @param {Array} searchFields - Campos donde buscar
 * @returns {Array} Array filtrado
 */
export const searchInArray = (array, searchTerm, searchFields) => {
    if (!Array.isArray(array) || !searchTerm) return array;

    const term = searchTerm.toLowerCase();

    return array.filter(item => {
        return searchFields.some(field => {
            const value = item[field];
            if (!value) return false;

            return value.toString().toLowerCase().includes(term);
        });
    });
};

// ============= FUNCIONES DE ARCHIVOS =============

/**
 * Convierte bytes a formato legible
 * @param {number} bytes - Bytes
 * @returns {string} Tamaño formateado
 */
export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Verifica si un archivo es una imagen
 * @param {File} file - Archivo
 * @returns {boolean}
 */
export const isImageFile = (file) => {
    if (!file) return false;
    return file.type.startsWith('image/');
};

/**
 * Verifica si un archivo es un PDF
 * @param {File} file - Archivo
 * @returns {boolean}
 */
export const isPdfFile = (file) => {
    if (!file) return false;
    return file.type === 'application/pdf';
};

// ============= FUNCIONES DE URL Y NAVEGACIÓN =============

/**
 * Construye una URL con parámetros
 * @param {string} baseUrl - URL base
 * @param {object} params - Parámetros
 * @returns {string} URL construida
 */
export const buildUrl = (baseUrl, params = {}) => {
    const url = new URL(baseUrl, window.location.origin);

    Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
            url.searchParams.append(key, value);
        }
    });

    return url.toString();
};

/**
 * Obtiene parámetros de la URL actual
 * @returns {object} Parámetros de la URL
 */
export const getUrlParams = () => {
    const params = new URLSearchParams(window.location.search);
    const result = {};

    for (const [key, value] of params) {
        result[key] = value;
    }

    return result;
};

/**
 * Genera un ID único
 * @returns {string} ID único
 */
export const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// ============= FUNCIONES DE LOCAL STORAGE =============

/**
 * Guarda datos en localStorage de forma segura
 * @param {string} key - Clave
 * @param {any} data - Datos a guardar
 */
export const saveToStorage = (key, data) => {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
};

/**
 * Obtiene datos de localStorage de forma segura
 * @param {string} key - Clave
 * @param {any} defaultValue - Valor por defecto
 * @returns {any} Datos obtenidos
 */
export const getFromStorage = (key, defaultValue = null) => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error('Error reading from localStorage:', error);
        return defaultValue;
    }
};

/**
 * Elimina datos de localStorage
 * @param {string} key - Clave
 */
export const removeFromStorage = (key) => {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error('Error removing from localStorage:', error);
    }
};

// ============= FUNCIONES DE DEBOUNCE Y THROTTLE =============

/**
 * Debounce: Ejecuta una función después de un delay
 * @param {Function} func - Función a ejecutar
 * @param {number} delay - Delay en milisegundos
 * @returns {Function} Función con debounce
 */
export const debounce = (func, delay) => {
    let timeoutId;

    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
};

/**
 * Throttle: Limita la ejecución de una función
 * @param {Function} func - Función a ejecutar
 * @param {number} limit - Límite en milisegundos
 * @returns {Function} Función con throttle
 */
export const throttle = (func, limit) => {
    let inThrottle;

    return (...args) => {
        if (!inThrottle) {
            func.apply(null, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

// ============= FUNCIONES DE CÁLCULO =============

/**
 * Calcula un porcentaje
 * @param {number} value - Valor
 * @param {number} total - Total
 * @returns {number} Porcentaje
 */
export const calculatePercentage = (value, total) => {
    if (!total || total === 0) return 0;
    return Math.round((value / total) * 100);
};

/**
 * Calcula el descuento de un precio
 * @param {number} price - Precio original
 * @param {number} discount - Porcentaje de descuento
 * @returns {number} Precio con descuento
 */
export const calculateDiscount = (price, discount) => {
    if (!price || !discount) return price;
    return price - (price * discount / 100);
};

/**
 * Calcula el impuesto sobre un monto
 * @param {number} amount - Monto
 * @param {number} taxRate - Tasa de impuesto (porcentaje)
 * @returns {number} Impuesto
 */
export const calculateTax = (amount, taxRate = 19) => {
    if (!amount) return 0;
    return (amount * taxRate) / 100;
};

/**
 * Redondea un número a decimales específicos
 * @param {number} number - Número
 * @param {number} decimals - Cantidad de decimales
 * @returns {number} Número redondeado
 */
export const roundToDecimals = (number, decimals = 2) => {
    return Math.round(number * Math.pow(10, decimals)) / Math.pow(10, decimals);
};

// ============= FUNCIONES DE VALIDACIÓN DE FORMULARIOS =============

/**
 * Valida un formulario completo
 * @param {object} data - Datos del formulario
 * @param {object} rules - Reglas de validación
 * @returns {object} Resultado de validación
 */
export const validateForm = (data, rules) => {
    const errors = {};

    Object.entries(rules).forEach(([field, fieldRules]) => {
        const value = data[field];
        const fieldErrors = [];

        // Validación requerido
        if (fieldRules.required && (!value || value.toString().trim() === '')) {
            fieldErrors.push(`${fieldRules.label || field} es requerido`);
        }

        if (value && value.toString().trim() !== '') {
            // Validación longitud mínima
            if (fieldRules.minLength && value.toString().length < fieldRules.minLength) {
                fieldErrors.push(`${fieldRules.label || field} debe tener al menos ${fieldRules.minLength} caracteres`);
            }

            // Validación longitud máxima
            if (fieldRules.maxLength && value.toString().length > fieldRules.maxLength) {
                fieldErrors.push(`${fieldRules.label || field} no puede tener más de ${fieldRules.maxLength} caracteres`);
            }

            // Validación email
            if (fieldRules.email && !isValidEmail(value)) {
                fieldErrors.push(`${fieldRules.label || field} debe ser un email válido`);
            }

            // Validación teléfono
            if (fieldRules.phone && !isValidPhone(value)) {
                fieldErrors.push(`${fieldRules.label || field} debe ser un teléfono válido`);
            }

            // Validación patrón personalizado
            if (fieldRules.pattern && !fieldRules.pattern.test(value)) {
                fieldErrors.push(fieldRules.patternMessage || `${fieldRules.label || field} tiene formato inválido`);
            }

            // Validación personalizada
            if (fieldRules.custom && typeof fieldRules.custom === 'function') {
                const customResult = fieldRules.custom(value, data);
                if (customResult !== true) {
                    fieldErrors.push(customResult);
                }
            }
        }

        if (fieldErrors.length > 0) {
            errors[field] = fieldErrors[0]; // Solo mostrar el primer error
        }
    });

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

// ============= FUNCIONES DE NOTIFICACIONES =============

/**
 * Muestra una notificación de éxito
 * @param {string} message - Mensaje
 */
export const showSuccessNotification = (message) => {
    // Esta función se puede implementar con react-hot-toast
    // toast.success(message);
    console.log('Success:', message);
};

/**
 * Muestra una notificación de error
 * @param {string} message - Mensaje
 */
export const showErrorNotification = (message) => {
    // Esta función se puede implementar con react-hot-toast
    // toast.error(message);
    console.error('Error:', message);
};

// ============= FUNCIONES DE UTILIDAD GENERAL =============

/**
 * Crea una pausa/delay
 * @param {number} ms - Milisegundos
 * @returns {Promise} Promise que se resuelve después del delay
 */
export const delay = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Copia texto al portapapeles
 * @param {string} text - Texto a copiar
 * @returns {Promise<boolean>} True si se copió exitosamente
 */
export const copyToClipboard = async (text) => {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (error) {
        console.error('Error copying to clipboard:', error);
        return false;
    }
};

/**
 * Verifica si el dispositivo es móvil
 * @returns {boolean}
 */
export const isMobile = () => {
    return window.innerWidth <= 768;
};

/**
 * Verifica si el dispositivo es tablet
 * @returns {boolean}
 */
export const isTablet = () => {
    return window.innerWidth > 768 && window.innerWidth <= 1024;
};

/**
 * Verifica si el dispositivo es desktop
 * @returns {boolean}
 */
export const isDesktop = () => {
    return window.innerWidth > 1024;
};

/**
 * Obtiene las iniciales de un nombre
 * @param {string} name - Nombre completo
 * @returns {string} Iniciales
 */
export const getInitials = (name) => {
    if (!name) return '';

    return name
        .split(' ')
        .map(word => word.charAt(0).toUpperCase())
        .slice(0, 2)
        .join('');
};

/**
 * Genera un color aleatorio en formato hexadecimal
 * @returns {string} Color hexadecimal
 */
export const generateRandomColor = () => {
    return '#' + Math.floor(Math.random()*16777215).toString(16);
};

/**
 * Convierte una cadena a slug (URL amigable)
 * @param {string} text - Texto a convertir
 * @returns {string} Slug
 */
export const textToSlug = (text) => {
    if (!text) return '';

    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // Remover caracteres especiales
        .replace(/[\s_-]+/g, '-') // Reemplazar espacios y guiones bajos con guiones
        .replace(/^-+|-+$/g, ''); // Remover guiones al inicio y final
};

/**
 * Escapa caracteres HTML
 * @param {string} text - Texto a escapar
 * @returns {string} Texto escapado
 */
export const escapeHtml = (text) => {
    if (!text) return '';

    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };

    return text.replace(/[&<>"']/g, (m) => map[m]);
};

// ============= FUNCIONES DE COMPARACIÓN =============

/**
 * Compara dos objetos de forma superficial
 * @param {object} obj1 - Primer objeto
 * @param {object} obj2 - Segundo objeto
 * @returns {boolean} True si son iguales
 */
export const shallowEqual = (obj1, obj2) => {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) {
        return false;
    }

    for (let key of keys1) {
        if (obj1[key] !== obj2[key]) {
            return false;
        }
    }

    return true;
};

/**
 * Compara dos arrays de forma superficial
 * @param {Array} arr1 - Primer array
 * @param {Array} arr2 - Segundo array
 * @returns {boolean} True si son iguales
 */
export const arrayEqual = (arr1, arr2) => {
    if (!Array.isArray(arr1) || !Array.isArray(arr2)) return false;
    if (arr1.length !== arr2.length) return false;

    return arr1.every((item, index) => item === arr2[index]);
};

// Exportar todas las funciones por defecto
export default {
    // Fechas
    formatDate,
    formatDateTime,
    formatTime,
    calculateAge,
    isToday,
    getDayName,

    // Validaciones
    isValidEmail,
    isValidPhone,
    isValidCedula,
    validatePassword,
    validateForm,

    // Formato
    formatPrice,
    formatNumber,
    capitalize,
    capitalizeWords,
    truncateText,

    // Estado y color
    getColorByStatus,
    getBadgeClass,

    // Arrays y objetos
    groupBy,
    sortBy,
    filterBy,
    searchInArray,

    // Archivos
    formatFileSize,
    isImageFile,
    isPdfFile,

    // URL y navegación
    buildUrl,
    getUrlParams,
    generateId,

    // Storage
    saveToStorage,
    getFromStorage,
    removeFromStorage,

    // Debounce y throttle
    debounce,
    throttle,

    // Cálculos
    calculatePercentage,
    calculateDiscount,
    calculateTax,
    roundToDecimals,

    // Utilidades generales
    delay,
    copyToClipboard,
    isMobile,
    isTablet,
    isDesktop,
    getInitials,
    generateRandomColor,
    textToSlug,
    escapeHtml,
    shallowEqual,
    arrayEqual
};