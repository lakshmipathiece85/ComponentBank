import React, { useState, useRef, useEffect } from 'react';
import { LogOut, Camera, Check, ShieldCheck, Mail, Building, User } from 'lucide-react';
import { LabUser, LabRole } from '../types';

interface UserProfileBadgeProps {
  user: LabUser;
  onLogout?: () => void;
  onUpdateAvatar?: (newUrl: string) => void;
  theme?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
}

const ROLE_CONFIG: Record<
  LabRole,
  { label: string; ringColor: string; badgeBg: string; badgeText: string }
> = {
  hod: {
    label: 'Head of Department',
    ringColor: 'ring-amber-400',
    badgeBg: 'bg-amber-500/20 border-amber-500/40',
    badgeText: 'text-amber-300',
  },
  incharge: {
    label: 'Lab Incharge',
    ringColor: 'ring-teal-400',
    badgeBg: 'bg-teal-500/20 border-teal-500/40',
    badgeText: 'text-teal-300',
  },
  instructor: {
    label: 'Lab Instructor',
    ringColor: 'ring-blue-400',
    badgeBg: 'bg-blue-500/20 border-blue-500/40',
    badgeText: 'text-blue-300',
  },
  student: {
    label: 'Student',
    ringColor: 'ring-purple-400',
    badgeBg: 'bg-purple-500/20 border-purple-500/40',
    badgeText: 'text-purple-300',
  },
};

export const UserProfileBadge: React.FC<UserProfileBadgeProps> = ({
  user,
  onLogout,
  onUpdateAvatar,
  theme = 'dark',
  size = 'md',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Reset img error if user or avatarUrl changes
  useEffect(() => {
    setImgError(false);
  }, [user.avatarUrl, user.id]);

  const roleMeta = ROLE_CONFIG[user.role] || ROLE_CONFIG.student;

  const getInitials = (name: string) => {
    const parts = name.replace(/^(Dr\.|Er\.|Prof\.)\s*/i, '').trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result && onUpdateAvatar) {
          onUpdateAvatar(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-9 h-9 sm:w-10 sm:h-10',
    lg: 'w-11 h-11 sm:w-12 sm:h-12',
  }[size];

  return (
    <div className="relative shrink-0" ref={menuRef}>
      {/* Profile Trigger Button */}
      <button
        id="top-profile-photo-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center gap-2 p-1 rounded-full hover:bg-slate-800/60 transition-all focus:outline-none focus:ring-2 focus:ring-teal-400"
        title={`${user.name} (${roleMeta.label}) • Click to view profile`}
        aria-expanded={isOpen}
      >
        <div className="relative">
          <div
            className={`${sizeClasses} rounded-full overflow-hidden shadow-lg ring-2 ${roleMeta.ringColor} border-2 border-slate-900 bg-slate-800 flex items-center justify-center transition-transform group-hover:scale-105`}
          >
            {user.avatarUrl && !imgError ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
                className="w-full h-full object-cover object-center"
              />
            ) : (
              <span className="text-sm font-bold text-teal-300 font-mono">
                {getInitials(user.name)}
              </span>
            )}
          </div>
          {/* Active Status Dot */}
          <span
            className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-900 ring-1 ring-emerald-400 shadow-xs"
            title="Active Session"
          />
        </div>

        {/* User preview label on large screens */}
        <div className="hidden xl:flex flex-col text-left pr-1 leading-tight">
          <span
            className={`text-xs font-bold truncate max-w-[130px] ${
              theme === 'light' ? 'text-slate-900' : 'text-white'
            }`}
          >
            {user.name}
          </span>
          <span className="text-[10px] text-teal-400 font-medium">{roleMeta.label}</span>
        </div>
      </button>

      {/* Hidden File Input for Custom Photo Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Profile Dropdown Card */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl z-50 p-4 text-slate-100 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-lg"
          style={{ transformOrigin: 'top right' }}
        >
          {/* Header with Photo & Badge */}
          <div className="flex items-center gap-3.5 pb-3 border-b border-slate-800">
            <div className="relative group">
              <div
                className={`w-14 h-14 rounded-full overflow-hidden ring-2 ${roleMeta.ringColor} border-2 border-slate-950 bg-slate-800 flex items-center justify-center`}
              >
                {user.avatarUrl && !imgError ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    referrerPolicy="no-referrer"
                    onError={() => setImgError(true)}
                    className="w-full h-full object-cover object-center"
                  />
                ) : (
                  <span className="text-base font-bold text-teal-300 font-mono">
                    {getInitials(user.name)}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-[9px] font-semibold text-white transition-opacity"
                title="Change profile photo"
              >
                <Camera className="w-4 h-4 mb-0.5 text-amber-300" />
                <span>Change</span>
              </button>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-white truncate">{user.name}</h3>
                <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0" />
              </div>
              <p className="text-[11px] text-slate-300 truncate mt-0.5">{user.designation}</p>
              <div className="mt-1">
                <span
                  className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${roleMeta.badgeBg} ${roleMeta.badgeText}`}
                >
                  {roleMeta.label}
                </span>
              </div>
            </div>
          </div>

          {/* User Details Details List */}
          <div className="py-3 space-y-2 text-xs border-b border-slate-800">
            <div className="flex items-center gap-2 text-slate-300">
              <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{user.email}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{user.department}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400 text-[11px]">
              <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>User ID: {user.id}</span>
            </div>
          </div>

          {/* Quick Photo Upload & Sign Out Buttons */}
          <div className="pt-3 flex items-center justify-between gap-2">
            <button
              type="button"
              id="change-photo-btn"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              <Camera className="w-3.5 h-3.5 text-amber-400" />
              <span>Upload Photo</span>
            </button>

            {onLogout && (
              <button
                type="button"
                id="profile-dropdown-logout-btn"
                onClick={() => {
                  setIsOpen(false);
                  onLogout();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-300 hover:text-rose-100 border border-rose-800/80 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
