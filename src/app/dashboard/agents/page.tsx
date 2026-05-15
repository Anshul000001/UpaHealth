"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Bot,
  Play,
  RefreshCw,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Activity,
  Zap,
  Brain,
  TrendingUp,
  Users,
  Globe,
  FileText,
  Target,
  BarChart3,
  Mail,
  MessageSquare,
  Building,
  Shield,
  Megaphone,
  Search,
  Wrench,
  IndianRupee,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Agent {
  name: string;
  role: string;
  description: string;
  capabilities: string[];
  schedule?: string;
  status: string;
  lastRunAt: string | null;
  totalRuns: number;
  successRuns: number;
  failedRuns: number;
}

interface AgentRun {
  id: string;
  status: string;
  startedAt: string;
  completedAt: string | null;
  durationMs: number | null;
  output: { text?: string; parsed?: unknown } | null;
  error: string | null;
  agent: { name: string; role: string };
}

const AGENT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  CEO: Brain,
  Sales: TrendingUp,
  CRM: Users,
  Procurement: Wrench,
  Supplier: Building,
  Tender: FileText,
  Export: Globe,
  Instagram: Megaphone,
  LinkedIn: Megaphone,
  SEO: Search,
  Email: Mail,
  Finance: IndianRupee,
  Operations: Activity,
  Compliance: Shield,
  Reporting: BarChart3,
};

const AGENT_COLORS: Record<string, string> = {
  CEO: "from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-400",
  Sales: "from-emerald-500/20 to-green-500/20 border-emerald-500/30 text-emerald-400",
  CRM: "from-cyan-500/20 to-blue-500/20 border-cyan-500/30 text-cyan-400",
  Procurement: "from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-400",
  Supplier: "from-blue-500/20 to-indigo-500/20 border-blue-500/30 text-blue-400",
  Tender: "from-red-500/20 to-orange-500/20 border-red-500/30 text-red-400",
  Export: "from-teal-500/20 to-cyan-500/20 border-teal-500/30 text-teal-400",
  Instagram: "from-pink-500/20 to-rose-500/20 border-pink-500/30 text-pink-400",
  LinkedIn: "from-blue-500/20 to-sky-500/20 border-blue-500/30 text-blue-400",
  SEO: "from-violet-500/20 to-purple-500/20 border-violet-500/30 text-violet-400",
  Email: "from-indigo-500/20 to-purple-500/20 border-indigo-500/30 text-indigo-400",
  Finance: "from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-400",
  Operations: "from-slate-500/20 to-gray-500/20 border-slate-500/30 text-slate-400",
  Compliance: "from-amber-500/20 to-yellow-500/20 border-amber-500/30 text-amber-400",
  Reporting: "from-cyan-500/20 to-blue-500/20 border-cyan-500/30 text-cyan-400",
};

