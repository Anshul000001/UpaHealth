"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Mail, Send, CheckCircle, AlertCircle, Loader2,
  FileText, Clock, RefreshCw, Eye, Inbox,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface EmailDraft {
  id: string;
  leadId: string;
  subject: string;
  body: string;
  status: string;
  sentAt: string | null;
  createdAt: string;
}

export default function CommunicationsPage() {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [result, setResult] = useState<string>("");
  const [drafts, setDrafts] = useState<EmailDraft[]>([]);
  const [loadingDrafts, setLoadingDrafts] = useState(false);
  const [selectedDraft, setSelectedDraft] = useState<EmailDraft | null>(null);
  const [tab, setTab] = useState<"compose" | "drafts">("compose");

  const loadDrafts = useCallback(async () => {
    setLoadingDrafts(true);
    try {
      const res = await fetch("/api/communications/drafts");
      const data = await res.json();
      if (data.success) setDrafts(data.data);
    } catch { /* ignore */ }
    finally { setLoadingDrafts(false); }
  }, []);

  useEffect(() => { loadDrafts(); }, [loadDrafts]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setResult("");
    try {
      const res = await fetch("/api/communications/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to, subject,
          html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto"><div style="background:#0f766e;padding:20px;text-align:center"><h1 style="color:white;margin:0">UpaHealth Supplies</h1><p style="color:#ccfbf1;margin:5px 0 0">Your Path to Wellness</p></div><div style="padding:30px;background:#f9fafb"><p>${message.replace(/\n/g, "<br/>")}</p><p style="margin-top:30px;color:#6b7280;font-size:14px">Sent from UpaHealth CRM<br/><a href="https://www.upahealthsupplies.com">www.upahealthsupplies.com</a></p></div></div>`,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("success");
        setResult(`Email sent! Message ID: ${data.messageId}`);
        setTo(""); setSubject(""); setMessage("");
      } else {
        setStatus("error");
        setResult(data.message || data.error || "Failed to send");
      }
    } catch (err) {
      setStatus("error");
      setResult((err as Error).message);
    }
  }

  function loadDraftIntoCompose(draft: EmailDraft) {
    setSubject(draft.subject);
    setMessage(draft.body);
    setSelectedDraft(draft);
    setTab("compose");
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30">
              <Mail className="w-6 h-6 text-cyan-400" />
            </div>
            Communications
          </h1>
          <p className="text-slate-400 mt-1 text-sm">Send emails · View AI-drafted outreach · Manage templates</p>
        </div>
        <button onClick={loadDrafts} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-700/50 pb-2">
        {([
          { id: "compose", label: "Compose", icon: Send },
          { id: "drafts", label: `AI Drafts (${drafts.length})`, icon: Inbox },
        ] as const).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              tab === t.id
                ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {/* ─── COMPOSE TAB ─────────────────────────────────────────── */}
      {tab === "compose" && (
        <>
          {selectedDraft && (
            <div className="flex items-center gap-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-4 py-2.5">
              <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
              <p className="text-xs text-cyan-300">
                AI draft loaded from Lead Gen — review and edit before sending. Email will NOT be sent until you click Send.
              </p>
              <button onClick={() => setSelectedDraft(null)} className="ml-auto text-slate-400 hover:text-white text-xs">✕</button>
            </div>
          )}

          <Card>
            <CardHeader><CardTitle className="text-sm">Compose Email</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleSend} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">To</label>
                  <input type="email" value={to} onChange={(e) => setTo(e.target.value)} placeholder="recipient@example.com" required
                    className="w-full px-4 py-2.5 rounded-lg bg-slate-800/50 border border-slate-700/50 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Subject</label>
                  <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Email subject" required
                    className="w-full px-4 py-2.5 rounded-lg bg-slate-800/50 border border-slate-700/50 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Message</label>
                  <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Write your message here..." required rows={8}
                    className="w-full px-4 py-2.5 rounded-lg bg-slate-800/50 border border-slate-700/50 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none" />
                </div>
                <div className="flex items-center gap-3">
                  <button type="submit" disabled={status === "sending"}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium hover:from-cyan-400 hover:to-blue-500 transition-all disabled:opacity-50">
                    {status === "sending" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {status === "sending" ? "Sending..." : "Send Email"}
                  </button>
                  <p className="text-[10px] text-slate-500">Email will only send when you click this button</p>
                </div>
              </form>
              {result && (
                <div className={`mt-4 flex items-center gap-2 px-4 py-3 rounded-lg text-sm ${status === "success" ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400" : "bg-red-500/10 border border-red-500/30 text-red-400"}`}>
                  {status === "success" ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                  {result}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Templates */}
          <Card>
            <CardHeader><CardTitle className="text-sm">Quick Templates</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { emoji: "📋", label: "Quotation Email", sub: "Professional quotation with trust signals",
                    subject: "Your Quotation from UpaHealth Supplies 📋",
                    body: "Dear Customer,\n\nThank you for choosing UpaHealth Supplies.\n\nPlease find the attached quotation prepared for you. We've ensured competitive pricing with the best quality products.\n\n✅ Competitive pricing\n✅ WHO-GMP & ISO certified products\n✅ Fast delivery across India & exports\n\nThis quotation is valid for 15 days.\n\nWarm regards,\nUpaHealth Supplies Team" },
                  { emoji: "🤝", label: "Follow-up", sub: "Warm check-in with action options",
                    subject: "Quick Follow-up — Still interested? 🤝",
                    body: "Hi,\n\nJust checking in! We spoke recently about your medical supply requirements.\n\nWould you like me to:\n• Send an updated quotation?\n• Schedule a quick call?\n• Share our latest product catalog?\n\nBest regards,\nUpaHealth Supplies Team" },
                  { emoji: "🏭", label: "Supplier Inquiry", sub: "Professional supplier outreach",
                    subject: "Product Inquiry — UpaHealth Supplies",
                    body: "Dear Supplier,\n\nGreetings from UpaHealth Supplies!\n\nWe are interested in your product range. Could you please share:\n📦 Latest product catalog\n💰 Wholesale pricing\n📋 MOQ and lead time\n📜 Certifications (ISO, CE, WHO-GMP)\n\nBest regards,\nUpaHealth Supplies Team" },
                  { emoji: "🎉", label: "Welcome Client", sub: "Onboard a new buyer",
                    subject: "Welcome to UpaHealth Supplies! 🎉",
                    body: "Dear Partner,\n\nWelcome aboard! We're thrilled to have you.\n\n🌟 Premium Quality — WHO-GMP, ISO 13485 & CE certified\n⚡ Fast Turnaround — 24-48 hours\n💰 Best Pricing — Direct from manufacturers\n🌍 Global Reach — Export to 15+ countries\n\nCheers,\nUpaHealth Supplies Team" },
                  { emoji: "🔥", label: "Special Offer", sub: "Promotional deal",
                    subject: "Exclusive Offer — Limited Time! 🔥",
                    body: "Dear Customer,\n\n🔥 SPECIAL DEAL 🔥\n\n• Up to 15% OFF on bulk orders\n• FREE shipping above ₹50,000\n• Priority delivery 3-5 days\n\n⏰ Valid till end of month!\n\nUpaHealth Supplies Team" },
                  { emoji: "🙏", label: "Order Confirmation", sub: "Thank customer after order",
                    subject: "Thank You for Your Order! 🙏",
                    body: "Dear Customer,\n\nThank you for your order! 🎊\n\nYour order is confirmed and being processed:\n1️⃣ Order Confirmed ✅\n2️⃣ Quality Check — In progress\n3️⃣ Dispatch — Within 24-48 hours\n4️⃣ Delivery — 3-7 business days\n\nUpaHealth Supplies Team" },
                ].map((t) => (
                  <button key={t.label} onClick={() => { setSubject(t.subject); setMessage(t.body); }}
                    className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 text-left hover:border-cyan-500/30 hover:bg-slate-800 transition-all group">
                    <div className="flex items-center gap-2 mb-1">
                      <span>{t.emoji}</span>
                      <p className="text-sm font-medium text-white group-hover:text-cyan-300 transition-colors">{t.label}</p>
                    </div>
                    <p className="text-xs text-slate-500">{t.sub}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* ─── DRAFTS TAB ───────────────────────────────────────────── */}
      {tab === "drafts" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400">AI-generated outreach emails from Lead Gen — review before sending</p>
            <Badge variant="info" className="text-[10px]">Drafts only — not sent</Badge>
          </div>

          {loadingDrafts ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
            </div>
          ) : drafts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Inbox className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No email drafts yet</p>
                <p className="text-xs text-slate-600 mt-1">Generate leads in Lead Gen AI and click "Generate Outreach Email" to create drafts</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {drafts.map((draft) => (
                <Card key={draft.id} className="hover:border-cyan-500/30 transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <FileText className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          <p className="text-sm font-medium text-white truncate">{draft.subject}</p>
                          <Badge variant={draft.status === "sent" ? "success" : "default"} className="text-[10px] shrink-0">
                            {draft.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-2 mb-2">{draft.body.slice(0, 120)}…</p>
                        <div className="flex items-center gap-3 text-[10px] text-slate-500">
                          <span className="flex items-center gap-1"><Clock className="w-2.5 h-2.5" />{new Date(draft.createdAt).toLocaleString("en-IN")}</span>
                          {draft.sentAt && <span className="text-emerald-400">Sent {new Date(draft.sentAt).toLocaleDateString("en-IN")}</span>}
                        </div>
                      </div>
                      <button
                        onClick={() => loadDraftIntoCompose(draft)}
                        className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 hover:text-white transition-colors"
                      >
                        <Eye className="w-3 h-3" /> Open
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
