import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const Modal = ({
                   isOpen,
                   onClose,
                   title,
                   children,
                   size = 'medium',
                   showCloseButton = true,
                   closeOnOverlayClick = true,
                   closeOnEscape = true,
                   className = ''
               }) => {
    // Tamaños del modal
    const sizes = {
        small: 'max-w-md',
        medium: 'max-w-lg',
        large: 'max-w-2xl',
        xlarge: 'max-w-4xl',
        full: 'max-w-7xl'
    };

    // Cerrar modal con tecla Escape
    useEffect(() => {
        if (!closeOnEscape) return;

        const handleKeyDown = (event) => {
            if (event.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose, closeOnEscape]);

    // Prevenir scroll del body cuando el modal está abierto
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const handleOverlayClick = (e) => {
        if (closeOnOverlayClick && e.target === e.currentTarget) {
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
                        className={`
              bg-white rounded-xl shadow-xl w-full ${sizes[size]} 
              max-h-[90vh] overflow-hidden flex flex-col ${className}
            `}
                    >
                        {/* Header del modal */}
                        {(title || showCloseButton) && (
                            <div className="flex items-center justify-between p-6 border-b border-gray-200">
                                {title && (
                                    <h2 className="text-xl font-semibold text-gray-900">
                                        {title}
                                    </h2>
                                )}
                                {showCloseButton && (
                                    <button
                                        onClick={onClose}
                                        className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Contenido del modal */}
                        <div className="flex-1 overflow-y-auto">
                            {children}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

// Modal con footer personalizable
export const ModalWithFooter = ({
                                    isOpen,
                                    onClose,
                                    title,
                                    children,
                                    footer,
                                    size = 'medium',
                                    showCloseButton = true,
                                    closeOnOverlayClick = true,
                                    closeOnEscape = true,
                                    className = ''
                                }) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            size={size}
            showCloseButton={showCloseButton}
            closeOnOverlayClick={closeOnOverlayClick}
            closeOnEscape={closeOnEscape}
            className={className}
        >
            <div className="p-6 flex-1">
                {children}
            </div>
            {footer && (
                <div className="border-t border-gray-200 px-6 py-4">
                    {footer}
                </div>
            )}
        </Modal>
    );
};

// Modal de formulario con botones estándar
export const FormModal = ({
                              isOpen,
                              onClose,
                              title,
                              children,
                              onSubmit,
                              submitText = 'Guardar',
                              cancelText = 'Cancelar',
                              isSubmitting = false,
                              submitButtonClass = 'btn-primary',
                              size = 'medium',
                              showCloseButton = true,
                              closeOnOverlayClick = true,
                              closeOnEscape = true
                          }) => {
    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(e);
    };

    return (
        <ModalWithFooter
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            size={size}
            showCloseButton={showCloseButton}
            closeOnOverlayClick={closeOnOverlayClick && !isSubmitting}
            closeOnEscape={closeOnEscape && !isSubmitting}
            footer={
                <div className="flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="btn-secondary"
                    >
                        {cancelText}
                    </button>
                    <button
                        type="submit"
                        form="modal-form"
                        disabled={isSubmitting}
                        className={submitButtonClass}
                    >
                        {isSubmitting ? (
                            <div className="flex items-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Guardando...
                            </div>
                        ) : (
                            submitText
                        )}
                    </button>
                </div>
            }
        >
            <form id="modal-form" onSubmit={handleSubmit} className="space-y-4">
                {children}
            </form>
        </ModalWithFooter>
    );
};

// Modal de imagen
export const ImageModal = ({ isOpen, onClose, src, alt, title }) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            size="large"
            showCloseButton={true}
            closeOnOverlayClick={true}
            closeOnEscape={true}
        >
            <div className="p-4">
                <img
                    src={src}
                    alt={alt}
                    className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
                />
            </div>
        </Modal>
    );
};

export default Modal;