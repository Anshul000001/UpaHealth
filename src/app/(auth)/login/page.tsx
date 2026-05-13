"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Sparkles, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password. Please try again.");
    } else {
      router.push(callbackUrl);
      router.refresh();
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/80 backdrop-blur-xl p-8">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white">Sign in</h2>
        <p className="text-slate-400 text-sm mt-1">Enter your credentials to access the platform</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-6">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs text-slate-400 mb-1.5 block">Email address</label>
          <Input
            type="email"
            placeholder="admin@upahealthsupplies.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div>
          <label className="text-xs text-slate-400 mb-1.5 block">Password</label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Signing in...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Sign in to Platform
            </span>
          )}
        </Button>
      </form>

      <div className="mt-6 pt-6 border-t border-white/5">
        <p className="text-xs text-slate-500 text-center mb-3">Demo credentials</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => { setEmail("admin@upahealthsupplies.com"); setPassword("admin123"); }}
            className="p-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-xs text-slate-400 hover:text-white hover:border-cyan-500/30 transition-colors text-left"
          >
            <p className="font-medium text-white">Admin</p>
            <p>admin@upahealthsupplies.com</p>
          </button>
          <button
            type="button"
            onClick={() => { setEmail("sales@upahealthsupplies.com"); setPassword("sales123"); }}
            className="p-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-xs text-slate-400 hover:text-white hover:border-cyan-500/30 transition-colors text-left"
          >
            <p className="font-medium text-white">Sales</p>
            <p>sales@upahealthsupplies.com</p>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-950 grid-pattern flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">UH</span>
          </div>
          <h1 className="text-2xl font-bold text-white">UpaHealth</h1>
          <p className="text-slate-400 text-sm mt-1">AI Procurement Intelligence Platform</p>
        </div>

        <Suspense fallback={
          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-8 text-center text-slate-400 text-sm">
            Loading...
          </div>
        }>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
