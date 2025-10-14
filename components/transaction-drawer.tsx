"use client"

import { Transaction } from "@/lib/types"
import { X, ExternalLink, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TransactionDrawerProps {
  transaction: Transaction | null
  onClose: () => void
}

export function TransactionDrawer({ transaction, onClose }: TransactionDrawerProps) {
  if (!transaction) return null

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full md:w-[500px] bg-card border-l border-border z-50 overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Transaction Details</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Type Badge */}
          <div>
            <span className={`inline-flex px-3 py-1.5 rounded-lg text-sm font-medium ${
              transaction.type === 'inflow'
                ? 'bg-green-500/10 text-green-500'
                : 'bg-destructive/10 text-destructive'
            }`}>
              {transaction.type.toUpperCase()}
            </span>
          </div>

          {/* Amount */}
          <div className="card p-4">
            <p className="text-sm text-muted-foreground mb-1">Amount</p>
            <p className={`text-3xl font-bold ${
              transaction.type === 'inflow' ? 'text-green-500' : 'text-destructive'
            }`}>
              {transaction.type === 'inflow' ? '+' : '-'}
              ${transaction.amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </p>
          </div>

          {/* Details Grid */}
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Chain</p>
              <p className="font-medium">{transaction.chain}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Timestamp</p>
              <p className="font-medium">
                {new Date(transaction.timestamp).toLocaleString('en-US', {
                  dateStyle: 'full',
                  timeStyle: 'long'
                })}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Transaction Hash</p>
              <div className="flex items-center gap-2">
                <p className="font-mono text-sm break-all">{transaction.txHash}</p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0"
                  onClick={() => copyToClipboard(transaction.txHash)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Counterparty</p>
              <div className="flex items-center gap-2">
                <p className="font-mono text-sm break-all">{transaction.counterparty}</p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0"
                  onClick={() => copyToClipboard(transaction.counterparty)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Label</p>
              <p className="font-medium">{transaction.label}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Transaction Fee</p>
              <p className="font-medium">${transaction.fee.toFixed(2)}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Risk Score</p>
              <div className="flex items-center gap-2">
                <span className={`inline-flex px-3 py-1 rounded-md text-sm font-medium ${
                  transaction.riskScore >= 70
                    ? 'bg-destructive/10 text-destructive'
                    : transaction.riskScore >= 40
                    ? 'bg-yellow-500/10 text-yellow-600'
                    : 'bg-green-500/10 text-green-500'
                }`}>
                  {transaction.riskScore.toFixed(0)} / 100
                </span>
                <span className="text-sm text-muted-foreground">
                  {transaction.riskScore >= 70
                    ? 'High Risk'
                    : transaction.riskScore >= 40
                    ? 'Medium Risk'
                    : 'Low Risk'}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 space-y-2">
            <Button variant="brand" className="w-full">
              <ExternalLink className="h-4 w-4" />
              View on Explorer
            </Button>
            <Button variant="outline" className="w-full" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
