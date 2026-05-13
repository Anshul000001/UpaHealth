"use client";

import { useState } from "react";
import {
  Upload,
  FileText,
  Sparkles,
  CheckCircle2,
  Clock,
  Bot,
  File,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function RFQPage() {
  const [isDragging, setIsDragging] = useState(false);

  const recentRFQs = [
    {
      id: "RFQ-001",
      buyer: "KEMSA Kenya",
      date: "2025-05-10",
      products: 8,
      status: "parsed",
      value: "₹25L",
    },
    {
      id: "RFQ-002",
      buyer: "City Hospital Jaipur",
      date: "2025-05-09",
      products: 5,
      status: "quotation_generated",
      value: "₹4.5L",
    },
    {
      id: "RFQ-003",
      buyer: "Al Noor Hospital UAE",
      date: "2025-05-08",
      products: 12,
      status: "pending",
      value: "₹18L",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">AI RFQ Parser</h1>
          <p className="text-slate-400 text-sm mt-1">
            Upload RFQs — AI extracts products, quantities, and auto-generates quotations
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Area */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-8">
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={() => setIsDragging(false)}
                className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
                  isDragging
                    ? "border-cyan-500 bg-cyan-500/5"
                    : "border-slate-700 hover:border-slate-600"
                }`}
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-8 h-8 text-cyan-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Drop your RFQ here
                </h3>
                <p className="text-sm text-slate-400 mb-6">
                  Supports PDF, Excel (.xlsx), Word (.docx), and email (.eml) files
                </p>
                <div className="flex items-center justify-center gap-3">
                  <Button>
                    <Upload className="w-3.5 h-3.5" /> Browse Files
                  </Button>
                  <Button variant="outline">
                    <Bot className="w-3.5 h-3.5" /> Paste RFQ Text
                  </Button>
                </div>
                <p className="text-xs text-slate-600 mt-4">Max file size: 10MB</p>
              </div>
            </CardContent>
          </Card>

          {/* AI Processing Steps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                AI Processing Pipeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                {[
                  { step: 1, title: "Extract", desc: "OCR + text extraction from uploaded document", icon: File },
                  { step: 2, title: "Parse", desc: "AI identifies products, quantities, specs", icon: Bot },
                  { step: 3, title: "Match", desc: "Auto-match to supplier database & pricing", icon: Sparkles },
                  { step: 4, title: "Generate", desc: "Create quotation draft with margins", icon: FileText },
                ].map((item) => (
                  <div key={item.step} className="text-center">
                    <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto mb-3">
                      <item.icon className="w-5 h-5 text-cyan-400" />
                    </div>
                    <p className="text-sm font-medium text-white">{item.title}</p>
                    <p className="text-[10px] text-slate-500 mt-1">{item.desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent RFQs */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent RFQs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentRFQs.map((rfq) => (
                  <div
                    key={rfq.id}
                    className="p-3 rounded-lg bg-slate-800/30 border border-white/5 hover:border-cyan-500/20 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-slate-500">{rfq.id}</span>
                      <Badge
                        variant={
                          rfq.status === "parsed"
                            ? "info"
                            : rfq.status === "quotation_generated"
                            ? "success"
                            : "warning"
                        }
                      >
                        {rfq.status === "parsed" && <CheckCircle2 className="w-3 h-3 mr-1" />}
                        {rfq.status === "pending" && <Clock className="w-3 h-3 mr-1" />}
                        {rfq.status.replace("_", " ")}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium text-white">{rfq.buyer}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-slate-500">{rfq.products} products</span>
                      <span className="text-xs font-medium text-cyan-400">{rfq.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AI Capabilities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  "Extract product names & quantities from any format",
                  "Detect urgency level and delivery requirements",
                  "Auto-suggest best suppliers for each item",
                  "Generate quotation with optimal margins",
                  "Multi-language support (English, Hindi, Arabic)",
                ].map((capability, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-slate-300">{capability}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
