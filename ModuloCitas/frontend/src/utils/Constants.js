// ROLES DE USUARIO
export const ROLES = {
    ADMIN: 'admin',
    VETERINARIO: 'veterinario',
    USUARIO: 'usuario',
    RECEPCIONISTA: 'recepcionista'
};

// ESTADOS DE CITAS
export const ESTADOS_CITA = {
    PENDIENTE: 'pendiente',
    CONFIRMADA: 'confirmada',
    EN_CURSO: 'en_curso',
    COMPLETADA: 'completada',
    CANCELADA: 'cancelada',
    NO_ASISTIO: 'no_asistio'
};

// ESTADOS DE PEDIDOS
export const ESTADOS_PEDIDO = {
    PENDIENTE: 'pendiente',
    CONFIRMADO: 'confirmado',
    PREPARANDO: 'preparando',
    ENVIADO: 'enviado',
    ENTREGADO: 'entregado',
    CANCELADO: 'cancelado'
};

// TIPOS DE SERVICIOS VETERINARIOS
export const TIPOS_SERVICIO = {
    CONSULTA_GENERAL: 'consulta_general',
    VACUNACION: 'vacunacion',
    CIRUGIA: 'cirugia',
    DESPARASITACION: 'desparasitacion',
    REVISION_RUTINA: 'revision_rutina',
    EMERGENCIA: 'emergencia',
    ODONTOLOGIA: 'odontologia',
    LABORATORIO: 'laboratorio',
    RADIOLOGIA: 'radiologia',
    ESTETICA: 'estetica'
};

// ESPECIES DE MASCOTAS
export const ESPECIES = [
    'Perro',
    'Gato',
    'Conejo',
    'Hámster',
    'Ave',
    'Pez',
    'Reptil',
    'Otro'
];

// SEXOS
export const SEXOS = [
    { value: 'macho', label: 'Macho' },
    { value: 'hembra', label: 'Hembra' }
];

// RAZAS POR ESPECIE
export const RAZAS_POR_ESPECIE = {
    'Perro': [
        'Labrador Retriever',
        'Golden Retriever',
        'Pastor Alemán',
        'Bulldog Francés',
        'Bulldog Inglés',
        'Beagle',
        'Poodle',
        'Rottweiler',
        'Yorkshire Terrier',
        'Dachshund',
        'Siberian Husky',
        'Shih Tzu',
        'Boston Terrier',
        'Pomerania',
        'Chihuahua',
        'Border Collie',
        'Cocker Spaniel',
        'Boxer',
        'Mestizo',
        'Otro'
    ],
    'Gato': [
        'Persa',
        'Siamés',
        'Maine Coon',
        'Ragdoll',
        'British Shorthair',
        'Abisinio',
        'Bengalí',
        'Russian Blue',
        'Scottish Fold',
        'Sphynx',
        'Norwegian Forest',
        'Oriental',
        'Birmano',
        'Mestizo',
        'Otro'
    ],
    'Conejo': [
        'Holandés',
        'Lop',
        'Angora',
        'Rex',
        'Netherland Dwarf',
        'Flemish Giant',
        'Lionhead',
        'Otro'
    ],
    'Ave': [
        'Canario',
        'Periquito',
        'Cockatiel',
        'Loro',
        'Agapornis',
        'Diamante',
        'Jilguero',
        'Otro'
    ],
    'Pez': [
        'Dorado',
        'Betta',
        'Guppy',
        'Tetra',
        'Ángel',
        'Molly',
        'Platy',
        'Otro'
    ],
    'Reptil': [
        'Iguana',
        'Gecko',
        'Tortuga',
        'Serpiente',
        'Lagarto',
        'Camaleón',
        'Otro'
    ]
};

// ESPECIALIDADES VETERINARIAS
export const ESPECIALIDADES_VETERINARIAS = [
    'Medicina General',
    'Cirugía',
    'Cardiología',
    'Dermatología',
    'Oftalmología',
    'Neurología',
    'Oncología',
    'Ortopedia',
    'Medicina Interna',
    'Anestesiología',
    'Radiología',
    'Medicina de Emergencias',
    'Medicina Preventiva',
    'Nutrición Animal',
    'Comportamiento Animal',
    'Medicina Exótica',
    'Reproducción',
    'Patología'
];

// CATEGORÍAS DE PRODUCTOS
export const CATEGORIAS_PRODUCTOS = [
    'Alimentos',
    'Medicamentos',
    'Juguetes',
    'Accesorios',
    'Higiene',
    'Camas y Transportadoras',
    'Collares y Correas',
    'Suplementos',
    'Productos de Limpieza',
    'Ropa para Mascotas',
    'Otros'
];

