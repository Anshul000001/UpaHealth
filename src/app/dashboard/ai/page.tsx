"use client";

import { useState, useRef, useEffect } from "react";
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
  Loader2,
  RefreshCw,
  User,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const QUICK_PROMPTS = [
  { icon: TrendingUp, text: "Which products have the best export margins?", color: "text-emerald-400" },
  { icon: Globe, text: "What are the best export markets for IV sets?", color: "text-purple-400" },
  { icon: Package, text: "Recommend suppliers for surgical kits", color: "text-cyan-400" },
  { icon: FileText, text: "How should I price a quotation for East Africa?", color: "text-blue-400" },
  { icon: Lightbulb, text: "What tenders should I bid on right now?", color: "text-amber-400" },
  { icon: Zap, text: "Analyze my current pipeline and suggest next steps", color: "text-red-400" },
];

const WELCOME: Message = {
  role: "assistant",
  content: `Hello! I'm your UpaHealth AI Procurement Assistant, powered by NVIDIA Llama 3.1.

I have live access to your:
• Product catalogue & pricing
• Supplier profiles & trust scores
• CRM pipeline & leads
• Matched government tenders

Ask me anything about pricing strategy, supplier selection, export markets, tender bids, or margin optimization. What would you like to explore?`,
};

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(text?: string) {
    const content = (text ?? input).trim();
    if (!content || loading) return;

    const userMsg: Message = { role: "user", content };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error?.message ?? "AI request failed");
      }

      setMessages((prev) => [...prev, { role: "assistant", content: data.data.reply }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }

  function clearChat() {
    setMessages([WELCOME]);
    setError(null);
  }

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
            Powered by NVIDIA Llama 3.1 — live access to your products, suppliers, leads &amp; tenders
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="success" className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Online
          </Badge>
          <button
            onClick={clearChat}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Clear chat"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chat Area */}
        <div className="lg:col-span-3 flex flex-col" style={{ height: "calc(100vh - 220px)", minHeight: "500px" }}>
          <Card className="flex-1 flex flex-col overflow-hidden">
            {/* Messages */}
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "assistant" && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500/30 to-blue-500/30 border border-cyan-500/30 flex items-center justify-center shrink-0 mt-1">
                      <Bot className="w-4 h-4 text-cyan-400" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      msg.role === "user"
                        ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/20 rounded-tr-sm"
                        : "bg-slate-800/60 border border-white/5 rounded-tl-sm"
                    }`}
                  >
                    {msg.role === "assistant" && (
                      <p className="text-[10px] text-cyan-400 font-medium mb-1.5 uppercase tracking-wider">UpaHealth AI</p>
                    )}
                    <p className="text-sm text-slate-200 whitespace-pre-line leading-relaxed">{msg.content}</p>
                  </div>
                  {msg.role === "user" && (
                    <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center shrink-0 mt-1">
                      <User className="w-4 h-4 text-slate-300" />
                    </div>
                  )}
                </div>
              ))}

              {/* Loading indicator */}
              {loading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500/30 to-blue-500/30 border border-cyan-500/30 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="bg-slate-800/60 border border-white/5 rounded-2xl rounded-tl-sm px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                      <span className="text-xs text-slate-400">Analyzing your data…</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              <div ref={bottomRef} />
            </CardContent>

            {/* Input */}
            <div className="p-4 border-t border-white/5 bg-slate-900/50">
              <div className="flex items-center gap-3">
                <Input
                  ref={inputRef}
                  placeholder="Ask about pricing, suppliers, tenders, export markets…"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                  disabled={loading}
                  className="flex-1"
                />
                <Button onClick={() => sendMessage()} disabled={loading || !input.trim()}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>
              <p className="text-[10px] text-slate-600 mt-2 text-center">
                AI has live access to your products, suppliers, leads and tenders
              </p>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Quick Prompts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {QUICK_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(prompt.text)}
                    disabled={loading}
                    className="w-full flex items-start gap-2 p-2.5 rounded-lg bg-slate-800/30 border border-white/5 hover:border-cyan-500/20 transition-colors text-left disabled:opacity-50"
                  >
                    <prompt.icon className={`w-4 h-4 shrink-0 mt-0.5 ${prompt.color}`} />
                    <span className="text-xs text-slate-300 leading-snug">{prompt.text}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Zap className="w-4 h-4 text-cyan-400" />
                AI Capabilities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1.5 text-xs text-slate-400">
                {[
                  "Live product & pricing data",
                  "Supplier risk scoring",
                  "Quotation pricing strategy",
                  "Export market analysis",
                  "Tender bid recommendations",
                  "Margin optimization",
                  "Demand forecasting",
                  "Competitor intelligence",
                  "Regulatory compliance",
                  "Pipeline analysis",
                ].map((cap) => (
                  <div key={cap} className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-cyan-500" />
                    {cap}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Model Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-slate-400">
              <div className="flex justify-between">
                <span>Model</span>
                <span className="text-white">Llama 3.1 8B</span>
              </div>
              <div className="flex justify-between">
                <span>Provider</span>
                <span className="text-white">NVIDIA NIM</span>
              </div>
              <div className="flex justify-between">
                <span>Context</span>
                <span className="text-white">Live DB data</span>
              </div>
              <div className="flex justify-between">
                <span>Status</span>
                <span className="text-emerald-400">Active</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
