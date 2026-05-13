"use client";

import { useState } from "react";
import {
  Bot,
  Send,
  Sparkles,
  Lightbulb,
  TrendingUp,
  Globe,
  FileText,
  Package,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function AIAssistantPage() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hello! I'm your UpaHealth AI Procurement Assistant. I can help you with:\n\n• Finding optimal suppliers for specific products\n• Generating quotation pricing recommendations\n• Analyzing export market opportunities\n• Monitoring government tenders\n• Supplier risk assessment\n\nWhat would you like to explore today?",
    },
  ]);

  const handleSend = () => {
    if (!message.trim()) return;
    setMessages([...messages, { role: "user", content: message }]);
    // Simulate AI response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Based on my analysis of current market data, I recommend focusing on IV Infusion Sets for your next East Africa quotation. Current supplier pricing from Romsons is ₹8/unit with export pricing at $0.42/unit — giving you a 38% margin. KEMSA Kenya has an open tender closing May 20th that matches your product catalogue with 92% confidence. Shall I draft a quotation?",
        },
      ]);
    }, 1000);
    setMessage("");
  };

  const quickPrompts = [
    { icon: TrendingUp, text: "Best margin products for export", color: "text-emerald-400" },
    { icon: Globe, text: "Open tenders matching my catalogue", color: "text-purple-400" },
    { icon: Package, text: "Suggest suppliers for surgical kits", color: "text-cyan-400" },
    { icon: FileText, text: "Draft quotation for KEMSA Kenya", color: "text-blue-400" },
    { icon: Lightbulb, text: "Pricing strategy for GCC market", color: "text-amber-400" },
    { icon: Zap, text: "Competitor pricing intelligence", color: "text-red-400" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-cyan-400" />
            AI Procurement Assistant
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Powered by advanced AI — procurement intelligence, pricing, and market analysis
          </p>
        </div>
        <Badge variant="success" className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-emerald-400 pulse-glow" />
          Online
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chat Area */}
        <div className="lg:col-span-3">
          <Card className="h-[600px] flex flex-col">
            <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-xl p-4 ${
                      msg.role === "user"
                        ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/20"
                        : "bg-slate-800/50 border border-white/5"
                    }`}
                  >
                    {msg.role === "assistant" && (
                      <div className="flex items-center gap-2 mb-2">
                        <Bot className="w-4 h-4 text-cyan-400" />
                        <span className="text-xs text-cyan-400 font-medium">UpaHealth AI</span>
                      </div>
                    )}
                    <p className="text-sm text-slate-200 whitespace-pre-line">{msg.content}</p>
                  </div>
                </div>
              ))}
            </CardContent>

            {/* Input */}
            <div className="p-4 border-t border-white/5">
              <div className="flex items-center gap-3">
                <Input
                  placeholder="Ask about pricing, suppliers, tenders, export markets..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  className="flex-1"
                />
                <Button onClick={handleSend}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Prompts Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Quick Prompts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {quickPrompts.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => setMessage(prompt.text)}
                    className="w-full flex items-center gap-2 p-2.5 rounded-lg bg-slate-800/30 border border-white/5 hover:border-cyan-500/20 transition-colors text-left"
                  >
                    <prompt.icon className={`w-4 h-4 shrink-0 ${prompt.color}`} />
                    <span className="text-xs text-slate-300">{prompt.text}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">AI Capabilities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-xs text-slate-400">
                <p>• Procurement intelligence</p>
                <p>• Pricing recommendations</p>
                <p>• Supplier risk scoring</p>
                <p>• Tender document drafting</p>
                <p>• Export market analysis</p>
                <p>• Demand forecasting</p>
                <p>• Margin optimization</p>
                <p>• Competitor monitoring</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