// MÉTODOS DE PAGO
export const METODOS_PAGO = [
    { value: 'efectivo', label: 'Efectivo', icon: '💵' },
    { value: 'tarjeta_credito', label: 'Tarjeta de Crédito', icon: '💳' },
    { value: 'tarjeta_debito', label: 'Tarjeta de Débito', icon: '💳' },
    { value: 'transferencia', label: 'Transferencia Bancaria', icon: '🏦' },
    { value: 'pse', label: 'PSE', icon: '🏛️' },
    { value: 'nequi', label: 'Nequi', icon: '📱' },
    { value: 'daviplata', label: 'Daviplata', icon: '📱' }
];

// DÍAS DE LA SEMANA
export const DIAS_SEMANA = [
    { value: 'lunes', label: 'Lunes' },
    { value: 'martes', label: 'Martes' },
    { value: 'miercoles', label: 'Miércoles' },
    { value: 'jueves', label: 'Jueves' },
    { value: 'viernes', label: 'Viernes' },
    { value: 'sabado', label: 'Sábado' },
    { value: 'domingo', label: 'Domingo' }
];

// HORARIOS DE TRABAJO
export const HORARIOS_TRABAJO = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
    '20:00'
];

// COLORES POR ESTADO
export const COLORES_ESTADO = {
    [ESTADOS_CITA.PENDIENTE]: 'warning',
    [ESTADOS_CITA.CONFIRMADA]: 'primary',
    [ESTADOS_CITA.EN_CURSO]: 'info',
    [ESTADOS_CITA.COMPLETADA]: 'success',
    [ESTADOS_CITA.CANCELADA]: 'danger',
    [ESTADOS_CITA.NO_ASISTIO]: 'secondary',

    [ESTADOS_PEDIDO.PENDIENTE]: 'warning',
    [ESTADOS_PEDIDO.CONFIRMADO]: 'primary',
    [ESTADOS_PEDIDO.PREPARANDO]: 'info',
    [ESTADOS_PEDIDO.ENVIADO]: 'secondary',
    [ESTADOS_PEDIDO.ENTREGADO]: 'success',
    [ESTADOS_PEDIDO.CANCELADO]: 'danger'
};

// MENSAJES DE LA APLICACIÓN
export const MENSAJES = {
    LOADING: 'Cargando...',
    NO_DATA: 'No hay datos disponibles',
    ERROR_GENERICO: 'Ha ocurrido un error. Intenta nuevamente.',
    ERROR_CONEXION: 'Error de conexión. Verifica tu conexión a internet.',
    OPERACION_EXITOSA: 'Operación realizada exitosamente',
    CONFIRMACION_ELIMINAR: '¿Estás seguro de que deseas eliminar este elemento?',
    SESION_EXPIRADA: 'Tu sesión ha expirado. Inicia sesión nuevamente.',
    DATOS_GUARDADOS: 'Datos guardados correctamente',
    CAMBIOS_NO_GUARDADOS: 'Tienes cambios sin guardar. ¿Deseas continuar?'
};

// CONFIGURACIÓN DE PAGINACIÓN
export const PAGINACION = {
    ITEMS_POR_PAGINA: 10,
    OPCIONES_ITEMS: [5, 10, 20, 50],
    MAX_PAGES_VISIBLE: 5
};

// CONFIGURACIÓN DE ARCHIVOS
export const ARCHIVOS = {
    MAX_SIZE_MB: 5,
    TIPOS_PERMITIDOS: {
        IMAGENES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        DOCUMENTOS: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        TODOS: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
    }
};

// CONFIGURACIÓN DE VALIDACIONES
export const VALIDACIONES = {
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    TELEFONO_REGEX: /^[\+]?[1-9][\d]{7,14}$/,
    CEDULA_REGEX: /^[0-9]{6,10}$/,
    PASSWORD_MIN_LENGTH: 6,
    USERNAME_MIN_LENGTH: 3,
    NOMBRE_MIN_LENGTH: 2
};

// CONFIGURACIÓN DE FECHAS
export const FECHAS = {
    FORMATO_FECHA: 'DD/MM/YYYY',
    FORMATO_FECHA_HORA: 'DD/MM/YYYY HH:mm',
    FORMATO_HORA: 'HH:mm',
    LOCALE: 'es-CO'
};

// URLs Y ENDPOINTS
export const ENDPOINTS = {
    AUTH: '/auth',
    USUARIOS: '/api/usuarios',
    MASCOTAS: '/api/mascotas',
    CITAS: '/agenda',
    TIENDA: '/api/tienda',
    HISTORIA_CLINICA: '/historiaClinica',
    SERVICIOS: '/servicios'
};

// CONFIGURACIÓN DE NOTIFICACIONES
export const NOTIFICACIONES = {
    DURACION_DEFAULT: 4000,
    DURACION_SUCCESS: 3000,
    DURACION_ERROR: 5000,
    POSICION: 'top-right'
};

