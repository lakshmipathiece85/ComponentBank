import React, { useState } from 'react';
import {
  ShieldCheck,
  Cpu,
  Wrench,
  LogIn,
  LogOut,
  CheckCircle2,
  Lock,
  Unlock,
  UserCheck,
  ChevronRight,
  ChevronDown,
  Sparkles,
  ArrowRight,
  Shield,
  KeyRound,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { LabRole, LabUser } from '../types';
import { DepartmentLogo } from './CollegeLogo';
import { getRoleDefaultPassword, verifyRolePassword } from '../services/auth';

interface RoleLoginPortalProps {
  currentUser: LabUser;
  onSelectRole: (role: LabRole, customUser?: LabUser) => void;
  availableUsers: LabUser[];
  isLoggedIn: boolean;
  onLogout?: () => void;
}

export const RoleLoginPortal: React.FC<RoleLoginPortalProps> = ({
  currentUser,
  onSelectRole,
  availableUsers,
  isLoggedIn,
  onLogout,
}) => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [targetRoleForModal, setTargetRoleForModal] = useState<LabRole | null>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showModalPassword, setShowModalPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isRolePickerExpanded, setIsRolePickerExpanded] = useState(false);

  // Per-card password entry state
  const [cardPasswords, setCardPasswords] = useState<Record<string, string>>({
    hod: '',
    incharge: '',
    instructor: '',
  });
  const [showCardPassword, setShowCardPassword] = useState<Record<string, boolean>>({
    hod: false,
    incharge: false,
    instructor: false,
  });
  const [cardErrors, setCardErrors] = useState<Record<string, string>>({
    hod: '',
    incharge: '',
    instructor: '',
  });

  const roleProfiles: Array<{
    role: LabRole;
    title: string;
    designation: string;
    defaultName: string;
    email: string;
    avatarBg: string;
    borderColor: string;
    activeBorder: string;
    icon: React.ReactNode;
    badge: string;
    responsibilities: string[];
    accessLevel: string;
  }> = [
    {
      role: 'hod',
      title: 'Head of Department (HoD)',
      designation: 'Professor & HoD ECE, R&D Director',
      defaultName: 'Dr. G.N Kodandaramaiah',
      email: 'hod.ece@kec.ac.in',
      avatarBg: 'from-amber-600 to-orange-700 text-amber-100',
      borderColor: 'border-amber-500/30',
      activeBorder: 'border-amber-400 ring-2 ring-amber-400/40 bg-amber-950/20',
      icon: <ShieldCheck className="w-5 h-5 text-amber-300" />,
      badge: 'Executive Oversight & R&D',
      responsibilities: [
        'Lab budget & equipment procurement sign-offs',
        'R&D initiatives, research labs & department analytics',
        'Lab policy & academic project kits clearance',
      ],
      accessLevel: 'Full Administrative & R&D Authority',
    },
    {
      role: 'incharge',
      title: 'Lab Incharge',
      designation: 'Associate Professor in ECE & Lab Incharge',
      defaultName: 'Dr. M. Lakshmipathy',
      email: 'lakshmipathiece@gmail.com',
      avatarBg: 'from-teal-600 to-emerald-700 text-teal-100',
      borderColor: 'border-teal-500/30',
      activeBorder: 'border-teal-400 ring-2 ring-teal-400/40 bg-teal-950/20',
      icon: <Cpu className="w-5 h-5 text-teal-300" />,
      badge: 'Inventory & Operations',
      responsibilities: [
        'Component inventory management & stock updates',
        'Student reservations approval & rejection',
        'Task delegation & technical assistant scheduling',
      ],
      accessLevel: 'Lab Management & Approvals',
    },
    {
      role: 'instructor',
      title: 'Lab Instructor',
      designation: 'Lab Instructor & Hardware Eng.',
      defaultName: 'Er. Ramesh Varma',
      email: 'ramesh.varma@kec.ac.in',
      avatarBg: 'from-blue-600 to-indigo-700 text-blue-100',
      borderColor: 'border-blue-500/30',
      activeBorder: 'border-blue-400 ring-2 ring-blue-400/40 bg-blue-950/20',
      icon: <Wrench className="w-5 h-5 text-blue-300" />,
      badge: 'Bench & Equipment Operations',
      responsibilities: [
        'Physical issuing & check-in of sensors & kits',
        'Equipment health calibration & testing checklist',
        'Gate pass generation & component condition logging',
      ],
      accessLevel: 'Bench Operations & Returns',
    },
  ];

  const handleOpenCredentialsModal = (role: LabRole) => {
    const profile = roleProfiles.find((p) => p.role === role);
    setTargetRoleForModal(role);
    setLoginEmail(profile?.email || '');
    setLoginPassword('');
    setShowModalPassword(false);
    setLoginError('');
    setIsLoginModalOpen(true);
  };

  const handleCardLogin = (role: LabRole) => {
    const inputPwd = cardPasswords[role] || '';
    if (!inputPwd.trim()) {
      setCardErrors((prev) => ({
        ...prev,
        [role]: `Password required (Default: ${getRoleDefaultPassword(role)})`,
      }));
      return;
    }

    if (!verifyRolePassword(role, inputPwd)) {
      setCardErrors((prev) => ({
        ...prev,
        [role]: `Incorrect password. Key: ${getRoleDefaultPassword(role)}`,
      }));
      return;
    }

    // Success: clear error and log in
    setCardErrors((prev) => ({ ...prev, [role]: '' }));
    onSelectRole(role);
  };

  const handleCredentialLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetRoleForModal) return;

    if (!loginEmail.trim()) {
      setLoginError('Please enter a valid college email address or roll number.');
      return;
    }

    if (!loginPassword.trim()) {
      setLoginError(`Password is required. (Default: ${getRoleDefaultPassword(targetRoleForModal)})`);
      return;
    }

    if (!verifyRolePassword(targetRoleForModal, loginPassword)) {
      setLoginError(
        `Invalid password for ${targetRoleForModal.toUpperCase()}. (Default: ${getRoleDefaultPassword(targetRoleForModal)})`
      );
      return;
    }

    const matchedUser = availableUsers.find((u) => u.role === targetRoleForModal);
    if (matchedUser) {
      onSelectRole(targetRoleForModal, {
        ...matchedUser,
        email: loginEmail.trim(),
      });
    } else {
      onSelectRole(targetRoleForModal);
    }
    setIsLoginModalOpen(false);
  };

  return (
    <section className="bg-slate-900/95 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden backdrop-blur-md">
      {/* Background Subtle Gradient Accents */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Role Logins & Status Section */}
      <div className="space-y-4">
        {isLoggedIn && (
          /* Unlocked Active State Banner */
          <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/30 p-3.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0">
                <Unlock className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold text-emerald-300">
                    Component Details Unlocked
                  </span>
                  <span className="text-slate-400 text-xs">•</span>
                  <span className="text-xs text-slate-300">
                    Logged in as: <strong className="text-white font-bold">{currentUser.name}</strong> ({currentUser.designation})
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {currentUser.role}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Full access granted to component catalog, specifications, stock levels, and laboratory tools.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={() => setIsRolePickerExpanded(!isRolePickerExpanded)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1.5"
              >
                <span>{isRolePickerExpanded ? 'Hide Role Switcher' : 'Switch Role'}</span>
                {isRolePickerExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>

              {onLogout && (
                <button
                  id="portal-sign-out-btn"
                  onClick={onLogout}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-950/60 hover:bg-rose-900 text-rose-300 hover:text-rose-100 border border-rose-700/60 transition flex items-center gap-1.5 shadow-xs"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Display Role Cards: Always when NOT logged in, or when expanded in logged-in state */}
        {(!isLoggedIn || isRolePickerExpanded) && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-teal-400" />
                  <span>{isLoggedIn ? 'Switch Active Institutional Role' : 'Institutional Role Sign-In'}</span>
                  <span className="text-xs font-normal text-slate-400">
                    ({isLoggedIn ? 'Select another profile' : 'Click to log in and unlock components'})
                  </span>
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
              {roleProfiles.map((p) => {
                const isCurrent = isLoggedIn && currentUser.role === p.role;
                const matchedUser = availableUsers.find((u) => u.role === p.role);
                const userName = matchedUser?.name || p.defaultName;

                return (
                  <div
                    key={p.role}
                    className={`relative rounded-xl border p-4 transition-all duration-200 flex flex-col justify-between ${
                      isCurrent
                        ? `${p.activeBorder} shadow-lg bg-slate-850`
                        : `${p.borderColor} bg-slate-900/60 hover:bg-slate-800/80 hover:border-slate-600`
                    }`}
                  >
                    {/* Active Indicator Ribbon */}
                    {isCurrent && (
                      <div className="absolute -top-2.5 right-3 bg-teal-500 text-slate-950 font-bold text-[10px] px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm uppercase tracking-wide">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Active</span>
                      </div>
                    )}

                    <div>
                      {/* Card Header: Icon + Role Title */}
                      <div className="flex items-start gap-3 mb-2.5">
                        <div className={`p-2.5 rounded-xl bg-gradient-to-br ${p.avatarBg} shadow-sm shrink-0`}>
                          {p.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-bold text-white truncate" title={userName}>
                            {userName}
                          </h4>
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">{p.designation}</p>
                        </div>
                      </div>

                      {/* Access Level Badge */}
                      <div className="mb-3">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                          {p.accessLevel}
                        </span>
                      </div>

                      {/* Responsibilities list */}
                      <div className="space-y-1.5 mb-4 text-[11px] text-slate-300">
                        {p.responsibilities.map((resp, i) => (
                          <div key={i} className="flex items-start gap-1.5 leading-tight">
                            <span className="text-teal-400 mt-0.5">•</span>
                            <span className="text-slate-400">{resp}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Password Entry Section for Unauthenticated or Switching Roles */}
                    {!isCurrent ? (
                      <div className="pt-2.5 pb-1 border-t border-slate-800/80 space-y-2 mt-auto">
                        <div className="flex items-center justify-between text-[11px]">
                          <label
                            htmlFor={`pwd-input-${p.role}`}
                            className="text-slate-300 font-semibold flex items-center gap-1"
                          >
                            <KeyRound className="w-3 h-3 text-teal-400" />
                            <span>Password</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              const defaultPwd = getRoleDefaultPassword(p.role);
                              setCardPasswords((prev) => ({ ...prev, [p.role]: defaultPwd }));
                              setCardErrors((prev) => ({ ...prev, [p.role]: '' }));
                            }}
                            title="Click to auto-fill default password"
                            className="text-[10px] font-mono text-teal-400 hover:text-teal-300 bg-teal-950/60 hover:bg-teal-900/80 px-2 py-0.5 rounded border border-teal-700/50 transition cursor-pointer flex items-center gap-1"
                          >
                            <span className="text-slate-400 font-sans">Key:</span>
                            <span className="underline decoration-dotted">{getRoleDefaultPassword(p.role)}</span>
                          </button>
                        </div>

                        <div className="relative">
                          <input
                            id={`pwd-input-${p.role}`}
                            type={showCardPassword[p.role] ? 'text' : 'password'}
                            value={cardPasswords[p.role] || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCardPasswords((prev) => ({ ...prev, [p.role]: val }));
                              if (cardErrors[p.role]) {
                                setCardErrors((prev) => ({ ...prev, [p.role]: '' }));
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleCardLogin(p.role);
                              }
                            }}
                            placeholder="Enter password..."
                            className="w-full bg-slate-950 border border-slate-700/80 rounded-lg pl-3 pr-8 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-500"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowCardPassword((prev) => ({ ...prev, [p.role]: !prev[p.role] }))
                            }
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-0.5"
                            title={showCardPassword[p.role] ? 'Hide password' : 'Show password'}
                          >
                            {showCardPassword[p.role] ? (
                              <EyeOff className="w-3.5 h-3.5" />
                            ) : (
                              <Eye className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>

                        {cardErrors[p.role] && (
                          <div className="text-[11px] text-rose-400 font-medium flex items-center gap-1 animate-in fade-in">
                            <AlertCircle className="w-3 h-3 shrink-0" />
                            <span>{cardErrors[p.role]}</span>
                          </div>
                        )}

                        <div className="pt-1 flex items-center gap-2">
                          <button
                            id={`login-role-btn-${p.role}`}
                            onClick={() => handleCardLogin(p.role)}
                            className="flex-1 py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs bg-teal-600 hover:bg-teal-500 text-white border border-teal-500 shadow-md"
                          >
                            <LogIn className="w-3.5 h-3.5" />
                            <span>
                              {isLoggedIn ? `Switch to ${p.role.toUpperCase()}` : `Login as ${p.role.toUpperCase()}`}
                            </span>
                          </button>

                          <button
                            onClick={() => handleOpenCredentialsModal(p.role)}
                            title={`Custom credentials sign in as ${p.title}`}
                            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition"
                          >
                            <Lock className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Active Role State */
                      <div className="pt-2.5 border-t border-slate-800/80 mt-auto flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>Currently Active & Authenticated</span>
                        </div>
                        <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                          Verified
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Institutional Credentials Login Modal */}
      {isLoginModalOpen && targetRoleForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-slate-100">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <DepartmentLogo size="md" />
                <div>
                  <h3 className="text-base font-bold text-white">
                    College Portal Authentication
                  </h3>
                  <p className="text-xs text-slate-400">
                    Kuppam Engineering College • KES Nagar, Kuppam
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsLoginModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            {/* Target Role summary */}
            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-900/60 text-blue-300">
                <Shield className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <span className="text-slate-400">Target Role: </span>
                <strong className="text-white capitalize font-bold">
                  {roleProfiles.find((r) => r.role === targetRoleForModal)?.title}
                </strong>
                <div className="text-slate-400 text-[11px]">
                  Institutional access with verified role permissions
                </div>
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleCredentialLoginSubmit} className="space-y-3 text-xs">
              {loginError && (
                <div className="p-2.5 rounded-lg bg-rose-950/60 border border-rose-700 text-rose-300 text-xs">
                  {loginError}
                </div>
              )}

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Institutional Email or Roll Number:
                </label>
                <input
                  type="text"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="e.g. user@kec.ac.in or 21ECE045"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-500"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-300 font-medium">
                    Password / PIN:
                  </label>
                  {targetRoleForModal && (
                    <button
                      type="button"
                      onClick={() => {
                        setLoginPassword(getRoleDefaultPassword(targetRoleForModal));
                        setLoginError('');
                      }}
                      className="text-[10px] font-mono text-teal-400 hover:text-teal-300 bg-teal-950/60 px-1.5 py-0.5 rounded border border-teal-800/50"
                    >
                      Use Key: {getRoleDefaultPassword(targetRoleForModal)}
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showModalPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => {
                      setLoginPassword(e.target.value);
                      if (loginError) setLoginError('');
                    }}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-3 pr-9 py-2 text-white focus:outline-none focus:border-teal-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowModalPassword(!showModalPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5"
                  >
                    {showModalPassword ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Default password for {targetRoleForModal?.toUpperCase()}: <span className="font-mono text-teal-300 font-semibold">{targetRoleForModal ? getRoleDefaultPassword(targetRoleForModal) : ''}</span>
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsLoginModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-300 hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold transition flex items-center gap-1.5 shadow-md"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Authenticate & Enter</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
