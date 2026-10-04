import React, { useState } from 'react';
import { X, CalendarCheck2, Cpu, UserCheck } from 'lucide-react';
import { ElectronicComponent, LabUser, ComponentReservation } from '../types';

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  components: ElectronicComponent[];
  preSelectedComponent?: ElectronicComponent | null;
  currentUser: LabUser;
  onSaveReservation: (reservation: ComponentReservation) => Promise<void>;
}

export const ReservationModal: React.FC<ReservationModalProps> = ({
  isOpen,
  onClose,
  components,
  preSelectedComponent,
  currentUser,
  onSaveReservation,
}) => {
  const [selectedCompId, setSelectedCompId] = useState<string>(
    preSelectedComponent?.id || components[0]?.id || ''
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [studentRollNo, setStudentRollNo] = useState(
    currentUser.role === 'student' ? '21ECE045' : ''
  );
  const [studentName, setStudentName] = useState(
    currentUser.role === 'student' ? currentUser.name : ''
  );
  const [studentEmail, setStudentEmail] = useState(
    currentUser.role === 'student' ? currentUser.email : ''
  );

  const today = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 7);

  const [reservedFrom, setReservedFrom] = useState(today.toISOString().split('T')[0]);
  const [reservedUntil, setReservedUntil] = useState(nextWeek.toISOString().split('T')[0]);
  const [purpose, setPurpose] = useState('');
  const [labCourseCode, setLabCourseCode] = useState('EC304');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const currentComp = components.find((c) => c.id === selectedCompId) || components[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!studentRollNo.trim() || !studentName.trim() || !purpose.trim()) {
      setErrorMsg('Roll Number, Student Name, and Purpose are required.');
      return;
    }

    if (!currentComp) {
      setErrorMsg('Please select a component.');
      return;
    }

    const newReservation: ComponentReservation = {
      id: 'res-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      componentId: currentComp.id,
      componentName: currentComp.name,
      componentModel: currentComp.modelNumber,
      quantity,
      studentRollNo: studentRollNo.trim().toUpperCase(),
      studentName: studentName.trim(),
      studentEmail: studentEmail.trim() || `${studentRollNo.toLowerCase()}@student.univ.edu`,
      purpose: purpose.trim(),
      labCourseCode: labCourseCode.trim() || undefined,
      requestedAt: new Date().toISOString(),
      reservedFrom: new Date(reservedFrom).toISOString(),
      reservedUntil: new Date(reservedUntil).toISOString(),
      status: 'pending',
    };

    try {
      setIsSubmitting(true);
      await onSaveReservation(newReservation);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit reservation');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden my-6">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-800/60">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-600/20 text-amber-400 rounded-lg border border-amber-500/30">
              <CalendarCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Reserve Laboratory Equipment</h3>
              <p className="text-xs text-slate-400">Lock in hardware for upcoming lab sessions or projects</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 text-xs rounded-lg">
              {errorMsg}
            </div>
          )}

          {/* Component Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Select Component / Equipment *
            </label>
            <select
              value={selectedCompId}
              onChange={(e) => setSelectedCompId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none"
            >
              {components.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.modelNumber}) — {c.availableQuantity} currently available
                </option>
              ))}
            </select>
          </div>

          {/* Quantity and Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Quantity *</label>
              <input
                type="number"
                min={1}
                max={currentComp ? currentComp.totalQuantity : 5}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Start Date *</label>
              <input
                type="date"
                value={reservedFrom}
                onChange={(e) => setReservedFrom(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">End Date *</label>
              <input
                type="date"
                value={reservedUntil}
                onChange={(e) => setReservedUntil(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none"
              />
            </div>
          </div>

          {/* Student details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Student Roll No *</label>
              <input
                type="text"
                placeholder="e.g. 21ECE045"
                value={studentRollNo}
                onChange={(e) => setStudentRollNo(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white font-mono uppercase focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Student Full Name *</label>
              <input
                type="text"
                placeholder="e.g. Rohan Deshmukh"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email</label>
              <input
                type="email"
                placeholder="student@univ.edu"
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Course / Lab Code</label>
              <input
                type="text"
                placeholder="e.g. EC401 Microprocessors"
                value={labCourseCode}
                onChange={(e) => setLabCourseCode(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none"
              />
            </div>
          </div>

          {/* Purpose */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Purpose / Experiment Title *
            </label>
            <input
              type="text"
              placeholder="e.g. BTech Capstone Project: Autonomous Rover Obstacle Avoidance"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none"
              required
            />
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white rounded-lg shadow transition active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Reservation Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
