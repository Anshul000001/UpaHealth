"use client";

import { useState, useRef, useEffect } from "react";
import {
  Send, Bot, User, Loader2, Sparkles, CheckCircle2,
  AlertCircle, Wand2, Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ParsedItem {
  name: string;
  category: string;
  quantity: number;
  unit: string;
  specifications: string;
  matchedProductId?: string;
  matchedProductName?: string;
  matchedSku?: string;
  sellingPrice?: number;
  exportPrice?: number;
  moq?: number;
  confidence: "high" | "medium" | "low";
}

interface AIResponse {
  buyerName: string;
  buyerType: string;
  items: ParsedItem[];
  summary: string;
  totalEstimate: { inr: number; usd: number };
  suggestions: string[];
  rawResponse?: string;
}

interface ChatMessage {
  role: "user" | "ai";
  content: string;
  data?: AIResponse;
  timestamp: Date;
}

interface CatalogAIChatProps {
  onAddItems: (items: ParsedItem[]) => void;
  onSetBuyer: (name: string) => void;
}

const QUICK_PROMPTS = [
  "ABC Hospital wants 1000 IV cannulas 20G and 500 PPE kits",
  "Government tender for 5000 surgical gloves and 200 oxygen masks",
  "Distributor needs Foley catheters, urine bags, and surgical drapes",
  "Build catalog for emergency response: gloves, masks, syringes, IV sets",
];

export function CatalogAIChat({ onAddItems, onSetBuyer }: CatalogAIChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "ai",
      content: "Hi! Tell me what your buyer needs in plain English. I'll automatically build the catalog selection for you. Example: \"XYZ Hospital wants IV cannula and PPE kit\"",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = {
      role: "user",
      content: text,
      timestamp: new Date(),
    };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/catalog-auto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      const result = await res.json();

      if (result.success) {
        const data: AIResponse = result.data;
        const aiMsg: ChatMessage = {
          role: "ai",
          content: data.summary || `Found ${data.items.length} items`,
          data,
          timestamp: new Date(),
        };
        setMessages((m) => [...m, aiMsg]);

        // Auto set buyer name if extracted
        if (data.buyerName && data.buyerName !== "Unknown") {
          onSetBuyer(data.buyerName);
        }
      } else {
        setMessages((m) => [
          ...m,
          {
            role: "ai",
            content: result.error?.message || "Something went wrong. Try again.",
            timestamp: new Date(),
          },
        ]);
      }
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: "ai",
          content: "Network error. Please check your connection and try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  function addAllMatched(items: ParsedItem[]) {
    const matched = items.filter((i) => i.matchedProductId);
    if (matched.length > 0) {
      onAddItems(matched);
    }
  }

  return (
    <Card className="border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-cyan-500/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center">
              <Wand2 className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <span className="text-white">AI Catalog Builder</span>
              <p className="text-[10px] text-slate-400 font-normal mt-0.5">
                Describe what you need, AI builds the catalog automatically
              </p>
            </div>
          </CardTitle>
          <Badge variant="info" className="text-[10px]">
            <Zap className="w-2.5 h-2.5 mr-1" /> NVIDIA AI
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        {/* Messages */}
        <div className="h-72 overflow-y-auto space-y-3 mb-3 pr-1">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "ai" && (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500/30 to-cyan-500/30 flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5 text-purple-300" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-xl px-3 py-2 ${
                  msg.role === "user"
                    ? "bg-cyan-500/15 border border-cyan-500/30 text-cyan-50"
                    : "bg-slate-800/50 border border-white/[0.06] text-slate-200"
                }`}
              >
                <p className="text-xs leading-relaxed whitespace-pre-wrap">
                  {msg.content}
                </p>

                {/* AI Response with parsed items */}
                {msg.data && msg.data.items.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {/* Buyer info */}
                    {msg.data.buyerName !== "Unknown" && (
                      <div className="flex items-center gap-1.5 text-[10px] text-purple-300">
                        <Sparkles className="w-3 h-3" />
                        Buyer: <span className="font-semibold">{msg.data.buyerName}</span>
                        <Badge variant="info" className="text-[9px]">{msg.data.buyerType}</Badge>
                      </div>
                    )}

                    {/* Items list */}
                    <div className="space-y-1.5">
                      {msg.data.items.map((item, idx) => (
                        <div
                          key={idx}
                          className={`p-2 rounded-lg border text-[11px] ${
                            item.matchedProductId
                              ? "bg-emerald-500/5 border-emerald-500/20"
                              : "bg-amber-500/5 border-amber-500/20"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {item.matchedProductId ? (
                                  <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                                ) : (
                                  <AlertCircle className="w-3 h-3 text-amber-400 shrink-0" />
                                )}
                                <span className="font-semibold text-white">
                                  {item.matchedProductName || item.name}
                                </span>
                                {item.matchedSku && (
                                  <span className="text-[9px] text-slate-500">
                                    {item.matchedSku}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-1 flex-wrap text-[10px] text-slate-400">
                                <span>Qty: {item.quantity.toLocaleString()} {item.unit}s</span>
                                {item.sellingPrice ? (
                                  <span className="text-emerald-400">
                                    ₹{item.sellingPrice} / ${item.exportPrice}
                                  </span>
                                ) : (
                                  <span className="text-amber-400">Not in DB</span>
                                )}
                                <Badge
                                  variant={
                                    item.confidence === "high"
                                      ? "success"
                                      : item.confidence === "medium"
                                      ? "warning"
                                      : "danger"
                                  }
                                  className="text-[9px]"
                                >
                                  {item.confidence}
                                </Badge>
                              </div>
                              {item.specifications && (
                                <p className="text-[10px] text-slate-500 mt-0.5">
                                  {item.specifications}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Total estimate */}
                    {(msg.data.totalEstimate.inr > 0 || msg.data.totalEstimate.usd > 0) && (
                      <div className="flex items-center justify-between p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                        <span className="text-[10px] text-slate-400">Estimated Total</span>
                        <div className="text-right">
                          <p className="text-xs font-bold text-white">
                            ₹{msg.data.totalEstimate.inr.toLocaleString()}
                          </p>
                          <p className="text-[10px] text-emerald-400">
                            ${msg.data.totalEstimate.usd.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Suggestions */}
                    {msg.data.suggestions && msg.data.suggestions.length > 0 && (
                      <div className="text-[10px] text-slate-400 italic">
                        💡 {msg.data.suggestions[0]}
                      </div>
                    )}

                    {/* Add to catalog button */}
                    {msg.data.items.some((i) => i.matchedProductId) && (
                      <Button
                        size="sm"
                        onClick={() => addAllMatched(msg.data!.items)}
                        className="w-full mt-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Add {msg.data.items.filter((i) => i.matchedProductId).length} matched items to catalog
                      </Button>
                    )}
                  </div>
                )}

                <p className="text-[9px] text-slate-500 mt-1">
                  {msg.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>

              {msg.role === "user" && (
                <div className="w-7 h-7 rounded-full bg-cyan-500/20 flex items-center justify-center shrink-0">
                  <User className="w-3.5 h-3.5 text-cyan-300" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-2 justify-start">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500/30 to-cyan-500/30 flex items-center justify-center shrink-0">
                <Bot className="w-3.5 h-3.5 text-purple-300" />
              </div>
              <div className="bg-slate-800/50 border border-white/[0.06] rounded-xl px-3 py-2">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Analyzing your request...
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick prompts */}
        {messages.length <= 1 && (
          <div className="mb-3">
            <p className="text-[10px] text-slate-500 mb-1.5 uppercase tracking-wider">
              Try these examples:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  disabled={loading}
                  className="text-[10px] px-2 py-1 rounded-full bg-slate-800/50 border border-slate-700 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30 transition-colors"
                >
                  {prompt.length > 50 ? prompt.slice(0, 50) + "..." : prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. XYZ Hospital wants IV cannula and PPE kit..."
            disabled={loading}
            className="flex-1 px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500/50 transition-colors disabled:opacity-50"
          />
          <Button
            type="submit"
            disabled={loading || !input.trim()}
            size="sm"
            className="shrink-0 bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600"
          >
            {loading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
