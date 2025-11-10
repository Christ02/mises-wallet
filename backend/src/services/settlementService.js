import { SettlementRequestRepository } from '../repositories/settlementRequestRepository.js';
import { EventRepository } from '../repositories/eventRepository.js';
import { EventBusinessRepository } from '../repositories/eventBusinessRepository.js';
import { EventBusinessMemberRepository } from '../repositories/eventBusinessMemberRepository.js';
import { BusinessWalletService } from './businessWalletService.js';
import { CentralWalletService } from './centralWalletService.js';
import { UserRepository } from '../repositories/userRepository.js';
import { TransactionRepository } from '../repositories/transactionRepository.js';

const ALLOWED_STATUSES = ['pendiente', 'pagado', 'rechazado'];

export class SettlementService {
  static async validateUserBelongsToBusiness(eventId, businessId, userId) {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    const membership = await EventBusinessMemberRepository.findByEventAndCarnet(
      eventId,
      user.carnet_universitario
    );

    if (!membership || membership.business_id !== businessId) {
      throw new Error('No tienes permisos para solicitar liquidaciones de este negocio');
    }

    return membership;
  }

  static async createSettlementRequest({ userId, eventId, businessId, method, notes }) {
    const event = await EventRepository.findById(eventId);
    if (!event) {
      throw new Error('Evento no encontrado');
    }

    if (event.status !== 'finalizado') {
      throw new Error('El evento aún no ha finalizado. Solo se puede liquidar después de finalizarlo.');
    }

    const business = await EventBusinessRepository.findById(businessId);
    if (!business || business.event_id !== eventId) {
      throw new Error('Negocio del evento no encontrado');
    }

    await this.validateUserBelongsToBusiness(eventId, businessId, userId);

    const existing = await SettlementRequestRepository.findActiveByBusinessId(businessId);
    if (existing) {
      throw new Error('Ya existe una solicitud de liquidación en proceso para este negocio');
    }

    const { balanceTokens, address } = await BusinessWalletService.getBalanceForBusiness(businessId);
    if (!balanceTokens || balanceTokens <= 0) {
      throw new Error('El negocio no tiene HayekCoin disponibles para liquidar');
    }

    await CentralWalletService.ensureSettingsLoaded();

    const request = await SettlementRequestRepository.create({
      event_id: eventId,
      business_id: businessId,
      requested_amount: balanceTokens,
      token_symbol: CentralWalletService.getTokenSymbol(),
      method: method || 'efectivo',
      notes,
      status: 'pendiente',
      created_by: userId
    });

    return {
      id: request.id,
      businessId,
      eventId,
      amount: balanceTokens,
      tokenSymbol: CentralWalletService.getTokenSymbol(),
      walletAddress: address,
      status: request.status
    };
  }

  static async getSettlementStatus(businessId) {
    const settlement = await SettlementRequestRepository.findByBusinessId(businessId);
    if (!settlement) {
      return null;
    }
    return {
      id: settlement.id,
      status: settlement.status,
      amount: parseFloat(settlement.requested_amount),
      tokenSymbol: settlement.token_symbol,
      method: settlement.method,
      notes: settlement.notes,
      hash: settlement.token_transfer_hash,
      updatedAt: settlement.updated_at,
      createdAt: settlement.created_at
    };
  }

  static async listSettlements({ status }) {
    const settlements = await SettlementRequestRepository.list({ status });
    return settlements.map((item) => ({
      id: item.id,
      event_id: item.event_id,
      event_name: item.event_name,
      business_id: item.business_id,
      business_name: item.business_name,
      group_id: item.group_id,
      requested_amount: parseFloat(item.requested_amount),
      token_symbol: item.token_symbol,
      status: item.status,
      method: item.method,
      notes: item.notes,
      created_at: item.created_at,
      updated_at: item.updated_at,
      token_transfer_hash: item.token_transfer_hash
    }));
  }

  static async approveSettlement({ settlementId, adminId }) {
    const settlement = await SettlementRequestRepository.findById(settlementId);
    if (!settlement) {
      throw new Error('Solicitud de liquidación no encontrada');
    }

    if (settlement.status !== 'pendiente') {
      throw new Error('La solicitud ya fue procesada');
    }

    const transfer = await BusinessWalletService.transferFullBalanceToCentralWallet(
      settlement.business_id,
      settlement.requested_amount
    );

    if (transfer.status !== 'confirmed') {
      throw new Error('La transferencia desde la wallet del negocio falló');
    }

    await SettlementRequestRepository.updateStatus(settlement.id, {
      status: 'pagado',
      token_transfer_hash: transfer.hash,
      approved_by: adminId
    });

    await TransactionRepository.create({
      user_id: null,
      reference: transfer.hash,
      type: 'liquidacion',
      status: 'completada',
      direction: 'entrante',
      amount: settlement.requested_amount.toString(),
      currency: transfer.token_symbol,
      description: `Liquidación de negocio ${settlement.business_id}`,
      metadata: {
        type: 'liquidacion',
        settlement_id: settlement.id,
        business_id: settlement.business_id,
        event_id: settlement.event_id,
        token_symbol: transfer.token_symbol,
        token_transfer_hash: transfer.hash
      }
    });

    return {
      id: settlement.id,
      hash: transfer.hash,
      status: 'pagado'
    };
  }
}