// CONFIGURACIÓN DE LA APLICACIÓN
export const APP_CONFIG = {
    NOMBRE: 'VetClinic',
    VERSION: '1.0.0',
    DESCRIPCION: 'Sistema de Gestión Veterinaria',
    AUTOR: 'Tu Empresa',
    EMAIL_SOPORTE: 'soporte@vetclinic.com',
    TELEFONO_SOPORTE: '+57 300 123 4567'
};

// PERMISOS
export const PERMISOS = {
    // Gestión de usuarios
    CREAR_USUARIO: 'crear_usuario',
    EDITAR_USUARIO: 'editar_usuario',
    ELIMINAR_USUARIO: 'eliminar_usuario',
    VER_USUARIOS: 'ver_usuarios',

    // Gestión de mascotas
    CREAR_MASCOTA: 'crear_mascota',
    EDITAR_MASCOTA: 'editar_mascota',
    ELIMINAR_MASCOTA: 'eliminar_mascota',
    VER_MASCOTAS: 'ver_mascotas',

    // Gestión de citas
    CREAR_CITA: 'crear_cita',
    EDITAR_CITA: 'editar_cita',
    CANCELAR_CITA: 'cancelar_cita',
    VER_CITAS: 'ver_citas',
    VER_TODAS_CITAS: 'ver_todas_citas',

    // Historia clínica
    CREAR_HISTORIA: 'crear_historia',
    EDITAR_HISTORIA: 'editar_historia',
    VER_HISTORIA: 'ver_historia',

    // Tienda
    GESTIONAR_PRODUCTOS: 'gestionar_productos',
    VER_REPORTES_VENTAS: 'ver_reportes_ventas',
    GESTIONAR_PEDIDOS: 'gestionar_pedidos',

    // Configuración
    CONFIGURAR_SISTEMA: 'configurar_sistema',
    VER_ESTADISTICAS: 'ver_estadisticas',
    EXPORTAR_DATOS: 'exportar_datos'
};

// PERMISOS POR ROL
export const PERMISOS_POR_ROL = {
    [ROLES.ADMIN]: Object.values(PERMISOS),
    [ROLES.VETERINARIO]: [
        PERMISOS.VER_MASCOTAS,
        PERMISOS.EDITAR_MASCOTA,
        PERMISOS.VER_CITAS,
        PERMISOS.EDITAR_CITA,
        PERMISOS.CANCELAR_CITA,
        PERMISOS.CREAR_HISTORIA,
        PERMISOS.EDITAR_HISTORIA,
        PERMISOS.VER_HISTORIA,
        PERMISOS.VER_ESTADISTICAS
    ],
    [ROLES.RECEPCIONISTA]: [
        PERMISOS.CREAR_USUARIO,
        PERMISOS.EDITAR_USUARIO,
        PERMISOS.VER_USUARIOS,
        PERMISOS.CREAR_MASCOTA,
        PERMISOS.EDITAR_MASCOTA,
        PERMISOS.VER_MASCOTAS,
        PERMISOS.CREAR_CITA,
        PERMISOS.EDITAR_CITA,
        PERMISOS.CANCELAR_CITA,
        PERMISOS.VER_TODAS_CITAS,
        PERMISOS.GESTIONAR_PEDIDOS
    ],
    [ROLES.USUARIO]: [
        PERMISOS.VER_MASCOTAS,
        PERMISOS.CREAR_CITA,
        PERMISOS.VER_CITAS,
        PERMISOS.CANCELAR_CITA,
        PERMISOS.VER_HISTORIA
    ]
};

// CONFIGURACIÓN DE CACHE
export const CACHE_CONFIG = {
    TTL_DEFAULT: 5 * 60 * 1000, // 5 minutos
    TTL_USUARIOS: 10 * 60 * 1000, // 10 minutos
    TTL_MASCOTAS: 15 * 60 * 1000, // 15 minutos
    TTL_CITAS: 2 * 60 * 1000, // 2 minutos
    TTL_PRODUCTOS: 30 * 60 * 1000 // 30 minutos
};

export default {
    ROLES,
    ESTADOS_CITA,
    ESTADOS_PEDIDO,
    TIPOS_SERVICIO,
    ESPECIES,
    SEXOS,
    RAZAS_POR_ESPECIE,
    ESPECIALIDADES_VETERINARIAS,
    CATEGORIAS_PRODUCTOS,
    METODOS_PAGO,
    DIAS_SEMANA,
    HORARIOS_TRABAJO,
    COLORES_ESTADO,
    MENSAJES,
    PAGINACION,
    ARCHIVOS,
    VALIDACIONES,
    FECHAS,
    ENDPOINTS,
    NOTIFICACIONES,
    APP_CONFIG,
    PERMISOS,
    PERMISOS_POR_ROL,
    CACHE_CONFIG
};