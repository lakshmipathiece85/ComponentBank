import React from 'react';
import { X, Printer, CheckCircle, Shield, Cpu, QrCode, MapPin } from 'lucide-react';
import { RentalRecord } from '../types';
import { CollegeLogo, DepartmentLogo, ClubLogo } from './CollegeLogo';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  rental: RentalRecord | null;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  rental,
}) => {
  if (!isOpen || !rental) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white text-slate-900 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden my-6 border border-slate-200">
        
        {/* Modal Controls (Screen Only) */}
        <div className="px-6 py-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between print:hidden">
          <span className="text-xs font-semibold text-slate-600">
            Printable Laboratory Equipment Gate Pass
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Slip</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Pass Body */}
        <div className="p-8 space-y-6 print:p-0">
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-4 text-center">
            <div className="flex items-center justify-between gap-3 mb-2">
              <DepartmentLogo size="lg" className="border border-blue-500 shadow-xs" />
              <div className="text-center flex-1">
                <h1 className="text-base sm:text-xl font-black tracking-tight text-slate-900 uppercase">
                  Kuppam Engineering College
                </h1>
                <p className="text-xs font-bold text-slate-700">
                  KES Nagar, Kuppam -517425, Andhra Pradesh
                </p>
                <h2 className="text-xs sm:text-sm font-bold uppercase tracking-tight text-blue-900 mt-0.5">
                  Department of Electronics & Communication Engineering
                </h2>
                <p className="text-[11px] font-medium text-slate-600 uppercase tracking-wider">
                  Nextgen ECE Innovators Club (NEIC) • Component & Equipment Lab Gate Pass
                </p>
              </div>
              <ClubLogo size="lg" className="border border-amber-500 shadow-xs" />
            </div>
            <div className="inline-block mt-1 px-3 py-0.5 bg-slate-900 text-white font-mono text-xs font-bold rounded">
              GATE PASS NO: {rental.gatePassNumber}
            </div>
          </div>

          {/* Student & Pass Meta Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Student Details
              </span>
              <div className="font-bold text-slate-900 text-sm">{rental.studentName}</div>
              <div className="font-mono text-teal-800 font-semibold">Roll: {rental.studentRollNo}</div>
              <div className="text-slate-600">{rental.studentDepartment} • {rental.studentSemester}</div>
              <div className="text-slate-600">{rental.studentPhone}</div>
            </div>

            <div className="space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Issue & Return Schedule
              </span>
              <div>
                <span className="text-slate-500">Date of Issue: </span>
                <strong className="text-slate-800">{new Date(rental.issuedAt).toLocaleDateString()}</strong>
              </div>
              <div>
                <span className="text-slate-500">Due Date: </span>
                <strong className="text-rose-700">{new Date(rental.expectedReturnDate).toLocaleDateString()}</strong>
              </div>
              <div>
                <span className="text-slate-500">Issued By: </span>
                <strong className="text-slate-800">{rental.issuedBy.name}</strong> ({rental.issuedBy.role === 'incharge' ? 'Incharge' : 'Instructor'})
              </div>
            </div>
          </div>

          {/* Equipment Table */}
          <div className="border border-slate-300 rounded-lg overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-100 text-slate-700 uppercase font-semibold border-b border-slate-300">
                <tr>
                  <th className="py-2.5 px-3">Item Description</th>
                  <th className="py-2.5 px-2">Model</th>
                  <th className="py-2.5 px-2 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">Condition</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="py-3 px-3 font-bold text-slate-900">
                    {rental.componentName}
                  </td>
                  <td className="py-3 px-2 font-mono text-slate-700">
                    {rental.componentModel}
                  </td>
                  <td className="py-3 px-2 text-center font-bold">
                    {rental.quantity}
                  </td>
                  <td className="py-3 px-3 text-right font-medium text-slate-700">
                    {rental.conditionOnIssue}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Accessories & Notes */}
          {rental.accessoriesIssued.length > 0 && (
            <div className="text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="font-bold text-slate-700">Included Accessories: </span>
              <span className="text-slate-600">{rental.accessoriesIssued.join(', ')}</span>
            </div>
          )}

          {rental.notes && (
            <div className="text-xs text-slate-600 italic">
              Experiment: {rental.notes}
            </div>
          )}

          {/* Student Undertaking */}
          <div className="border-t border-slate-200 pt-3 text-[11px] text-slate-500 leading-relaxed">
            <p className="font-semibold text-slate-700 mb-1">Student Safety & Return Undertaking:</p>
            <p>
              I acknowledge receipt of the electronic equipment listed above in working condition. I agree to adhere to ESD safety standards, avoid short circuits or over-voltage, and return all equipment and accessories on or before the due date. Any damages or losses will be subject to university component replacement charges.
            </p>
          </div>

          {/* Signature Blocks */}
          <div className="grid grid-cols-2 gap-8 pt-8 text-xs text-center border-t border-slate-300">
            <div>
              <div className="border-b border-slate-400 w-40 mx-auto mb-1.5" />
              <div className="font-semibold text-slate-800">{rental.studentName}</div>
              <div className="text-[10px] text-slate-500">Borrower Signature</div>
            </div>

            <div>
              <div className="border-b border-slate-400 w-40 mx-auto mb-1.5" />
              <div className="font-semibold text-slate-800">{rental.issuedBy.name}</div>
              <div className="text-[10px] text-slate-500">Lab Incharge / Instructor Signature</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
