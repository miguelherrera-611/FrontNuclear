import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Trash, Check, Info, AlertCircle } from 'lucide-react';

const ConfirmModal = ({
                          isOpen,
                          onClose,
                          onConfirm,
                          title = '¿Estás seguro?',
                          message = 'Esta acción no se puede deshacer.',
                          confirmText = 'Confirmar',
                          cancelText = 'Cancelar',
                          type = 'warning', // 'warning', 'danger', 'info', 'success'
                          isLoading = false,
                          showIcon = true
                      }) => {
    // Configuraciones por tipo
    const typeConfig = {
        warning: {
            icon: AlertTriangle,
            iconBg: 'bg-yellow-100',
            iconColor: 'text-yellow-600',
            confirmButtonClass: 'btn-warning'
        },
        danger: {
            icon: Trash,
            iconBg: 'bg-red-100',
            iconColor: 'text-red-600',
            confirmButtonClass: 'btn-danger'
        },
        info: {
            icon: Info,
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-600',
            confirmButtonClass: 'btn-primary'
        },
        success: {
            icon: Check,
            iconBg: 'bg-green-100',
            iconColor: 'text-green-600',
            confirmButtonClass: 'btn-success'
        }
    };

    const config = typeConfig[type];
    const Icon = config.icon;

    const handleConfirm = () => {
        onConfirm();
    };

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget && !isLoading) {
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4"
                    onClick={handleOverlayClick}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.2 }}
                        className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-6">
                            <div className="flex items-start">
                                {showIcon && (
                                    <div className={`flex-shrink-0 mx-auto flex items-center justify-center h-12 w-12 rounded-full ${config.iconBg} sm:mx-0 sm:h-10 sm:w-10`}>
                                        <Icon className={`h-6 w-6 ${config.iconColor}`} />
                                    </div>
                                )}

                                <div className={`mt-3 text-center sm:mt-0 ${showIcon ? 'sm:ml-4' : ''} sm:text-left flex-1`}>
                                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                                        {title}
                                    </h3>
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-500">
                                            {message}
                                        </p>
                                    </div>
                                </div>

                                {/* Botón cerrar */}
                                <button
                                    onClick={onClose}
                                    disabled={isLoading}
                                    className="ml-4 p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Footer con botones */}
                        <div className="bg-gray-50 px-6 py-4 sm:flex sm:flex-row-reverse sm:space-x-reverse sm:space-x-3">
                            <button
                                type="button"
                                onClick={handleConfirm}
                                disabled={isLoading}
                                className={`w-full sm:w-auto ${config.confirmButtonClass} disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Procesando...
                                    </div>
                                ) : (
                                    confirmText
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isLoading}
                                className="w-full sm:w-auto mt-3 sm:mt-0 btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {cancelText}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

// Hook personalizado para usar el modal de confirmación
export const useConfirmModal = () => {
    const [modalState, setModalState] = React.useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => {},
        type: 'warning',
        confirmText: 'Confirmar',
        cancelText: 'Cancelar',
        isLoading: false
    });

    const showConfirm = (options) => {
        setModalState({
            isOpen: true,
            title: options.title || '¿Estás seguro?',
            message: options.message || 'Esta acción no se puede deshacer.',
            onConfirm: options.onConfirm || (() => {}),
            type: options.type || 'warning',
            confirmText: options.confirmText || 'Confirmar',
            cancelText: options.cancelText || 'Cancelar',
            isLoading: false
        });
    };

    const hideConfirm = () => {
        setModalState(prev => ({ ...prev, isOpen: false }));
    };

    const setLoading = (loading) => {
        setModalState(prev => ({ ...prev, isLoading: loading }));
    };

    const handleConfirm = async () => {
        try {
            setLoading(true);
            await modalState.onConfirm();
            hideConfirm();
        } catch (error) {
            console.error('Error in confirmation:', error);
        } finally {
            setLoading(false);
        }
    };

    const ConfirmModalComponent = () => (
        <ConfirmModal
            isOpen={modalState.isOpen}
            onClose={hideConfirm}
            onConfirm={handleConfirm}
            title={modalState.title}
            message={modalState.message}
            type={modalState.type}
            confirmText={modalState.confirmText}
            cancelText={modalState.cancelText}
            isLoading={modalState.isLoading}
        />
    );

    return {
        showConfirm,
        hideConfirm,
        setLoading,
        ConfirmModal: ConfirmModalComponent
    };
};

// Modalles de confirmación predefinidos
export const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, itemName, isLoading }) => (
    <ConfirmModal
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={onConfirm}
        title="Eliminar elemento"
        message={`¿Estás seguro de que deseas eliminar ${itemName ? `"${itemName}"` : 'este elemento'}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
        isLoading={isLoading}
    />
);

export const SaveConfirmModal = ({ isOpen, onClose, onConfirm, isLoading }) => (
    <ConfirmModal
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={onConfirm}
        title="Guardar cambios"
        message="¿Deseas guardar los cambios realizados?"
        confirmText="Guardar"
        cancelText="Cancelar"
        type="success"
        isLoading={isLoading}
    />
);

export const CancelConfirmModal = ({ isOpen, onClose, onConfirm, isLoading }) => (
    <ConfirmModal
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={onConfirm}
        title="Cancelar operación"
        message="¿Estás seguro de que deseas cancelar? Los cambios no guardados se perderán."
        confirmText="Sí, cancelar"
        cancelText="Continuar editando"
        type="warning"
        isLoading={isLoading}
    />
);

export default ConfirmModal;