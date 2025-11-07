import crypto from 'crypto';
import { Block, Transaction, Blockchain, SmartContract } from '@/types/enhanced';

// Blockchain creation and management
export class BlockchainManager {
  private blockchains: Map<string, Blockchain> = new Map();

  // Create a new blockchain
  createBlockchain(params: {
    name: string;
    network: 'private' | 'public' | 'consortium';
    consensus: 'PoW' | 'PoS' | 'PoA' | 'PBFT';
    createdBy: string;
  }): Blockchain {
    const chainId = this.generateChainId();
    
    const blockchain: Blockchain = {
      id: `bc_${Date.now()}`,
      name: params.name,
      network: params.network,
      consensus: params.consensus,
      chainId,
      blocks: [this.createGenesisBlock()],
      nodes: [],
      smartContracts: [],
      createdBy: params.createdBy,
      createdAt: new Date(),
      status: 'active',
    };

    this.blockchains.set(blockchain.id, blockchain);
    return blockchain;
  }

  // Create genesis block
  private createGenesisBlock(): Block {
    return {
      index: 0,
      timestamp: new Date().toISOString(),
      transactions: [],
      nonce: 0,
      hash: this.calculateHash('0', [], 0),
      previousHash: '0',
      merkleRoot: this.calculateMerkleRoot([]),
      difficulty: 4,
      miner: 'system',
    };
  }

  // Add a new block to the blockchain
  addBlock(
    blockchainId: string,
    transactions: Transaction[],
    miner: string
  ): Block | null {
    const blockchain = this.blockchains.get(blockchainId);
    if (!blockchain) return null;

    const previousBlock = blockchain.blocks[blockchain.blocks.length - 1];
    const newBlock: Block = {
      index: previousBlock.index + 1,
      timestamp: new Date().toISOString(),
      transactions,
      nonce: 0,
      hash: '',
      previousHash: previousBlock.hash,
      merkleRoot: this.calculateMerkleRoot(transactions),
      difficulty: this.adjustDifficulty(blockchain),
      miner,
    };

    // Mine the block based on consensus
    if (blockchain.consensus === 'PoW') {
      newBlock.nonce = this.mineBlock(newBlock, newBlock.difficulty);
    }

    newBlock.hash = this.calculateHash(
      newBlock.previousHash,
      newBlock.transactions,
      newBlock.nonce
    );

    blockchain.blocks.push(newBlock);
    return newBlock;
  }

  // Mine block (Proof of Work)
  private mineBlock(block: Block, difficulty: number): number {
    let nonce = 0;
    const target = '0'.repeat(difficulty);
    
    while (true) {
      const hash = this.calculateHash(
        block.previousHash,
        block.transactions,
        nonce
      );
      
      if (hash.substring(0, difficulty) === target) {
        return nonce;
      }
      nonce++;
    }
  }

