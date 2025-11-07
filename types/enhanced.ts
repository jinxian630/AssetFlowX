// Enhanced User types with three roles
export interface User {
  id: string;
  email: string;
  password?: string;
  name: string;
  role: 'student' | 'instructor' | 'enterprise';
  wallet?: {
    address: string;
    type: 'metamask' | 'zkLogin' | 'huaweiCloud';
    verified: boolean;
    publicKey?: string;
  };
  huaweiCloudIAM?: {
    accountId: string;
    accessKeyId: string;
    region: string;
    verified: boolean;
  };
  profileCompleted: boolean;
  kycStatus: 'pending' | 'verified' | 'rejected';
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Role-specific fields
  studentProfile?: StudentProfile;
  instructorProfile?: InstructorProfile;
  enterpriseProfile?: EnterpriseProfile;
}

export interface StudentProfile {
  userId: string;
  university?: string;
  major?: string;
  graduationYear?: number;
  skills: Skill[];
  courses: string[];
  credentials: string[];
  skillScore: number;
  portfolio?: string;
  github?: string;
  linkedin?: string;
  achievements: Achievement[];
  learningPath: LearningPath[];
}

export interface InstructorProfile {
  userId: string;
  title: string;
  department?: string;
  university?: string;
  expertise: string[];
  yearsOfExperience: number;
  coursesCreated: string[];
  rating: number;
  totalStudents: number;
  certifications: Certification[];
  publications?: string[];
  researchInterests?: string[];
}

export interface EnterpriseProfile {
  userId: string;
  companyName: string;
  industry: string;
  size: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  website?: string;
  description?: string;
  talentNeeds: TalentNeed[];
  hiringBudget?: number;
  technicalStack: string[];
  benefits?: string[];
  locations: string[];
  verifiedEmployer: boolean;
}

// Skill Graph structure
export interface Skill {
  id: string;
  name: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  verified: boolean;
  endorsements: Endorsement[];
  relatedSkills: string[]; // For Graph Engine connections
  score?: number;
}

export interface Endorsement {
  endorserId: string;
  endorserName: string;
  endorserRole: string;
  date: Date;
  comment?: string;
}

// Talent Discovery
export interface TalentNeed {
  id: string;
  position: string;
  requiredSkills: SkillRequirement[];
  experienceLevel: string;
  salaryRange: {
    min: number;
    max: number;
    currency: string;
  };
  remote: boolean;
  urgent: boolean;
  deadline?: Date;
}

export interface SkillRequirement {
  skillId: string;
  skillName: string;
  minLevel: string;
  weight: number; // Importance weight for matching
}

// Course Enhanced
export interface Course {
  id: string;
  name: string;
  description: string;
  instructorId: string;
  instructorName: string;
  price: number;
  duration: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  tags: string[];
  students: number;
  rating: number;
  curriculum: Curriculum[];
  prerequisites: string[];
  learningOutcomes: string[];
  certificateType: 'SBT' | 'NFT' | 'CERTIFICATE' | 'BADGE';
  blockchainEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Curriculum {
  week: number;
  title: string;
  topics: string[];
  assignments?: string[];
  duration: string;
}

// Blockchain types
export interface Blockchain {
  id: string;
  name: string;
  network: 'private' | 'public' | 'consortium';
  consensus: 'PoW' | 'PoS' | 'PoA' | 'PBFT';
  chainId: number;
  blocks: Block[];
  nodes: Node[];
  smartContracts: SmartContract[];
  createdBy: string;
  createdAt: Date;
  status: 'active' | 'paused' | 'terminated';
}

export interface Block {
  index: number;
  timestamp: string;
  transactions: Transaction[];
  nonce: number;
  hash: string;
  previousHash: string;
  merkleRoot: string;
  difficulty: number;
  miner?: string;
}

export interface Transaction {
  id: string;
  from: string;
  to: string;
  value?: number;
  data?: any;
  type: 'transfer' | 'credential' | 'enrollment' | 'smart_contract' | 'kyc';
  gasPrice?: number;
  gasLimit?: number;
  nonce: number;
  signature: string;
  status: 'pending' | 'confirmed' | 'failed';
  blockNumber?: number;
  timestamp: Date;
}

export interface SmartContract {
  address: string;
  name: string;
  type: 'SBT' | 'NFT' | 'ERC20' | 'Custom';
  abi: any[];
  bytecode: string;
  deployedBy: string;
  deploymentTx: string;
  verified: boolean;
}

export interface Node {
  id: string;
  address: string;
  type: 'validator' | 'full' | 'light';
  status: 'online' | 'offline' | 'syncing';
  stake?: number;
  reputation?: number;
}

// Credential Enhanced with Blockchain
export interface Credential {
  id: string;
  userId: string;
  courseId: string;
  courseName: string;
  instructorId: string;
  type: 'SBT' | 'NFT' | 'CERTIFICATE' | 'BADGE';
  score: number;
  blockchain: {
    network: string;
    chainId: number;
    contractAddress: string;
    tokenId: string;
    txHash: string;
    blockNumber: number;
    ipfsHash?: string;
  };
  metadata: {
    issuedDate: Date;
    expiryDate?: Date;
    skills: string[];
    grade?: string;
    completionTime: string;
    projectWork?: string[];
  };
  verificationProof: string;
  revocable: boolean;
  revoked: boolean;
}

// Graph Engine Types for Talent Matching
export interface SkillGraph {
  nodes: SkillNode[];
  edges: SkillEdge[];
}

export interface SkillNode {
  id: string;
  label: string;
  category: string;
  demand: number; // Market demand score
  supply: number; // Available talent score
  trending: boolean;
  metadata?: any;
}

export interface SkillEdge {
  source: string;
  target: string;
  weight: number;
  relationship: 'requires' | 'complements' | 'advances_to' | 'similar_to';
}

// Talent Match Results
export interface TalentMatch {
  userId: string;
  profile: User;
  matchScore: number;
  matchedSkills: MatchedSkill[];
  missingSkills: string[];
  recommendations: string[];
  graphPath: string[]; // Skill progression path
}

export interface MatchedSkill {
  skillName: string;
  userLevel: string;
  requiredLevel: string;
  match: boolean;
  score: number;
}

// Achievement System
export interface Achievement {
  id: string;
  title: string;
  description: string;
  type: 'course' | 'skill' | 'project' | 'contribution';
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earnedDate: Date;
  blockchainVerified: boolean;
  txHash?: string;
}

export interface LearningPath {
  id: string;
  name: string;
  description: string;
  skills: string[];
  courses: string[];
  estimatedDuration: string;
  currentProgress: number;
  nextMilestone: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate: Date;
  expiryDate?: Date;
  verificationUrl?: string;
  blockchainHash?: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  metadata?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

// Web3 Wallet Types
export interface WalletConnection {
  type: 'metamask' | 'zkLogin' | 'walletconnect';
  address: string;
  chainId: number;
  networkName: string;
  balance?: string;
}

export interface Web3Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  data?: string;
  nonce: number;
  gasPrice: string;
  gasLimit: string;
  chainId: number;
}

// Huawei Cloud Integration Types
export interface HuaweiCloudConfig {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  projectId: string;
  endpoints: {
    iam: string;
    graphEngine: string;
    obs: string;
    rds: string;
    modelArts: string;
  };
}

export interface GraphEngineQuery {
  query: string;
  parameters?: Record<string, any>;
  timeout?: number;
}

export interface GraphEngineResult {
  nodes: any[];
  edges: any[];
  metadata: {
    executionTime: number;
    nodesScanned: number;
    edgesTraversed: number;
  };
}
