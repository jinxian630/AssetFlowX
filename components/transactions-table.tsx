"use client"

import { useState } from "react"
import { Transaction } from "@/lib/types"
import { ArrowUpDown, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TransactionsTableProps {
  transactions: Transaction[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  onPageChange: (page: number) => void
  onTransactionClick: (transaction: Transaction) => void
}

export function TransactionsTable({
  transactions,
  pagination,
  onPageChange,
  onTransactionClick
}: TransactionsTableProps) {
  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-lg">Transaction History</h3>
          <p className="text-sm text-muted-foreground">
            {pagination.total} total transactions
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="pb-3 font-medium text-sm text-muted-foreground">Time</th>
                <th className="pb-3 font-medium text-sm text-muted-foreground">Chain</th>
                <th className="pb-3 font-medium text-sm text-muted-foreground">Type</th>
                <th className="pb-3 font-medium text-sm text-muted-foreground">Counterparty</th>
                <th className="pb-3 font-medium text-sm text-muted-foreground">Label</th>
                <th className="pb-3 font-medium text-sm text-muted-foreground text-right">Amount</th>
                <th className="pb-3 font-medium text-sm text-muted-foreground text-right">Risk</th>
                <th className="pb-3 font-medium text-sm text-muted-foreground"></th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr
                  key={tx.id}
                  className="border-b border-border last:border-0 hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => onTransactionClick(tx)}
                >
                  <td className="py-3">
                    <div className="text-sm">
                      {new Date(tx.timestamp).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </td>
                  <td className="py-3">
                    <span className="text-sm">{tx.chain}</span>
                  </td>
                  <td className="py-3">
                    <span className={`inline-flex px-2 py-1 rounded-md text-xs font-medium ${
                      tx.type === 'inflow'
                        ? 'bg-green-500/10 text-green-500'
                        : 'bg-destructive/10 text-destructive'
                    }`}>
                      {tx.type}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className="text-sm font-mono text-muted-foreground">
                      {tx.counterparty.slice(0, 6)}...{tx.counterparty.slice(-4)}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className="text-sm">{tx.label}</span>
                  </td>
                  <td className="py-3 text-right">
                    <span className={`font-medium ${
                      tx.type === 'inflow' ? 'text-green-500' : 'text-destructive'
                    }`}>
                      {tx.type === 'inflow' ? '+' : '-'}
                      ${tx.amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <span className={`inline-flex px-2 py-1 rounded-md text-xs font-medium ${
                      tx.riskScore >= 70
                        ? 'bg-destructive/10 text-destructive'
                        : tx.riskScore >= 40
                        ? 'bg-yellow-500/10 text-yellow-600'
                        : 'bg-green-500/10 text-green-500'
                    }`}>
                      {tx.riskScore.toFixed(0)}
                    </span>
                  </td>
                  <td className="py-3">
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
          {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
          {pagination.total} transactions
        </p>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              const pageNum = i + 1
              return (
                <Button
                  key={pageNum}
                  variant={pagination.page === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(pageNum)}
                  className="w-9"
                >
                  {pageNum}
                </Button>
              )
            })}
            {pagination.totalPages > 5 && (
              <span className="text-sm text-muted-foreground px-2">...</span>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
