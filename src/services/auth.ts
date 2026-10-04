import { LabRole } from '../types';

export const ROLE_DEFAULT_PASSWORDS: Record<LabRole, string> = {
  hod: '123456789',
  incharge: '123456789',
  instructor: '123456789',
  student: '123456789',
};

export const ROLE_ACCEPTED_PASSWORDS: Record<LabRole, string[]> = {
  hod: ['123456789', 'hod@kec2024', 'hod123', 'kec@123', 'admin123', 'admin'],
  incharge: ['123456789', 'incharge@kec2024', 'incharge123', 'kec@123', 'ece@123'],
  instructor: ['123456789', 'instructor@kec2024', 'instructor123', 'kec@123'],
  student: ['123456789', 'student@kec2024', 'student123', 'kec@123'],
};

export function getRoleDefaultPassword(role: LabRole): string {
  try {
    const saved = localStorage.getItem(`kec_pwd_${role}`);
    if (saved) return saved;
  } catch (e) {
    // ignore
  }
  return '123456789';
}

export function verifyRolePassword(role: LabRole, passwordInput: string): boolean {
  const trimmed = passwordInput.trim();
  if (!trimmed) return false;

  // Universal temporary password
  if (trimmed === '123456789') return true;

  try {
    const saved = localStorage.getItem(`kec_pwd_${role}`);
    if (saved && saved === trimmed) return true;
  } catch (e) {
    // ignore
  }

  const accepted = ROLE_ACCEPTED_PASSWORDS[role] || [];
  return accepted.some((pwd) => pwd.toLowerCase() === trimmed.toLowerCase());
}

export function setRolePassword(role: LabRole, newPassword: string): void {
  try {
    localStorage.setItem(`kec_pwd_${role}`, newPassword.trim());
  } catch (e) {
    // ignore
  }
}
