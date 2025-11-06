import { useState } from 'react';
import { HiBell, HiCheckCircle, HiXCircle, HiInformationCircle, HiQuestionMarkCircle, HiX } from 'react-icons/hi';
import Layout from '../components/layout/Layout';

interface Notification {
  id: number;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'success' | 'error' | 'info';
}

const notifications: Notification[] = [
  {
    id: 1,
    title: 'Transacción completada',
    message: 'Tu transacción de 50.25 UFM ha sido completada exitosamente',
    date: '2024-11-15T10:45:00',
    read: false,
    type: 'success'
  },
  {
    id: 2,
    title: 'Nuevo evento disponible',
    message: 'La Conferencia Blockchain 2024 está disponible para registro',
    date: '2024-11-14T15:20:00',
    read: false,
    type: 'info'
  },
  {
    id: 3,
    title: 'Sesión iniciada',
    message: 'Has iniciado sesión desde un nuevo dispositivo',
    date: '2024-11-13T09:00:00',
    read: true,
    type: 'info'
  }
];

export default function Notifications() {
  const [notifs, setNotifs] = useState<Notification[]>(notifications);
  const [showHelp, setShowHelp] = useState(false);

  const markAsRead = (id: number) => {
    setNotifs(notifs.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <HiCheckCircle className="w-6 h-6 text-positive" />;
      case 'error':
        return <HiXCircle className="w-6 h-6 text-negative" />;
      default:
        return <HiInformationCircle className="w-6 h-6 text-primary-blue" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return `Hoy, ${date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return `Ayer, ${date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  return (
    <Layout>
      <div>
        {/* Header Section */}
        <div className="flex items-center justify-between mt-5">
          <div className="flex items-center space-x-4 sm:space-x-5 flex-1 min-w-0">
            <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-primary-red to-primary-red/80 rounded-full flex items-center justify-center text-white shadow-lg flex-shrink-0">
              <HiBell className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Notificaciones</h2>
              <p className="text-sm sm:text-base text-gray-400">Gestiona tus notificaciones</p>
            </div>
          </div>
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="w-10 h-10 sm:w-12 sm:h-12 bg-dark-card border border-dark-border rounded-full flex items-center justify-center text-white hover:bg-dark-bg transition-all flex-shrink-0"
          >
            <HiQuestionMarkCircle className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* NOTIFICACIONES Section */}
        <div className="mt-8 sm:mt-10 lg:mt-12">
          {notifs.length === 0 ? (
            <div className="text-center py-12 sm:py-16">
              <HiBell className="w-16 h-16 sm:w-20 sm:h-20 text-gray-400 mx-auto mb-4" />
              <p className="text-base sm:text-lg text-gray-400 mb-2">No hay notificaciones</p>
              <p className="text-sm sm:text-base text-gray-500">Tus notificaciones aparecerán aquí</p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {notifs.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => markAsRead(notif.id)}
                  className={`bg-dark-card border rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-8 hover:border-primary-red/30 transition-all cursor-pointer ${
                    !notif.read ? 'border-primary-red/30' : 'border-dark-border'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 mt-1">
                      {getIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className={`text-base sm:text-lg lg:text-xl font-semibold ${
                          !notif.read ? 'text-white' : 'text-gray-300'
                        }`}>
                          {notif.title}
                        </h3>
                        {!notif.read && (
                          <div className="w-2 h-2 bg-primary-red rounded-full flex-shrink-0 ml-2"></div>
                        )}
                      </div>
                      <p className="text-sm sm:text-base text-gray-400 mb-2">
                        {notif.message}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500">
                        {formatDate(notif.date)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Help Modal */}
        {showHelp && (
          <>
            <div
              className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
              onClick={() => setShowHelp(false)}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div
                className="bg-dark-card border border-dark-border rounded-xl sm:rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl sm:text-2xl font-bold text-white">Ayuda</h3>
                  <button
                    onClick={() => setShowHelp(false)}
                    className="p-2 text-gray-400 hover:text-white hover:bg-dark-bg rounded-lg transition-all"
                  >
                    <HiX className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </div>
                <div className="space-y-4 text-sm sm:text-base text-gray-300">
                  <p>
                    En esta sección puedes ver todas tus notificaciones y gestionarlas.
                  </p>
                  <p>
                    Las notificaciones no leídas aparecen destacadas. Haz clic en una notificación para marcarla como leída.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}

