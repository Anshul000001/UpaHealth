"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Mail, Send, Inbox, Star, Archive, Trash2, Search,
  RefreshCw, Loader2, ChevronLeft, Paperclip, Download,
  FileText, Eye, X, Plus, Upload, FolderOpen, Share2,
  Clock, CheckCircle, AlertCircle, MessageSquare,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Types
interface MailMessage {
  id: string;
  threadId: string | null;
  direction: "inbound" | "outbound";
  from: string;
  fromName: string | null;
  to: string;
  toName: string | null;
  subject: string;
  snippet: string | null;
  bodyText?: string | null;
  bodyHtml?: string | null;
  status: string;
  starred: boolean;
  labels: string[];
  relatedType: string | null;
  relatedId: string | null;
  sentAt: string;
  readAt: string | null;
  attachments: FileItem[];
}

interface FileItem {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  description?: string | null;
  category: string;
  sharedWith?: string[];
  downloadCount?: number;
  createdAt: string;
}

interface MailCounts {
  unread: number;
  starred: number;
  sent: number;
}

type Folder = "inbox" | "sent" | "starred" | "archived" | "trash";
type Tab = "mail" | "files";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(date: string): string {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 86400000) return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  if (diff < 604800000) return d.toLocaleDateString("en-IN", { weekday: "short" });
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

