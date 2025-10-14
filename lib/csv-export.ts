import { Transaction } from "./types"

export function exportTransactionsToCSV(transactions: Transaction[], filename: string = "transactions.csv") {
  // Define CSV headers
  const headers = [
    "ID",
    "Timestamp",
    "Chain",
    "Transaction Hash",
    "Counterparty",
    "Label",
    "Amount",
    "Fee",
    "Risk Score",
    "Type"
  ]

  // Convert transactions to CSV rows
  const rows = transactions.map(tx => [
    tx.id,
    new Date(tx.timestamp).toISOString(),
    tx.chain,
    tx.txHash,
    tx.counterparty,
    tx.label,
    tx.amount.toString(),
    tx.fee.toString(),
    tx.riskScore.toString(),
    tx.type
  ])

  // Combine headers and rows
  const csvContent = [
    headers.join(","),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
  ].join("\n")

  // Create blob and download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", filename)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}
