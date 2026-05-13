"use client";

import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Globe,
  Shield,
  Zap,
  BarChart3,
  FileText,
  Package,
  Factory,
  Users,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 grid-pattern">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">UH</span>
            </div>
            <div>
              <span className="text-white font-bold">UpaHealth</span>
              <span className="text-slate-500 text-xs ml-2">Procurement Intelligence</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm text-slate-400 hover:text-white transition-colors">
              Platform
            </Link>
            <Link href="/dashboard">
              <Button size="sm">
                Launch Dashboard <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium mb-8">
              <Sparkles className="w-3.5 h-3.5" />
              AI-Powered Healthcare Procurement Intelligence
            </div>

            <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
              <span className="text-white">The Operating System for</span>
              <br />
              <span className="gradient-text">Healthcare Sourcing</span>
            </h1>

            <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10">
              India&apos;s first AI-enabled platform for surgical consumables procurement,
              quotation automation, supplier intelligence, and export management.
              Built for hospitals, distributors, and global buyers.
            </p>

            <div className="flex items-center justify-center gap-4">
              <Link href="/dashboard">
                <Button size="lg" className="text-base">
                  Enter Platform <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/dashboard/quotations">
                <Button variant="outline" size="lg" className="text-base">
                  Generate Quotation
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-6 mt-16 max-w-3xl mx-auto">
              {[
                { label: "Products Tracked", value: "156+" },
                { label: "Export Markets", value: "6" },
                { label: "AI Accuracy", value: "94%" },
                { label: "Time Saved", value: "10x" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">
              Complete Procurement Intelligence Stack
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Every tool a healthcare sourcing company needs — powered by AI, built for scale.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: FileText,
                title: "AI Quotation Generator",
                description: "Auto-generate professional quotations with margin calculations, GST, multi-currency support, and branded PDF export.",
                color: "from-cyan-500 to-blue-500",
              },
              {
                icon: Bot,
                title: "AI RFQ Parser",
                description: "Upload PDF/Excel RFQs — AI extracts products, quantities, detects urgency, and auto-generates quotation drafts.",
                color: "from-blue-500 to-purple-500",
              },
              {
                icon: Factory,
                title: "Supplier Intelligence",
                description: "AI-scored supplier profiles with reliability ratings, quality metrics, CDSCO compliance tracking, and price history.",
                color: "from-purple-500 to-pink-500",
              },
              {
                icon: Package,
                title: "Product Database",
                description: "Complete surgical consumables catalogue with pricing, margins, certifications, and export availability data.",
                color: "from-pink-500 to-red-500",
              },
              {
                icon: Users,
                title: "Healthcare CRM",
                description: "Track hospitals, distributors, export buyers with pipeline stages, follow-ups, and procurement history.",
                color: "from-red-500 to-orange-500",
              },
              {
                icon: Globe,
                title: "Export Intelligence",
                description: "Country-wise demand data, HS codes, freight estimation, compliance requirements, and tender monitoring.",
                color: "from-orange-500 to-amber-500",
              },
              {
                icon: BarChart3,
                title: "Analytics Dashboard",
                description: "Revenue projections, conversion rates, product demand trends, supplier performance, and margin analysis.",
                color: "from-amber-500 to-yellow-500",
              },
              {
                icon: Zap,
                title: "WhatsApp Automation",
                description: "AI ordering bot, automated follow-ups, quotation delivery, and procurement workflow automation.",
                color: "from-yellow-500 to-green-500",
              },
              {
                icon: Shield,
                title: "QR Verification",
                description: "Batch-level product authentication. Hospitals scan QR to verify authenticity — trust infrastructure.",
                color: "from-green-500 to-cyan-500",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group relative rounded-xl border border-white/10 bg-slate-900/50 p-6 hover:border-cyan-500/30 transition-all duration-300"
              >
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 opacity-80`}>
                  <feature.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Market Opportunity */}
      <section className="py-20 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">
              The Market Opportunity
            </h2>
            <p className="text-slate-400">India&apos;s surgical consumables market is at a historic inflection point</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: "$891M", label: "India Disposable Surgical Market 2024", sub: "→ $3.67B by 2034" },
              { value: "15.2%", label: "CAGR Growth Rate", sub: "Fastest globally" },
              { value: "70-80%", label: "Import Dependency", sub: "Massive domestic gap" },
              { value: "₹99,858 Cr", label: "Healthcare Budget FY26", sub: "Government spending" },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-white/10 bg-slate-900/30 p-6 text-center">
                <p className="text-2xl font-bold gradient-text">{item.value}</p>
                <p className="text-xs text-slate-400 mt-2">{item.label}</p>
                <p className="text-[10px] text-cyan-400/60 mt-1">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-blue-600/5 p-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Transform Healthcare Procurement?
            </h2>
            <p className="text-slate-400 mb-8">
              Join the AI-powered future of surgical consumables sourcing and export intelligence.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/dashboard">
                <Button size="lg">
                  Launch Platform <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            <div className="flex items-center justify-center gap-6 mt-8 text-xs text-slate-500">
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-cyan-400" /> AI-First</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-cyan-400" /> Export Ready</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-cyan-400" /> CDSCO Compliant</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-xs">UH</span>
            </div>
            <span className="text-sm text-slate-400">UpaHealth Supplies © 2025</span>
          </div>
          <p className="text-xs text-slate-600">AI-Enabled Healthcare Sourcing Intelligence</p>
        </div>
      </footer>
    </div>
  );
}
