export interface PortfolioData {
  totalAssets: number
  pnl24h: number
  netflow7d: number
  history: { date: string; value: number }[]
  topTokens: TokenHolding[]
}

export interface TokenHolding {
  token: string
  chain: string
  qty: number
  price: number
  value: number
  pct24h: number
}

export interface FlowData {
  inflow: number
  outflow: number
  netflow: number
  history: { date: string; inflow: number; outflow: number; netflow: number }[]
  byChain: { chain: string; inflow: number; outflow: number }[]
  counterparties: Counterparty[]
}

export interface Counterparty {
  label: string
  chain: string
  txCount: number
  volumeIn: number
  volumeOut: number
  net: number
}

export interface Transaction {
  id: string
  timestamp: string
  chain: string
  txHash: string
  counterparty: string
  label: string
  amount: number
  fee: number
  riskScore: number
  type: "inflow" | "outflow"
}

export interface Alert {
  id: string
  type: "price_threshold" | "large_transfer" | "risky_address"
  name: string
  severity: "high" | "medium" | "low"
  enabled: boolean
  conditions: Record<string, any>
  createdAt: string
}

export interface AlertEvent {
  id: string
  ruleId: string
  ruleName: string
  timestamp: string
  entity: string
  value: string
  severity: "high" | "medium" | "low"
}

export interface RiskData {
  highCount: number
  mediumCount: number
  lowCount: number
  hitList: RiskEntity[]
}

export interface RiskEntity {
  address: string
  label?: string
  riskScore: number
  reason: string
  lastSeen: string
  flags: string[]
}

export interface RiskAssessment {
  address: string
  riskScore: number
  riskLevel: "high" | "medium" | "low"
  flags: string[]
  reason: string
  lastActivity: string
}
