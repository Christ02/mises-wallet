import { ethers } from 'ethers';
import { config } from '../config/config.js';

export class CentralWalletService {
  static async getStatus() {
    const provider = new ethers.JsonRpcProvider(
      process.env.SEPOLIA_RPC_URL || config.sepolia?.rpcUrl || 'https://sepolia.infura.io/v3/YOUR_KEY'
    );
    const network = await provider.getNetwork();
    return {
      network: network.name,
      chainId: network.chainId.toString(),
      rpcUrl: provider.connection.url
    };
  }

  static async getBalance(address) {
    const provider = new ethers.JsonRpcProvider(
      process.env.SEPOLIA_RPC_URL || config.sepolia?.rpcUrl || 'https://sepolia.infura.io/v3/YOUR_KEY'
    );
    const balance = await provider.getBalance(address);
    return ethers.formatEther(balance);
  }
}

