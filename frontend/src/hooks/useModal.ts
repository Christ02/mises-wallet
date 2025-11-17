import { useEffect } from 'react';

/**
 * Hook para prevenir el scroll del body cuando un modal está abierto
 * Calcula el ancho del scrollbar y lo compensa con padding para evitar el desplazamiento del contenido
 */
export function useModal(isOpen: boolean) {
  useEffect(() => {
    if (isOpen) {
      // Calcular el ancho del scrollbar ANTES de ocultarlo
      // Esto es crítico: debemos medir cuando el scrollbar todavía está visible
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      
      // Guardar los valores originales
      const originalBodyOverflow = document.body.style.overflow;
      const originalBodyPaddingRight = document.body.style.paddingRight;
      const originalHtmlOverflow = document.documentElement.style.overflow;
      const originalHtmlPaddingRight = document.documentElement.style.paddingRight;
      
      // Aplicar estilos para prevenir scroll
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      
      // Compensar el ancho del scrollbar en ambos elementos
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
        document.documentElement.style.paddingRight = `${scrollbarWidth}px`;
      }

      // Cleanup: restaurar el estado original cuando el modal se cierra
      return () => {
        document.body.style.overflow = originalBodyOverflow;
        document.body.style.paddingRight = originalBodyPaddingRight;
        document.documentElement.style.overflow = originalHtmlOverflow;
        document.documentElement.style.paddingRight = originalHtmlPaddingRight;
      };
    }
  }, [isOpen]);
}

