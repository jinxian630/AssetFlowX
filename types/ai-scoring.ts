// ============================================================================
// AssetFlowX - AI Scoring & Risk Module
// TrustScore™ Type Definitions
// Based on FICO Crypto + EY Pillars + NIST AI Governance
// ============================================================================

/**
 * TrustScore™ - 0-100 composite score for digital asset trustworthiness
 * Weighted combination of:
 * - FICO Crypto (40%): On-chain escrow history & DeFi factors
 * - EY Pillars (35%): Risk flags & compliance indicators
 * - NIST AI Governance (25%): Transparency, explainability, bias detection
 */
export interface TrustScore {
  /** Overall TrustScore™ (0-100) */
  score: number
  
  /** Risk level classification */
  riskLevel: "excellent" | "good" | "moderate" | "high" | "critical"
  
  /** Component breakdowns */
  components: {
    /** FICO Crypto Score (0-100) - 40% weight */
    ficoCrypto: {
      score: number
      weight: 0.4
      factors: {
        /** On-chain escrow payment history (like FICO payment history) - 40% of FICO Crypto */
        escrowHistory: {
          score: number
          weight: 0.4
          metrics: {
            totalEscrows: number
            completedEscrows: number
            completionRate: number // percentage
            disputeRate: number // percentage
            averageEscrowAmount: number
            oldestEscrowAge: number // days
            recentActivity: number // days since last escrow
          }
        }
        /** DeFi protocol interactions - 30% of FICO Crypto */
        defiActivity: {
          score: number
          weight: 0.3
          metrics: {
            protocolsUsed: number
            totalValueLocked: number
            liquidationEvents: number
            yieldFarmingScore: number // 0-100
          }
        }
        /** Transaction patterns & volume - 20% of FICO Crypto */
        transactionPatterns: {
          score: number
          weight: 0.2
          metrics: {
            totalTransactions: number
            averageTransactionSize: number
            transactionFrequency: number // per month
            volatilityScore: number // 0-100
          }
        }
        /** Wallet age & stability - 10% of FICO Crypto */
        walletStability: {
          score: number
          weight: 0.1
          metrics: {
            walletAge: number // days
            addressChanges: number
            multiSigUsage: boolean
            hardwareWalletUsage: boolean
          }
        }
      }
    }
    
    /** EY Risk Pillars Score (0-100) - 35% weight */
    eyPillars: {
      score: number
      weight: 0.35
      factors: {
        /** Sanctions & AML compliance - 40% of EY Pillars */
        sanctionsCompliance: {
          score: number
          weight: 0.4
          flags: string[] // e.g., ["OFAC", "EU Sanctions"]
          riskIndicators: {
            sanctionedEntityExposure: boolean
            mixerInteraction: boolean
            darknetMarketExposure: boolean
            terroristFinancingRisk: boolean
          }
        }
        /** Fraud & scam detection - 30% of EY Pillars */
        fraudDetection: {
          score: number
          weight: 0.3
          flags: string[]
          riskIndicators: {
            phishingVictim: boolean
            rugPullInvolvement: boolean
            ponziSchemeExposure: boolean
            pumpAndDumpActivity: boolean
          }
        }
        /** Regulatory compliance - 20% of EY Pillars */
        regulatoryCompliance: {
          score: number
          weight: 0.2
          flags: string[]
          riskIndicators: {
            kycStatus: "verified" | "pending" | "rejected" | "unknown"
            amlChecks: "passed" | "failed" | "pending" | "unknown"
            jurisdictionRisk: "low" | "medium" | "high" | "unknown"
            taxCompliance: "compliant" | "non-compliant" | "unknown"
          }
        }
        /** Operational risk - 10% of EY Pillars */
        operationalRisk: {
          score: number
          weight: 0.1
          flags: string[]
          riskIndicators: {
            smartContractVulnerabilities: number
            keyManagementRisk: "low" | "medium" | "high"
            custodyRisk: "non-custodial" | "custodial" | "hybrid"
            insuranceCoverage: boolean
          }
        }
      }
    }
    
    /** NIST AI Governance Score (0-100) - 25% weight */
    nistGovernance: {
      score: number
      weight: 0.25
      factors: {
        /** AI Transparency & Explainability - 40% of NIST */
        transparency: {
          score: number
          weight: 0.4
          metrics: {
            scoreExplanation: string // Human-readable explanation
            factorVisibility: number // 0-100
            auditTrailCompleteness: number // 0-100
            modelVersioning: boolean
          }
        }
        /** Bias Detection & Fairness - 30% of NIST */
        fairness: {
          score: number
          weight: 0.3
          metrics: {
            demographicBias: number // 0-100 (lower is better)
            geographicBias: number // 0-100
            economicBias: number // 0-100
            fairnessScore: number // 0-100 (higher is better)
          }
        }
        /** AI System Reliability - 20% of NIST */
        reliability: {
          score: number
          weight: 0.2
          metrics: {
            modelAccuracy: number // 0-100
            predictionConsistency: number // 0-100
            errorRate: number // percentage
            uptimeScore: number // 0-100
          }
        }
        /** Privacy & Data Protection - 10% of NIST */
        privacy: {
          score: number
          weight: 0.1
          metrics: {
            dataMinimization: boolean
            encryptionAtRest: boolean
            encryptionInTransit: boolean
            gdprCompliance: boolean
            dataRetentionPolicy: boolean
          }
        }
      }
    }
  }
  
  /** AI-generated explanation of the score */
  explanation: string
  
  /** Recommendations for improving the score */
  recommendations: string[]
  
  /** Timestamp of assessment */
  assessedAt: string // ISO 8601
  
  /** Model version used for assessment */
  modelVersion: string
}

/**
 * Input data for TrustScore™ calculation
 */
export interface TrustScoreInput {
  /** Wallet address or entity identifier */
  address: string
  
  /** Optional: Known entity label/name */
  label?: string
  
  /** On-chain escrow history */
  escrowHistory?: {
    totalEscrows: number
    completedEscrows: number
    disputedEscrows: number
    totalVolume: number
    averageAmount: number
    firstEscrowDate: string // ISO 8601
    lastEscrowDate: string // ISO 8601
    escrows: Array<{
      id: string
      amount: number
      status: "completed" | "disputed" | "pending" | "cancelled"
      completedAt?: string
      disputedAt?: string
    }>
  }
  
  /** Transaction history */
  transactions?: Array<{
    txHash: string
    timestamp: string
    amount: number
    type: "inflow" | "outflow"
    counterparty: string
    chain: string
  }>
  
  /** DeFi activity */
  defiActivity?: {
    protocols: string[]
    totalValueLocked: number
    liquidationEvents: number
    yieldFarmingPositions: number
  }
  
  /** Wallet metadata */
  walletMetadata?: {
    firstSeen: string // ISO 8601
    isMultiSig: boolean
    isHardwareWallet: boolean
    addressChanges: number
  }
  
  /** Known risk flags */
  knownFlags?: string[]
  
  /** KYC/AML status */
  complianceStatus?: {
    kyc: "verified" | "pending" | "rejected" | "unknown"
    aml: "passed" | "failed" | "pending" | "unknown"
    jurisdiction: string
  }
}

/**
 * Risk assessment result (simplified for API responses)
 */
export interface RiskAssessmentResult {
  address: string
  trustScore: TrustScore
  riskLevel: "excellent" | "good" | "moderate" | "high" | "critical"
  flags: string[]
  explanation: string
  recommendations: string[]
  assessedAt: string
}

