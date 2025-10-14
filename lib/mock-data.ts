import {
  PortfolioData,
  FlowData,
  Transaction,
  Alert,
  AlertEvent,
  RiskData,
  RiskEntity,
  RiskAssessment,
  TokenHolding,
  Counterparty
} from "./types"

// Helper functions
const randomFloat = (min: number, max: number) => Math.random() * (max - min) + min
const randomInt = (min: number, max: number) => Math.floor(randomFloat(min, max))
const randomChoice = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]

const tokens = ["ETH", "BTC", "USDC", "USDT", "DAI", "WETH", "UNI", "AAVE", "LINK", "MATIC"]
const chains = ["Ethereum", "Polygon", "Arbitrum", "Optimism", "Base", "BSC"]
const labels = ["Exchange", "DeFi Protocol", "Wallet", "Unknown", "CEX Deposit", "Bridge"]

// Generate dates
const generateDates = (days: number): string[] => {
  const dates: string[] = []
  const now = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    dates.push(date.toISOString().split('T')[0])
  }
  return dates
}

// Portfolio Mock Data
export function generatePortfolioData(): PortfolioData {
  const dates = generateDates(90)
  const history = dates.map((date, i) => ({
    date,
    value: 2500000 + randomFloat(-200000, 300000) + i * 3000
  }))

  const topTokens: TokenHolding[] = tokens.slice(0, 6).map(token => ({
    token,
    chain: randomChoice(chains),
    qty: randomFloat(10, 10000),
    price: randomFloat(0.1, 50000),
    value: 0, // calculated below
    pct24h: randomFloat(-15, 25)
  }))

  topTokens.forEach(t => {
    t.value = t.qty * t.price
  })

  return {
    totalAssets: topTokens.reduce((sum, t) => sum + t.value, 0),
    pnl24h: randomFloat(-50000, 100000),
    netflow7d: randomFloat(-300000, 200000),
    history,
    topTokens
  }
}

// Flows Mock Data
export function generateFlowData(): FlowData {
  const dates = generateDates(30)

  const history = dates.map(date => {
    const inflow = randomFloat(50000, 200000)
    const outflow = randomFloat(40000, 220000)
    return {
      date,
      inflow,
      outflow,
      netflow: inflow - outflow
    }
  })

  const byChain = chains.map(chain => ({
    chain,
    inflow: randomFloat(100000, 500000),
    outflow: randomFloat(100000, 600000)
  }))

  const counterparties: Counterparty[] = [
    "Binance", "Uniswap", "Aave", "Compound", "1inch",
    "Curve", "dYdX", "Kraken", "Coinbase", "SushiSwap"
  ].map(label => ({
    label,
    chain: randomChoice(chains),
    txCount: randomInt(10, 500),
    volumeIn: randomFloat(50000, 800000),
    volumeOut: randomFloat(50000, 800000),
    net: 0
  }))

  counterparties.forEach(c => {
    c.net = c.volumeIn - c.volumeOut
  })

  const totalIn = history.reduce((sum, h) => sum + h.inflow, 0)
  const totalOut = history.reduce((sum, h) => sum + h.outflow, 0)

  return {
    inflow: totalIn,
    outflow: totalOut,
    netflow: totalIn - totalOut,
    history,
    byChain,
    counterparties
  }
}

