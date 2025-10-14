"use client"

import { useEffect, useState } from "react"
import { Filter, Download, Search, RefreshCw } from "lucide-react"
import { Transaction } from "@/lib/types"
import { TransactionsTable } from "@/components/transactions-table"
import { TransactionDrawer } from "@/components/transaction-drawer"
import { LoadingTable } from "@/components/loading-state"
import { ErrorState } from "@/components/error-state"
import { Button } from "@/components/ui/button"
import { exportTransactionsToCSV } from "@/lib/csv-export"

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  })

  const fetchData = async (pageNum: number = 1) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/transactions?page=${pageNum}&limit=20`)

      if (!response.ok) {
        throw new Error("Failed to fetch transactions")
      }

      const result = await response.json()
      setTransactions(result.data)
      setPagination(result.pagination)
      setPage(pageNum)

      // Fetch all for CSV export (limit 200)
      if (allTransactions.length === 0) {
        const allResponse = await fetch(`/api/transactions?page=1&limit=200`)
        const allResult = await allResponse.json()
        setAllTransactions(allResult.data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData(1)
  }, [])

  const handlePageChange = (newPage: number) => {
    fetchData(newPage)
  }

  const handleExportCSV = () => {
    exportTransactionsToCSV(allTransactions, `assetflowx-transactions-${new Date().toISOString().split('T')[0]}.csv`)
  }

  // Calculate stats
  const stats = {
    totalVolume: transactions.reduce((sum, tx) => sum + tx.amount, 0),
    avgTransaction: transactions.length > 0 ? transactions.reduce((sum, tx) => sum + tx.amount, 0) / transactions.length : 0,
    totalFees: transactions.reduce((sum, tx) => sum + tx.fee, 0),
    highRisk: transactions.filter(tx => tx.riskScore >= 70).length
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground mt-1">
            Browse and filter all transaction history
          </p>
        </div>
        <ErrorState
          title="Failed to load transactions"
          message={error}
          onRetry={() => fetchData(page)}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground mt-1">
            Browse and filter all transaction history
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => fetchData(page)}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button variant="brand" onClick={handleExportCSV}>
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="card p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search by hash, address, label..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-xl border border-input bg-background pl-10 pr-4 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </div>

        <div className="flex gap-2 mt-3">
          <button className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium">
            All chains
          </button>
          <button className="px-3 py-1.5 rounded-lg bg-muted text-muted-foreground text-sm hover:bg-muted/80">
            Last 30 days
          </button>
          <button className="px-3 py-1.5 rounded-lg bg-muted text-muted-foreground text-sm hover:bg-muted/80">
            Amount: Any
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingTable />
      ) : (
        <TransactionsTable
          transactions={transactions}
          pagination={pagination}
          onPageChange={handlePageChange}
          onTransactionClick={setSelectedTransaction}
        />
      )}

      {/* Stats Footer */}
      {!loading && transactions.length > 0 && (
        <div className="grid gap-4 md:grid-cols-4">
          <div className="card p-4">
            <p className="text-sm text-muted-foreground">Total Volume</p>
            <p className="text-2xl font-bold mt-1">
              ${(stats.totalVolume / 1000000).toFixed(1)}M
            </p>
          </div>
          <div className="card p-4">
            <p className="text-sm text-muted-foreground">Avg. Transaction</p>
            <p className="text-2xl font-bold mt-1">
              ${stats.avgTransaction.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
          </div>
          <div className="card p-4">
            <p className="text-sm text-muted-foreground">Total Fees</p>
            <p className="text-2xl font-bold mt-1">
              ${stats.totalFees.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
          </div>
          <div className="card p-4">
            <p className="text-sm text-muted-foreground">High Risk</p>
            <p className="text-2xl font-bold text-destructive mt-1">{stats.highRisk}</p>
          </div>
        </div>
      )}

      {/* Transaction Detail Drawer */}
      <TransactionDrawer
        transaction={selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
      />
    </div>
  )
}
