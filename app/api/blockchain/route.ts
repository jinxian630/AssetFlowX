import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromHeader, verifyToken } from '@/lib/auth';
import { blockchainManager, contractTemplates } from '@/lib/blockchain';
import { ApiResponse, Blockchain, Transaction } from '@/types/enhanced';

// POST handler: handles multiple blockchain actions
export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromHeader(request.headers.get('authorization') || '');
    if (!token) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'create':
        return handleCreateBlockchain(body, payload.userId);
      case 'addBlock':
        return handleAddBlock(body);
      case 'deployContract':
        return handleDeployContract(body, payload.userId);
      case 'addTransaction':
        return handleAddTransaction(body, payload.userId);
      case 'validate':
        return handleValidateBlockchain(body);
      default:
        return NextResponse.json<ApiResponse>(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Blockchain error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}

// ========================
//  Blockchain Operations
// ========================

// Create a new blockchain instance
async function handleCreateBlockchain(data: any, createdBy: string) {
  const { name, network, consensus } = data;

  if (!name || !network || !consensus) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Missing required parameters' },
      { status: 400 }
    );
  }

  const blockchain = blockchainManager.createBlockchain({
    name,
    network,
    consensus,
    createdBy,
  });

  return NextResponse.json<ApiResponse<Blockchain>>({
    success: true,
    message: 'Blockchain created successfully',
    data: blockchain,
  });
}

// Add a new block to an existing blockchain
async function handleAddBlock(data: any) {
  const { blockchainId, transactions, miner } = data;

  if (!blockchainId) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Missing blockchain ID' },
      { status: 400 }
    );
  }

  const block = blockchainManager.addBlock(
    blockchainId,
    transactions || [],
    miner || 'system'
  );

  if (!block) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Blockchain not found' },
      { status: 404 }
    );
  }

  return NextResponse.json<ApiResponse>({
    success: true,
    message: 'Block added successfully',
    data: block,
  });
}

// Deploy a smart contract to blockchain
async function handleDeployContract(data: any, deployedBy: string) {
  const { blockchainId, contractType, name, customAbi, customBytecode } = data;

  if (!blockchainId || !contractType) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Missing required parameters' },
      { status: 400 }
    );
  }

  // Retrieve contract template or use custom
  let contractData;
  if (contractType === 'Custom' && customAbi && customBytecode) {
    contractData = {
      name: name || 'CustomContract',
      type: 'Custom' as const,
      abi: customAbi,
      bytecode: customBytecode,
      deployedBy,
      verified: false,
    };
  } else if (contractTemplates[contractType as keyof typeof contractTemplates]) {
    const template = contractTemplates[contractType as keyof typeof contractTemplates];
    contractData = {
      ...template,
      deployedBy,
      verified: true,
    };
  } else {
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Invalid contract type' },
      { status: 400 }
    );
  }

  const contract = blockchainManager.deploySmartContract(blockchainId, contractData);

  if (!contract) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Contract deployment failed' },
      { status: 500 }
    );
  }

  return NextResponse.json<ApiResponse>({
    success: true,
    message: 'Smart contract deployed successfully',
    data: contract,
  });
}

// Add a new transaction to blockchain
async function handleAddTransaction(data: any, userId: string) {
  const { blockchainId, to, value, type, data: txData } = data;

  if (!blockchainId || !to || !type) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Missing required parameters' },
      { status: 400 }
    );
  }

  const transaction: Transaction = {
    id: `tx_${Date.now()}`,
    from: userId,
    to,
    value,
    data: txData,
    type,
    nonce: Date.now(),
    signature: '0x' + require('crypto').randomBytes(65).toString('hex'),
    status: 'pending',
    timestamp: new Date(),
  };

  const block = blockchainManager.addBlock(blockchainId, [transaction], userId);

  if (!block) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Transaction failed' },
      { status: 500 }
    );
  }

  transaction.status = 'confirmed';
  transaction.blockNumber = block.index;

  return NextResponse.json<ApiResponse>({
    success: true,
    message: 'Transaction confirmed successfully',
    data: {
      transaction,
      blockHash: block.hash,
      blockNumber: block.index,
    },
  });
}

// Validate blockchain integrity
async function handleValidateBlockchain(data: any) {
  const { blockchainId } = data;

  if (!blockchainId) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Missing blockchain ID' },
      { status: 400 }
    );
  }

  const isValid = blockchainManager.validateBlockchain(blockchainId);

  return NextResponse.json<ApiResponse>({
    success: true,
    data: {
      isValid,
      message: isValid ? 'Blockchain is valid' : 'Blockchain validation failed',
    },
  });
}

// ========================
//  GET Handler
// ========================
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const blockchainId = searchParams.get('id');
    const action = searchParams.get('action');

    if (action === 'list') {
      const blockchains = blockchainManager.getAllBlockchains();
      return NextResponse.json<ApiResponse>({
        success: true,
        data: blockchains,
      });
    }

    if (!blockchainId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Missing blockchain ID' },
        { status: 400 }
      );
    }

    if (action === 'stats') {
      const stats = blockchainManager.getBlockchainStats(blockchainId);
      if (!stats) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: 'Blockchain not found' },
          { status: 404 }
        );
      }

      return NextResponse.json<ApiResponse>({
        success: true,
        data: stats,
      });
    }

    const blockchain = blockchainManager.getBlockchain(blockchainId);
    if (!blockchain) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Blockchain not found' },
        { status: 404 }
      );
    }

    const blockHash = searchParams.get('blockHash');
    const txId = searchParams.get('txId');

    if (blockHash) {
      const block = blockchainManager.getBlockByHash(blockchainId, blockHash);
      return NextResponse.json<ApiResponse>({
        success: true,
        data: block,
      });
    }

    if (txId) {
      const transaction = blockchainManager.getTransaction(blockchainId, txId);
      return NextResponse.json<ApiResponse>({
        success: true,
        data: transaction,
      });
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: blockchain,
    });
  } catch (error) {
    console.error('Get blockchain error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}
