import React, { useState } from 'react';
import { X, RotateCcw, AlertTriangle, CheckCircle, Wrench, ShieldAlert } from 'lucide-react';
import { RentalRecord, LabUser, ComponentCondition } from '../types';

interface ReturnEquipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  rental: RentalRecord | null;
  currentUser: LabUser;
  onConfirmReturn: (
    rentalId: string,
    returnData: {
      conditionOnReturn: ComponentCondition;
      fineAmount: number;
      fineStatus: 'none' | 'pending' | 'paid' | 'waived';
      notes?: string;
      sendToMaintenance?: boolean;
    }
  ) => Promise<void>;
}

export const ReturnEquipmentModal: React.FC<ReturnEquipmentModalProps> = ({
  isOpen,
  onClose,
  rental,
  currentUser,
  onConfirmReturn,
}) => {
  if (!isOpen || !rental) return null;

  // Overdue fine calculation
  const now = new Date().getTime();
  const expected = new Date(rental.expectedReturnDate).getTime();
  const diffDays = Math.max(0, Math.ceil((now - expected) / (1000 * 60 * 60 * 24)));
  const calculatedFine = diffDays > 0 ? diffDays * 10 : rental.fineAmount;

  const [condition, setCondition] = useState<ComponentCondition>('Good');
  const [fineAmount, setFineAmount] = useState<number>(calculatedFine);
  const [fineStatus, setFineStatus] = useState<'none' | 'pending' | 'paid' | 'waived'>(
    calculatedFine > 0 ? 'pending' : 'none'
  );
  const [sendToMaintenance, setSendToMaintenance] = useState(false);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await onConfirmReturn(rental.id, {
        conditionOnReturn: condition,
        fineAmount,
        fineStatus,
        notes: notes.trim() || undefined,
        sendToMaintenance: sendToMaintenance || condition === 'Damaged' || condition === 'Needs Calibration',
      });
      onClose();
    } catch (err) {
      console.error('Error processing return:', err);
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
            <div className="p-2 bg-emerald-600/20 text-emerald-400 rounded-lg border border-emerald-500/30">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Equipment Return & Bench Inspection</h3>
              <p className="text-xs text-slate-400 font-mono">Gate Pass: {rental.gatePassNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Summary Card */}
          <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-3.5 space-y-2 text-xs">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-bold text-white text-sm">
                  {rental.quantity}x {rental.componentName}
                </span>
                <p className="text-slate-400 font-mono">Model: {rental.componentModel}</p>
              </div>
              <span className="px-2 py-0.5 rounded bg-slate-700 text-slate-300 font-semibold">
                Initial: {rental.conditionOnIssue}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-slate-300">
              <div>
                Student: <strong className="text-white">{rental.studentName}</strong> ({rental.studentRollNo})
              </div>
              <div>
                Due: <strong>{new Date(rental.expectedReturnDate).toLocaleDateString()}</strong>
              </div>
            </div>

            {rental.accessoriesIssued.length > 0 && (
              <div className="text-[11px] text-slate-400">
                <span>Accessories to verify: </span>
                <span className="text-teal-300">{rental.accessoriesIssued.join(', ')}</span>
              </div>
            )}
          </div>

          {/* Overdue Warning */}
          {diffDays > 0 && (
            <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl flex items-center gap-2 text-xs text-rose-300">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>
                Rental is <strong>{diffDays} day(s) overdue</strong>. Default late fine: ₹{diffDays * 10} (₹10/day).
              </span>
            </div>
          )}

          {/* Condition on Return */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Component Condition on Return *
            </label>
            <select
              value={condition}
              onChange={(e) => {
                const val = e.target.value as ComponentCondition;
                setCondition(val);
                if (val === 'Damaged' || val === 'Needs Calibration') {
                  setSendToMaintenance(true);
                }
              }}
              className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
            >
              <option value="Good">Tested & Working Normally (Good)</option>
              <option value="New">Pristine Condition (Like New)</option>
              <option value="Needs Calibration">Functional but Needs Bench Calibration</option>
              <option value="Damaged">Damaged / Burnt / Component Malfunction</option>
            </select>
          </div>

          {/* Route to Bench Maintenance Checkbox */}
          <div className="flex items-center gap-2 bg-slate-800/40 p-3 rounded-lg border border-slate-800">
            <input
              type="checkbox"
              id="sendToMaintenance"
              checked={sendToMaintenance}
              onChange={(e) => setSendToMaintenance(e.target.checked)}
              className="rounded border-slate-700 text-teal-600 focus:ring-teal-500 w-4 h-4"
            />
            <label htmlFor="sendToMaintenance" className="text-xs text-slate-300 select-none cursor-pointer">
              Route this unit to <strong>Bench Maintenance Queue</strong> instead of immediate available stock
            </label>
          </div>

          {/* Fine & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Late Fine / Repair Charge (₹)
              </label>
              <input
                type="number"
                min={0}
                value={fineAmount}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 0;
                  setFineAmount(val);
                  if (val === 0) setFineStatus('none');
                  else if (fineStatus === 'none') setFineStatus('pending');
                }}
                className="w-full px-3 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Fine Status</label>
              <select
                value={fineStatus}
                onChange={(e) => setFineStatus(e.target.value as any)}
                className="w-full px-3 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none"
              >
                <option value="none">No Fine Applicable</option>
                <option value="paid">Paid by Student</option>
                <option value="pending">Pending Student Clearance</option>
                <option value="waived">Waived by Incharge</option>
              </select>
            </div>
          </div>

          {/* Inspection Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Return Inspection Notes / Remarks
            </label>
            <input
              type="text"
              placeholder="e.g. Oscilloscope power-on self test passed, ground clip intact"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none"
            />
          </div>

          {/* Inspector Badge */}
          <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <span>Inspected By:</span>
            <span className="font-semibold text-white">
              {currentUser.name} ({currentUser.designation})
            </span>
          </div>

          {/* Actions */}
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
              className="px-5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow transition active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? 'Verifying...' : 'Complete Inspection & Return'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
