import React from 'react';
import { AdminDashboardData } from '../../types/index.ts';
import {
  FolderKanban,
  CheckCircle2,
  FileEdit,
  Layers,
  Inbox,
  Clock,
  ArrowUpRight,
  Plus,
  ShieldCheck,
} from 'lucide-react';

interface DashboardOverviewProps {
  data: AdminDashboardData;
  onNavigateTab: (tab: string) => void;
  onNewProject: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  data,
  onNavigateTab,
  onNewProject,
}) => {
  const { stats, activities } = data;

  return (
    <div className="space-y-8">
      {/* Top Banner / Welcome */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-900/60 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Authorized Administrator Session</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Portfolio Administration Studio
          </h2>
          <p className="text-sm text-zinc-400 mt-1 max-w-xl">
            Manage projects, bilingual copy, services, client inquiries, and live publishing states with persistent database synchronization.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onNewProject}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </button>

          <button
            onClick={() => onNavigateTab('inquiries')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs sm:text-sm border border-zinc-700 transition-all cursor-pointer relative"
          >
            <Inbox className="w-4 h-4" />
            <span>Inquiries</span>
            {stats.unreadInquiries > 0 && (
              <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                {stats.unreadInquiries}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Metrics Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Projects */}
        <div
          onClick={() => onNavigateTab('projects')}
          className="p-5 rounded-2xl bg-zinc-900/70 border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Total Projects
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-950/60 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
              <FolderKanban className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{stats.totalProjects}</span>
            <span className="text-xs text-zinc-500">records in DB</span>
          </div>
        </div>

        {/* Published Projects */}
        <div
          onClick={() => onNavigateTab('projects')}
          className="p-5 rounded-2xl bg-zinc-900/70 border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Published (Live)
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-400">{stats.publishedProjects}</span>
            <span className="text-xs text-zinc-500">visible to public</span>
          </div>
        </div>

        {/* Draft Projects */}
        <div
          onClick={() => onNavigateTab('projects')}
          className="p-5 rounded-2xl bg-zinc-900/70 border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Drafts (Hidden)
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-950/60 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
              <FileEdit className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-400">{stats.draftProjects}</span>
            <span className="text-xs text-zinc-500">admin preview only</span>
          </div>
        </div>

        {/* Services & Inquiries */}
        <div
          onClick={() => onNavigateTab('inquiries')}
          className="p-5 rounded-2xl bg-zinc-900/70 border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Client Inquiries
            </span>
            <div className="w-9 h-9 rounded-xl bg-teal-950/60 border border-teal-500/30 flex items-center justify-center text-teal-400 group-hover:scale-105 transition-transform">
              <Inbox className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{stats.totalInquiries}</span>
            <span className="text-xs text-rose-400 font-semibold">({stats.unreadInquiries} unread)</span>
          </div>
        </div>
      </div>

      {/* Grid: Recent Activity & Quick Navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Activity Feed */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              <h3 className="text-base font-bold text-white">Recent Content Updates & Audit Log</h3>
            </div>
            <span className="text-xs text-zinc-500">Last 50 changes</span>
          </div>

          {activities.length === 0 ? (
            <p className="text-xs text-zinc-500 py-6 text-center">No recent activity logged yet.</p>
          ) : (
            <div className="space-y-3">
              {activities.slice(0, 7).map((act) => (
                <div
                  key={act.id}
                  className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 flex items-start justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-emerald-400">{act.action}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-400 uppercase">
                        {act.entityType}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-300 mt-1">{act.details}</p>
                  </div>
                  <span className="text-[11px] text-zinc-500 whitespace-nowrap">
                    {new Date(act.timestamp).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Shortcuts */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white mb-4">Quick Shortcuts</h3>
            <div className="space-y-2">
              <button
                onClick={() => onNavigateTab('services')}
                className="w-full text-left p-3 rounded-xl bg-zinc-950 hover:bg-zinc-800/70 border border-zinc-800 flex items-center justify-between text-xs font-medium text-zinc-300 hover:text-white transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  <span>Manage 5 Core Services</span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500" />
              </button>

              <button
                onClick={() => onNavigateTab('profile')}
                className="w-full text-left p-3 rounded-xl bg-zinc-950 hover:bg-zinc-800/70 border border-zinc-800 flex items-center justify-between text-xs font-medium text-zinc-300 hover:text-white transition-colors"
              >
                <div className="flex items-center gap-2">
                  <FileEdit className="w-4 h-4 text-emerald-400" />
                  <span>Edit Profile & Social Links</span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500" />
              </button>

              <button
                onClick={() => onNavigateTab('settings')}
                className="w-full text-left p-3 rounded-xl bg-zinc-950 hover:bg-zinc-800/70 border border-zinc-800 flex items-center justify-between text-xs font-medium text-zinc-300 hover:text-white transition-colors"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-400" />
                  <span>Website Content & SEO Meta</span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500" />
              </button>

              <button
                onClick={() => onNavigateTab('security-guide')}
                className="w-full text-left p-3 rounded-xl bg-zinc-950 hover:bg-zinc-800/70 border border-zinc-800 flex items-center justify-between text-xs font-medium text-zinc-300 hover:text-white transition-colors"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Setup & Security Checklist</span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500" />
              </button>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-zinc-800 text-[11px] text-zinc-500">
            Current Server Port: <span className="text-zinc-300 font-mono">3000</span> (Express + Vite)
          </div>
        </div>
      </div>
    </div>
  );
};
