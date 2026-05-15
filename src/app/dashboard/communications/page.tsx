"use client";

import { useState } from "react";
import { Mail, Send, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

export default function CommunicationsPage() {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [result, setResult] = useState<string>("");
  const [connectionStatus, setConnectionStatus] = useState<string>("");

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setResult("");

    try {
      const res = await fetch("/api/communications/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to,
          subject,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: #0f766e; padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0;">UpaHealth Supplies</h1>
                <p style="color: #ccfbf1; margin: 5px 0 0;">Your Path to Wellness</p>
              </div>
              <div style="padding: 30px; background: #f9fafb;">
                <p>${message.replace(/\n/g, "<br/>")}</p>
                <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
                  Sent from UpaHealth CRM<br/>
                  <a href="https://www.upahealthsupplies.com">www.upahealthsupplies.com</a>
                </p>
              </div>
            </div>
          `,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setResult(`Email sent successfully! Message ID: ${data.messageId}`);
        setTo("");
        setSubject("");
        setMessage("");
      } else {
        setStatus("error");
        setResult(data.message || data.error || "Failed to send email");
      }
    } catch (err) {
      setStatus("error");
      setResult((err as Error).message);
    }
  }

  async function verifyConnection() {
    setConnectionStatus("checking...");
    try {
      const res = await fetch("/api/communications/verify");
      const data = await res.json();
      setConnectionStatus(data.message);
    } catch {
      setConnectionStatus("Failed to verify connection");
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30">
              <Mail className="w-6 h-6 text-cyan-400" />
            </div>
            Communications
          </h1>
          <p className="text-slate-400 mt-1">Send emails to leads, buyers, and suppliers from your CRM</p>
        </div>
        <button
          onClick={verifyConnection}
          className="px-4 py-2 text-sm rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 transition-colors"
        >
          Verify Gmail Connection
        </button>
      </div>

      {connectionStatus && (
        <div className="px-4 py-3 rounded-lg bg-slate-900/50 border border-slate-700/50 text-sm text-slate-300">
          {connectionStatus}
        </div>
      )}

      {/* Compose Email Card */}
      <div className="rounded-xl bg-slate-900/50 border border-white/10 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Compose Email</h2>

        <form onSubmit={handleSend} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">To</label>
            <input
              type="email"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="recipient@example.com"
              required
              className="w-full px-4 py-2.5 rounded-lg bg-slate-800/50 border border-slate-700/50 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject"
              required
              className="w-full px-4 py-2.5 rounded-lg bg-slate-800/50 border border-slate-700/50 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your message here..."
              required
              rows={6}
              className="w-full px-4 py-2.5 rounded-lg bg-slate-800/50 border border-slate-700/50 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 resize-none"
            />
          </div>

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={status === "sending"}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium hover:from-cyan-400 hover:to-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === "sending" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {status === "sending" ? "Sending..." : "Send Email"}
            </button>
          </div>
        </form>

        {/* Status Message */}
        {result && (
          <div
            className={`mt-4 flex items-center gap-2 px-4 py-3 rounded-lg text-sm ${
              status === "success"
                ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                : "bg-red-500/10 border border-red-500/30 text-red-400"
            }`}
          >
            {status === "success" ? (
              <CheckCircle className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            {result}
          </div>
        )}
      </div>

      {/* Quick Templates */}
      <div className="rounded-xl bg-slate-900/50 border border-white/10 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Quick Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => {
              setSubject("Quotation from UpaHealth Supplies");
              setMessage("Dear Customer,\n\nThank you for your interest in our products. Please find the attached quotation for your review.\n\nIf you have any questions, please don't hesitate to reach out.\n\nBest regards,\nUpaHealth Supplies Team");
            }}
            className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50 text-left hover:border-cyan-500/30 hover:bg-slate-800 transition-all"
          >
            <p className="text-sm font-medium text-white">Quotation Email</p>
            <p className="text-xs text-slate-400 mt-1">Send quotation to a buyer</p>
          </button>

          <button
            onClick={() => {
              setSubject("Following up — UpaHealth Supplies");
              setMessage("Dear Customer,\n\nI wanted to follow up regarding our previous conversation. We'd love to assist you with your medical supply requirements.\n\nPlease let us know if you'd like to discuss further or need an updated quotation.\n\nBest regards,\nUpaHealth Supplies Team");
            }}
            className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50 text-left hover:border-cyan-500/30 hover:bg-slate-800 transition-all"
          >
            <p className="text-sm font-medium text-white">Follow-up</p>
            <p className="text-xs text-slate-400 mt-1">Follow up with a lead</p>
          </button>

          <button
            onClick={() => {
              setSubject("Product Inquiry — UpaHealth Supplies");
              setMessage("Dear Supplier,\n\nWe are interested in your products and would like to request pricing and availability information.\n\nPlease share your latest catalog and MOQ details.\n\nBest regards,\nUpaHealth Supplies Team");
            }}
            className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50 text-left hover:border-cyan-500/30 hover:bg-slate-800 transition-all"
          >
            <p className="text-sm font-medium text-white">Supplier Inquiry</p>
            <p className="text-xs text-slate-400 mt-1">Reach out to a supplier</p>
          </button>
        </div>
      </div>
    </div>
  );
}
