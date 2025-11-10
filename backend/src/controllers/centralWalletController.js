import { CentralWalletService } from '../services/centralWalletService.js';
import { CentralWalletSettingsService } from '../services/centralWalletSettingsService.js';
import { TransactionRepository } from '../repositories/transactionRepository.js';
import { SettlementService } from '../services/settlementService.js';
import { UserWithdrawalService } from '../services/userWithdrawalService.js';

export class CentralWalletController {
  static async status(_req, res) {
    try {
      const status = await CentralWalletService.getStatus();
      res.status(200).json(status);
    } catch (error) {
      res.status(500).json({ error: error.message || 'Error al obtener estado de la wallet central' });
    }
  }

  static async getConfig(_req, res) {
    try {
      await CentralWalletService.ensureSettingsLoaded();
      const settings = await CentralWalletSettingsService.getSettings({ includeSecrets: false });
      res.status(200).json(settings || {});
    } catch (error) {
      res.status(500).json({ error: error.message || 'Error al obtener las credenciales de la wallet central' });
    }
  }

  static async updateConfig(req, res) {
    try {
      const payload = {
        bankName: req.body.bankName,
        network: req.body.network,
        walletAddress: req.body.walletAddress,
        walletPrivateKey: req.body.walletPrivateKey,
        publicApiKey: req.body.publicApiKey,
        secretApiKey: req.body.secretApiKey,
        tokenSymbol: req.body.tokenSymbol,
        tokenAddress: req.body.tokenAddress,
        tokenDecimals: req.body.tokenDecimals
      };

      const updated = await CentralWalletSettingsService.upsertSettings(payload, req.user?.id);
      CentralWalletService.settingsCache = null; // reset cache
      await CentralWalletService.ensureSettingsLoaded();
      res.status(200).json(updated);
    } catch (error) {
      res.status(400).json({ error: error.message || 'Error al actualizar credenciales' });
    }
  }

  static async activity(req, res) {
    try {
      await CentralWalletService.ensureSettingsLoaded();
      const limit = Number.isNaN(Number(req.query.limit)) ? 25 : Math.min(Number(req.query.limit), 100);
      const rows = await TransactionRepository.findCentralWalletActivity(limit);
      const symbol = CentralWalletService.getTokenSymbol();

      const movements = rows.map((row) => {
        const metadata = row.metadata || {};
        const tokenAmount = metadata.token_amount ? parseFloat(metadata.token_amount) : parseFloat(row.amount);
        const direction = row.direction === 'saliente' ? 'saliente' : 'entrante';
        const counterparty =
          metadata.recipient_name ||
          metadata.merchant_name ||
          metadata.recipient_carnet ||
          metadata.merchant_group_id ||
          metadata.to_address ||
          metadata.to ||
          metadata.from ||
          'Sin identificar';

        return {
          id: row.id,
          reference: row.reference,
          direction,
          type: row.type,
          status: row.status,
          created_at: row.created_at,
          amount: tokenAmount || 0,
          currency: metadata.token_symbol || symbol,
          counterparty,
          metadata
        };
      });

      res.status(200).json({
        movements,
        tokenSymbol: symbol,
        tokenDecimals: CentralWalletService.getTokenDecimals()
      });
    } catch (error) {
      console.error('Error fetching central wallet activity', error);
      res.status(500).json({ error: error.message || 'Error al obtener la actividad de la wallet central' });
    }
  }

  static async listSettlements(req, res) {
    try {
      const { status } = req.query;
      const settlements = await SettlementService.listSettlements({ status });
      res.status(200).json({ settlements });
    } catch (error) {
      console.error('Error listing settlements', error);
      res.status(500).json({ error: error.message || 'Error al obtener las solicitudes de liquidación' });
    }
  }

  static async approveSettlement(req, res) {
    try {
      const adminId = req.user.id;
      const { settlementId } = req.params;
      const result = await SettlementService.approveSettlement({
        settlementId: Number(settlementId),
        adminId
      });
      res.status(200).json(result);
    } catch (error) {
      console.error('Error approving settlement', error);
      res.status(400).json({ error: error.message || 'Error al aprobar la liquidación' });
    }
  }

  static async listWithdrawals(req, res) {
    try {
      const limit = Number.isNaN(Number(req.query.limit)) ? 25 : Math.min(Number(req.query.limit), 100);
      const offset = Number.isNaN(Number(req.query.offset)) ? 0 : Number(req.query.offset);
      const requests = await UserWithdrawalService.listAll({ limit, offset });
      res.status(200).json({ withdrawals: requests });
    } catch (error) {
      console.error('Error listing withdrawals', error);
      res.status(500).json({ error: error.message || 'Error al obtener las solicitudes de retiro' });
    }
  }

  static async approveWithdrawal(req, res) {
    try {
      const adminId = req.user.id;
      const { withdrawalId } = req.params;
      const { txHash } = req.body || {};
      const result = await UserWithdrawalService.approveWithdrawal({
        requestId: Number(withdrawalId),
        adminId,
        txHash
      });
      res.status(200).json(result);
    } catch (error) {
      console.error('Error approving withdrawal', error);
      res.status(400).json({ error: error.message || 'Error al aprobar la solicitud de retiro' });
    }
  }

  static async rejectWithdrawal(req, res) {
    try {
      const adminId = req.user.id;
      const { withdrawalId } = req.params;
      const { notes } = req.body || {};
      const result = await UserWithdrawalService.rejectWithdrawal({
        requestId: Number(withdrawalId),
        adminId,
        notes
      });
      res.status(200).json(result);
    } catch (error) {
      console.error('Error rejecting withdrawal', error);
      res.status(400).json({ error: error.message || 'Error al rechazar la solicitud de retiro' });
    }
  }
}

