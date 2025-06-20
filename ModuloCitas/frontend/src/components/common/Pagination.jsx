import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

const Pagination = ({
                        currentPage,
                        totalPages,
                        onPageChange,
                        maxVisiblePages = 5,
                        showFirstLast = true,
                        showPrevNext = true,
                        className = ''
                    }) => {
    if (totalPages <= 1) return null;

    // Calcular el rango de páginas a mostrar
    const getPageNumbers = () => {
        const pages = [];
        const halfVisible = Math.floor(maxVisiblePages / 2);

        let startPage = Math.max(1, currentPage - halfVisible);
        let endPage = Math.min(totalPages, currentPage + halfVisible);

        // Ajustar si estamos cerca del inicio
        if (currentPage <= halfVisible) {
            endPage = Math.min(totalPages, maxVisiblePages);
        }

        // Ajustar si estamos cerca del final
        if (currentPage + halfVisible >= totalPages) {
            startPage = Math.max(1, totalPages - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        return pages;
    };

    const pageNumbers = getPageNumbers();
    const showStartEllipsis = pageNumbers[0] > 1;
    const showEndEllipsis = pageNumbers[pageNumbers.length - 1] < totalPages;

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages && page !== currentPage) {
            onPageChange(page);
        }
    };

    const PaginationButton = ({
                                  page,
                                  isActive = false,
                                  isDisabled = false,
                                  onClick,
                                  children,
                                  className: buttonClassName = ''
                              }) => (
        <button
            onClick={onClick}
            disabled={isDisabled}
            className={`
        relative inline-flex items-center px-3 py-2 text-sm font-medium transition-colors
        border border-gray-300 hover:bg-gray-50 focus:z-10 focus:outline-none 
        focus:ring-1 focus:ring-blue-500 focus:border-blue-500
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white
        ${isActive
                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                : 'bg-white text-gray-500 hover:text-gray-700'
            }
        ${buttonClassName}
      `}
        >
            {children || page}
        </button>
    );

    return (
        <nav
            className={`flex items-center justify-center ${className}`}
            aria-label="Paginación"
        >
            <div className="flex">

                {/* Botón Primera página */}
                {showFirstLast && currentPage > 1 && (
                    <PaginationButton
                        onClick={() => handlePageChange(1)}
                        className="rounded-l-md mr-1"
                    >
                        Primera
                    </PaginationButton>
                )}

                {/* Botón Anterior */}
                {showPrevNext && (
                    <PaginationButton
                        onClick={() => handlePageChange(currentPage - 1)}
                        isDisabled={currentPage === 1}
                        className={`${!showFirstLast || currentPage === 1 ? 'rounded-l-md' : ''}`}
                    >
                        <ChevronLeft className="w-4 h-4" />
                        <span className="sr-only">Anterior</span>
                    </PaginationButton>
                )}

                {/* Elipsis inicial */}
                {showStartEllipsis && (
                    <>
                        <PaginationButton
                            onClick={() => handlePageChange(1)}
                        >
                            1
                        </PaginationButton>
                        <span className="relative inline-flex items-center px-3 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
              <MoreHorizontal className="w-4 h-4" />
            </span>
                    </>
                )}

                {/* Números de página */}
                {pageNumbers.map((page, index) => (
                    <PaginationButton
                        key={page}
                        page={page}
                        isActive={page === currentPage}
                        onClick={() => handlePageChange(page)}
                        className={`
              ${index === 0 && !showStartEllipsis && !showPrevNext && (!showFirstLast || currentPage === 1) ? 'rounded-l-md' : ''}
              ${index === pageNumbers.length - 1 && !showEndEllipsis && !showPrevNext && (!showFirstLast || currentPage === totalPages) ? 'rounded-r-md' : ''}
            `}
                    />
                ))}

                {/* Elipsis final */}
                {showEndEllipsis && (
                    <>
            <span className="relative inline-flex items-center px-3 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
              <MoreHorizontal className="w-4 h-4" />
            </span>
                        <PaginationButton
                            onClick={() => handlePageChange(totalPages)}
                        >
                            {totalPages}
                        </PaginationButton>
                    </>
                )}

                {/* Botón Siguiente */}
                {showPrevNext && (
                    <PaginationButton
                        onClick={() => handlePageChange(currentPage + 1)}
                        isDisabled={currentPage === totalPages}
                        className={`${!showFirstLast || currentPage === totalPages ? 'rounded-r-md' : ''}`}
                    >
                        <ChevronRight className="w-4 h-4" />
                        <span className="sr-only">Siguiente</span>
                    </PaginationButton>
                )}

                {/* Botón Última página */}
                {showFirstLast && currentPage < totalPages && (
                    <PaginationButton
                        onClick={() => handlePageChange(totalPages)}
                        className="rounded-r-md ml-1"
                    >
                        Última
                    </PaginationButton>
                )}
            </div>
        </nav>
    );
};

// Componente de paginación simple (solo anterior/siguiente)
export const SimplePagination = ({
                                     currentPage,
                                     totalPages,
                                     onPageChange,
                                     showPageInfo = true,
                                     className = ''
                                 }) => {
    if (totalPages <= 1) return null;

    return (
        <div className={`flex items-center justify-between ${className}`}>
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Anterior
            </button>

            {showPageInfo && (
                <span className="text-sm text-gray-700">
          Página {currentPage} de {totalPages}
        </span>
            )}

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Siguiente
                <ChevronRight className="w-4 h-4 ml-1" />
            </button>
        </div>
    );
};

// Componente de paginación con selector de tamaño de página
export const PaginationWithPageSize = ({
                                           currentPage,
                                           totalPages,
                                           pageSize,
                                           totalItems,
                                           onPageChange,
                                           onPageSizeChange,
                                           pageSizeOptions = [5, 10, 20, 50],
                                           className = ''
                                       }) => {
    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalItems);

    return (
        <div className={`flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0 ${className}`}>

            {/* Información y selector de tamaño */}
            <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-700">
                    Mostrando {startItem} - {endItem} de {totalItems} resultados
                </div>

                <div className="flex items-center space-x-2">
                    <label className="text-sm text-gray-700">
                        Mostrar:
                    </label>
                    <select
                        value={pageSize}
                        onChange={(e) => onPageSizeChange(Number(e.target.value))}
                        className="border border-gray-300 rounded text-sm px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                        {pageSizeOptions.map(size => (
                            <option key={size} value={size}>
                                {size}
                            </option>
                        ))}
                    </select>
                    <span className="text-sm text-gray-700">por página</span>
                </div>
            </div>

            {/* Paginación */}
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={onPageChange}
            />
        </div>
    );
};

export default Pagination;