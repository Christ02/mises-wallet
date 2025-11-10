import { UserRepository } from '../repositories/userRepository.js';
import { WalletService } from './walletService.js';
import { UserRechargeService } from './userRechargeService.js';

export class UserProfileService {
  static async getProfile(userId) {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    const [walletBalance, rechargeSummary] = await Promise.all([
      WalletService.getBalanceForUser(userId),
      UserRechargeService.getUserRechargeSummary(userId)
    ]);

    return {
      user: {
        id: user.id,
        nombres: user.nombres,
        apellidos: user.apellidos,
        email: user.email,
        carnet_universitario: user.carnet_universitario,
        role: user.role_name || user.role_id,
        status: user.status
      },
      wallet: {
        balance: walletBalance.balance,
        tokenSymbol: walletBalance.currency,
        network: walletBalance.network
      },
      rechargeSummary
    };
  }
}


