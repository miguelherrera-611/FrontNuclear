import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = ({
                            size = 'medium',
                            text = 'Cargando...',
                            fullScreen = true,
                            color = 'primary'
                        }) => {
    // Tamaños del spinner
    const sizes = {
        small: 'w-6 h-6',
        medium: 'w-8 h-8',
        large: 'w-12 h-12',
        xlarge: 'w-16 h-16'
    };

    // Colores del spinner
    const colors = {
        primary: 'border-primary-600',
        secondary: 'border-secondary-600',
        success: 'border-success-600',
        warning: 'border-warning-600',
        danger: 'border-danger-600',
        white: 'border-white'
    };

    const SpinnerComponent = () => (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col items-center justify-center"
        >
            {/* Spinner */}
            <div className={`
        ${sizes[size]} 
        border-4 
        border-gray-200 
        ${colors[color]} 
        border-t-transparent 
        rounded-full 
        animate-spin
      `} />

            {/* Texto de carga */}
            {text && (
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mt-4 text-sm text-gray-600 font-medium"
                >
                    {text}
                </motion.p>
            )}
        </motion.div>
    );

    // Si es fullScreen, mostrar overlay completo
    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-white bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50">
                <SpinnerComponent />
            </div>
        );
    }

    // Si no es fullScreen, solo mostrar el spinner
    return <SpinnerComponent />;
};

// Variantes específicas para casos comunes
export const LoadingButton = ({ isLoading, children, ...props }) => (
    <button {...props} disabled={isLoading || props.disabled}>
        {isLoading ? (
            <div className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                {typeof children === 'string' ? children : 'Cargando...'}
            </div>
        ) : (
            children
        )}
    </button>
);

export const LoadingCard = ({ isLoading, children, text = 'Cargando datos...' }) => {
    if (isLoading) {
        return (
            <div className="card p-8">
                <LoadingSpinner size="large" text={text} fullScreen={false} />
            </div>
        );
    }

    return children;
};

export const LoadingTable = ({ rows = 5 }) => (
    <div className="space-y-3">
        {Array.from({ length: rows }).map((_, index) => (
            <div key={index} className="animate-pulse">
                <div className="flex space-x-4 p-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    <div className="w-20 h-8 bg-gray-200 rounded"></div>
                </div>
            </div>
        ))}
    </div>
);

export const LoadingSkeleton = ({
                                    width = 'w-full',
                                    height = 'h-4',
                                    className = '',
                                    count = 1
                                }) => (
    <div className={`space-y-2 ${className}`}>
        {Array.from({ length: count }).map((_, index) => (
            <div
                key={index}
                className={`${width} ${height} bg-gray-200 rounded animate-pulse`}
            />
        ))}
    </div>
);

export default LoadingSpinner;