function fileToBase64(file: globalThis.File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function getCategoryIcon(category: string) {
  switch (category) {
    case "pdf": return "📄";
    case "catalog": return "📚";
    case "quotation": return "💰";
    case "brochure": return "📋";
    case "certificate": return "🏅";
    default: return "📎";
  }
}

export default function MailboxPage() {
  // State
  const [tab, setTab] = useState<Tab>("mail");
  const [folder, setFolder] = useState<Folder>("inbox");
  const [messages, setMessages] = useState<MailMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<MailMessage | null>(null);
  const [counts, setCounts] = useState<MailCounts>({ unread: 0, starred: 0, sent: 0 });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [showCompose, setShowCompose] = useState(false);

  // Compose state
  const [composeTo, setComposeTo] = useState("");
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState("");
  const [composeSending, setComposeSending] = useState(false);
  const [composeFiles, setComposeFiles] = useState<string[]>([]);

  // Files state
  const [files, setFiles] = useState<FileItem[]>([]);
  const [filesLoading, setFilesLoading] = useState(false);
  const [fileCategory, setFileCategory] = useState("all");
  const [uploading, setUploading] = useState(false);
  const [shareEmail, setShareEmail] = useState("");
  const [sharingFileId, setSharingFileId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const composeFileInputRef = useRef<HTMLInputElement>(null);

  // Load messages
  const loadMessages = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ folder, ...(search ? { search } : {}) });
      const res = await fetch(`/api/mailbox?${params}`);
      const data = await res.json();
      if (data.success) {
        setMessages(data.data);
        setCounts(data.counts);
      }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [folder, search]);

  // Load files
  const loadFiles = useCallback(async () => {
    setFilesLoading(true);
    try {
      const params = new URLSearchParams({ ...(fileCategory !== "all" ? { category: fileCategory } : {}) });
      const res = await fetch(`/api/mailbox/files?${params}`);
      const data = await res.json();
      if (data.success) setFiles(data.data);
    } catch { /* ignore */ }
    finally { setFilesLoading(false); }
  }, [fileCategory]);

  useEffect(() => { loadMessages(); }, [loadMessages]);
  useEffect(() => { if (tab === "files") loadFiles(); }, [tab, loadFiles]);

  // Open message detail
  async function openMessage(msg: MailMessage) {
    try {
      const res = await fetch(`/api/mailbox/${msg.id}`);
      const data = await res.json();
      if (data.success) {
        setSelectedMessage(data.data);
        // Update list to show as read
        setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, status: "read" } : m));
        if (msg.status === "unread") {
          setCounts((c) => ({ ...c, unread: Math.max(0, c.unread - 1) }));
        }
      }
    } catch { /* ignore */ }
  }

  // Toggle star
  async function toggleStar(id: string, currentStarred: boolean) {
    await fetch(`/api/mailbox/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ starred: !currentStarred }),
    });
    setMessages((prev) => prev.map((m) => m.id === id ? { ...m, starred: !currentStarred } : m));
    if (selectedMessage?.id === id) setSelectedMessage({ ...selectedMessage, starred: !currentStarred });
  }

  // Archive / Trash
  async function updateStatus(id: string, status: string) {
    await fetch(`/api/mailbox/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setMessages((prev) => prev.filter((m) => m.id !== id));
    if (selectedMessage?.id === id) setSelectedMessage(null);
  }

  // Send email
  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setComposeSending(true);
    try {
      const res = await fetch("/api/mailbox/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: composeTo,
          subject: composeSubject,
          bodyText: composeBody,
          attachmentIds: composeFiles.length > 0 ? composeFiles : undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowCompose(false);
        setComposeTo(""); setComposeSubject(""); setComposeBody(""); setComposeFiles([]);
        loadMessages();
      }
    } catch { /* ignore */ }
    finally { setComposeSending(false); }
  }

  // Upload file
  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>, forCompose = false) {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;
    setUploading(true);

    for (const file of Array.from(fileList)) {
      if (file.size > 10 * 1024 * 1024) {
        alert(`${file.name} exceeds 10MB limit.`);
        continue;
      }
      try {
        const base64 = await fileToBase64(file);
        const res = await fetch("/api/mailbox/files", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filename: file.name, mimeType: file.type, data: base64 }),
        });
        const data = await res.json();
        if (data.success) {
          if (forCompose) {
            setComposeFiles((prev) => [...prev, data.data.id]);
          }
          loadFiles();
        }
      } catch { /* ignore */ }
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (composeFileInputRef.current) composeFileInputRef.current.value = "";
  }

  // Download file
  async function downloadFile(id: string, filename: string) {
    const res = await fetch(`/api/mailbox/files/${id}`);
    const data = await res.json();
    if (data.success) {
      const blob = new Blob([Uint8Array.from(atob(data.data.data), (c) => c.charCodeAt(0))], { type: data.data.mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = filename; a.click();
      URL.revokeObjectURL(url);
    }
  }

  // Share file with customer
  async function shareFile(fileId: string) {
    if (!shareEmail.trim()) return;
    await fetch(`/api/mailbox/files/${fileId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sharedWith: [shareEmail] }),
    });
    setShareEmail("");
    setSharingFileId(null);
    loadFiles();
  }

  // Delete file
  async function deleteFile(id: string) {
    await fetch(`/api/mailbox/files/${id}`, { method: "DELETE" });
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }

  // Folders config
  const folders: { id: Folder; label: string; icon: typeof Inbox; count?: number }[] = [
    { id: "inbox", label: "Inbox", icon: Inbox, count: counts.unread || undefined },
    { id: "sent", label: "Sent", icon: Send, count: counts.sent || undefined },
    { id: "starred", label: "Starred", icon: Star, count: counts.starred || undefined },
    { id: "archived", label: "Archived", icon: Archive },
    { id: "trash", label: "Trash", icon: Trash2 },
  ];

  const fileCategories = [
    { id: "all", label: "All Files" },
    { id: "pdf", label: "PDFs" },
    { id: "catalog", label: "Catalogs" },
    { id: "quotation", label: "Quotations" },
    { id: "brochure", label: "Brochures" },
    { id: "certificate", label: "Certificates" },
  ];

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30">
              <Mail className="w-6 h-6 text-cyan-400" />
            </div>
            Mailbox
          </h1>
          <p className="text-slate-400 mt-1 text-sm">Email conversations, file sharing & customer engagement</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { loadMessages(); loadFiles(); }} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
          <Button onClick={() => setShowCompose(true)}>
            <Plus className="w-4 h-4" /> Compose
          </Button>
        </div>
      </div>

      {/* Main Tabs: Mail / Files */}
      <div className="flex items-center gap-2 border-b border-slate-700/50 pb-2">
        <button onClick={() => setTab("mail")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === "mail" ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30" : "text-slate-400 hover:text-white hover:bg-slate-800"}`}>
          <MessageSquare className="w-4 h-4" /> Mail
          {counts.unread > 0 && <span className="ml-1 text-[10px] bg-cyan-500/20 text-cyan-400 px-1.5 py-0.5 rounded-full">{counts.unread}</span>}
        </button>
        <button onClick={() => setTab("files")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === "files" ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30" : "text-slate-400 hover:text-white hover:bg-slate-800"}`}>
          <FolderOpen className="w-4 h-4" /> Shared Files
        </button>
      </div>

      {/* ═══ MAIL TAB ═══════════════════════════════════════════ */}
      {tab === "mail" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4" style={{ minHeight: "calc(100vh - 280px)" }}>
          {/* Sidebar - Folders */}
          <div className="lg:col-span-2 space-y-1">
            {folders.map((f) => (
              <button key={f.id} onClick={() => { setFolder(f.id); setSelectedMessage(null); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${folder === f.id ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" : "text-slate-400 hover:text-white hover:bg-slate-800/50"}`}>
                <f.icon className="w-4 h-4" />
                <span className="flex-1 text-left">{f.label}</span>
                {f.count && <span className="text-[10px] bg-slate-700 px-1.5 py-0.5 rounded-full">{f.count}</span>}
              </button>
            ))}
          </div>

          {/* Message List */}
          <div className="lg:col-span-4 flex flex-col border border-white/[0.06] rounded-xl overflow-hidden bg-[#111827]/50">
            {/* Search */}
            <div className="p-3 border-b border-white/[0.06]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search emails..."
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50" />
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-16"><Loader2 className="w-5 h-5 animate-spin text-cyan-400" /></div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Inbox className="w-8 h-8 text-slate-700 mb-2" />
                  <p className="text-sm text-slate-500">No messages in {folder}</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <button key={msg.id} onClick={() => openMessage(msg)}
                    className={`w-full text-left px-4 py-3 border-b border-white/[0.04] transition-all hover:bg-slate-800/30 ${selectedMessage?.id === msg.id ? "bg-cyan-500/5 border-l-2 border-l-cyan-400" : ""} ${msg.status === "unread" ? "bg-slate-800/20" : ""}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-medium truncate flex-1 ${msg.status === "unread" ? "text-white font-semibold" : "text-slate-300"}`}>
                        {msg.direction === "inbound" ? (msg.fromName || msg.from) : `To: ${msg.toName || msg.to}`}
                      </span>
                      <span className="text-[10px] text-slate-500 shrink-0">{formatDate(msg.sentAt)}</span>
                    </div>
                    <p className={`text-xs truncate ${msg.status === "unread" ? "text-slate-200" : "text-slate-400"}`}>{msg.subject}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-[11px] text-slate-500 truncate flex-1">{msg.snippet || ""}</p>
                      {msg.attachments.length > 0 && <Paperclip className="w-3 h-3 text-slate-500 shrink-0" />}
                      {msg.starred && <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Message Detail */}
          <div className="lg:col-span-6 border border-white/[0.06] rounded-xl overflow-hidden bg-[#111827]/50 flex flex-col">
            {selectedMessage ? (
              <>
                {/* Detail Header */}
                <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
                  <button onClick={() => setSelectedMessage(null)} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors lg:hidden">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-2">
                    <button onClick={() => toggleStar(selectedMessage.id, selectedMessage.starred)} className="p-1.5 rounded-lg hover:bg-slate-800 transition-colors">
                      <Star className={`w-4 h-4 ${selectedMessage.starred ? "text-amber-400 fill-amber-400" : "text-slate-500"}`} />
                    </button>
                    <button onClick={() => updateStatus(selectedMessage.id, "archived")} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors" title="Archive">
                      <Archive className="w-4 h-4" />
                    </button>
                    <button onClick={() => updateStatus(selectedMessage.id, "trash")} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-red-400 transition-colors" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Detail Body */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                  <div>
                    <h2 className="text-lg font-semibold text-white">{selectedMessage.subject}</h2>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
                        <span className="text-xs font-bold text-cyan-400">{(selectedMessage.fromName || selectedMessage.from).charAt(0).toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{selectedMessage.fromName || selectedMessage.from}</p>
                        <p className="text-[11px] text-slate-500">
                          {selectedMessage.direction === "inbound" ? `to me` : `to ${selectedMessage.toName || selectedMessage.to}`}
                          {" · "}
                          {new Date(selectedMessage.sentAt).toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-white/[0.06] pt-4">
                    {selectedMessage.bodyHtml ? (
                      <div className="prose prose-invert prose-sm max-w-none text-slate-300"
                        dangerouslySetInnerHTML={{ __html: selectedMessage.bodyHtml }} />
                    ) : (
                      <p className="text-sm text-slate-300 whitespace-pre-wrap">{selectedMessage.bodyText || "(No content)"}</p>
                    )}
                  </div>

                  {/* Attachments */}
                  {selectedMessage.attachments.length > 0 && (
                    <div className="border-t border-white/[0.06] pt-4">
                      <p className="text-xs font-medium text-slate-400 mb-2 flex items-center gap-1.5">
                        <Paperclip className="w-3.5 h-3.5" /> {selectedMessage.attachments.length} attachment{selectedMessage.attachments.length > 1 ? "s" : ""}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {selectedMessage.attachments.map((att) => (
                          <div key={att.id} className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-800/50 border border-white/[0.06]">
                            <div className="w-8 h-8 rounded-lg bg-slate-700/50 flex items-center justify-center shrink-0">
                              <FileText className="w-4 h-4 text-slate-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-white truncate">{att.filename}</p>
                              <p className="text-[10px] text-slate-500">{formatFileSize(att.size)}</p>
                            </div>
                            <button onClick={() => downloadFile(att.id, att.filename)} className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors">
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center">
                <Mail className="w-12 h-12 text-slate-700 mb-3" />
                <p className="text-sm text-slate-500">Select a message to read</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══ FILES TAB ══════════════════════════════════════════ */}
      {tab === "files" && (
        <div className="space-y-4">
          {/* File Actions */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              {fileCategories.map((cat) => (
                <button key={cat.id} onClick={() => setFileCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${fileCategory === cat.id ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30" : "text-slate-400 hover:text-white hover:bg-slate-800"}`}>
                  {cat.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input ref={fileInputRef} type="file" multiple className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif,.csv"
                onChange={(e) => handleFileUpload(e)} />
              <Button onClick={() => fileInputRef.current?.click()} disabled={uploading} size="sm">
                {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                Upload File
              </Button>
            </div>
          </div>

          {/* Files Grid */}
          {filesLoading ? (
            <div className="flex items-center justify-center py-16"><Loader2 className="w-5 h-5 animate-spin text-cyan-400" /></div>
          ) : files.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <FolderOpen className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                <p className="text-sm text-slate-400 font-medium">No shared files yet</p>
                <p className="text-xs text-slate-500 mt-1">Upload PDFs, catalogs, brochures, and certificates to share with customers</p>
                <Button size="sm" className="mt-4" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="w-3.5 h-3.5" /> Upload Your First File
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {files.map((file) => (
                <Card key={file.id} className="hover:border-slate-600 transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-800/80 flex items-center justify-center shrink-0 text-lg">
                        {getCategoryIcon(file.category)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{file.filename}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant="default" className="text-[9px]">{file.category}</Badge>
                          <span className="text-[10px] text-slate-500">{formatFileSize(file.size)}</span>
                        </div>
                        {file.description && <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{file.description}</p>}
                        <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-500">
                          <span className="flex items-center gap-1"><Download className="w-2.5 h-2.5" /> {file.downloadCount || 0}</span>
                          <span className="flex items-center gap-1"><Clock className="w-2.5 h-2.5" /> {formatDate(file.createdAt)}</span>
                          {file.sharedWith && file.sharedWith.length > 0 && (
                            <span className="flex items-center gap-1"><Share2 className="w-2.5 h-2.5" /> {file.sharedWith.length}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Share input */}
                    {sharingFileId === file.id && (
                      <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center gap-2">
                        <input value={shareEmail} onChange={(e) => setShareEmail(e.target.value)} placeholder="customer@email.com" type="email"
                          className="flex-1 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700/50 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50" />
                        <Button size="sm" onClick={() => shareFile(file.id)} disabled={!shareEmail.trim()}>Share</Button>
                        <button onClick={() => setSharingFileId(null)} className="p-1 text-slate-400 hover:text-white"><X className="w-3.5 h-3.5" /></button>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-white/[0.06]">
                      <button onClick={() => downloadFile(file.id, file.filename)} className="p-1.5 rounded-lg bg-slate-800/50 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors" title="Download">
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setSharingFileId(sharingFileId === file.id ? null : file.id)} className="p-1.5 rounded-lg bg-slate-800/50 hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-400 transition-colors" title="Share with customer">
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => deleteFile(file.id)} className="p-1.5 rounded-lg bg-slate-800/50 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors ml-auto" title="Delete">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══ COMPOSE MODAL ═════════════════════════════════════ */}
      {showCompose && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-[#111827] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06]">
              <h3 className="text-sm font-semibold text-white">New Message</h3>
              <button onClick={() => setShowCompose(false)} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSend} className="p-5 space-y-3">
              <div>
                <input type="email" value={composeTo} onChange={(e) => setComposeTo(e.target.value)} placeholder="To: recipient@email.com" required
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-800/50 border border-slate-700/50 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50" />
              </div>
              <div>
                <input type="text" value={composeSubject} onChange={(e) => setComposeSubject(e.target.value)} placeholder="Subject" required
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-800/50 border border-slate-700/50 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50" />
              </div>
              <div>
                <textarea value={composeBody} onChange={(e) => setComposeBody(e.target.value)} placeholder="Write your message..." required rows={10}
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-800/50 border border-slate-700/50 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 resize-none" />
              </div>

              {/* Attachments in compose */}
              {composeFiles.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  {composeFiles.map((fid, i) => (
                    <span key={fid} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-white/[0.06] text-xs text-slate-300">
                      <Paperclip className="w-3 h-3" /> File {i + 1}
                      <button onClick={() => setComposeFiles((prev) => prev.filter((id) => id !== fid))} className="text-slate-500 hover:text-red-400"><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <input ref={composeFileInputRef} type="file" multiple className="hidden"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif,.csv"
                    onChange={(e) => handleFileUpload(e, true)} />
                  <button type="button" onClick={() => composeFileInputRef.current?.click()} className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors" title="Attach files">
                    <Paperclip className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <Button type="button" variant="secondary" onClick={() => setShowCompose(false)}>Cancel</Button>
                  <Button type="submit" disabled={composeSending}>
                    {composeSending ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</> : <><Send className="w-4 h-4" /> Send</>}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
