"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Mail, Send, CheckCircle, AlertCircle, Loader2,
  FileText, Clock, RefreshCw, Eye, Inbox, Trash2,
  User, AtSign, ChevronDown, ChevronUp, Sparkles,
  Archive, SendHorizonal, BookmarkPlus,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

interface SentEmail {
  id: string;
  to: string;
  subject: string;
  status: string;
  template: string | null;
  sentAt: string;
  errorMsg: string | null;
}

interface SavedEmail {
  id: string;
  to: string;
  subject: string;
  body: string;
  savedAt: string;
}

export default function CommunicationsPage() {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sendStatus, setSendStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [sendResult, setSendResult] = useState<string>("");
  const [drafts, setDrafts] = useState<EmailDraft[]>([]);
  const [sentEmails, setSentEmails] = useState<SentEmail[]>([]);
  const [savedEmails, setSavedEmails] = useState<SavedEmail[]>([]);
  const [loadingDrafts, setLoadingDrafts] = useState(false);
  const [loadingSent, setLoadingSent] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingEmail, setEditingEmail] = useState<Record<string, string>>({});
  const [tab, setTab] = useState<"compose" | "drafts" | "sent" | "saved">("compose");
  const [loadedDraftId, setLoadedDraftId] = useState<string | null>(null);
  const [aiContext, setAiContext] = useState("");
  const [aiType, setAiType] = useState("outreach");
  const [aiLoading, setAiLoading] = useState(false);

  const loadDrafts = useCallback(async () => {
    setLoadingDrafts(true);
    try {
      const res = await fetch("/api/communications/drafts");
      const data = await res.json();
      if (data.success) setDrafts(data.data);
    } catch { /* ignore */ }
    finally { setLoadingDrafts(false); }
  }, []);

  const loadSent = useCallback(async () => {
    setLoadingSent(true);
    try {
      const res = await fetch("/api/communications/history");
      const data = await res.json();
      if (data.success) setSentEmails(data.data);
    } catch { /* ignore */ }
    finally { setLoadingSent(false); }
  }, []);

  const loadSaved = useCallback(() => {
    try {
      const raw = localStorage.getItem("upahealth_saved_emails");
      if (raw) setSavedEmails(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { loadDrafts(); loadSent(); loadSaved(); }, [loadDrafts, loadSent, loadSaved]);

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
        loadSent(); // Refresh sent list
      } else {
        setSendStatus("error");
        setSendResult(data.message || data.error || "Failed to send");
      }
    } catch (err) {
      setSendStatus("error");
      setSendResult((err as Error).message);
    }
  }

  function handleSave() {
    if (!subject.trim() && !message.trim()) return;
    const saved: SavedEmail = {
      id: `saved-${Date.now()}`,
      to: to || "Not specified",
      subject: subject || "(No subject)",
      body: message,
      savedAt: new Date().toISOString(),
    };
    const updated = [saved, ...savedEmails];
    setSavedEmails(updated);
    localStorage.setItem("upahealth_saved_emails", JSON.stringify(updated));
    setSendResult("Email saved to drafts!");
    setSendStatus("success");
  }

  function deleteSaved(id: string) {
    const updated = savedEmails.filter(e => e.id !== id);
    setSavedEmails(updated);
    localStorage.setItem("upahealth_saved_emails", JSON.stringify(updated));
  }

  function loadSavedIntoCompose(email: SavedEmail) {
    setTo(email.to === "Not specified" ? "" : email.to);
    setSubject(email.subject);
    setMessage(email.body);
    setTab("compose");
    setSendStatus("idle");
    setSendResult("");
  }

  async function deleteDraft(id: string) {
    setDeletingId(id);
    try {
      await fetch(`/api/communications/drafts/${id}`, { method: "DELETE" });
      setDrafts((prev) => prev.filter((d) => d.id !== id));
    } finally { setDeletingId(null); }
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

  async function aiCompose() {
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/compose-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, context: aiContext, type: aiType }),
      });
      const data = await res.json();
      if (data.success) { setSubject(data.data.subject); setMessage(data.data.body); }
    } finally { setAiLoading(false); }
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
          <p className="text-slate-400 mt-1 text-sm">Compose · AI Drafts · Sent History · Saved</p>
        </div>
        <button onClick={() => { loadDrafts(); loadSent(); }} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors" title="Refresh">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-700/50 pb-2 overflow-x-auto">
        {([
          { id: "compose", label: "Compose", icon: Send, count: null },
          { id: "drafts", label: "AI Drafts", icon: Inbox, count: drafts.length },
          { id: "sent", label: "Sent", icon: SendHorizonal, count: sentEmails.length },
          { id: "saved", label: "Saved", icon: Archive, count: savedEmails.length },
        ] as const).map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
              tab === t.id ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30" : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}>
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
            {t.count !== null && t.count > 0 && (
              <span className="ml-1 text-[10px] bg-slate-700 px-1.5 py-0.5 rounded-full">{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* ─── COMPOSE TAB ─────────────────────────────────────────── */}
      {tab === "compose" && (
        <>
          {loadedDraftId && (
            <div className="flex items-center gap-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-4 py-2.5">
              <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
              <p className="text-xs text-cyan-300">AI draft loaded — review, edit, then Send or Save.</p>
              <button onClick={() => { setLoadedDraftId(null); setSubject(""); setMessage(""); setTo(""); }} className="ml-auto text-slate-400 hover:text-white text-xs">✕</button>
            </div>
          )}

          {/* NVIDIA AI Compose */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <p className="text-sm font-medium text-cyan-300">NVIDIA AI Email Writer</p>
                <Badge variant="success" className="text-[10px] ml-auto">Llama 3.1</Badge>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                <div className="sm:col-span-2">
                  <Input value={aiContext} onChange={(e) => setAiContext(e.target.value)} placeholder="Context: e.g. Hospital in Kenya interested in IV sets..." />
                </div>
                <select value={aiType} onChange={(e) => setAiType(e.target.value)}
                  className="w-full rounded-lg border border-slate-600/50 bg-slate-800/50 px-3 py-2.5 text-sm text-white focus:border-cyan-500/50 focus:outline-none">
                  <option value="outreach">Cold Outreach</option>
                  <option value="followup">Follow-up</option>
                  <option value="quotation">Quotation</option>
                  <option value="supplier">Supplier Inquiry</option>
                  <option value="tender">Tender Response</option>
                </select>
              </div>
              <Button size="sm" variant="outline" onClick={aiCompose} disabled={aiLoading}>
                {aiLoading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Writing…</> : <><Sparkles className="w-3.5 h-3.5" /> Generate with AI</>}
              </Button>
            </CardContent>
          </Card>

          {/* Compose Form */}
          <Card>
            <CardHeader><CardTitle className="text-sm">Compose Email</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleSend} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">To</label>
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
                  <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Write your message..." required rows={8}
                    className="w-full px-4 py-2.5 rounded-lg bg-slate-800/50 border border-slate-700/50 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none" />
                </div>
                <div className="flex items-center gap-3">
                  <Button type="submit" disabled={sendStatus === "sending"}>
                    {sendStatus === "sending" ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</> : <><Send className="w-4 h-4" /> Send Email</>}
                  </Button>
                  <Button type="button" variant="secondary" onClick={handleSave}>
                    <BookmarkPlus className="w-4 h-4" /> Save Draft
                  </Button>
                  <p className="text-[10px] text-slate-500">Send requires your permission</p>
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
        </>
      )}

      {/* ─── AI DRAFTS TAB ────────────────────────────────────────── */}
      {tab === "drafts" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400">AI-generated outreach emails from Lead Gen — review before sending</p>
            <Badge variant="info" className="text-[10px]">Not sent until you click Send</Badge>
          </div>
          {loadingDrafts ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-cyan-400" /></div>
          ) : drafts.length === 0 ? (
            <Card><CardContent className="py-12 text-center"><Inbox className="w-8 h-8 text-slate-700 mx-auto mb-2" /><p className="text-sm text-slate-500">No AI drafts yet</p><p className="text-xs text-slate-600 mt-1">Go to Lead Gen AI → generate leads → click "Generate Outreach Email"</p></CardContent></Card>
          ) : (
            <div className="space-y-2">
              {drafts.map((draft) => {
                const isExpanded = expandedId === draft.id;
                const editEmail = editingEmail[draft.id] ?? draft.toEmail;
                return (
                  <Card key={draft.id} className="transition-all hover:border-slate-600">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                          <FileText className="w-4 h-4 text-cyan-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                            <span className="flex items-center gap-1 text-xs text-slate-400"><User className="w-3 h-3" /> {draft.leadName || "Unknown"}</span>
                            <Badge variant={draft.status === "sent" ? "success" : "default"} className="text-[10px]">{draft.status}</Badge>
                          </div>
                          <div className="flex items-center gap-2 mb-1">
                            <AtSign className="w-3 h-3 text-slate-500 shrink-0" />
                            <input type="email" value={editEmail}
                              onChange={(e) => setEditingEmail((prev) => ({ ...prev, [draft.id]: e.target.value }))}
                              onBlur={() => { if (editEmail !== draft.toEmail) updateDraftEmail(draft.id, editEmail); }}
                              placeholder="Add recipient email…"
                              className="flex-1 text-xs bg-transparent border-b border-slate-700 text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 py-0.5" />
                          </div>
                          <p className="text-sm font-medium text-white truncate">{draft.subject}</p>
                          <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5"><Clock className="w-2.5 h-2.5" />{new Date(draft.createdAt).toLocaleString("en-IN")}</p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button onClick={() => setExpandedId(isExpanded ? null : draft.id)} className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors">
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                          <button onClick={() => loadDraftIntoCompose(draft)} className="p-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 transition-colors"><Eye className="w-3.5 h-3.5" /></button>
                          <button onClick={() => deleteDraft(draft.id)} disabled={deletingId === draft.id} className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors disabled:opacity-50">
                            {deletingId === draft.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t border-slate-700/50">
                          <div className="text-xs text-slate-300 bg-slate-800/50 rounded-lg px-4 py-3 whitespace-pre-line leading-relaxed max-h-48 overflow-y-auto">{draft.body}</div>
                          <Button size="sm" variant="outline" onClick={() => loadDraftIntoCompose(draft)} className="mt-2"><Send className="w-3 h-3" /> Open to Send</Button>
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

      {/* ─── SENT TAB ─────────────────────────────────────────────── */}
      {tab === "sent" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400">All emails sent from this platform</p>
            <button onClick={loadSent} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"><RefreshCw className="w-3.5 h-3.5" /></button>
          </div>
          {loadingSent ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-cyan-400" /></div>
          ) : sentEmails.length === 0 ? (
            <Card><CardContent className="py-12 text-center"><SendHorizonal className="w-8 h-8 text-slate-700 mx-auto mb-2" /><p className="text-sm text-slate-500">No emails sent yet</p><p className="text-xs text-slate-600 mt-1">Sent emails will appear here after you send from Compose</p></CardContent></Card>
          ) : (
            <div className="space-y-2">
              {sentEmails.map((email) => (
                <Card key={email.id} className="hover:border-slate-600 transition-all">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">{email.subject}</p>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-xs text-slate-400 flex items-center gap-1"><AtSign className="w-3 h-3" /> {email.to}</span>
                          <span className="text-[10px] text-slate-500 flex items-center gap-1"><Clock className="w-2.5 h-2.5" /> {new Date(email.sentAt).toLocaleString("en-IN")}</span>
                        </div>
                      </div>
                    </div>
                    <Badge variant={email.status === "sent" ? "success" : email.status === "failed" ? "danger" : "default"} className="text-[10px] shrink-0">
                      {email.status}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── SAVED TAB ────────────────────────────────────────────── */}
      {tab === "saved" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400">Manually saved email drafts (stored locally)</p>
            <Badge variant="default" className="text-[10px]">{savedEmails.length} saved</Badge>
          </div>
          {savedEmails.length === 0 ? (
            <Card><CardContent className="py-12 text-center"><Archive className="w-8 h-8 text-slate-700 mx-auto mb-2" /><p className="text-sm text-slate-500">No saved emails</p><p className="text-xs text-slate-600 mt-1">Click "Save Draft" in Compose to save emails here</p></CardContent></Card>
          ) : (
            <div className="space-y-2">
              {savedEmails.map((email) => (
                <Card key={email.id} className="hover:border-slate-600 transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                          <Archive className="w-4 h-4 text-amber-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white truncate">{email.subject}</p>
                          <div className="flex items-center gap-3 mt-0.5">
                            <span className="text-xs text-slate-400">To: {email.to}</span>
                            <span className="text-[10px] text-slate-500">{new Date(email.savedAt).toLocaleString("en-IN")}</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2">{email.body.slice(0, 100)}…</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button onClick={() => loadSavedIntoCompose(email)} className="p-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 transition-colors" title="Open"><Eye className="w-3.5 h-3.5" /></button>
                        <button onClick={() => deleteSaved(email.id)} className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
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
