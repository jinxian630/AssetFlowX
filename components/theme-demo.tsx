"use client"

import { Button } from "@/components/ui/button"

export function ThemeDemo() {
  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      {/* Color Palette */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Brand Colors</h2>
        <div className="grid grid-cols-5 gap-4">
          <div className="space-y-2">
            <div className="h-20 rounded-2xl bg-brand-500 shadow-soft"></div>
            <p className="text-xs text-center text-muted-foreground">brand-500</p>
          </div>
          <div className="space-y-2">
            <div className="h-20 rounded-2xl bg-brand-400 shadow-soft"></div>
            <p className="text-xs text-center text-muted-foreground">brand-400</p>
          </div>
          <div className="space-y-2">
            <div className="h-20 rounded-2xl bg-brand-300 shadow-soft"></div>
            <p className="text-xs text-center text-muted-foreground">brand-300</p>
          </div>
          <div className="space-y-2">
            <div className="h-20 rounded-2xl bg-brand-200 shadow-soft"></div>
            <p className="text-xs text-center text-muted-foreground">brand-200</p>
          </div>
          <div className="space-y-2">
            <div className="h-20 rounded-2xl bg-brand-100 shadow-soft"></div>
            <p className="text-xs text-center text-muted-foreground">brand-100</p>
          </div>
        </div>
      </section>

      {/* Gradient Showcase */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Gradients</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="card p-8 brand-gradient-bg">
            <h3 className="text-2xl font-bold text-white">Brand Gradient</h3>
            <p className="text-white/90 mt-2">
              Purple to pink gradient background
            </p>
          </div>
          <div className="card p-8 bg-background">
            <h3 className="text-4xl font-bold brand-gradient-text">
              Gradient Text
            </h3>
            <p className="text-muted-foreground mt-2">
              Text with gradient clip effect
            </p>
          </div>
        </div>
      </section>

      {/* Shadow Variants */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Shadows & Borders</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-2xl p-6 bg-card border border-border">
            <h3 className="font-semibold">Default Border</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Standard card with border
            </p>
          </div>
          <div className="card p-6">
            <h3 className="font-semibold">Soft Shadow</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Using shadow-soft utility
            </p>
          </div>
          <div className="rounded-2xl p-6 bg-card shadow-soft-lg">
            <h3 className="font-semibold">Large Shadow</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Using shadow-soft-lg
            </p>
          </div>
        </div>
      </section>

      {/* Button Variants */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Button Variants</h2>
        <div className="flex flex-wrap gap-3">
          <Button variant="default">Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="brand">Brand Gradient</Button>
        </div>
      </section>

      {/* Typography */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Typography</h2>
        <div className="card p-6 space-y-3">
          <h1 className="text-4xl font-bold">Heading 1</h1>
          <h2 className="text-3xl font-bold">Heading 2</h2>
          <h3 className="text-2xl font-semibold">Heading 3</h3>
          <p className="text-base">
            Body text with normal weight and standard line height.
          </p>
          <p className="text-sm text-muted-foreground">
            Muted text for secondary information and descriptions.
          </p>
        </div>
      </section>

      {/* Semantic Colors */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Semantic Colors</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl p-6 bg-primary text-primary-foreground">
            <h3 className="font-semibold">Primary</h3>
            <p className="text-sm mt-2 opacity-90">Main brand color</p>
          </div>
          <div className="rounded-2xl p-6 bg-secondary text-secondary-foreground">
            <h3 className="font-semibold">Secondary</h3>
            <p className="text-sm mt-2 opacity-90">Secondary actions</p>
          </div>
          <div className="rounded-2xl p-6 bg-muted text-muted-foreground">
            <h3 className="font-semibold">Muted</h3>
            <p className="text-sm mt-2">Subtle backgrounds</p>
          </div>
          <div className="rounded-2xl p-6 bg-accent text-accent-foreground">
            <h3 className="font-semibold">Accent</h3>
            <p className="text-sm mt-2">Highlighted content</p>
          </div>
        </div>
      </section>
    </div>
  )
}
