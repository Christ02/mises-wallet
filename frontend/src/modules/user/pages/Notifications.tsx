import { useState } from 'react';
import { HiBell, HiCheckCircle, HiXCircle, HiInformationCircle } from 'react-icons/hi';
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
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Notificaciones</h1>
          <p className="text-sm sm:text-base text-gray-400">Gestiona tus notificaciones</p>
        </div>

        {notifs.length === 0 ? (
          <div className="text-center py-12">
            <HiBell className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 mb-2">No hay notificaciones</p>
            <p className="text-sm text-gray-500">Tus notificaciones aparecerán aquí</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifs.map((notif) => (
              <div
                key={notif.id}
                onClick={() => markAsRead(notif.id)}
                className={`bg-dark-card border border-dark-border rounded-xl p-4 sm:p-6 hover:border-primary-red/30 transition-all cursor-pointer ${
                  !notif.read ? 'border-primary-red/30' : ''
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className={`text-base sm:text-lg font-semibold ${
                        !notif.read ? 'text-white' : 'text-gray-300'
                      }`}>
                        {notif.title}
                      </h3>
                      {!notif.read && (
                        <div className="w-2 h-2 bg-primary-red rounded-full flex-shrink-0"></div>
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
    </Layout>
  );
}

