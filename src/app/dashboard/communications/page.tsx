"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Mail, Send, CheckCircle, AlertCircle, Loader2,
  FileText, Clock, RefreshCw, Eye, Inbox, Trash2,
  User, AtSign, ChevronDown, ChevronUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface EmailDraft {
  id: string;
  leadId: string;
  leadName: string;
  toEmail: string;
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
  const [sendStatus, setSendStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [sendResult, setSendResult] = useState<string>("");
  const [drafts, setDrafts] = useState<EmailDraft[]>([]);
  const [loadingDrafts, setLoadingDrafts] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingEmail, setEditingEmail] = useState<Record<string, string>>({});
  const [tab, setTab] = useState<"compose" | "drafts">("compose");
  const [loadedDraftId, setLoadedDraftId] = useState<string | null>(null);

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
    setSendStatus("sending");
    setSendResult("");
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
        setSendStatus("success");
        setSendResult(`Email sent! Message ID: ${data.messageId}`);
        setTo(""); setSubject(""); setMessage(""); setLoadedDraftId(null);
      } else {
        setSendStatus("error");
        setSendResult(data.message || data.error || "Failed to send");
      }
    } catch (err) {
      setSendStatus("error");
      setSendResult((err as Error).message);
    }
  }

  async function deleteDraft(id: string) {
    setDeletingId(id);
    try {
      await fetch(`/api/communications/drafts/${id}`, { method: "DELETE" });
      setDrafts((prev) => prev.filter((d) => d.id !== id));
      if (loadedDraftId === id) {
        setLoadedDraftId(null);
        setSubject(""); setMessage(""); setTo("");
      }
    } finally {
      setDeletingId(null);
    }
  }

  async function updateDraftEmail(id: string, toEmail: string) {
    await fetch(`/api/communications/drafts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toEmail }),
    });
    setDrafts((prev) => prev.map((d) => d.id === id ? { ...d, toEmail } : d));
  }

  function loadDraftIntoCompose(draft: EmailDraft) {
    setSubject(draft.subject);
    setMessage(draft.body);
    setTo(draft.toEmail ?? "");
    setLoadedDraftId(draft.id);
    setTab("compose");
    setSendStatus("idle");
    setSendResult("");
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
          <p className="text-slate-400 mt-1 text-sm">Send emails · Review AI drafts · Manage outreach</p>
        </div>
        <button onClick={loadDrafts} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors" title="Refresh">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-700/50 pb-2">
        {([
          { id: "compose", label: "Compose", icon: Send },
          { id: "drafts", label: `AI Drafts (${drafts.length})`, icon: Inbox },
        ] as const).map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              tab === t.id ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30" : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}>
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {/* ─── COMPOSE TAB ─────────────────────────────────────────── */}
      {tab === "compose" && (
        <>
          {loadedDraftId && (
            <div className="flex items-center gap-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-4 py-2.5">
              <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
              <p className="text-xs text-cyan-300">
                AI draft loaded — review, add recipient email if missing, then click Send.
                <strong className="ml-1">Email will NOT send until you click the button.</strong>
              </p>
              <button onClick={() => { setLoadedDraftId(null); setSubject(""); setMessage(""); setTo(""); }} className="ml-auto text-slate-400 hover:text-white text-xs">✕</button>
            </div>
          )}

          <Card>
            <CardHeader><CardTitle className="text-sm">Compose Email</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleSend} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">To (Recipient Email)</label>
                  <input type="email" value={to} onChange={(e) => setTo(e.target.value)} placeholder="recipient@hospital.com" required
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
                  <Button type="submit" disabled={sendStatus === "sending"}>
                    {sendStatus === "sending" ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</> : <><Send className="w-4 h-4" /> Send Email</>}
                  </Button>
                  <p className="text-[10px] text-slate-500">Only sends when you click this button</p>
                </div>
              </form>
              {sendResult && (
                <div className={`mt-4 flex items-center gap-2 px-4 py-3 rounded-lg text-sm ${sendStatus === "success" ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400" : "bg-red-500/10 border border-red-500/30 text-red-400"}`}>
                  {sendStatus === "success" ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                  {sendResult}
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
                  { emoji: "📋", label: "Quotation Email", sub: "Professional quotation",
                    subject: "Your Quotation from UpaHealth Supplies 📋",
                    body: "Dear Customer,\n\nThank you for choosing UpaHealth Supplies.\n\nPlease find the attached quotation prepared for you. We've ensured competitive pricing with the best quality products.\n\n✅ Competitive pricing\n✅ WHO-GMP & ISO certified products\n✅ Fast delivery across India & exports\n\nThis quotation is valid for 15 days.\n\nWarm regards,\nUpaHealth Supplies Team" },
                  { emoji: "🤝", label: "Follow-up", sub: "Warm check-in",
                    subject: "Quick Follow-up — Still interested? 🤝",
                    body: "Hi,\n\nJust checking in about your medical supply requirements.\n\nWould you like me to:\n• Send an updated quotation?\n• Schedule a quick call?\n• Share our latest product catalog?\n\nBest regards,\nUpaHealth Supplies Team" },
                  { emoji: "🏭", label: "Supplier Inquiry", sub: "Supplier outreach",
                    subject: "Product Inquiry — UpaHealth Supplies",
                    body: "Dear Supplier,\n\nGreetings from UpaHealth Supplies!\n\nWe are interested in your product range. Could you please share:\n📦 Latest product catalog\n💰 Wholesale pricing\n📋 MOQ and lead time\n📜 Certifications (ISO, CE, WHO-GMP)\n\nBest regards,\nUpaHealth Supplies Team" },
                  { emoji: "🎉", label: "Welcome Client", sub: "Onboard new buyer",
                    subject: "Welcome to UpaHealth Supplies! 🎉",
                    body: "Dear Partner,\n\nWelcome aboard!\n\n🌟 Premium Quality — WHO-GMP, ISO 13485 & CE certified\n⚡ Fast Turnaround — 24-48 hours\n💰 Best Pricing — Direct from manufacturers\n🌍 Global Reach — Export to 15+ countries\n\nCheers,\nUpaHealth Supplies Team" },
                  { emoji: "🔥", label: "Special Offer", sub: "Promotional deal",
                    subject: "Exclusive Offer — Limited Time! 🔥",
                    body: "Dear Customer,\n\n🔥 SPECIAL DEAL 🔥\n\n• Up to 15% OFF on bulk orders\n• FREE shipping above ₹50,000\n• Priority delivery 3-5 days\n\n⏰ Valid till end of month!\n\nUpaHealth Supplies Team" },
                  { emoji: "🙏", label: "Order Confirmation", sub: "Thank customer",
                    subject: "Thank You for Your Order! 🙏",
                    body: "Dear Customer,\n\nThank you for your order! 🎊\n\nYour order is confirmed:\n1️⃣ Order Confirmed ✅\n2️⃣ Quality Check — In progress\n3️⃣ Dispatch — Within 24-48 hours\n4️⃣ Delivery — 3-7 business days\n\nUpaHealth Supplies Team" },
                ].map((t) => (
                  <button key={t.label} onClick={() => { setSubject(t.subject); setMessage(t.body); setLoadedDraftId(null); }}
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
            <div>
              <p className="text-sm font-medium text-white">AI-Generated Email Drafts</p>
              <p className="text-xs text-slate-400 mt-0.5">From Lead Gen AI — review, edit recipient, then open to send</p>
            </div>
            <Badge variant="info" className="text-[10px]">Not sent until you click Send</Badge>
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
                <p className="text-xs text-slate-600 mt-1">Go to Lead Gen AI → generate leads → click "Generate Outreach Email"</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {drafts.map((draft) => {
                const isExpanded = expandedId === draft.id;
                const editEmail = editingEmail[draft.id] ?? draft.toEmail;
                return (
                  <Card key={draft.id} className={`transition-all ${loadedDraftId === draft.id ? "border-cyan-500/40" : "hover:border-slate-600"}`}>
                    <CardContent className="p-4">
                      {/* Top row */}
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                          <FileText className="w-4 h-4 text-cyan-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          {/* Lead name + status */}
                          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                            <span className="flex items-center gap-1 text-xs text-slate-400">
                              <User className="w-3 h-3" /> {draft.leadName || "Unknown Lead"}
                            </span>
                            <Badge variant={draft.status === "sent" ? "success" : "default"} className="text-[10px]">
                              {draft.status}
                            </Badge>
                          </div>

                          {/* Recipient email — editable */}
                          <div className="flex items-center gap-2 mb-1">
                            <AtSign className="w-3 h-3 text-slate-500 shrink-0" />
                            <input
                              type="email"
                              value={editEmail}
                              onChange={(e) => setEditingEmail((prev) => ({ ...prev, [draft.id]: e.target.value }))}
                              onBlur={() => {
                                if (editEmail !== draft.toEmail) {
                                  updateDraftEmail(draft.id, editEmail);
                                }
                              }}
                              placeholder="Add recipient email…"
                              className="flex-1 text-xs bg-transparent border-b border-slate-700 text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 py-0.5"
                            />
                          </div>

                          {/* Subject */}
                          <p className="text-sm font-medium text-white truncate">{draft.subject}</p>

                          {/* Date */}
                          <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Clock className="w-2.5 h-2.5" />
                            {new Date(draft.createdAt).toLocaleString("en-IN")}
                            {draft.sentAt && <span className="text-emerald-400 ml-2">Sent {new Date(draft.sentAt).toLocaleDateString("en-IN")}</span>}
                          </p>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : draft.id)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                            title={isExpanded ? "Collapse" : "Preview"}
                          >
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => loadDraftIntoCompose(draft)}
                            className="p-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 transition-colors"
                            title="Open in Compose"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteDraft(draft.id)}
                            disabled={deletingId === draft.id}
                            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors disabled:opacity-50"
                            title="Delete draft"
                          >
                            {deletingId === draft.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      {/* Expanded body preview */}
                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t border-slate-700/50">
                          <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Email Body Preview</p>
                          <div className="text-xs text-slate-300 bg-slate-800/50 rounded-lg px-4 py-3 whitespace-pre-line leading-relaxed max-h-48 overflow-y-auto">
                            {draft.body}
                          </div>
                          <div className="mt-2 flex items-center gap-2">
                            <Button size="sm" variant="outline" onClick={() => loadDraftIntoCompose(draft)}>
                              <Send className="w-3 h-3" /> Open to Send
                            </Button>
                            <p className="text-[10px] text-slate-500">Add recipient email above, then open to send</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
