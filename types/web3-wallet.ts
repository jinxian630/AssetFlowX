// Web3 Wallet Integration Module
import { WalletConnection, Web3Transaction } from '@/types/enhanced';

export class Web3WalletManager {
  private currentWallet: WalletConnection | null = null;
  private ethereum: any = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.ethereum = (window as any).ethereum;
    }
  }

  // Connect MetaMask wallet
  async connectMetaMask(): Promise<WalletConnection> {
    if (!this.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    try {
      // Request account access
      const accounts = await this.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      // Get chain ID
      const chainId = await this.ethereum.request({
        method: 'eth_chainId',
      });

      // Get network name
      const networkName = this.getNetworkName(parseInt(chainId, 16));

      // Get balance
      const balance = await this.ethereum.request({
        method: 'eth_getBalance',
        params: [accounts[0], 'latest'],
      });

      this.currentWallet = {
        type: 'metamask',
        address: accounts[0],
        chainId: parseInt(chainId, 16),
        networkName,
        balance: this.formatBalance(balance),
      };

      // Set up event listeners
      this.setupMetaMaskListeners();

      return this.currentWallet;
    } catch (error) {
      console.error('MetaMask connection error:', error);
      throw error;
    }
  }

  // Connect zkLogin (Sui-based zero-knowledge login)
  async connectZkLogin(provider: 'google' | 'facebook' | 'twitch'): Promise<WalletConnection> {
    try {
      // Simulate zkLogin flow (in production, integrate with actual zkLogin SDK)
      const mockZkProof = await this.generateZkProof(provider);
      
      // Generate deterministic address from zkProof
      const address = this.deriveAddressFromZkProof(mockZkProof);
      
      this.currentWallet = {
        type: 'zkLogin',
        address,
        chainId: 101, // Sui testnet
        networkName: 'Sui Testnet',
        balance: '0',
      };

      return this.currentWallet;
    } catch (error) {
      console.error('zkLogin connection error:', error);
      throw error;
    }
  }

  // Generate zero-knowledge proof (mock implementation)
  private async generateZkProof(provider: string): Promise<string> {
    // In production, this would interact with the actual zkLogin service
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
    
    const proof = {
      provider,
      timestamp: Date.now(),
      nonce: Math.random().toString(36).substring(2),
      signature: this.generateMockSignature(),
    };

    return Buffer.from(JSON.stringify(proof)).toString('base64');
  }

  // Derive address from zkProof
  private deriveAddressFromZkProof(zkProof: string): string {
    // Mock derivation - in production, use actual cryptographic derivation
    const hash = require('crypto')
      .createHash('sha256')
      .update(zkProof)
      .digest('hex');
    return '0x' + hash.substring(0, 40);
  }

  // Generate mock signature
  private generateMockSignature(): string {
    return '0x' + require('crypto').randomBytes(65).toString('hex');
  }

  // Set up MetaMask event listeners
  private setupMetaMaskListeners() {
    if (!this.ethereum) return;

    // Listen for account changes
    this.ethereum.on('accountsChanged', (accounts: string[]) => {
      if (accounts.length === 0) {
        this.disconnect();
      } else if (this.currentWallet) {
        this.currentWallet.address = accounts[0];
        this.updateBalance();
      }
    });

    // Listen for chain changes
    this.ethereum.on('chainChanged', (chainId: string) => {
      if (this.currentWallet) {
        this.currentWallet.chainId = parseInt(chainId, 16);
        this.currentWallet.networkName = this.getNetworkName(parseInt(chainId, 16));
      }
    });
  }

  // Update wallet balance
  private async updateBalance() {
    if (!this.ethereum || !this.currentWallet) return;

    try {
      const balance = await this.ethereum.request({
        method: 'eth_getBalance',
        params: [this.currentWallet.address, 'latest'],
      });
      this.currentWallet.balance = this.formatBalance(balance);
    } catch (error) {
      console.error('Error updating balance:', error);
    }
  }

  // Sign message
  async signMessage(message: string): Promise<string> {
    if (!this.currentWallet) {
      throw new Error('No wallet connected');
    }

    if (this.currentWallet.type === 'metamask' && this.ethereum) {
      try {
        const signature = await this.ethereum.request({
          method: 'personal_sign',
          params: [message, this.currentWallet.address],
        });
        return signature;
      } catch (error) {
        console.error('Error signing message:', error);
        throw error;
      }
    } else if (this.currentWallet.type === 'zkLogin') {
      // Mock zkLogin signature
      return this.generateMockSignature();
    }

    throw new Error('Unsupported wallet type');
  }

  // Send transaction
  async sendTransaction(transaction: Partial<Web3Transaction>): Promise<string> {
    if (!this.currentWallet) {
      throw new Error('No wallet connected');
    }

    if (this.currentWallet.type === 'metamask' && this.ethereum) {
      try {
        const txHash = await this.ethereum.request({
          method: 'eth_sendTransaction',
          params: [{
            from: transaction.from || this.currentWallet.address,
            to: transaction.to,
            value: transaction.value,
            data: transaction.data || '0x',
            gas: transaction.gasLimit,
            gasPrice: transaction.gasPrice,
          }],
        });
        return txHash;
      } catch (error) {
        console.error('Error sending transaction:', error);
        throw error;
      }
    } else if (this.currentWallet.type === 'zkLogin') {
      // Mock zkLogin transaction
      return '0x' + require('crypto').randomBytes(32).toString('hex');
    }

    throw new Error('Unsupported wallet type');
  }

  // Switch network
  async switchNetwork(chainId: number): Promise<void> {
    if (!this.ethereum) {
      throw new Error('MetaMask is not available');
    }

    try {
      await this.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
    } catch (error: any) {
      // If the chain hasn't been added, add it
      if (error.code === 4902) {
        await this.addNetwork(chainId);
      } else {
        throw error;
      }
    }
  }

  // Add network to MetaMask
  private async addNetwork(chainId: number): Promise<void> {
    const networks: Record<number, any> = {
      84532: { // Base Sepolia
        chainName: 'Base Sepolia',
        nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
        rpcUrls: ['https://sepolia.base.org'],
        blockExplorerUrls: ['https://sepolia.basescan.org'],
      },
      11155111: { // Sepolia
        chainName: 'Sepolia',
        nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
        rpcUrls: ['https://sepolia.infura.io/v3/YOUR_INFURA_KEY'],
        blockExplorerUrls: ['https://sepolia.etherscan.io'],
      },
    };

    const network = networks[chainId];
    if (!network) {
      throw new Error(`Network configuration not found for chain ID ${chainId}`);
    }

    await this.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: `0x${chainId.toString(16)}`,
        ...network,
      }],
    });
  }

  // Get network name from chain ID
  private getNetworkName(chainId: number): string {
    const networks: Record<number, string> = {
      1: 'Ethereum Mainnet',
      5: 'Goerli',
      11155111: 'Sepolia',
      137: 'Polygon',
      80001: 'Mumbai',
      56: 'BSC',
      97: 'BSC Testnet',
      84532: 'Base Sepolia',
      8453: 'Base',
      101: 'Sui Testnet',
    };

    return networks[chainId] || `Chain ${chainId}`;
  }

  // Format balance from Wei to ETH
  private formatBalance(balanceWei: string): string {
    const balance = parseInt(balanceWei, 16) / 1e18;
    return balance.toFixed(4);
  }

  // Disconnect wallet
  disconnect() {
    this.currentWallet = null;
    if (this.ethereum) {
      this.ethereum.removeAllListeners();
    }
  }

  // Get current wallet
  getCurrentWallet(): WalletConnection | null {
    return this.currentWallet;
  }

  // Check if wallet is connected
  isConnected(): boolean {
    return this.currentWallet !== null;
  }

  // Verify wallet ownership (sign and verify)
  async verifyOwnership(message: string, expectedAddress: string): Promise<boolean> {
    try {
      const signature = await this.signMessage(message);
      
      if (this.currentWallet?.type === 'metamask' && this.ethereum) {
        // Recover address from signature
        const recoveredAddress = await this.ethereum.request({
          method: 'personal_ecRecover',
          params: [message, signature],
        });
        
        return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();
      } else if (this.currentWallet?.type === 'zkLogin') {
        // Mock verification for zkLogin
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error verifying ownership:', error);
      return false;
    }
  }

  // Get transaction receipt
  async getTransactionReceipt(txHash: string): Promise<any> {
    if (!this.ethereum) {
      throw new Error('Provider not available');
    }

    return await this.ethereum.request({
      method: 'eth_getTransactionReceipt',
      params: [txHash],
    });
  }

  // Watch for transaction confirmation
  async waitForTransaction(txHash: string, confirmations: number = 1): Promise<any> {
    const receipt = await this.getTransactionReceipt(txHash);
    
    if (receipt && receipt.blockNumber) {
      const currentBlock = await this.ethereum.request({
        method: 'eth_blockNumber',
        params: [],
      });
      
      const confirmationCount = parseInt(currentBlock, 16) - parseInt(receipt.blockNumber, 16);
      
      if (confirmationCount >= confirmations) {
        return receipt;
      }
    }
    
    // Wait and retry
    await new Promise(resolve => setTimeout(resolve, 3000));
    return this.waitForTransaction(txHash, confirmations);
  }
}

// Export singleton instance
export const web3WalletManager = new Web3WalletManager();

// Utility functions
export const web3Utils = {
  // Convert to Wei
  toWei: (value: string, unit: 'ether' | 'gwei' | 'wei' = 'ether'): string => {
    const units = {
      wei: 1,
      gwei: 1e9,
      ether: 1e18,
    };
    return (parseFloat(value) * units[unit]).toString();
  },

  // Convert from Wei
  fromWei: (value: string, unit: 'ether' | 'gwei' | 'wei' = 'ether'): string => {
    const units = {
      wei: 1,
      gwei: 1e9,
      ether: 1e18,
    };
    return (parseInt(value) / units[unit]).toString();
  },

  // Validate address
  isValidAddress: (address: string): boolean => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  },

  // Shorten address for display
  shortenAddress: (address: string, chars: number = 4): string => {
    if (!address) return '';
    return `${address.substring(0, chars + 2)}...${address.substring(address.length - chars)}`;
  },

  // Generate random nonce
  generateNonce: (): string => {
    return Date.now().toString() + Math.random().toString(36).substring(2);
  },
};
