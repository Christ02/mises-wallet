import { HiExclamation } from 'react-icons/hi';

interface ConfirmModalProps {
  open: boolean;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onClose: () => void;
  loading?: boolean;
}

export default function ConfirmModal({
  open,
  title = 'Confirmar acción',
  description = '¿Estás seguro de continuar? Esta acción no se puede deshacer.',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onClose,
  loading = false
}: ConfirmModalProps) {
  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-dark-card border border-dark-border rounded-xl shadow-2xl overflow-hidden">
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-red to-primary-red/80 border border-primary-red/40 text-white flex items-center justify-center shadow-lg flex-shrink-0">
                <HiExclamation className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
                <p className="text-sm text-gray-400">{description}</p>
              </div>
            </div>
          </div>
          <div className="px-6 pb-6 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-dark-bg border border-dark-border text-gray-300 hover:text-white hover:bg-dark-bg/80 transition-all disabled:opacity-60"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2 bg-primary-red hover:bg-primary-red/90 text-white font-semibold rounded-lg transition-all disabled:opacity-60"
            >
              {loading && (
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}