// Transactions Mock Data
export function generateTransactions(count: number = 50): Transaction[] {
  const txs: Transaction[] = []

  for (let i = 0; i < count; i++) {
    const type = randomChoice<"inflow" | "outflow">(["inflow", "outflow"])
    const date = new Date()
    date.setHours(date.getHours() - randomInt(0, 720)) // Last 30 days

    txs.push({
      id: `tx-${i}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: date.toISOString(),
      chain: randomChoice(chains),
      txHash: `0x${Math.random().toString(16).substr(2, 64)}`,
      counterparty: `0x${Math.random().toString(16).substr(2, 40)}`,
      label: randomChoice(labels),
      amount: randomFloat(100, 250000),
      fee: randomFloat(1, 150),
      riskScore: randomFloat(0, 100),
      type
    })
  }

  return txs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

// Alerts Mock Data
let mockAlerts: Alert[] = [
  {
    id: "alert-1",
    type: "large_transfer",
    name: "Large Transfer Alert",
    severity: "high",
    enabled: true,
    conditions: { amount: 100000, chain: "Ethereum" },
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "alert-2",
    type: "price_threshold",
    name: "ETH Price Threshold",
    severity: "medium",
    enabled: true,
    conditions: { token: "ETH", threshold: 3000, operator: "below" },
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "alert-3",
    type: "risky_address",
    name: "Risky Address Interaction",
    severity: "low",
    enabled: false,
    conditions: { riskThreshold: 70 },
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  }
]

export function getAlerts(): Alert[] {
  return [...mockAlerts]
}

export function createAlert(alert: Omit<Alert, "id" | "createdAt">): Alert {
  const newAlert: Alert = {
    ...alert,
    id: `alert-${Date.now()}`,
    createdAt: new Date().toISOString()
  }
  mockAlerts.push(newAlert)
  return newAlert
}

export function updateAlert(id: string, updates: Partial<Alert>): Alert | null {
  const index = mockAlerts.findIndex(a => a.id === id)
  if (index === -1) return null

  mockAlerts[index] = { ...mockAlerts[index], ...updates }
  return mockAlerts[index]
}

export function generateAlertEvents(count: number = 20): AlertEvent[] {
  const events: AlertEvent[] = []
  const alertIds = mockAlerts.map(a => a.id)

  for (let i = 0; i < count; i++) {
    const date = new Date()
    date.setMinutes(date.getMinutes() - randomInt(0, 2880)) // Last 2 days

    const alert = randomChoice(mockAlerts)

    events.push({
      id: `event-${i}-${Math.random().toString(36).substr(2, 9)}`,
      ruleId: alert.id,
      ruleName: alert.name,
      timestamp: date.toISOString(),
      entity: `0x${Math.random().toString(16).substr(2, 40)}`,
      value: `$${randomInt(100000, 500000).toLocaleString()}`,
      severity: alert.severity
    })
  }

  return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

// Risk Mock Data
export function generateRiskData(): RiskData {
  const hitList: RiskEntity[] = []

  for (let i = 0; i < 23; i++) {
    const date = new Date()
    date.setHours(date.getHours() - randomInt(0, 720))

    hitList.push({
      address: `0x${Math.random().toString(16).substr(2, 40)}`,
      label: randomFloat(0, 1) > 0.7 ? randomChoice(["Tornado Cash", "Mixer", "Sanctioned", "Exploit"]) : undefined,
      riskScore: randomFloat(70, 100),
      reason: randomChoice([
        "Linked to sanctioned entity",
        "High mixer exposure",
        "Stolen funds",
        "Exploit contract",
        "Phishing activity"
      ]),
      lastSeen: date.toISOString(),
      flags: randomChoice([
        ["OFAC", "Mixer"],
        ["Exploit", "High Risk"],
        ["Phishing", "Scam"],
        ["Mixer"],
        ["Sanctioned"]
      ])
    })
  }

  return {
    highCount: 23,
    mediumCount: 87,
    lowCount: 1138,
    hitList: hitList.sort((a, b) => b.riskScore - a.riskScore)
  }
}

export function assessAddressRisk(address: string): RiskAssessment {
  const riskScore = randomFloat(0, 100)
  let riskLevel: "high" | "medium" | "low"

  if (riskScore >= 70) riskLevel = "high"
  else if (riskScore >= 40) riskLevel = "medium"
  else riskLevel = "low"

  const flags: string[] = []
  if (riskScore > 80) flags.push("OFAC", "Sanctioned")
  if (riskScore > 60) flags.push("Mixer Exposure")
  if (riskScore > 40) flags.push("Indirect Risk")

  const date = new Date()
  date.setHours(date.getHours() - randomInt(0, 168))

  return {
    address,
    riskScore: Math.round(riskScore),
    riskLevel,
    flags: flags.length > 0 ? flags : ["Clean"],
    reason: riskLevel === "high"
      ? "Direct interaction with sanctioned entities"
      : riskLevel === "medium"
      ? "Indirect exposure to high-risk addresses"
      : "No significant risk indicators found",
    lastActivity: date.toISOString()
  }
}
