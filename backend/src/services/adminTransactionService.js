import { TransactionRepository } from '../repositories/transactionRepository.js';

const normalizeFilters = (filters = {}) => {
  const normalized = { ...filters };

  if (normalized.search) {
    normalized.search = normalized.search.trim();
  } else {
    delete normalized.search;
  }

  if (normalized.status === 'Todos' || normalized.status === 'all' || !normalized.status) {
    delete normalized.status;
  }

  if (normalized.type === 'Todos' || normalized.type === 'all' || !normalized.type) {
    delete normalized.type;
  }

  if (normalized.direction === 'Todos' || normalized.direction === 'all' || !normalized.direction) {
    delete normalized.direction;
  }

  if (!normalized.dateFrom) {
    delete normalized.dateFrom;
  }

  if (!normalized.dateTo) {
    delete normalized.dateTo;
  }

  normalized.limit = Number.isNaN(Number(filters.limit)) ? 25 : Math.min(Number(filters.limit), 200);
  normalized.offset = Number.isNaN(Number(filters.offset))
    ? 0
    : Math.max(Number(filters.offset), 0);

  return normalized;
};

const mapTransaction = (tx) => ({
  id: tx.id,
  reference: tx.reference,
  type: tx.type,
  status: tx.status,
  direction: tx.direction,
  amount: tx.amount,
  currency: tx.currency,
  description: tx.description,
  metadata: tx.metadata || {},
  created_at: tx.created_at,
  updated_at: tx.updated_at,
  completed_at: tx.completed_at,
  user: tx.user
    ? {
        id: tx.user.id,
        nombres: tx.user.nombres,
        apellidos: tx.user.apellidos,
        email: tx.user.email,
        carnet: tx.user.carnet_universitario
      }
    : null
});

export class AdminTransactionService {
  static async listTransactions(filters = {}) {
    const normalized = normalizeFilters(filters);
    const [transactions, total] = await Promise.all([
      TransactionRepository.findAll(normalized),
      TransactionRepository.countAll(normalized)
    ]);

    return {
      data: transactions.map(mapTransaction),
      total,
      limit: normalized.limit,
      offset: normalized.offset
    };
  }
}

