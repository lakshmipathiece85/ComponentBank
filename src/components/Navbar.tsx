import React, { useState } from 'react';
import {
  Cpu,
  Layers,
  ClipboardList,
  CalendarCheck2,
  History,
  Sparkles,
  Cloud,
  HardDrive,
  Plus,
  RefreshCw,
  AlertTriangle,
  Lock,
  LogOut,
  UserCheck,
  Eye,
  EyeOff,
  KeyRound,
  Shield,
  LogIn,
  CheckCircle2,
} from 'lucide-react';
import { LabRole, LabUser, NavigationTab } from '../types';
import { LAB_USERS, DEFAULT_USERS } from '../services/initialData';
import { UserProfileBadge } from './UserProfileBadge';
import { DepartmentLogo } from './CollegeLogo';
import { getRoleDefaultPassword, verifyRolePassword } from '../services/auth';

export interface StorageStatus {
  isCloud: boolean;
  projectId?: string;
}

interface NavbarProps {
  currentTab?: NavigationTab;
  activeTab?: NavigationTab;
  onSelectTab?: (tab: NavigationTab) => void;
  setActiveTab?: (tab: NavigationTab) => void;
  currentUser: LabUser;
  setCurrentUser?: (user: LabUser) => void;
  onSwitchRole?: (role: LabRole) => void;
  storageStatus?: StorageStatus;
  overdueCount?: number;
  pendingReservationsCount?: number;
  pendingTasksCount?: number;
  tasksCount?: number;
  onOpenIssueModal?: () => void;
  onOpenNewTaskModal?: () => void;
  onResetDemo?: () => void;
  availableUsers?: LabUser[];
  theme?: 'light' | 'dark';
  isLoggedIn?: boolean;
  onLogout?: () => void;
  onUpdateAvatar?: (newUrl: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  activeTab,
  onSelectTab,
  setActiveTab,
  currentUser,
  setCurrentUser,
  onSwitchRole,
  storageStatus = { isCloud: false, projectId: undefined },
  overdueCount = 0,
  pendingReservationsCount = 0,
  pendingTasksCount = 0,
  tasksCount = 0,
  onOpenIssueModal,
  onOpenNewTaskModal,
  onResetDemo,
  availableUsers = DEFAULT_USERS,
  theme = 'light',
  isLoggedIn = true,
  onLogout,
  onUpdateAvatar,
}) => {
  const effectiveTab = activeTab || currentTab || 'inventory';
  const [pendingRoleSwitch, setPendingRoleSwitch] = useState<LabRole | null>(null);
  const [switchPassword, setSwitchPassword] = useState('');
  const [showSwitchPassword, setShowSwitchPassword] = useState(false);
  const [switchError, setSwitchError] = useState('');

  const handleSelectTab = (tab: NavigationTab) => {
    if (setActiveTab) setActiveTab(tab);
    if (onSelectTab) onSelectTab(tab);
  };

  const handleRoleChange = (role: LabRole) => {
    if (role === currentUser.role) return;
    setPendingRoleSwitch(role);
    setSwitchPassword('');
    setShowSwitchPassword(false);
    setSwitchError('');
  };

  const handleConfirmRoleSwitch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!pendingRoleSwitch) return;

    if (!switchPassword.trim()) {
      setSwitchError(`Password is required. (Default: ${getRoleDefaultPassword(pendingRoleSwitch)})`);
      return;
    }

    if (!verifyRolePassword(pendingRoleSwitch, switchPassword)) {
      setSwitchError(`Invalid password for ${pendingRoleSwitch.toUpperCase()}. (Hint: ${getRoleDefaultPassword(pendingRoleSwitch)})`);
      return;
    }

    // Authenticated successfully
    if (onSwitchRole) {
      onSwitchRole(pendingRoleSwitch);
    } else if (setCurrentUser) {
      const user = availableUsers.find((u) => u.role === pendingRoleSwitch) || LAB_USERS[pendingRoleSwitch] || availableUsers[0];
      setCurrentUser(user);
      sessionStorage.setItem('kec_ece_logged_user', JSON.stringify(user));
    }
    setPendingRoleSwitch(null);
    setSwitchPassword('');
    setSwitchError('');
  };

  const effectiveTasksCount = pendingTasksCount || tasksCount || 0;
  const isCloud = Boolean(storageStatus?.isCloud);
  const projectId = storageStatus?.projectId;

  // Tab styling helper: ensures selected button has dark font in light mode
  const getTabClass = (tab: NavigationTab) => {
    const isSelected = effectiveTab === tab;
    if (isSelected) {
      return theme === 'light'
        ? 'bg-sky-200 text-slate-950 font-bold border-2 border-sky-600 shadow-sm active-tab selected-btn'
        : 'bg-teal-600/20 text-teal-300 border border-teal-500/40 font-semibold active-tab selected-btn';
    }
    return theme === 'light'
      ? 'text-slate-700 hover:text-slate-950 hover:bg-sky-100/80 border border-transparent font-medium'
      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent font-medium';
  };

  const getTabIconClass = (tab: NavigationTab) => {
    const isSelected = effectiveTab === tab;
    if (isSelected) {
      return theme === 'light' ? 'text-sky-950 w-4 h-4' : 'text-teal-300 w-4 h-4';
    }
    return theme === 'light' ? 'text-slate-600 w-4 h-4' : 'text-slate-400 w-4 h-4';
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-slate-100 shadow-md">
      {/* Main Bar: Logo, College Title, Persona Switcher & Cloud Indicator */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between py-2.5 gap-3">
          
          {/* Left Section: Storage Sync Status */}
          <div className="flex items-center gap-3">
            <div
              title={isCloud ? `Connected to Firestore: ${projectId}` : 'Syncing via Real-Time Local Storage'}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium shadow-xs ${
                isCloud
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60'
                  : 'bg-slate-800/90 text-slate-300 border border-slate-700'
              }`}
            >
              {isCloud ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <Cloud className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Firestore Cloud Sync</span>
                </>
              ) : (
                <>
                  <HardDrive className="w-3.5 h-3.5 text-amber-400" />
                  <span>Local Mode (Vite Ready)</span>
                </>
              )}
            </div>
          </div>

          {/* Right Section: Persona Role Switcher & Action Buttons */}
          <div className="flex flex-wrap items-center justify-end gap-2.5 w-full md:w-auto">

            {!isLoggedIn ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold shadow-xs">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Sign In Required</span>
                </div>
              </div>
            ) : (
              <>
                {/* Role Switcher Pill */}
                <div className="flex items-center bg-slate-800 p-1 rounded-lg border border-slate-700">
                  <span className="text-[11px] text-slate-400 px-2 font-medium hidden sm:inline">
                    Role:
                  </span>
                  <button
                    id="role-btn-hod"
                    onClick={() => handleRoleChange('hod')}
                    className={`px-2.5 py-1 text-xs rounded-md transition-all ${
                      currentUser.role === 'hod'
                        ? (theme === 'light' ? 'bg-amber-200 text-slate-950 font-bold border-2 border-amber-600 shadow-xs selected-btn' : 'bg-amber-600 text-white font-medium shadow-sm')
                        : (theme === 'light' ? 'text-slate-700 hover:text-slate-950 hover:bg-sky-100' : 'text-slate-300 hover:text-white hover:bg-slate-700/60')
                    }`}
                  >
                    HoD
                  </button>
                  <button
                    id="role-btn-incharge"
                    onClick={() => handleRoleChange('incharge')}
                    className={`px-2.5 py-1 text-xs rounded-md transition-all ${
                      currentUser.role === 'incharge'
                        ? (theme === 'light' ? 'bg-sky-200 text-slate-950 font-bold border-2 border-sky-600 shadow-xs selected-btn' : 'bg-teal-600 text-white font-medium shadow-sm')
                        : (theme === 'light' ? 'text-slate-700 hover:text-slate-950 hover:bg-sky-100' : 'text-slate-300 hover:text-white hover:bg-slate-700/60')
                    }`}
                  >
                    Lab Incharge
                  </button>
                  <button
                    id="role-btn-instructor"
                    onClick={() => handleRoleChange('instructor')}
                    className={`px-2.5 py-1 text-xs rounded-md transition-all ${
                      currentUser.role === 'instructor'
                        ? (theme === 'light' ? 'bg-sky-200 text-slate-950 font-bold border-2 border-sky-600 shadow-xs selected-btn' : 'bg-blue-600 text-white font-medium shadow-sm')
                        : (theme === 'light' ? 'text-slate-700 hover:text-slate-950 hover:bg-sky-100' : 'text-slate-300 hover:text-white hover:bg-slate-700/60')
                    }`}
                  >
                    Lab Instructor
                  </button>
                </div>
              </>
            )}

            {/* Reset / Catalog Helper Button */}
            {isLoggedIn && onResetDemo && (
              <button
                id="reset-demo-btn"
                onClick={onResetDemo}
                title="Reset sample laboratory equipment and records"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}

            {/* Quick Action: Issue Equipment */}
            {isLoggedIn && currentUser.role !== 'student' && onOpenIssueModal && (
              <button
                id="quick-issue-btn"
                onClick={onOpenIssueModal}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-lg shadow hover:from-teal-400 hover:to-emerald-500 transition active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Issue Equipment</span>
              </button>
            )}

            {/* Quick Action: New Task */}
            {isLoggedIn && currentUser.role !== 'student' && onOpenNewTaskModal && (
              <button
                id="quick-new-task-btn"
                onClick={onOpenNewTaskModal}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-800 border border-slate-700 text-slate-200 rounded-lg hover:bg-slate-700 transition active:scale-95"
              >
                <ClipboardList className="w-3.5 h-3.5 text-teal-400" />
                <span>Assign Task</span>
              </button>
            )}

            {/* Sign Out Button */}
            {isLoggedIn && onLogout && (
              <button
                id="nav-sign-out-btn"
                onClick={onLogout}
                title="Sign out of laboratory portal"
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-lg bg-rose-950/70 hover:bg-rose-900 text-rose-300 hover:text-rose-100 border border-rose-700/60 transition shadow-xs active:scale-95"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Sign Out</span>
              </button>
            )}

            {/* Profile photo of the user when logged in (Right top, below header banner) */}
            {isLoggedIn && (
              <div className="pl-1.5 border-l border-slate-700 flex items-center">
                <UserProfileBadge
                  user={currentUser}
                  onLogout={onLogout}
                  onUpdateAvatar={onUpdateAvatar}
                  theme={theme}
                  size="md"
                />
              </div>
            )}
          </div>
        </div>

        {/* Main Navigation Tabs */}
        {isLoggedIn && (
          <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            id="nav-tab-inventory"
            onClick={() => handleSelectTab('inventory')}
            className={`flex items-center gap-2 px-3.5 py-2 text-sm rounded-lg whitespace-nowrap transition-all ${getTabClass('inventory')}`}
          >
            <Cpu className={getTabIconClass('inventory')} />
            <span>Components & Equipment</span>
          </button>

          <button
            id="nav-tab-rentals"
            onClick={() => handleSelectTab('rentals')}
            className={`flex items-center gap-2 px-3.5 py-2 text-sm rounded-lg whitespace-nowrap transition-all ${getTabClass('rentals')}`}
          >
            <Layers className={getTabIconClass('rentals')} />
            <span>Rentals & Checkouts</span>
            {overdueCount > 0 && (
              <span className="px-1.5 py-0.2 bg-rose-500 text-white rounded-full text-[10px] font-bold animate-pulse">
                {overdueCount} overdue
              </span>
            )}
          </button>

          <button
            id="nav-tab-reservations"
            onClick={() => handleSelectTab('reservations')}
            className={`flex items-center gap-2 px-3.5 py-2 text-sm rounded-lg whitespace-nowrap transition-all ${getTabClass('reservations')}`}
          >
            <CalendarCheck2 className={getTabIconClass('reservations')} />
            <span>Reservations</span>
            {pendingReservationsCount > 0 && (
              <span className="px-1.5 py-0.2 bg-amber-500 text-slate-950 rounded-full text-[10px] font-bold">
                {pendingReservationsCount}
              </span>
            )}
          </button>

          <button
            id="nav-tab-tasks"
            onClick={() => handleSelectTab('tasks')}
            className={`flex items-center gap-2 px-3.5 py-2 text-sm rounded-lg whitespace-nowrap transition-all ${getTabClass('tasks')}`}
          >
            <ClipboardList className={getTabIconClass('tasks')} />
            <span>Lab Tasks & Bench</span>
            {effectiveTasksCount > 0 && (
              <span className="px-1.5 py-0.2 bg-blue-500 text-white rounded-full text-[10px] font-bold">
                {effectiveTasksCount}
              </span>
            )}
          </button>

          <button
            id="nav-tab-logs"
            onClick={() => handleSelectTab('audit')}
            className={`flex items-center gap-2 px-3.5 py-2 text-sm rounded-lg whitespace-nowrap transition-all ${getTabClass('audit')}`}
          >
            <History className={getTabIconClass('audit')} />
            <span>Audit & Activity</span>
          </button>
        </nav>
        )}
      </div>

      {/* Role Switch Password Authentication Modal */}
      {pendingRoleSwitch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-slate-100">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <DepartmentLogo size="md" />
                <div>
                  <h3 className="text-base font-bold text-white">
                    Institutional Role Switch
                  </h3>
                  <p className="text-xs text-slate-400">
                    Kuppam Engineering College • Department of ECE
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setPendingRoleSwitch(null);
                  setSwitchPassword('');
                  setSwitchError('');
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-teal-900/60 text-teal-300">
                <Shield className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <span className="text-slate-400">Switching Target Role to: </span>
                <strong className="text-white uppercase font-bold tracking-wide block text-sm">
                  {pendingRoleSwitch === 'hod'
                    ? 'Professor & Head of Department'
                    : pendingRoleSwitch === 'incharge'
                    ? 'Lab Incharge'
                    : 'Lab Instructor'}
                </strong>
                <span className="text-slate-400 text-[11px]">
                  Password verification is required for security clearance.
                </span>
              </div>
            </div>

            <form onSubmit={handleConfirmRoleSwitch} className="space-y-3 text-xs">
              {switchError && (
                <div className="p-2.5 rounded-lg bg-rose-950/60 border border-rose-700 text-rose-300 text-xs">
                  {switchError}
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-300 font-medium">
                    Role Password / PIN:
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setSwitchPassword(getRoleDefaultPassword(pendingRoleSwitch));
                      setSwitchError('');
                    }}
                    className="text-[10px] font-mono text-teal-400 hover:text-teal-300 bg-teal-950/60 px-2 py-0.5 rounded border border-teal-800/50"
                  >
                    Auto-fill: {getRoleDefaultPassword(pendingRoleSwitch)}
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showSwitchPassword ? 'text' : 'password'}
                    value={switchPassword}
                    onChange={(e) => {
                      setSwitchPassword(e.target.value);
                      if (switchError) setSwitchError('');
                    }}
                    placeholder={`Enter password for ${pendingRoleSwitch.toUpperCase()}...`}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-3 pr-9 py-2 text-white focus:outline-none focus:border-teal-500"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowSwitchPassword(!showSwitchPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5"
                  >
                    {showSwitchPassword ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Key for {pendingRoleSwitch.toUpperCase()}: <span className="font-mono text-teal-300 font-semibold">{getRoleDefaultPassword(pendingRoleSwitch)}</span>
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPendingRoleSwitch(null);
                    setSwitchPassword('');
                    setSwitchError('');
                  }}
                  className="px-3 py-1.5 rounded-lg text-slate-300 hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold transition flex items-center gap-1.5 shadow-md"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verify & Switch Role</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};

