import { NextRequest, NextResponse } from 'next/server';
import { mockDB, verifyPassword, hashPassword, generateWalletAddress } from '@/lib/db';
import { generateToken } from '@/lib/auth';
import { ApiResponse, User } from '@/types/enhanced';
import crypto from 'crypto';

// Enhanced authentication with three roles and Web3
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'login':
        return handleLogin(body);
      case 'register':
        return handleRegister(body);
      case 'walletLogin':
        return handleWalletLogin(body);
      case 'connectWallet':
        return handleConnectWallet(body);
      case 'verifyIAM':
        return handleIAMVerification(body);
      default:
        return NextResponse.json<ApiResponse>(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}

// Traditional email/password login
async function handleLogin(data: any) {
  const { email, password } = data;

  const user = mockDB.users.find((u: any) => u.email === email);
  if (!user) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Invalid email or password' },
      { status: 401 }
    );
  }

  const isValid = await verifyPassword(password, user.password!);
  if (!isValid) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Invalid email or password' },
      { status: 401 }
    );
  }

  const token = generateToken(user);
  const { password: _, ...userWithoutPassword } = user;

  return NextResponse.json<ApiResponse>({
    success: true,
    data: {
      user: userWithoutPassword,
      token,
    },
  });
}

// Register with role selection (student, instructor, enterprise)
async function handleRegister(data: any) {
  const { email, password, name, role, companyName, title, department } = data;

  if (!['student', 'instructor', 'enterprise'].includes(role)) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Invalid role type' },
      { status: 400 }
    );
  }

  if (mockDB.users.find((u: any) => u.email === email)) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Email already registered' },
      { status: 400 }
    );
  }

  const hashedPassword = await hashPassword(password);
  const userId = `u_${Date.now()}`;

  const newUser: User = {
    id: userId,
    email,
    password: hashedPassword,
    name: role === 'enterprise' ? companyName : name,
    role,
    wallet: {
      address: generateWalletAddress(),
      type: 'metamask',
      verified: false,
    },
    profileCompleted: false,
    kycStatus: 'pending',
    avatar: role === 'student' ? '👨‍🎓' : role === 'instructor' ? '👨‍🏫' : '🏢',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  if (role === 'student') {
    newUser.studentProfile = {
      userId,
      skills: [],
      courses: [],
      credentials: [],
      skillScore: 0,
      achievements: [],
      learningPath: [],
    };
  } else if (role === 'instructor') {
    newUser.instructorProfile = {
      userId,
      title: title || 'Instructor',
      department,
      expertise: [],
      yearsOfExperience: 0,
      coursesCreated: [],
      rating: 0,
      totalStudents: 0,
      certifications: [],
    };
  } else if (role === 'enterprise') {
    newUser.enterpriseProfile = {
      userId,
      companyName,
      industry: '',
      size: 'startup',
      talentNeeds: [],
      technicalStack: [],
      locations: [],
      verifiedEmployer: false,
    };
  }

  mockDB.users.push(newUser);

  mockDB.blockchain.push({
    id: mockDB.blockchain.length,
    action: 'USER_REGISTERED',
    data: {
      userId,
      email,
      role,
      walletAddress: newUser.wallet?.address,
    },
    timestamp: new Date().toISOString(),
    hash: '0x' + crypto.randomBytes(32).toString('hex'),
    previousHash: mockDB.blockchain[mockDB.blockchain.length - 1].hash,
    nonce: Math.floor(Math.random() * 100000),
  });

  const token = generateToken(newUser);
  const { password: _, ...userWithoutPassword } = newUser;

  return NextResponse.json<ApiResponse>({
    success: true,
    data: {
      user: userWithoutPassword,
      token,
    },
  });
}

