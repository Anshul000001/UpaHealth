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
        <h2 className="text-lg font-semibold text-white mb-2">Quick Templates</h2>
        <p className="text-xs text-slate-500 mb-4">Click any template to auto-fill your message — edit before sending</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            onClick={() => {
              setSubject("Your Quotation from UpaHealth Supplies 📋");
              setMessage("Dear Customer,\n\nThank you for choosing UpaHealth Supplies — your trusted partner in quality healthcare products.\n\nPlease find the attached quotation prepared exclusively for you. We've ensured competitive pricing with the best quality products available.\n\n✅ Competitive pricing\n✅ WHO-GMP & ISO certified products\n✅ Fast delivery across India & exports\n\nThis quotation is valid for 15 days. Feel free to reach out if you need any modifications.\n\nLooking forward to serving you!\n\nWarm regards,\nUpaHealth Supplies Team\n📞 Contact us anytime");
            }}
            className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50 text-left hover:border-cyan-500/30 hover:bg-slate-800 transition-all group"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">📋</span>
              <p className="text-sm font-medium text-white group-hover:text-cyan-300 transition-colors">Quotation Email</p>
            </div>
            <p className="text-xs text-slate-400 mt-1">Professional quotation with trust signals</p>
          </button>

          <button
            onClick={() => {
              setSubject("Quick Follow-up — Still interested? 🤝");
              setMessage("Hi there,\n\nJust checking in! We spoke recently about your medical supply requirements and I wanted to make sure you have everything you need.\n\nHere's what we can help with:\n🏥 Surgical consumables & disposables\n💊 Pharmaceutical products\n🔬 Diagnostic equipment & supplies\n🌍 Export-ready with all certifications\n\nWould you like me to:\n• Send an updated quotation?\n• Schedule a quick call to discuss?\n• Share our latest product catalog?\n\nWe're here to make procurement easy for you.\n\nBest regards,\nUpaHealth Supplies Team");
            }}
            className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50 text-left hover:border-cyan-500/30 hover:bg-slate-800 transition-all group"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">🤝</span>
              <p className="text-sm font-medium text-white group-hover:text-cyan-300 transition-colors">Friendly Follow-up</p>
            </div>
            <p className="text-xs text-slate-400 mt-1">Warm check-in with action options</p>
          </button>

          <button
            onClick={() => {
              setSubject("Product Inquiry — UpaHealth Supplies");
              setMessage("Dear Supplier,\n\nGreetings from UpaHealth Supplies!\n\nWe are a growing healthcare procurement company based in India, serving hospitals, distributors, and government institutions.\n\nWe are interested in your product range and would like to explore a business partnership.\n\nCould you please share:\n📦 Your latest product catalog\n💰 Wholesale/distributor pricing\n📋 MOQ and lead time details\n📜 Available certifications (ISO, CE, WHO-GMP)\n\nWe look forward to building a long-term relationship.\n\nBest regards,\nUpaHealth Supplies Team\nwww.upahealthsupplies.com");
            }}
            className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50 text-left hover:border-cyan-500/30 hover:bg-slate-800 transition-all group"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">🏭</span>
              <p className="text-sm font-medium text-white group-hover:text-cyan-300 transition-colors">Supplier Inquiry</p>
            </div>
            <p className="text-xs text-slate-400 mt-1">Professional supplier outreach</p>
          </button>

          <button
            onClick={() => {
              setSubject("Welcome to UpaHealth Supplies! 🎉");
              setMessage("Dear Partner,\n\nWelcome aboard! We're thrilled to have you as part of the UpaHealth family.\n\nHere's what you can expect from us:\n\n🌟 Premium Quality — All products are WHO-GMP, ISO 13485 & CE certified\n⚡ Fast Turnaround — Orders processed within 24-48 hours\n💰 Best Pricing — Direct from manufacturers, no middlemen\n🌍 Global Reach — We export to 15+ countries\n📞 Dedicated Support — Your personal account manager is just a call away\n\nTo get started, simply reply to this email with your requirements or browse our catalog at www.upahealthsupplies.com\n\nWe're excited to serve you!\n\nCheers,\nUpaHealth Supplies Team");
            }}
            className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50 text-left hover:border-cyan-500/30 hover:bg-slate-800 transition-all group"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">🎉</span>
              <p className="text-sm font-medium text-white group-hover:text-cyan-300 transition-colors">Welcome New Client</p>
            </div>
            <p className="text-xs text-slate-400 mt-1">Onboard a new buyer or distributor</p>
          </button>

          <button
            onClick={() => {
              setSubject("Exclusive Offer — Limited Time Only! 🔥");
              setMessage("Dear Valued Customer,\n\nWe have an exclusive offer just for you!\n\n🔥 SPECIAL DEAL 🔥\n\n• Up to 15% OFF on bulk orders (50+ units)\n• FREE shipping on orders above ₹50,000\n• Extra 5% discount for repeat customers\n• Priority delivery within 3-5 business days\n\n📦 Top Categories on Offer:\n- Surgical gloves & masks\n- Syringes & IV sets\n- Diagnostic kits\n- Hospital furniture & equipment\n\n⏰ Offer valid till end of this month — don't miss out!\n\nReply to this email or call us to place your order today.\n\nBest regards,\nUpaHealth Supplies Team\nYour Path to Wellness 💚");
            }}
            className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50 text-left hover:border-cyan-500/30 hover:bg-slate-800 transition-all group"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">🔥</span>
              <p className="text-sm font-medium text-white group-hover:text-cyan-300 transition-colors">Special Offer</p>
            </div>
            <p className="text-xs text-slate-400 mt-1">Promotional deal to drive sales</p>
          </button>

          <button
            onClick={() => {
              setSubject("Thank You for Your Order! 🙏");
              setMessage("Dear Customer,\n\nThank you for your recent order with UpaHealth Supplies! 🎊\n\nYour order has been confirmed and is being processed. Here's what happens next:\n\n1️⃣ Order Confirmation — Done ✅\n2️⃣ Quality Check — In progress\n3️⃣ Packaging & Dispatch — Within 24-48 hours\n4️⃣ Delivery — Estimated 3-7 business days\n\nYou'll receive tracking details once your order is shipped.\n\n💡 Pro Tip: Save 10% on your next order by referring a hospital or clinic to us!\n\nIf you have any questions about your order, simply reply to this email.\n\nThank you for trusting UpaHealth Supplies!\n\nWith gratitude,\nUpaHealth Supplies Team\nwww.upahealthsupplies.com");
            }}
            className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50 text-left hover:border-cyan-500/30 hover:bg-slate-800 transition-all group"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">🙏</span>
              <p className="text-sm font-medium text-white group-hover:text-cyan-300 transition-colors">Order Confirmation</p>
            </div>
            <p className="text-xs text-slate-400 mt-1">Thank customer after order placement</p>
          </button>
        </div>
      </div>
    </div>
  );
}
