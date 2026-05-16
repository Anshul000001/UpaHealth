"use client";

import { useState } from "react";
import { Sparkles, Loader2, Brain, TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface Lead {
  id: string;
  name: string;
  type: string;
  stage: string;
  estimatedValue: number;
}

interface Insight {
  leadId: string;
  leadName: string;
  score: number;
  closeProbability: number;
  nextAction: string;
  reasoning: string;
  risks: string[];
  tone: string;
}

export function CRMAIPanel({ leads }: { leads: Lead[] }) {
  const [selectedLeadId, setSelectedLeadId] = useState(leads[0]?.id ?? "");
  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState<Insight | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function analyze() {
    if (!selectedLeadId) return;
    setLoading(true);
    setError(null);
    setInsight(null);
    try {
      const res = await fetch("/api/ai/crm-insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId: selectedLeadId }),
      });
      const data = await res.json();
      if (data.success) setInsight(data.data);
      else setError(data.error?.message ?? "Analysis failed");
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  const scoreColor = insight
    ? insight.score >= 70 ? "text-emerald-400" : insight.score >= 40 ? "text-amber-400" : "text-red-400"
    : "text-slate-400";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Brain className="w-4 h-4 text-cyan-400" />
          NVIDIA AI Lead Scorer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-xs text-slate-400 mb-1.5 block">Select Lead to Analyze</label>
          <Select value={selectedLeadId} onChange={(e) => setSelectedLeadId(e.target.value)}>
            {leads.map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </Select>
        </div>

        <Button onClick={analyze} disabled={loading || !selectedLeadId} className="w-full">
          {loading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Analyzing…</> : <><Sparkles className="w-3.5 h-3.5" /> Analyze with AI</>}
        </Button>

        {error && <p className="text-xs text-red-400">{error}</p>}

        {insight && (
          <div className="space-y-3">
            {/* Score */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Lead Score</p>
                <p className={`text-2xl font-bold ${scoreColor}`}>{insight.score}/100</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Close Probability</p>
                <p className="text-lg font-bold text-white">{insight.closeProbability}%</p>
              </div>
            </div>

            {/* Next Action */}
            <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                <p className="text-[10px] text-cyan-400 uppercase tracking-wider font-medium">Next Best Action</p>
              </div>
              <p className="text-xs text-white">{insight.nextAction}</p>
            </div>

            {/* Reasoning */}
            <div className="p-3 rounded-lg bg-slate-800/30">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">AI Reasoning</p>
              <p className="text-xs text-slate-300 italic">{insight.reasoning}</p>
            </div>

            {/* Risks */}
            {insight.risks?.length > 0 && (
              <div className="space-y-1">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-amber-400" /> Risk Factors
                </p>
                {insight.risks.map((r, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-xs text-amber-300">
                    <span className="mt-0.5">•</span> {r}
                  </div>
                ))}
              </div>
            )}

            {/* Tone */}
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <p className="text-xs text-slate-400">Recommended tone: <span className="text-white">{insight.tone}</span></p>
            </div>

            <Badge variant="info" className="text-[10px]">Score saved to Supabase</Badge>
          </div>
        )}

        {!insight && !loading && (
          <div className="text-center py-4">
            <Brain className="w-8 h-8 text-slate-700 mx-auto mb-2" />
            <p className="text-xs text-slate-500">Select a lead and click Analyze to get AI-powered scoring and recommendations</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