function formatRelative(date: string | null) {
  if (!date) return "Never";
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [runs, setRuns] = useState<AgentRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [runOutput, setRunOutput] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [agentsRes, runsRes] = await Promise.all([
        fetch("/api/agents").then((r) => r.json()),
        fetch("/api/agents/runs?limit=10").then((r) => r.json()),
      ]);
      if (agentsRes.success) setAgents(agentsRes.data);
      if (runsRes.success) setRuns(runsRes.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [load]);

  async function runNow(name: string) {
    setRunning(name);
    setRunOutput(null);
    try {
      const res = await fetch(`/api/agents/${name}/run`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setRunOutput(data.data.output);
      } else {
        setRunOutput(`Error: ${data.data?.error ?? "Unknown error"}`);
      }
      await load();
    } finally {
      setRunning(null);
    }
  }

  const totalRuns = agents.reduce((s, a) => s + a.totalRuns, 0);
  const totalSuccess = agents.reduce((s, a) => s + a.successRuns, 0);
  const successRate = totalRuns > 0 ? Math.round((totalSuccess / totalRuns) * 100) : 0;
  const activeCount = agents.filter((a) => a.status === "active").length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Bot className="w-6 h-6 text-cyan-400" />
            AI Operating System
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            15 autonomous AI agents managing UpaHealth — powered by NVIDIA Llama 3.1
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="success" className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {activeCount} active
          </Badge>
          <button
            onClick={load}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Active Agents</p>
                <p className="text-2xl font-bold text-white mt-1">{activeCount}</p>
                <p className="text-[10px] text-slate-500 mt-1">of {agents.length} total</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                <Bot className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Total Runs</p>
                <p className="text-2xl font-bold text-white mt-1">{totalRuns}</p>
                <p className="text-[10px] text-emerald-400 mt-1">{successRate}% success</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Recent Activity</p>
                <p className="text-2xl font-bold text-white mt-1">{runs.length}</p>
                <p className="text-[10px] text-slate-500 mt-1">Last 10 runs</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Activity className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">AI Provider</p>
                <p className="text-sm font-bold text-white mt-1">NVIDIA NIM</p>
                <p className="text-[10px] text-emerald-400 mt-1">Llama 3.1 8B</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Brain className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {loading && agents.length === 0 ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Agents grid */}
          <div className="lg:col-span-2">
            <h2 className="text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wider">AI Department Heads</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {agents.map((agent) => {
                const Icon = AGENT_ICONS[agent.name] ?? Bot;
                const colorClass = AGENT_COLORS[agent.name] ?? "from-slate-500/20 to-gray-500/20 border-slate-500/30 text-slate-400";
                const isRunning = running === agent.name;
                return (
                  <Card
                    key={agent.name}
                    className={`hover:border-cyan-500/30 transition-all cursor-pointer ${selectedAgent?.name === agent.name ? "border-cyan-500/50" : ""}`}
                    onClick={() => setSelectedAgent(agent)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${colorClass} border flex items-center justify-center`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); runNow(agent.name); }}
                          disabled={isRunning}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors disabled:opacity-50"
                          title="Run now"
                        >
                          {isRunning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <h3 className="text-sm font-semibold text-white">{agent.name}</h3>
                      <p className="text-[10px] text-slate-500 mb-2">{agent.role}</p>
                      <p className="text-xs text-slate-400 line-clamp-2 mb-2">{agent.description}</p>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-500 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {formatRelative(agent.lastRunAt)}
                        </span>
                        <span className="text-slate-500">
                          {agent.totalRuns} runs · {agent.totalRuns > 0 ? Math.round((agent.successRuns / agent.totalRuns) * 100) : 0}% ok
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Right panel: agent detail or recent activity */}
          <div className="space-y-4">
            {selectedAgent ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Target className="w-4 h-4 text-cyan-400" />
                    {selectedAgent.name} Agent
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-xs text-slate-400">{selectedAgent.description}</p>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Capabilities</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedAgent.capabilities.map((cap) => (
                        <span key={cap} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                          {cap}
                        </span>
                      ))}
                    </div>
                  </div>
                  {selectedAgent.schedule && (
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Schedule</p>
                      <code className="text-[10px] text-cyan-400 bg-slate-800 px-2 py-1 rounded">{selectedAgent.schedule}</code>
                    </div>
                  )}
                  <Button
                    size="sm"
                    onClick={() => runNow(selectedAgent.name)}
                    disabled={running === selectedAgent.name}
                    className="w-full"
                  >
                    {running === selectedAgent.name ? (
                      <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Running…</>
                    ) : (
                      <><Play className="w-3.5 h-3.5" /> Run Now</>
                    )}
                  </Button>

                  {runOutput && running === null && (
                    <div className="mt-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                      <p className="text-[10px] text-cyan-400 mb-1.5 uppercase tracking-wider">Latest Output</p>
                      <pre className="text-xs text-slate-300 whitespace-pre-wrap max-h-72 overflow-y-auto">{runOutput}</pre>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <Bot className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">Select an agent to view details</p>
                </CardContent>
              </Card>
            )}

            {/* Recent runs feed */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {runs.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4">No runs yet — click any agent to run it</p>
                ) : (
                  <div className="space-y-2">
                    {runs.map((run) => (
                      <div key={run.id} className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/30 border border-slate-700/30">
                        {run.status === "completed" ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        ) : run.status === "failed" ? (
                          <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                        ) : (
                          <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-white truncate">{run.agent.name}</p>
                          <p className="text-[10px] text-slate-500">
                            {formatRelative(run.startedAt)} · {run.durationMs ? `${(run.durationMs / 1000).toFixed(1)}s` : "running"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* n8n integration hint */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-amber-400" />
                  n8n Integration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <p className="text-slate-400">Trigger any agent from n8n:</p>
                <code className="block text-[10px] text-cyan-400 bg-slate-800 px-2 py-1.5 rounded break-all">
                  POST /api/agents/&#123;name&#125;/run
                </code>
                <p className="text-[10px] text-slate-500">
                  Set up cron schedules in n8n to call these endpoints. All runs are logged to Supabase.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
