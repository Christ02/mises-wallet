import express from 'express';
import { WalletController } from '../controllers/walletController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.get('/balance', authenticate, WalletController.getBalance);
router.post('/send', authenticate, WalletController.sendTokens);
router.get('/history', authenticate, WalletController.getHistory);
router.get('/recipients/search', authenticate, WalletController.searchRecipients);
router.get('/merchants/search', authenticate, WalletController.searchMerchants);
router.post('/merchants/pay', authenticate, WalletController.payMerchant);
router.post('/recharge', authenticate, WalletController.recharge);
router.post('/withdrawals', authenticate, WalletController.requestWithdrawal);
router.get('/withdrawals', authenticate, WalletController.listWithdrawals);

export default router;

