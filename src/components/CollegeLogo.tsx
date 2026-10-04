import React, { useState } from 'react';

interface LogoItemProps {
  variant?: 'department' | 'club';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const DepartmentLogo: React.FC<{ size?: 'sm' | 'md' | 'lg' | 'xl'; className?: string }> = ({
  size = 'md',
  className = '',
}) => {
  const [imgError, setImgError] = useState(false);

  const dimensionMap = {
    sm: 'w-8 h-8 min-w-[2rem]',
    md: 'w-12 h-12 min-w-[3rem]',
    lg: 'w-16 h-16 min-w-[4rem]',
    xl: 'w-20 h-20 min-w-[5rem]',
  };

  const selectedDimension = dimensionMap[size];

  if (imgError) {
    return (
      <div
        className={`${selectedDimension} ${className} rounded-full bg-gradient-to-br from-sky-900 via-blue-950 to-sky-900 border-2 border-blue-400 p-0.5 flex items-center justify-center shadow-md relative overflow-hidden flex-shrink-0`}
        title="Department of Electronics & Communication Engineering - Kuppam Educational Society"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Gear teeth */}
          <circle cx="50" cy="50" r="46" fill="#0284c7" stroke="#ffffff" strokeWidth="1" />
          <circle cx="50" cy="50" r="38" fill="#ffffff" />
          <circle cx="50" cy="50" r="32" fill="#0369a1" />
          {/* Central Diya Lamp & Atom */}
          <ellipse cx="50" cy="50" rx="20" ry="8" fill="none" stroke="#ffffff" strokeWidth="1.2" transform="rotate(-30 50 50)" />
          <ellipse cx="50" cy="50" rx="20" ry="8" fill="none" stroke="#ffffff" strokeWidth="1.2" transform="rotate(30 50 50)" />
          <circle cx="50" cy="50" r="4" fill="#f59e0b" />
          <path d="M48 42 Q50 36 52 42 Z" fill="#ef4444" />
          <text x="50" y="74" textAnchor="middle" fontSize="6.5" fontWeight="bold" fill="#ffffff">
            KES • ECE
          </text>
        </svg>
      </div>
    );
  }

  return (
    <div
      className={`${selectedDimension} ${className} rounded-full overflow-hidden border-2 border-blue-400/90 shadow-md bg-white flex items-center justify-center flex-shrink-0 transition-transform hover:scale-105`}
      title="Department of Electronics and Communication Engineering - Kuppam Educational Society"
    >
      <img
        src="/assets/kes_college_logo.jpg"
        alt="Department of Electronics and Communication Engineering Logo"
        referrerPolicy="no-referrer"
        onError={() => setImgError(true)}
        className="w-full h-full object-cover object-center rounded-full"
      />
    </div>
  );
};

export const ClubLogo: React.FC<{ size?: 'sm' | 'md' | 'lg' | 'xl'; className?: string }> = ({
  size = 'md',
  className = '',
}) => {
  const [imgError, setImgError] = useState(false);

  const dimensionMap = {
    sm: 'w-8 h-8 min-w-[2rem]',
    md: 'w-12 h-12 min-w-[3rem]',
    lg: 'w-16 h-16 min-w-[4rem]',
    xl: 'w-20 h-20 min-w-[5rem]',
  };

  const selectedDimension = dimensionMap[size];

  if (imgError) {
    return (
      <div
        className={`${selectedDimension} ${className} rounded-full bg-gradient-to-br from-blue-900 via-indigo-950 to-blue-900 border-2 border-amber-400 p-0.5 flex items-center justify-center shadow-md relative overflow-hidden flex-shrink-0`}
        title="Nextgen ECE Innovators Club (NEIC)"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r="47" fill="#0f172a" stroke="#f59e0b" strokeWidth="2.5" />
          <circle cx="50" cy="50" r="40" fill="#f8fafc" stroke="#1e3a8a" strokeWidth="1" />
          <ellipse cx="50" cy="50" rx="22" ry="8" fill="none" stroke="#f59e0b" strokeWidth="1.2" transform="rotate(-30 50 50)" />
          <ellipse cx="50" cy="50" rx="22" ry="8" fill="none" stroke="#0284c7" strokeWidth="1.2" transform="rotate(30 50 50)" />
          <rect x="42" y="42" width="16" height="16" rx="2" fill="#1e40af" stroke="#f59e0b" strokeWidth="1" />
          <circle cx="50" cy="50" r="3" fill="#38bdf8" />
          <rect x="22" y="65" width="56" height="11" rx="2" fill="#1e3a8a" stroke="#f59e0b" strokeWidth="0.8" />
          <text x="50" y="73" textAnchor="middle" fontSize="6.5" fontWeight="bold" fill="#ffffff">
            NEIC • ECE
          </text>
        </svg>
      </div>
    );
  }

  return (
    <div
      className={`${selectedDimension} ${className} rounded-full overflow-hidden border-2 border-amber-400/90 shadow-md bg-white flex items-center justify-center flex-shrink-0 transition-transform hover:scale-105`}
      title="Nextgen ECE Innovators Club (NEIC)"
    >
      <img
        src="/assets/kec_niec_logo.jpg"
        alt="Nextgen ECE Innovators Club (NEIC)"
        referrerPolicy="no-referrer"
        onError={() => setImgError(true)}
        className="w-full h-full object-cover object-center rounded-full"
      />
    </div>
  );
};

export interface CollegeLogoProps {
  variant?: 'department' | 'club' | 'dual';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showLabels?: boolean;
}

export const CollegeLogo: React.FC<CollegeLogoProps> = ({
  variant = 'dual',
  size = 'md',
  className = '',
  showLabels = false,
}) => {
  if (variant === 'department') {
    return <DepartmentLogo size={size} className={className} />;
  }

  if (variant === 'club') {
    return <ClubLogo size={size} className={className} />;
  }

  // Dual logo layout: both the Department & Club logos with optional labels
  return (
    <div className={`flex items-center gap-2.5 flex-shrink-0 ${className}`}>
      <div className="flex items-center -space-x-2 hover:space-x-1 transition-all duration-300">
        <DepartmentLogo size={size} className="ring-2 ring-blue-500/30 z-10" />
        <ClubLogo size={size} className="ring-2 ring-amber-400/30 z-20" />
      </div>
      {showLabels && (
        <div className="hidden lg:flex flex-col text-[11px] leading-tight text-slate-300">
          <span className="font-bold text-white">Dept. of ECE & NEIC</span>
          <span className="text-[10px] text-amber-400">Innovators Club</span>
        </div>
      )}
    </div>
  );
};