  // Calculate hash
  private calculateHash(
    previousHash: string,
    transactions: Transaction[],
    nonce: number
  ): string {
    const data = previousHash + JSON.stringify(transactions) + nonce;
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  // Calculate Merkle Root
  private calculateMerkleRoot(transactions: Transaction[]): string {
    if (transactions.length === 0) {
      return crypto.createHash('sha256').update('').digest('hex');
    }

    const leaves = transactions.map(tx =>
      crypto.createHash('sha256').update(JSON.stringify(tx)).digest('hex')
    );

    while (leaves.length > 1) {
      const newLevel = [];
      for (let i = 0; i < leaves.length; i += 2) {
        const left = leaves[i];
        const right = leaves[i + 1] || left;
        const combined = left + right;
        newLevel.push(
          crypto.createHash('sha256').update(combined).digest('hex')
        );
      }
      leaves.splice(0, leaves.length, ...newLevel);
    }

    return leaves[0];
  }

  // Adjust difficulty based on block time
  private adjustDifficulty(blockchain: Blockchain): number {
    const lastBlock = blockchain.blocks[blockchain.blocks.length - 1];
    const expectedTime = 10000; // 10 seconds
    
    if (blockchain.blocks.length < 10) {
      return lastBlock.difficulty;
    }

    const tenBlocksAgo = blockchain.blocks[blockchain.blocks.length - 10];
    const timeDiff = Date.parse(lastBlock.timestamp) - Date.parse(tenBlocksAgo.timestamp);
    
    if (timeDiff < expectedTime * 10 / 2) {
      return lastBlock.difficulty + 1;
    } else if (timeDiff > expectedTime * 10 * 2) {
      return lastBlock.difficulty - 1;
    }
    
    return lastBlock.difficulty;
  }

  // Deploy smart contract
  deploySmartContract(
    blockchainId: string,
    contract: Omit<SmartContract, 'address' | 'deploymentTx'>
  ): SmartContract | null {
    const blockchain = this.blockchains.get(blockchainId);
    if (!blockchain) return null;

    const contractAddress = this.generateContractAddress(contract.deployedBy);
    const deploymentTx = this.generateTransactionHash();

    const smartContract: SmartContract = {
      ...contract,
      address: contractAddress,
      deploymentTx,
    };

    blockchain.smartContracts.push(smartContract);

    // Create deployment transaction
    const transaction: Transaction = {
      id: `tx_${Date.now()}`,
      from: contract.deployedBy,
      to: contractAddress,
      data: { type: 'contract_deployment', contract: smartContract },
      type: 'smart_contract',
      nonce: Date.now(),
      signature: this.generateSignature(contract.deployedBy, contractAddress),
      status: 'confirmed',
      blockNumber: blockchain.blocks.length,
      timestamp: new Date(),
    };

    // Add transaction to new block
    this.addBlock(blockchainId, [transaction], 'system');

    return smartContract;
  }

  // Generate unique chain ID
  private generateChainId(): number {
    return Math.floor(Math.random() * 1000000) + 1000;
  }

  // Generate contract address
  private generateContractAddress(deployer: string): string {
    const hash = crypto
      .createHash('sha256')
      .update(deployer + Date.now())
      .digest('hex');
    return '0x' + hash.substring(0, 40);
  }

  // Generate transaction hash
  private generateTransactionHash(): string {
    return '0x' + crypto.randomBytes(32).toString('hex');
  }

  // Generate signature (mock)
  private generateSignature(from: string, to: string): string {
    const data = from + to + Date.now();
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  // Validate blockchain
  validateBlockchain(blockchainId: string): boolean {
    const blockchain = this.blockchains.get(blockchainId);
    if (!blockchain) return false;

    for (let i = 1; i < blockchain.blocks.length; i++) {
      const currentBlock = blockchain.blocks[i];
      const previousBlock = blockchain.blocks[i - 1];

      // Check if current block hash is valid
      const calculatedHash = this.calculateHash(
        currentBlock.previousHash,
        currentBlock.transactions,
        currentBlock.nonce
      );

      if (currentBlock.hash !== calculatedHash) {
        return false;
      }

      // Check if previous hash matches
      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }

      // Validate Proof of Work
      if (blockchain.consensus === 'PoW') {
        const target = '0'.repeat(currentBlock.difficulty);
        if (currentBlock.hash.substring(0, currentBlock.difficulty) !== target) {
          return false;
        }
      }
    }

    return true;
  }

  // Get blockchain by ID
  getBlockchain(blockchainId: string): Blockchain | null {
    return this.blockchains.get(blockchainId) || null;
  }

  // Get all blockchains
  getAllBlockchains(): Blockchain[] {
    return Array.from(this.blockchains.values());
  }

  // Get block by hash
  getBlockByHash(blockchainId: string, hash: string): Block | null {
    const blockchain = this.blockchains.get(blockchainId);
    if (!blockchain) return null;

    return blockchain.blocks.find(block => block.hash === hash) || null;
  }

  // Get transaction by ID
  getTransaction(blockchainId: string, txId: string): Transaction | null {
    const blockchain = this.blockchains.get(blockchainId);
    if (!blockchain) return null;

    for (const block of blockchain.blocks) {
      const tx = block.transactions.find(t => t.id === txId);
      if (tx) return tx;
    }

    return null;
  }

  // Calculate blockchain statistics
  getBlockchainStats(blockchainId: string) {
    const blockchain = this.blockchains.get(blockchainId);
    if (!blockchain) return null;

    const totalTransactions = blockchain.blocks.reduce(
      (sum, block) => sum + block.transactions.length,
      0
    );

    const averageBlockTime = this.calculateAverageBlockTime(blockchain);
    const hashRate = this.calculateHashRate(blockchain);

    return {
      blocks: blockchain.blocks.length,
      transactions: totalTransactions,
      contracts: blockchain.smartContracts.length,
      nodes: blockchain.nodes.length,
      averageBlockTime,
      hashRate,
      difficulty: blockchain.blocks[blockchain.blocks.length - 1].difficulty,
    };
  }

  // Calculate average block time
  private calculateAverageBlockTime(blockchain: Blockchain): number {
    if (blockchain.blocks.length < 2) return 0;

    const timeDiffs = [];
    for (let i = 1; i < blockchain.blocks.length; i++) {
      const current = Date.parse(blockchain.blocks[i].timestamp);
      const previous = Date.parse(blockchain.blocks[i - 1].timestamp);
      timeDiffs.push((current - previous) / 1000); // Convert to seconds
    }

    return timeDiffs.reduce((sum, diff) => sum + diff, 0) / timeDiffs.length;
  }

  // Calculate hash rate (hashes per second)
  private calculateHashRate(blockchain: Blockchain): number {
    if (blockchain.blocks.length < 2) return 0;

    const lastBlock = blockchain.blocks[blockchain.blocks.length - 1];
    const difficulty = lastBlock.difficulty;
    const averageBlockTime = this.calculateAverageBlockTime(blockchain);

    if (averageBlockTime === 0) return 0;

    // Simplified calculation: 2^difficulty / averageBlockTime
    return Math.pow(2, difficulty) / averageBlockTime;
  }
}

// Export singleton instance
export const blockchainManager = new BlockchainManager();

// Smart Contract Templates
export const contractTemplates = {
  SBT: {
    name: 'SoulboundToken',
    type: 'SBT',
    abi: [
      {
        name: 'mint',
        type: 'function',
        inputs: [
          { name: 'to', type: 'address' },
          { name: 'tokenId', type: 'uint256' },
          { name: 'metadata', type: 'string' },
        ],
        outputs: [],
      },
      {
        name: 'burn',
        type: 'function',
        inputs: [{ name: 'tokenId', type: 'uint256' }],
        outputs: [],
      },
      {
        name: 'tokenURI',
        type: 'function',
        inputs: [{ name: 'tokenId', type: 'uint256' }],
        outputs: [{ name: '', type: 'string' }],
      },
    ],
    bytecode: '0x608060405234801561001057600080fd5b50...',
  },
  NFT: {
    name: 'EducationNFT',
    type: 'NFT',
    abi: [
      {
        name: 'mint',
        type: 'function',
        inputs: [
          { name: 'to', type: 'address' },
          { name: 'tokenId', type: 'uint256' },
        ],
        outputs: [],
      },
      {
        name: 'transfer',
        type: 'function',
        inputs: [
          { name: 'from', type: 'address' },
          { name: 'to', type: 'address' },
          { name: 'tokenId', type: 'uint256' },
        ],
        outputs: [],
      },
    ],
    bytecode: '0x608060405234801561001057600080fd5b50...',
  },
};
