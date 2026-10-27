import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { AdminDashboardData } from '../../types/index.ts';
import { DashboardOverview } from './DashboardOverview.tsx';
import { ProjectsManager } from './ProjectsManager.tsx';
import { ServicesManager } from './ServicesManager.tsx';
import { ProfileEditor } from './ProfileEditor.tsx';
import { SiteContentManager } from './SiteContentManager.tsx';
import { InquiriesManager } from './InquiriesManager.tsx';
import { AdminSetupGuide } from './AdminSetupGuide.tsx';
import {
  LayoutDashboard,
  FolderKanban,
  Layers,
  User,
  FileText,
  Inbox,
  Eye,
  ShieldCheck,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Bell,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface AdminShellProps {
  onExitToPublic: () => void;
  onEnterPreview: () => void;
}

export const AdminShell: React.FC<AdminShellProps> = ({
  onExitToPublic,
  onEnterPreview,
}) => {
  const { adminUser, logout, authFetch } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [openCreateProjectDirectly, setOpenCreateProjectDirectly] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchAdminData = async () => {
    try {
      const res = await authFetch('/api/admin/all-data');
      if (res.ok) {
        const data = await res.json();
        setDashboardData(data);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
      showToast('Could not sync admin data from backend.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
    {
      id: 'projects',
      label: 'Projects Manager',
      icon: FolderKanban,
      badge: dashboardData?.stats.totalProjects,
    },
    {
      id: 'services',
      label: 'Services Manager',
      icon: Layers,
      badge: dashboardData?.stats.totalServices,
    },
    { id: 'profile', label: 'Profile & Security', icon: User },
    { id: 'settings', label: 'Website Content & SEO', icon: FileText },
    {
      id: 'inquiries',
      label: 'Client Inquiries',
      icon: Inbox,
      badge: dashboardData?.stats.unreadInquiries || undefined,
      badgeColor: 'rose',
    },
    { id: 'security-guide', label: 'Setup & Security', icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col md:flex-row">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-zinc-900 border border-zinc-700 shadow-2xl text-xs font-semibold text-white animate-bounce">
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-zinc-900/90 border-b border-zinc-800 sticky top-0 z-40 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center font-bold text-emerald-400 text-xs">
            AI
          </div>
          <span className="font-bold text-sm text-white">Admin Studio</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onExitToPublic}
            className="p-2 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white text-xs"
            title="Public Website"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-2 rounded-lg bg-zinc-800 text-zinc-300"
          >
            {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-zinc-900/95 border-r border-zinc-800/80 flex flex-col justify-between p-4 transition-transform duration-300 md:static md:translate-x-0 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Logo / Brand Header */}
          <div className="flex items-center justify-between pb-6 mb-4 border-b border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 p-[1.5px] shadow-lg shadow-emerald-500/20">
                <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center font-bold text-emerald-400">
                  AI
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-sm text-white tracking-tight">Admin Studio</span>
                <span className="text-[10px] text-emerald-400 font-medium">Verified Admin</span>
              </div>
            </div>

            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="md:hidden text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileSidebarOpen(false);
                    setOpenCreateProjectDirectly(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20'
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive
                          ? 'bg-zinc-950 text-emerald-300'
                          : item.badgeColor === 'rose'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : 'bg-zinc-800 text-zinc-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="pt-4 border-t border-zinc-800/80 space-y-2">
          {/* Live Preview Mode Button */}
          <button
            onClick={onEnterPreview}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold transition-colors cursor-pointer"
          >
            <Eye className="w-4 h-4" />
            <span>Admin Live Preview</span>
          </button>

          {/* Public Portfolio Link */}
          <button
            onClick={onExitToPublic}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition-colors cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Public Site</span>
          </button>

          {/* Sign Out */}
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-zinc-950 hover:bg-rose-950/60 text-zinc-400 hover:text-rose-400 text-xs font-medium border border-zinc-800 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto w-full overflow-y-auto">
        {/* Top Desktop Bar */}
        <div className="hidden md:flex items-center justify-between pb-6 mb-6 border-b border-zinc-800/80">
          <div>
            <h1 className="text-xl font-extrabold text-white capitalize">
              {navItems.find((n) => n.id === activeTab)?.label}
            </h1>
            <p className="text-xs text-zinc-400">
              Authenticated Administrator: <span className="text-emerald-400 font-mono">{adminUser?.email}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onEnterPreview}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Admin Preview</span>
            </button>

            <button
              onClick={onExitToPublic}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Visit Public Portfolio</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {isLoading ? (
          <div className="py-24 text-center">
            <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin mx-auto mb-3" />
            <p className="text-xs text-zinc-400">Loading Admin Studio data from backend...</p>
          </div>
        ) : !dashboardData ? (
          <div className="py-20 text-center">
            <p className="text-xs text-rose-400">Failed to connect to backend server.</p>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <DashboardOverview
                data={dashboardData}
                onNavigateTab={(tab) => setActiveTab(tab)}
                onNewProject={() => {
                  setActiveTab('projects');
                  setOpenCreateProjectDirectly(true);
                }}
              />
            )}

            {activeTab === 'projects' && (
              <ProjectsManager
                projects={dashboardData.projects}
                onRefresh={fetchAdminData}
                showToast={showToast}
                initialCreateOpen={openCreateProjectDirectly}
              />
            )}

            {activeTab === 'services' && (
              <ServicesManager
                services={dashboardData.services}
                onRefresh={fetchAdminData}
                showToast={showToast}
              />
            )}

            {activeTab === 'profile' && (
              <ProfileEditor
                profile={dashboardData.profile}
                onRefresh={fetchAdminData}
                showToast={showToast}
              />
            )}

            {activeTab === 'settings' && (
              <SiteContentManager
                settings={dashboardData.settings}
                onRefresh={fetchAdminData}
                showToast={showToast}
              />
            )}

            {activeTab === 'inquiries' && (
              <InquiriesManager
                inquiries={dashboardData.inquiries}
                onRefresh={fetchAdminData}
                showToast={showToast}
              />
            )}

            {activeTab === 'security-guide' && <AdminSetupGuide />}
          </>
        )}
      </main>
    </div>
  );
};
