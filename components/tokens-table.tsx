"use client"

import { TokenHolding } from "@/lib/types"
import { ArrowUpRight, ArrowDownRight } from "lucide-react"

interface TokensTableProps {
  tokens: TokenHolding[]
}

export function TokensTable({ tokens }: TokensTableProps) {
  return (
    <div className="card p-6">
      <h3 className="font-semibold text-lg mb-4">Top Token Holdings</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="pb-3 font-medium text-sm text-muted-foreground">Token</th>
              <th className="pb-3 font-medium text-sm text-muted-foreground">Chain</th>
              <th className="pb-3 font-medium text-sm text-muted-foreground text-right">Quantity</th>
              <th className="pb-3 font-medium text-sm text-muted-foreground text-right">Price</th>
              <th className="pb-3 font-medium text-sm text-muted-foreground text-right">Value</th>
              <th className="pb-3 font-medium text-sm text-muted-foreground text-right">24h %</th>
            </tr>
          </thead>
          <tbody>
            {tokens.map((token, i) => (
              <tr key={i} className="border-b border-border last:border-0">
                <td className="py-3">
                  <div className="font-medium">{token.token}</div>
                </td>
                <td className="py-3">
                  <span className="text-sm text-muted-foreground">{token.chain}</span>
                </td>
                <td className="py-3 text-right">
                  <span className="text-sm">{token.qty.toFixed(2)}</span>
                </td>
                <td className="py-3 text-right">
                  <span className="text-sm">${token.price.toLocaleString()}</span>
                </td>
                <td className="py-3 text-right">
                  <span className="font-medium">${token.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                </td>
                <td className="py-3 text-right">
                  <div className={`flex items-center justify-end gap-1 text-sm font-medium ${
                    token.pct24h >= 0 ? 'text-green-500' : 'text-destructive'
                  }`}>
                    {token.pct24h >= 0 ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3" />
                    )}
                    {Math.abs(token.pct24h).toFixed(2)}%
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
