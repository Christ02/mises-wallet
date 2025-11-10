import { randomUUID } from 'crypto';
import { TransactionRepository } from '../repositories/transactionRepository.js';
import { UserEventService } from './userEventService.js';
import { UserRepository } from '../repositories/userRepository.js';

const toISODate = (value) => {
  if (!value) return new Date().toISOString();
  if (value instanceof Date) return value.toISOString();
  return new Date(value).toISOString();
};

export class UserNotificationService {
  static async getNotifications(userId) {
    const [transactions, eventsData, user] = await Promise.all([
      TransactionRepository.findByUserId(userId, { limit: 10 }),
      UserEventService.getUserEvents(userId),
      UserRepository.findById(userId)
    ]);

    const notifications = [];

    for (const tx of transactions) {
      const direction = tx.direction === 'entrante' ? 'entrante' : 'saliente';
      const amount = typeof tx.amount === 'number' ? tx.amount : parseFloat(tx.amount || '0');
      const counterparty =
        tx.metadata?.recipient_name ||
        tx.metadata?.merchant_name ||
        tx.metadata?.recipient_carnet ||
        tx.metadata?.sender_name ||
        tx.metadata?.to ||
        tx.metadata?.from ||
        'transacción';

      notifications.push({
        id: `tx-${tx.id ?? randomUUID()}`,
        title: direction === 'entrante' ? 'Fondos recibidos' : 'Fondos enviados',
        message:
          direction === 'entrante'
            ? `Recibiste ${amount.toFixed(2)} ${tx.currency || 'ETH'} de ${counterparty}`
            : `Enviaste ${amount.toFixed(2)} ${tx.currency || 'ETH'} hacia ${counterparty}`,
        date: toISODate(tx.created_at),
        type: direction === 'entrante' ? 'success' : 'info',
        read: tx.status !== 'pendiente'
      });
    }

    const upcomingEvents = eventsData?.upcoming || [];
    upcomingEvents.slice(0, 5).forEach((event) => {
      notifications.push({
        id: `event-${event.id}`,
        title: 'Nuevo evento disponible',
        message: `${event.name} se realizará el ${event.event_date}`,
        date: toISODate(event.event_date),
        type: 'info',
        read: false
      });
    });

    if (user?.status === 'inactivo') {
      notifications.push({
        id: 'status-inactive',
        title: 'Cuenta inactiva',
        message: 'Tu cuenta se encuentra inactiva. Contacta al soporte para reactivarla.',
        date: toISODate(new Date()),
        type: 'error',
        read: false
      });
    }

    notifications.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return notifications;
  }
}


