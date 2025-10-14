"use client"

import { useState } from "react"
import { Counterparty } from "@/lib/types"
import { ArrowUpDown } from "lucide-react"

interface CounterpartiesTableProps {
  counterparties: Counterparty[]
}

type SortField = "label" | "txCount" | "volumeIn" | "volumeOut" | "net"
type SortDirection = "asc" | "desc"

export function CounterpartiesTable({ counterparties }: CounterpartiesTableProps) {
  const [sortField, setSortField] = useState<SortField>("net")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  const sortedData = [...counterparties].sort((a, b) => {
    const aVal = a[sortField]
    const bVal = b[sortField]

    if (typeof aVal === "string" && typeof bVal === "string") {
      return sortDirection === "asc"
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal)
    }

    return sortDirection === "asc"
      ? (aVal as number) - (bVal as number)
      : (bVal as number) - (aVal as number)
  })

  const SortButton = ({ field, label }: { field: SortField; label: string }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 hover:text-foreground transition-colors"
    >
      {label}
      <ArrowUpDown className="h-3 w-3" />
    </button>
  )

  return (
    <div className="card p-6">
      <h3 className="font-semibold text-lg mb-4">Top Counterparties</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="pb-3 font-medium text-sm text-muted-foreground">
                <SortButton field="label" label="Counterparty" />
              </th>
              <th className="pb-3 font-medium text-sm text-muted-foreground">
                Chain
              </th>
              <th className="pb-3 font-medium text-sm text-muted-foreground text-right">
                <SortButton field="txCount" label="Tx Count" />
              </th>
              <th className="pb-3 font-medium text-sm text-muted-foreground text-right">
                <SortButton field="volumeIn" label="Volume In" />
              </th>
              <th className="pb-3 font-medium text-sm text-muted-foreground text-right">
                <SortButton field="volumeOut" label="Volume Out" />
              </th>
              <th className="pb-3 font-medium text-sm text-muted-foreground text-right">
                <SortButton field="net" label="Net" />
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((cp, i) => (
              <tr key={i} className="border-b border-border last:border-0">
                <td className="py-3">
                  <div className="font-medium">{cp.label}</div>
                </td>
                <td className="py-3">
                  <span className="text-sm text-muted-foreground">{cp.chain}</span>
                </td>
                <td className="py-3 text-right">
                  <span className="text-sm">{cp.txCount.toLocaleString()}</span>
                </td>
                <td className="py-3 text-right">
                  <span className="text-sm text-green-500">
                    ${cp.volumeIn.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                </td>
                <td className="py-3 text-right">
                  <span className="text-sm text-destructive">
                    ${cp.volumeOut.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                </td>
                <td className="py-3 text-right">
                  <span className={`text-sm font-medium ${
                    cp.net >= 0 ? 'text-green-500' : 'text-destructive'
                  }`}>
                    {cp.net >= 0 ? '+' : ''}
                    ${cp.net.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
