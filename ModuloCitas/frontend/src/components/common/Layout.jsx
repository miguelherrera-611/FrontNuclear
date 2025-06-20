import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from './Header';
import Sidebar from './Sidebar';
import { useApp } from '../../context/AppContext';

const Layout = () => {
    const { sidebarOpen, setCurrentPage } = useApp();
    const location = useLocation();

    // Actualizar página actual basada en la ruta
    useEffect(() => {
        const pathSegments = location.pathname.split('/').filter(Boolean);
        const currentPage = pathSegments[0] || 'dashboard';
        setCurrentPage(currentPage.charAt(0).toUpperCase() + currentPage.slice(1));
    }, [location.pathname, setCurrentPage]);

    // Animaciones de página
    const pageVariants = {
        initial: { opacity: 0, y: 20 },
        in: { opacity: 1, y: 0 },
        out: { opacity: 0, y: -20 }
    };

    const pageTransition = {
        type: 'tween',
        ease: 'anticipate',
        duration: 0.3
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Layout principal */}
            <div className="flex h-screen overflow-hidden">

                {/* Sidebar */}
                <Sidebar />

                {/* Contenido principal */}
                <div className="flex-1 flex flex-col overflow-hidden">

                    {/* Header */}
                    <Header />

                    {/* Área de contenido */}
                    <main className="flex-1 overflow-y-auto">
                        <motion.div
                            key={location.pathname}
                            initial="initial"
                            animate="in"
                            exit="out"
                            variants={pageVariants}
                            transition={pageTransition}
                            className="h-full"
                        >
                            {/* Contenedor con padding responsive */}
                            <div className="container mx-auto px-4 py-6 max-w-7xl">
                                <Outlet />
                            </div>
                        </motion.div>
                    </main>
                </div>
            </div>

            {/* Overlay para cerrar sidebar en móvil */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
                    onClick={() => {/* toggleSidebar se maneja en Sidebar */}}
                />
            )}
        </div>
    );
};

export default Layout;