import { ethers } from 'ethers';
import { config } from '../config/config.js';
import { CentralWalletSettingsService } from './centralWalletSettingsService.js';

const TOKEN_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function totalSupply() view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)'
];

const getEnv = (key, fallback = undefined) => {
  if (process.env[key] !== undefined) {
    return process.env[key];
  }
  return fallback;
};

const DEFAULT_DECIMALS = parseInt(getEnv('CENTRAL_TOKEN_DECIMALS', '18'), 10);
const TOKEN_SYMBOL = getEnv('CENTRAL_TOKEN_SYMBOL', 'HC');

export class CentralWalletService {
  static settingsCache = null;

  static async ensureSettingsLoaded() {
    if (!this.settingsCache) {
      this.settingsCache = await CentralWalletSettingsService.getSettingsForOperations();
    }
    return this.settingsCache;
  }

  static getSetting(key) {
    if (this.settingsCache && this.settingsCache[key] !== undefined && this.settingsCache[key] !== null && this.settingsCache[key] !== '') {
      return this.settingsCache[key];
    }
    const envKeyMap = {
      walletAddress: 'CENTRAL_WALLET_ADDRESS',
      walletPrivateKey: 'CENTRAL_WALLET_PRIVATE_KEY',
      tokenAddress: 'CENTRAL_WALLET_TOKEN_ADDRESS',
      tokenSymbol: 'CENTRAL_TOKEN_SYMBOL',
      tokenDecimals: 'CENTRAL_TOKEN_DECIMALS'
    };
    const envKey = envKeyMap[key];
    if (envKey) {
      return getEnv(envKey, null);
    }
    return null;
  }

  static getProvider() {
    return new ethers.JsonRpcProvider(
      process.env.SEPOLIA_RPC_URL ||
        config.sepolia?.rpcUrl ||
        'https://sepolia.infura.io/v3/YOUR_KEY'
    );
  }

  static getTokenAddress() {
    const cached = this.getSetting('tokenAddress');
    const address = cached || getEnv('CENTRAL_WALLET_TOKEN_ADDRESS');
    if (!address) {
      throw new Error('CENTRAL_WALLET_TOKEN_ADDRESS no está configurado');
    }
    return address;
  }

  static getCentralWalletAddress() {
    const address = this.getSetting('walletAddress') || getEnv('CENTRAL_WALLET_ADDRESS');
    if (!address) {
      throw new Error('CENTRAL_WALLET_ADDRESS no está configurado');
    }
    return address;
  }

  static getCentralWalletPrivateKey() {
    const fromSettings = this.getSetting('walletPrivateKey');
    if (fromSettings) {
      return fromSettings.startsWith('0x') ? fromSettings : `0x${fromSettings}`;
    }
    const key = getEnv('CENTRAL_WALLET_PRIVATE_KEY');
    if (!key) {
      throw new Error('CENTRAL_WALLET_PRIVATE_KEY no está configurado');
    }
    return key.startsWith('0x') ? key : `0x${key}`;
  }

  static getTokenDecimals() {
    const fromSettings = this.getSetting('tokenDecimals');
    if (fromSettings) {
      return parseInt(fromSettings, 10);
    }
    return parseInt(getEnv('CENTRAL_TOKEN_DECIMALS', `${DEFAULT_DECIMALS}`), 10);
  }

  static getTokenSymbol() {
    const fromSettings = this.getSetting('tokenSymbol');
    if (fromSettings) {
      return fromSettings;
    }
    return getEnv('CENTRAL_TOKEN_SYMBOL', TOKEN_SYMBOL);
  }

  static getTokenContract(providerOrSigner) {
    const tokenAddress = this.getTokenAddress();
    return new ethers.Contract(tokenAddress, TOKEN_ABI, providerOrSigner);
  }

  static async getStatus() {
    await this.ensureSettingsLoaded();
    const provider = this.getProvider();
    const network = await provider.getNetwork();
    const centralAddress = this.getCentralWalletAddress();
    const tokenAddress = this.getTokenAddress();
    const tokenBalance = await this.getTokenBalance(centralAddress);
    const contract = this.getTokenContract(provider);

    let totalSupply = null;
    let decimals = this.getTokenDecimals();
    let symbol = this.getTokenSymbol();

    try {
      const [supplyRaw, decimalsFromChain, symbolFromChain] = await Promise.all([
        contract.totalSupply(),
        contract.decimals(),
        contract.symbol()
      ]);
      decimals = Number.isFinite(parseInt(decimalsFromChain, 10))
        ? Number(decimalsFromChain)
        : decimals;
      symbol = symbolFromChain || symbol;
      totalSupply = ethers.formatUnits(supplyRaw, decimals);
    } catch (err) {
      console.warn('No se pudo obtener totalSupply/decimals/symbol del contrato:', err);
    }

    return {
      network: network.name,
      chainId: network.chainId.toString(),
      rpcUrl:
        (provider.connection && provider.connection.url) ||
        (typeof provider._getConnection === 'function'
          ? provider._getConnection().url
          : undefined),
      address: centralAddress,
      token: {
        contract: tokenAddress,
        symbol,
        decimals,
        balance: tokenBalance,
        totalSupply
      }
    };
  }

  static async getTokenBalance(address) {
    await this.ensureSettingsLoaded();
    const provider = this.getProvider();
    const contract = this.getTokenContract(provider);
    const decimals = this.getTokenDecimals();
    const balance = await contract.balanceOf(address);
    return ethers.formatUnits(balance, decimals);
  }

  static async transferTokens(toAddress, amountTokens) {
    if (!toAddress) {
      throw new Error('Dirección destino inválida para transferencia de token');
    }

    await this.ensureSettingsLoaded();

    const provider = this.getProvider();
    const privateKey = this.getCentralWalletPrivateKey();
    const signer = new ethers.Wallet(privateKey, provider);
    const contract = this.getTokenContract(signer);
    const decimals = this.getTokenDecimals();
    const symbol = this.getTokenSymbol();

    const amountUnits = ethers.parseUnits(
      typeof amountTokens === 'string' ? amountTokens : amountTokens.toString(),
      decimals
    );

    const tx = await contract.transfer(toAddress, amountUnits);
    const receipt = await tx.wait();

    const status = receipt.status === 1 ? 'confirmed' : 'failed';

    return {
      hash: tx.hash,
      status,
      symbol,
      decimals
    };
  }

  static async ensureGasBalance(toAddress, options = {}) {
    if (!toAddress) {
      throw new Error('Dirección destino inválida para envío de gas');
    }

    await this.ensureSettingsLoaded();

    const minBalanceEth = options.minBalanceEth || process.env.TOPUP_MIN_NATIVE_BALANCE || '0.0002';
    const topUpEth = options.topUpEth || process.env.TOPUP_NATIVE_AMOUNT || '0.001';

    const provider = this.getProvider();
    const currentBalance = await provider.getBalance(toAddress);
    const minWei = ethers.parseEther(minBalanceEth);

    if (currentBalance >= minWei) {
      return null;
    }

    const topUpWei = ethers.parseEther(topUpEth);
    const signer = new ethers.Wallet(this.getCentralWalletPrivateKey(), provider);
    const tx = await signer.sendTransaction({ to: toAddress, value: topUpWei });
    const receipt = await tx.wait();

    return {
      hash: tx.hash,
      status: receipt.status === 1 ? 'confirmed' : 'failed',
      amountWei: topUpWei.toString()
    };
  }
}

