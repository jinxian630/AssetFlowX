// ============================================================================
// AssetFlowX - TrustScore Data Aggregator
// Aggregates escrow history, transactions, and other data for TrustScore calculation
// ============================================================================

import { ordersStore } from "@/lib/payments-mock-store"
import { generateTransactions } from "@/lib/mock-data"
import type { TrustScoreInput } from "@/types/ai-scoring"
import type { Order, OrderStatus } from "@/types/payments"
import type { Transaction } from "@/lib/types"

/**
 * Aggregate escrow history from orders for a given address
 */
function aggregateEscrowHistory(address: string): TrustScoreInput["escrowHistory"] | undefined {
  // In a real system, we'd filter orders by address
  // For now, we'll use all orders as a proxy for the address's escrow history
  const allOrders = Array.from(ordersStore.values())
  
  if (allOrders.length === 0) {
    return undefined
  }
  
  // Filter orders that are escrow-related (PAID, SETTLED, or have transactions)
  const escrowOrders = allOrders.filter(order => 
    order.status === "PAID" || order.status === "SETTLED" || order.onchainTx
  )
  
  if (escrowOrders.length === 0) {
    return undefined
  }
  
  const completedEscrows = escrowOrders.filter(order => order.status === "SETTLED").length
  const disputedEscrows = escrowOrders.filter(order => order.status === "REFUNDED").length
  const totalVolume = escrowOrders.reduce((sum, order) => sum + parseFloat(order.price), 0)
  const averageAmount = totalVolume / escrowOrders.length
  
  // Get date range
  const dates = escrowOrders
    .map(order => new Date(order.createdAt))
    .sort((a, b) => a.getTime() - b.getTime())
  
  const firstEscrowDate = dates[0]?.toISOString() || new Date().toISOString()
  const lastEscrowDate = dates[dates.length - 1]?.toISOString() || new Date().toISOString()
  
  return {
    totalEscrows: escrowOrders.length,
    completedEscrows,
    disputedEscrows,
    totalVolume,
    averageAmount,
    firstEscrowDate,
    lastEscrowDate,
    escrows: escrowOrders.map(order => ({
      id: order.id,
      amount: parseFloat(order.price),
      status: (order.status === "SETTLED" ? "completed" : 
               order.status === "REFUNDED" ? "disputed" :
               order.status === "PAID" ? "pending" : "cancelled") as "completed" | "disputed" | "pending" | "cancelled",
      completedAt: order.status === "SETTLED" ? order.updatedAt : undefined,
      disputedAt: order.status === "REFUNDED" ? order.updatedAt : undefined
    }))
  }
}

/**
 * Aggregate transaction history for a given address
 */
function aggregateTransactions(address: string): TrustScoreInput["transactions"] {
  // In a real system, we'd filter transactions by address
  // For now, we'll generate mock transactions filtered by address pattern
  const allTransactions = generateTransactions(50)
  
  // Filter transactions that might be related to this address
  // In a real system, this would be a proper address match
  const addressHash = address.slice(2, 10) // Use part of address as filter
  const filteredTransactions = allTransactions.filter((tx, index) => 
    index % 3 === 0 || tx.counterparty.includes(addressHash.slice(0, 4))
  )
  
  return filteredTransactions.map(tx => ({
    txHash: tx.txHash,
    timestamp: tx.timestamp,
    amount: tx.amount,
    type: tx.type,
    counterparty: tx.counterparty,
    chain: tx.chain
  }))
}

/**
 * Aggregate DeFi activity for a given address
 */
function aggregateDefiActivity(address: string): TrustScoreInput["defiActivity"] {
  // Mock DeFi activity - in a real system, this would query on-chain data
  const protocols = ["Uniswap", "Aave", "Compound"]
  const hasActivity = address.length > 10 // Simple heuristic
  
  if (!hasActivity) {
    return {
      protocols: [],
      totalValueLocked: 0,
      liquidationEvents: 0,
      yieldFarmingPositions: 0
    }
  }
  
  return {
    protocols: protocols.slice(0, Math.floor(Math.random() * 3) + 1),
    totalValueLocked: Math.random() * 50000 + 10000,
    liquidationEvents: Math.random() > 0.8 ? 1 : 0,
    yieldFarmingPositions: Math.floor(Math.random() * 5)
  }
}

/**
 * Get wallet metadata for a given address
 */
function getWalletMetadata(address: string): TrustScoreInput["walletMetadata"] {
  // Mock wallet metadata - in a real system, this would query blockchain data
  const walletAge = Math.random() * 730 + 30 // 30-760 days
  const firstSeen = new Date(Date.now() - walletAge * 24 * 60 * 60 * 1000).toISOString()
  
  return {
    firstSeen,
    isMultiSig: Math.random() > 0.7,
    isHardwareWallet: Math.random() > 0.6,
    addressChanges: Math.floor(Math.random() * 3)
  }
}

/**
 * Get known risk flags for an address
 */
function getKnownFlags(address: string): string[] {
  // Mock risk flags - in a real system, this would query risk databases
  const flags: string[] = []
  
  // Simulate some risk flags based on address pattern
  if (address.includes("000") || address.includes("fff")) {
    flags.push("Mixer Exposure")
  }
  
  if (Math.random() > 0.9) {
    flags.push("OFAC")
  }
  
  if (Math.random() > 0.85) {
    flags.push("Indirect Risk")
  }
  
  return flags
}

/**
 * Get compliance status for an address
 */
function getComplianceStatus(address: string): TrustScoreInput["complianceStatus"] {
  // Mock compliance status - in a real system, this would query KYC/AML systems
  const kycStatuses: Array<"verified" | "pending" | "rejected" | "unknown"> = 
    ["verified", "pending", "unknown"]
  const amlStatuses: Array<"passed" | "failed" | "pending" | "unknown"> = 
    ["passed", "pending", "unknown"]
  
  return {
    kyc: kycStatuses[Math.floor(Math.random() * kycStatuses.length)],
    aml: amlStatuses[Math.floor(Math.random() * amlStatuses.length)],
    jurisdiction: "US" // Mock jurisdiction
  }
}

/**
 * Aggregate all data needed for TrustScore calculation
 */
export function aggregateTrustScoreData(address: string, label?: string): TrustScoreInput {
  return {
    address,
    label,
    escrowHistory: aggregateEscrowHistory(address),
    transactions: aggregateTransactions(address),
    defiActivity: aggregateDefiActivity(address),
    walletMetadata: getWalletMetadata(address),
    knownFlags: getKnownFlags(address),
    complianceStatus: getComplianceStatus(address)
  }
}

