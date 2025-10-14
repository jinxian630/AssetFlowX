"use client"

import { useState } from "react"
import { Alert } from "@/lib/types"
import { z } from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Zod schema for alert rule validation
const alertSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(100),
  type: z.enum(["price_threshold", "large_transfer", "risky_address"]),
  severity: z.enum(["high", "medium", "low"]),
  conditions: z.record(z.any())
})

// Conditional schemas based on alert type
const priceThresholdConditions = z.object({
  token: z.string().min(1, "Token is required"),
  operator: z.enum(["above", "below"]),
  threshold: z.number().positive("Threshold must be positive")
})

const largeTransferConditions = z.object({
  amount: z.number().positive("Amount must be positive"),
  chain: z.string().optional()
})

const riskyAddressConditions = z.object({
  riskThreshold: z.number().min(0).max(100, "Risk threshold must be 0-100")
})

interface NewAlertDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (alert: Omit<Alert, "id" | "createdAt">) => void
}

export function NewAlertDialog({ open, onOpenChange, onSubmit }: NewAlertDialogProps) {
  const [name, setName] = useState("")
  const [type, setType] = useState<"price_threshold" | "large_transfer" | "risky_address">("price_threshold")
  const [severity, setSeverity] = useState<"high" | "medium" | "low">("medium")

  // Price threshold fields
  const [token, setToken] = useState("")
  const [operator, setOperator] = useState<"above" | "below">("above")
  const [threshold, setThreshold] = useState("")

  // Large transfer fields
  const [amount, setAmount] = useState("")
  const [chain, setChain] = useState("")

  // Risky address fields
  const [riskThreshold, setRiskThreshold] = useState("")

  const [errors, setErrors] = useState<Record<string, string>>({})

  const resetForm = () => {
    setName("")
    setType("price_threshold")
    setSeverity("medium")
    setToken("")
    setOperator("above")
    setThreshold("")
    setAmount("")
    setChain("")
    setRiskThreshold("")
    setErrors({})
  }

  const handleSubmit = () => {
    try {
      setErrors({})

      // Build conditions based on type
      let conditions: Record<string, any> = {}

      if (type === "price_threshold") {
        conditions = priceThresholdConditions.parse({
          token,
          operator,
          threshold: parseFloat(threshold)
        })
      } else if (type === "large_transfer") {
        conditions = largeTransferConditions.parse({
          amount: parseFloat(amount),
          chain: chain || undefined
        })
      } else if (type === "risky_address") {
        conditions = riskyAddressConditions.parse({
          riskThreshold: parseFloat(riskThreshold)
        })
      }

      // Validate overall alert
      const alert = alertSchema.parse({
        name,
        type,
        severity,
        conditions,
      })

      onSubmit({
        ...alert,
        enabled: true
      })

      resetForm()
      onOpenChange(false)
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {}
        error.errors.forEach((err) => {
          const path = err.path.join(".")
          fieldErrors[path] = err.message
        })
        setErrors(fieldErrors)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Create New Alert Rule</DialogTitle>
          <DialogDescription>
            Set up a new alert rule to monitor your assets and transactions.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Name */}
          <div className="grid gap-2">
            <Label htmlFor="name">Rule Name</Label>
            <Input
              id="name"
              placeholder="e.g. BTC Price Alert"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          {/* Type */}
          <div className="grid gap-2">
            <Label htmlFor="type">Alert Type</Label>
            <Select value={type} onValueChange={(v: any) => setType(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select alert type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="price_threshold">Price Threshold</SelectItem>
                <SelectItem value="large_transfer">Large Transfer</SelectItem>
                <SelectItem value="risky_address">Risky Address</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Severity */}
          <div className="grid gap-2">
            <Label htmlFor="severity">Severity</Label>
            <Select value={severity} onValueChange={(v: any) => setSeverity(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Conditional Fields Based on Type */}
          {type === "price_threshold" && (
            <>
              <div className="grid gap-2">
                <Label htmlFor="token">Token</Label>
                <Input
                  id="token"
                  placeholder="e.g. BTC, ETH"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                />
                {errors["conditions.token"] && (
                  <p className="text-sm text-destructive">{errors["conditions.token"]}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="operator">Condition</Label>
                  <Select value={operator} onValueChange={(v: any) => setOperator(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="above">Above</SelectItem>
                      <SelectItem value="below">Below</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="threshold">Price ($)</Label>
                  <Input
                    id="threshold"
                    type="number"
                    placeholder="50000"
                    value={threshold}
                    onChange={(e) => setThreshold(e.target.value)}
                  />
                  {errors["conditions.threshold"] && (
                    <p className="text-sm text-destructive">{errors["conditions.threshold"]}</p>
                  )}
                </div>
              </div>
            </>
          )}

          {type === "large_transfer" && (
            <>
              <div className="grid gap-2">
                <Label htmlFor="amount">Amount ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="100000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                {errors["conditions.amount"] && (
                  <p className="text-sm text-destructive">{errors["conditions.amount"]}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="chain">Chain (Optional)</Label>
                <Input
                  id="chain"
                  placeholder="e.g. Ethereum, Bitcoin"
                  value={chain}
                  onChange={(e) => setChain(e.target.value)}
                />
              </div>
            </>
          )}

          {type === "risky_address" && (
            <div className="grid gap-2">
              <Label htmlFor="riskThreshold">Risk Score Threshold (0-100)</Label>
              <Input
                id="riskThreshold"
                type="number"
                placeholder="70"
                min="0"
                max="100"
                value={riskThreshold}
                onChange={(e) => setRiskThreshold(e.target.value)}
              />
              {errors["conditions.riskThreshold"] && (
                <p className="text-sm text-destructive">{errors["conditions.riskThreshold"]}</p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              resetForm()
              onOpenChange(false)
            }}
          >
            Cancel
          </Button>
          <Button variant="brand" onClick={handleSubmit}>
            Create Rule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
