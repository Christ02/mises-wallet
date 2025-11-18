import { HiChevronLeft, HiChevronRight, HiUserGroup } from 'react-icons/hi';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
}

export default function Pagination({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage }: PaginationProps) {
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    // const maxVisible = 4; // Número máximo de páginas visibles además de la actual (no usado actualmente)

    if (totalPages <= 7) {
      // Si hay 7 o menos páginas, mostrar todas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Lógica para mostrar páginas con elipsis
      if (currentPage <= 3) {
        // Mostrar primeras páginas
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Mostrar últimas páginas
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Mostrar páginas del medio
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (totalPages <= 1) {
    return null;
  }

  // Calcular el rango de items mostrados
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="bg-dark-card border border-dark-border rounded-xl p-4 sm:p-6 mt-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Texto informativo a la izquierda */}
        <div className="flex items-center gap-2 text-sm text-gray-300">
          <HiUserGroup className="w-5 h-5 text-gray-400" />
          <span>
            Mostrando <span className="font-semibold text-white">{startItem}</span> a{' '}
            <span className="font-semibold text-white">{endItem}</span> de{' '}
            <span className="font-semibold text-white">{totalItems}</span> resultados
          </span>
        </div>

        {/* Controles de navegación a la derecha */}
        <div className="flex items-center gap-2">
          {/* Botón Anterior */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              currentPage === 1
                ? 'bg-dark-bg border border-primary-red/30 text-gray-500 cursor-not-allowed'
                : 'bg-dark-bg border border-primary-red/50 text-primary-red hover:bg-primary-red/10 hover:border-primary-red'
            }`}
          >
            <HiChevronLeft className="w-4 h-4" />
            <span>Anterior</span>
          </button>

          {/* Números de página */}
          {getPageNumbers().map((page, index) => {
            if (page === '...') {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="px-3 py-2 text-gray-400"
                >
                  ...
                </span>
              );
            }

            const pageNumber = page as number;
            const isActive = pageNumber === currentPage;

            return (
              <button
                key={pageNumber}
                onClick={() => onPageChange(pageNumber)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  isActive
                    ? 'bg-primary-red border border-primary-red text-white'
                    : 'bg-dark-bg border border-dark-border text-gray-300 hover:bg-dark-bg/80 hover:text-white hover:border-primary-red/50'
                }`}
              >
                {pageNumber}
              </button>
            );
          })}

          {/* Botón Siguiente */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              currentPage === totalPages
                ? 'bg-dark-bg border border-primary-red/30 text-gray-500 cursor-not-allowed'
                : 'bg-dark-bg border border-primary-red/50 text-primary-red hover:bg-primary-red/10 hover:border-primary-red'
            }`}
          >
            <span>Siguiente</span>
            <HiChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

