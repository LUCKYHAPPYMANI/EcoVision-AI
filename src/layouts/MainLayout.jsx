import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Database,
  TrendingUp,
  Cpu,
  AlertTriangle,
  ShieldAlert,
  Sparkles,
  FileText,
  BookOpen,
  Menu,
  X,
  Activity,
  Layers,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  HardDrive
} from 'lucide-react';
import { getHealth, getAvailableDatasets, loadDataset } from '../services/api';

const navItems = [
  { id: 'dashboard', label: 'Main Dashboard', icon: LayoutDashboard },
  { id: 'explorer', label: 'Data Explorer', icon: Database },
  { id: 'analytics', label: 'Pollution Analytics', icon: TrendingUp },
  { id: 'prediction', label: 'AI Prediction', icon: Cpu },
  { id: 'anomalies', label: 'Anomaly Detection', icon: AlertTriangle },
  { id: 'risk', label: 'Risk Assessment', icon: ShieldAlert },
  { id: 'abatement', label: 'AI Abatement Advisor', icon: Sparkles },
  { id: 'report', label: 'Report Generator', icon: FileText },
  { id: 'about', label: 'About Project', icon: BookOpen },
];

export default function MainLayout({ activePage, setActivePage, children, notification, setNotification }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [healthStatus, setHealthStatus] = useState(null);
  const [datasets, setDatasets] = useState([]);
  const [loadingDataset, setLoadingDataset] = useState(false);

  const fetchHealthAndDatasets = async () => {
    try {
      const h = await getHealth();
      setHealthStatus(h);
      const d = await getAvailableDatasets();
      setDatasets(d.datasets || []);
    } catch (err) {
      console.error('Health check failed:', err);
    }
  };

  useEffect(() => {
    fetchHealthAndDatasets();
    const interval = setInterval(fetchHealthAndDatasets, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectDataset = async (filename) => {
    setLoadingDataset(true);
    try {
      await loadDataset(filename);
      await fetchHealthAndDatasets();
      if (setNotification) {
        setNotification({
          type: 'success',
          message: `Switched active dataset to '${filename}'. Dashboard and analytics updated.`
        });
      }
    } catch (err) {
      if (setNotification) {
        setNotification({
          type: 'error',
          message: `Failed to load dataset: ${err.message}`
        });
      }
    } finally {
      setLoadingDataset(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#070b14] text-slate-100 font-sans">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border backdrop-blur-md shadow-2xl transition-all duration-300 animate-slide-in text-sm max-w-md ${
          notification.type === 'error'
            ? 'bg-red-950/80 border-red-500/40 text-red-200'
            : notification.type === 'warning'
            ? 'bg-amber-950/80 border-amber-500/40 text-amber-200'
            : 'bg-emerald-950/80 border-emerald-500/40 text-emerald-200'
        }">
          {notification.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          )}
          <span className="flex-1">{notification.message}</span>
          <button
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-white ml-2 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col transition-all duration-300 ease-in-out glass-panel border-r border-cyan-500/20 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-cyan-500/15">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan-600 to-teal-400 flex items-center justify-center shadow-lg shadow-cyan-500/20 shrink-0">
              <Layers className="w-5 h-5 text-slate-950" />
            </div>
            {sidebarOpen && (
              <div className="leading-tight">
                <span className="font-bold text-lg tracking-wider bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
                  ECOVISION
                </span>
                <span className="block text-[10px] font-mono tracking-widest text-cyan-400/80">AI SYSTEM</span>
              </div>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-cyan-950/40 transition-colors"
            title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-teal-500/10 text-cyan-300 border border-cyan-500/30 shadow-md shadow-cyan-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
                title={item.label}
              >
                <Icon
                  className={`w-5 h-5 shrink-0 transition-colors ${
                    isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-cyan-300'
                  }`}
                />
                {sidebarOpen && <span className="truncate">{item.label}</span>}
                {isActive && sidebarOpen && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400"></span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Dataset Quick Switcher in Sidebar Footer */}
        {sidebarOpen && (
          <div className="p-3 border-t border-cyan-500/15 bg-slate-900/40">
            <div className="flex items-center justify-between mb-1.5 text-xs text-slate-400 font-mono">
              <span className="flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-cyan-400" /> ACTIVE DATASET
              </span>
              {loadingDataset && <RefreshCw className="w-3 h-3 text-cyan-400 animate-spin" />}
            </div>
            <select
              value={healthStatus?.active_dataset?.name || ''}
              onChange={(e) => handleSelectDataset(e.target.value)}
              disabled={loadingDataset}
              className="w-full text-xs bg-slate-950/80 border border-slate-700/60 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              {datasets.map((d) => (
                <option key={d.filename} value={d.filename}>
                  {d.is_synthetic ? '🧪 [Demo] ' : '🌿 [Authentic] '}
                  {d.display_name}
                </option>
              ))}
            </select>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 h-16 glass-panel border-b border-cyan-500/15 flex items-center justify-between px-6 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-white tracking-wide flex items-center gap-2">
              {navItems.find((n) => n.id === activePage)?.label}
            </h1>
            <span className="hidden md:inline-block px-2.5 py-0.5 text-[11px] font-mono rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
              AIML & Environmental Engineering Assessment
            </span>
          </div>

          {/* Status Indicator */}
          <div className="flex items-center gap-3">
            {healthStatus?.active_dataset?.name && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-slate-900/80 border border-slate-700/50">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-slate-400">Dataset:</span>
                <span className="text-cyan-300 font-medium truncate max-w-[150px]">
                  {healthStatus.active_dataset.name}
                </span>
                <span className="text-slate-500">
                  ({healthStatus.active_dataset.record_count.toLocaleString()} rows)
                </span>
              </div>
            )}

            <div className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-cyan-950/50 text-cyan-300 border border-cyan-500/30">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>API ONLINE</span>
            </div>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="flex-1 p-6 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