// Web3 wallet login (MetaMask / zkLogin)
async function handleWalletLogin(data: any) {
  const { walletAddress, signature, message, walletType } = data;

  const isValid = await verifyWalletSignature(walletAddress, signature, message);
  if (!isValid) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Wallet signature verification failed' },
      { status: 401 }
    );
  }

  let user = mockDB.users.find((u: any) => u.wallet?.address === walletAddress);

  if (!user) {
    const userId = `u_${Date.now()}`;
    user = {
      id: userId,
      email: `${walletAddress.substring(0, 8)}@wallet.local`,
      name: `User ${walletAddress.substring(0, 8)}`,
      role: 'student',
      wallet: {
        address: walletAddress,
        type: walletType || 'metamask',
        verified: true,
        publicKey: walletAddress,
      },
      profileCompleted: false,
      kycStatus: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
      studentProfile: {
        userId,
        skills: [],
        courses: [],
        credentials: [],
        skillScore: 0,
        achievements: [],
        learningPath: [],
      },
    };
    mockDB.users.push(user);
  }

  const token = generateToken(user);
  const { password: _, ...userWithoutPassword } = user;

  return NextResponse.json<ApiResponse>({
    success: true,
    data: {
      user: userWithoutPassword,
      token,
      isNewUser: !user.profileCompleted,
    },
  });
}

// Connect wallet to existing account
async function handleConnectWallet(data: any) {
  const { userId, walletAddress, walletType, signature, message } = data;

  const isValid = await verifyWalletSignature(walletAddress, signature, message);
  if (!isValid) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Wallet signature verification failed' },
      { status: 401 }
    );
  }

  const user = mockDB.users.find((u: any) => u.id === userId);
  if (!user) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'User not found' },
      { status: 404 }
    );
  }

  user.wallet = {
    address: walletAddress,
    type: walletType,
    verified: true,
    publicKey: walletAddress,
  };
  user.updatedAt = new Date();

  mockDB.blockchain.push({
    id: mockDB.blockchain.length,
    action: 'WALLET_CONNECTED',
    data: { userId, walletAddress, walletType },
    timestamp: new Date().toISOString(),
    hash: '0x' + crypto.randomBytes(32).toString('hex'),
    previousHash: mockDB.blockchain[mockDB.blockchain.length - 1].hash,
    nonce: Math.floor(Math.random() * 100000),
  });

  return NextResponse.json<ApiResponse>({
    success: true,
    message: 'Wallet connected successfully',
    data: { wallet: user.wallet },
  });
}

// Huawei Cloud IAM verification
async function handleIAMVerification(data: any) {
  const { userId, accessKeyId, secretAccessKey, region, projectId } = data;

  const isValid = await verifyHuaweiCloudIAM(accessKeyId, secretAccessKey);
  if (!isValid) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'IAM verification failed' },
      { status: 401 }
    );
  }

  const user = mockDB.users.find((u: any) => u.id === userId);
  if (!user) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'User not found' },
      { status: 404 }
    );
  }

  user.huaweiCloudIAM = {
    accountId: `hc_${Date.now()}`,
    accessKeyId,
    region,
    verified: true,
  };
  user.updatedAt = new Date();

  if (user.role === 'enterprise' && user.enterpriseProfile) {
    user.enterpriseProfile.verifiedEmployer = true;
  }

  return NextResponse.json<ApiResponse>({
    success: true,
    message: 'Huawei Cloud IAM verified successfully',
    data: {
      iamVerified: true,
      accountId: user.huaweiCloudIAM.accountId,
    },
  });
}

// Verify wallet signature (mock)
async function verifyWalletSignature(address: string, signature: string, message: string): Promise<boolean> {
  return signature.length === 132 && address.startsWith('0x');
}

// Verify Huawei Cloud IAM (mock)
async function verifyHuaweiCloudIAM(accessKeyId: string, secretAccessKey: string): Promise<boolean> {
  return accessKeyId.length > 10 && secretAccessKey.length > 20;
}

// GET endpoint to verify token and get user info
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Token not provided' },
        { status: 401 }
      );
    }

    const { verifyToken } = require('@/lib/auth');
    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    const user = mockDB.users.find((u: any) => u.id === payload.userId);
    if (!user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json<ApiResponse>({ success: true, data: userWithoutPassword });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}
