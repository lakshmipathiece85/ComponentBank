import React, { useState } from 'react';
import { X, Check, Cpu, UserCheck, Calendar, ShieldCheck, Plus } from 'lucide-react';
import { ElectronicComponent, LabUser } from '../types';

interface IssueEquipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  components: ElectronicComponent[];
  preSelectedComponent?: ElectronicComponent | null;
  currentUser: LabUser;
  onConfirmIssue: (data: {
    componentId: string;
    quantity: number;
    studentRollNo: string;
    studentName: string;
    studentEmail: string;
    studentDepartment: string;
    studentSemester: string;
    studentPhone: string;
    expectedReturnDate: string;
    accessoriesIssued: string[];
    notes?: string;
  }) => Promise<void>;
}

export const IssueEquipmentModal: React.FC<IssueEquipmentModalProps> = ({
  isOpen,
  onClose,
  components,
  preSelectedComponent,
  currentUser,
  onConfirmIssue,
}) => {
  const [selectedCompId, setSelectedCompId] = useState<string>(
    preSelectedComponent?.id || components[0]?.id || ''
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [studentRollNo, setStudentRollNo] = useState('');
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentDepartment, setStudentDepartment] = useState('ECE');
  const [studentSemester, setStudentSemester] = useState('Semester 6');
  const [studentPhone, setStudentPhone] = useState('');
  
  // Return date calculation (default to +7 days)
  const defaultReturnDate = new Date();
  defaultReturnDate.setDate(defaultReturnDate.getDate() + 7);
  const [expectedReturnDate, setExpectedReturnDate] = useState(
    defaultReturnDate.toISOString().split('T')[0]
  );

  const [accessories, setAccessories] = useState<string[]>([]);
  const [accessoryInput, setAccessoryInput] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const currentComp = components.find((c) => c.id === selectedCompId) || components[0];

  // Quick fill student preset
  const handleQuickStudentSelect = (preset: {
    roll: string;
    name: string;
    dept: string;
    sem: string;
    phone: string;
    email: string;
  }) => {
    setStudentRollNo(preset.roll);
    setStudentName(preset.name);
    setStudentDepartment(preset.dept);
    setStudentSemester(preset.sem);
    setStudentPhone(preset.phone);
    setStudentEmail(preset.email);
  };

  const handleAddAccessory = () => {
    if (accessoryInput.trim() && !accessories.includes(accessoryInput.trim())) {
      setAccessories([...accessories, accessoryInput.trim()]);
      setAccessoryInput('');
    }
  };

  const handleRemoveAccessory = (acc: string) => {
    setAccessories(accessories.filter((a) => a !== acc));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!selectedCompId) {
      setErrorMsg('Please choose an electronic component.');
      return;
    }
    if (!currentComp || currentComp.availableQuantity < quantity) {
      setErrorMsg(`Only ${currentComp?.availableQuantity || 0} unit(s) available in stock.`);
      return;
    }
    if (!studentRollNo.trim() || !studentName.trim()) {
      setErrorMsg('Student Roll Number and Name are required.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onConfirmIssue({
        componentId: selectedCompId,
        quantity,
        studentRollNo: studentRollNo.trim().toUpperCase(),
        studentName: studentName.trim(),
        studentEmail: studentEmail.trim() || `${studentRollNo.toLowerCase()}@student.univ.edu`,
        studentDepartment,
        studentSemester,
        studentPhone: studentPhone.trim() || '+91 98000 00000',
        expectedReturnDate: new Date(expectedReturnDate).toISOString(),
        accessoriesIssued: accessories,
        notes: notes.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to issue equipment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-6">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-800/60">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-teal-600/20 text-teal-400 rounded-lg border border-teal-500/30">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Issue Component / Equipment</h3>
              <p className="text-xs text-slate-400">Generate laboratory rental gate pass & update stock</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 text-xs rounded-lg">
              {errorMsg}
            </div>
          )}

          {/* Component Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Select Component or Equipment *
            </label>
            <select
              value={selectedCompId}
              onChange={(e) => setSelectedCompId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
            >
              {components.map((c) => (
                <option key={c.id} value={c.id} disabled={c.availableQuantity <= 0}>
                  {c.name} ({c.modelNumber}) — {c.availableQuantity} in stock — {c.location.rack}
                </option>
              ))}
            </select>
          </div>

          {/* Component Quick Info Pill */}
          {currentComp && (
            <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-3 text-xs flex flex-wrap items-center justify-between gap-2 text-slate-300">
              <div>
                <span className="text-slate-400">Location: </span>
                <strong className="text-teal-300">
                  {currentComp.location.rack} • {currentComp.location.shelf} • {currentComp.location.bin}
                </strong>
              </div>
              <div>
                <span className="text-slate-400">Available: </span>
                <strong className="text-emerald-400 font-bold">{currentComp.availableQuantity} units</strong>
              </div>
              <div>
                <span className="text-slate-400">Security Deposit: </span>
                <strong className="text-white">₹{currentComp.securityDeposit}</strong>
              </div>
            </div>
          )}

          {/* Quantity & Return Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Quantity to Issue *
              </label>
              <input
                type="number"
                min={1}
                max={currentComp?.availableQuantity || 1}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Expected Return Date *
              </label>
              <input
                type="date"
                value={expectedReturnDate}
                onChange={(e) => setExpectedReturnDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Student Quick Fill Preset Chips */}
          <div className="pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-300">
                Student Details (or Quick Fill Sample Student)
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    handleQuickStudentSelect({
                      roll: '21ECE045',
                      name: 'Rohan Deshmukh',
                      dept: 'ECE',
                      sem: 'Semester 7',
                      phone: '+91 98451 22301',
                      email: 'rohan.d21@student.univ.edu',
                    })
                  }
                  className="text-[10px] bg-slate-800 hover:bg-slate-700 text-teal-300 px-2 py-0.5 rounded border border-slate-700 transition"
                >
                  Rohan (ECE 7)
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleQuickStudentSelect({
                      roll: '22ECE012',
                      name: 'Siddharth Rao',
                      dept: 'ECE',
                      sem: 'Semester 5',
                      phone: '+91 97410 88219',
                      email: 'siddharth.r22@student.univ.edu',
                    })
                  }
                  className="text-[10px] bg-slate-800 hover:bg-slate-700 text-teal-300 px-2 py-0.5 rounded border border-slate-700 transition"
                >
                  Siddharth (ECE 5)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Student Roll Number *</label>
                <input
                  type="text"
                  placeholder="e.g. 21ECE045"
                  value={studentRollNo}
                  onChange={(e) => setStudentRollNo(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white font-mono focus:ring-1 focus:ring-teal-500 focus:outline-none uppercase"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Student Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Ananya Sharma"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-1 focus:ring-teal-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Department</label>
                <select
                  value={studentDepartment}
                  onChange={(e) => setStudentDepartment(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-1 focus:ring-teal-500 focus:outline-none"
                >
                  <option value="ECE">Electronics & Communication (ECE)</option>
                  <option value="EEE">Electrical & Electronics (EEE)</option>
                  <option value="CSE">Computer Science & Eng (CSE)</option>
                  <option value="MECH">Mechanical Eng (Robotics)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Semester</label>
                <select
                  value={studentSemester}
                  onChange={(e) => setStudentSemester(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-1 focus:ring-teal-500 focus:outline-none"
                >
                  <option value="Semester 3">Semester 3</option>
                  <option value="Semester 4">Semester 4</option>
                  <option value="Semester 5">Semester 5</option>
                  <option value="Semester 6">Semester 6</option>
                  <option value="Semester 7">Semester 7</option>
                  <option value="Semester 8">Semester 8</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="+91 98451 22301"
                  value={studentPhone}
                  onChange={(e) => setStudentPhone(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-1 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Email ID</label>
                <input
                  type="email"
                  placeholder="student@univ.edu"
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-1 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Accessories Checklist Input */}
          <div className="pt-2 border-t border-slate-800">
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Accessories Issued (e.g. Probes, USB Cables, Power Adapter)
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Type accessory and press Add (e.g. 10x Oscilloscope Probe)"
                value={accessoryInput}
                onChange={(e) => setAccessoryInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddAccessory();
                  }
                }}
                className="flex-1 px-3 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddAccessory}
                className="px-3 py-1.5 text-xs bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
              >
                Add
              </button>
            </div>

            {accessories.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {accessories.map((acc) => (
                  <span
                    key={acc}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs bg-teal-950 text-teal-300 border border-teal-800"
                  >
                    <span>{acc}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAccessory(acc)}
                      className="hover:text-white"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Project / Experiment Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Lab Experiment / Project Remarks
            </label>
            <input
              type="text"
              placeholder="e.g. EC401 Li-Fi Audio Transmitter capstone experiment"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none"
            />
          </div>

          {/* Issuing Authority Badge */}
          <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <span>Issuing Staff Member:</span>
            <span className="font-semibold text-white">
              {currentUser.name} ({currentUser.designation})
            </span>
          </div>

          {/* Modal Footer */}
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
              className="px-5 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white rounded-lg shadow transition active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? 'Issuing...' : 'Generate Gate Pass & Check Out'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
