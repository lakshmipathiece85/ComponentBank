import React, { useState } from 'react';
import {
  Search,
  Plus,
  Clock,
  AlertOctagon,
  CheckCircle2,
  FileText,
  UserCheck,
  RotateCcw,
  Printer,
  Calendar,
  Phone,
  Mail,
  ShieldAlert,
  Download,
} from 'lucide-react';
import { RentalRecord, LabUser } from '../types';
import { exportRentalsToCSV } from '../utils/csvExport';

interface RentalsViewProps {
  rentals: RentalRecord[];
  currentUser: LabUser;
  onOpenIssueModal: () => void;
  onOpenReturnModal: (rental: RentalRecord) => void;
  onPrintReceipt: (rental: RentalRecord) => void;
  initialFilter?: 'all' | 'active' | 'overdue' | 'returned';
}

export const RentalsView: React.FC<RentalsViewProps> = ({
  rentals,
  currentUser,
  onOpenIssueModal,
  onOpenReturnModal,
  onPrintReceipt,
  initialFilter = 'all',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'overdue' | 'returned'>(
    initialFilter
  );

  const filteredRentals = rentals.filter((r) => {
    const matchesSearch =
      r.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.studentRollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.gatePassNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.componentName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getDaysDiff = (targetIso: string) => {
    const now = new Date().getTime();
    const target = new Date(targetIso).getTime();
    return Math.round((target - now) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-4">
      {/* Top Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="rentals-search-input"
              type="text"
              placeholder="Search by student roll no, name, gate pass # (e.g. 21ECE045)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Status Tabs & Issue Button */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-between md:justify-end">
            <div className="flex items-center bg-slate-800 p-1 rounded-lg border border-slate-700">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1 text-xs rounded-md transition ${
                  statusFilter === 'all'
                    ? 'selected-btn bg-sky-200 text-slate-950 font-bold border border-sky-500 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 font-medium'
                }`}
              >
                All ({rentals.length})
              </button>
              <button
                onClick={() => setStatusFilter('active')}
                className={`px-3 py-1 text-xs rounded-md transition ${
                  statusFilter === 'active'
                    ? 'selected-btn bg-sky-200 text-slate-950 font-bold border border-sky-500 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 font-medium'
                }`}
              >
                Active ({rentals.filter((r) => r.status === 'active').length})
              </button>
              <button
                onClick={() => setStatusFilter('overdue')}
                className={`px-3 py-1 text-xs rounded-md transition ${
                  statusFilter === 'overdue'
                    ? 'selected-btn bg-rose-200 text-rose-950 font-bold border border-rose-500 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 font-medium'
                }`}
              >
                Overdue ({rentals.filter((r) => r.status === 'overdue').length})
              </button>
              <button
                onClick={() => setStatusFilter('returned')}
                className={`px-3 py-1 text-xs rounded-md transition ${
                  statusFilter === 'returned'
                    ? 'selected-btn bg-sky-200 text-slate-950 font-bold border border-sky-500 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 font-medium'
                }`}
              >
                Returned ({rentals.filter((r) => r.status === 'returned').length})
              </button>
            </div>

            {/* Export Rentals & Gate Pass CSV */}
            <button
              id="export-rentals-csv-btn"
              onClick={() => exportRentalsToCSV(filteredRentals.length > 0 ? filteredRentals : rentals)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 rounded-lg transition active:scale-95 whitespace-nowrap shadow-sm"
              title={`Download ${filteredRentals.length} rental records as CSV`}
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>Export CSV</span>
            </button>

            {currentUser.role !== 'student' && (
              <button
                id="issue-new-rental-btn"
                onClick={onOpenIssueModal}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white rounded-lg transition active:scale-95 whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>Issue Component</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Rentals List */}
      {filteredRentals.length === 0 ? (
        <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-xl p-6">
          <FileText className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white">No rental records found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            There are currently no active or historical check-outs matching this filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3.5">
          {filteredRentals.map((rental) => {
            const isOverdue = rental.status === 'overdue';
            const isActive = rental.status === 'active';
            const isReturned = rental.status === 'returned';
            const daysRemaining = getDaysDiff(rental.expectedReturnDate);

            return (
              <div
                key={rental.id}
                className={`bg-slate-900 border rounded-xl p-4 shadow-sm transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                  isOverdue
                    ? 'border-rose-800/80 bg-rose-950/20'
                    : isActive
                    ? 'border-slate-800 hover:border-slate-700'
                    : 'border-slate-800/60 opacity-80'
                }`}
              >
                {/* Left: Component & Gate Pass Info */}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-teal-400 bg-slate-800 px-2.5 py-0.5 rounded border border-slate-700">
                      {rental.gatePassNumber}
                    </span>

                    <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                        isOverdue
                          ? 'bg-rose-900/60 text-rose-300 border border-rose-700 animate-pulse'
                          : isActive
                          ? 'bg-blue-950 text-blue-300 border border-blue-800'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {isOverdue && <AlertOctagon className="w-3 h-3 text-rose-400" />}
                      {isActive && <Clock className="w-3 h-3 text-blue-400" />}
                      {isReturned && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                      <span className="uppercase tracking-wider text-[10px]">
                        {rental.status}
                      </span>
                    </span>

                    {isOverdue && (
                      <span className="text-[11px] font-semibold text-rose-400">
                        {Math.abs(daysRemaining)} days late (Fine: ₹{rental.fineAmount})
                      </span>
                    )}

                    {isActive && (
                      <span className="text-[11px] text-slate-400">
                        {daysRemaining >= 0
                          ? `Due in ${daysRemaining} days`
                          : `${Math.abs(daysRemaining)} days overdue`}
                      </span>
                    )}
                  </div>

                  <h4 className="text-base font-bold text-white truncate">
                    {rental.quantity}x {rental.componentName}
                  </h4>
                  <p className="text-xs text-slate-400 font-mono">
                    Model: {rental.componentModel}
                  </p>

                  {/* Accessories badge list */}
                  {rental.accessoriesIssued.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[11px] text-slate-400">Accessories:</span>
                      {rental.accessoriesIssued.map((acc, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700"
                        >
                          {acc}
                        </span>
                      ))}
                    </div>
                  )}

                  {rental.notes && (
                    <p className="text-xs text-slate-400 italic pt-0.5">
                      Note: {rental.notes}
                    </p>
                  )}
                </div>

                {/* Center: Student & Staff Details */}
                <div className="text-xs text-slate-300 space-y-1 md:border-l md:border-r border-slate-800/80 md:px-4 shrink-0 w-full md:w-auto">
                  <div className="font-semibold text-white flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-teal-400" />
                    <span>{rental.studentName}</span>
                    <span className="text-teal-400 font-mono">({rental.studentRollNo})</span>
                  </div>
                  <div className="text-slate-400">
                    {rental.studentDepartment} • {rental.studentSemester}
                  </div>
                  <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-500" />
                      {rental.studentPhone}
                    </span>
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3 text-slate-500" />
                      {rental.studentEmail}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 pt-0.5">
                    Issued by: <strong className="text-slate-300">{rental.issuedBy.name}</strong> ({rental.issuedBy.role === 'incharge' ? 'Incharge' : 'Instructor'})
                  </div>
                </div>

                {/* Right: Dates & Actions */}
                <div className="flex flex-col sm:flex-row md:flex-col items-end justify-between gap-2 shrink-0 w-full md:w-auto">
                  <div className="text-right text-xs">
                    <div className="text-slate-400 flex items-center justify-end gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>Issued: {new Date(rental.issuedAt).toLocaleDateString()}</span>
                    </div>
                    <div className={`font-medium ${isOverdue ? 'text-rose-400 font-bold' : 'text-slate-300'}`}>
                      Expected: {new Date(rental.expectedReturnDate).toLocaleDateString()}
                    </div>
                    {rental.actualReturnDate && (
                      <div className="text-emerald-400 text-[11px]">
                        Returned: {new Date(rental.actualReturnDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      onClick={() => onPrintReceipt(rental)}
                      title="Generate Official Gate Pass / Slip"
                      className="p-1.5 text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition flex items-center gap-1"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Gate Pass</span>
                    </button>

                    {(isActive || isOverdue) && currentUser.role !== 'student' && (
                      <button
                        onClick={() => onOpenReturnModal(rental)}
                        className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow transition active:scale-95 flex items-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Inspect & Return</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
