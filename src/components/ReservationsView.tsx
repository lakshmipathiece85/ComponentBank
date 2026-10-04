import React, { useState } from 'react';
import {
  CalendarCheck2,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  Search,
  ArrowRight,
  BookOpen,
  UserCheck,
} from 'lucide-react';
import { ComponentReservation, LabUser } from '../types';

interface ReservationsViewProps {
  reservations: ComponentReservation[];
  currentUser: LabUser;
  onOpenNewReservationModal: () => void;
  onApproveReservation: (resId: string) => void;
  onRejectReservation: (resId: string, reason?: string) => void;
  onFulfillReservation: (reservation: ComponentReservation) => void;
}

export const ReservationsView: React.FC<ReservationsViewProps> = ({
  reservations,
  currentUser,
  onOpenNewReservationModal,
  onApproveReservation,
  onRejectReservation,
  onFulfillReservation,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'fulfilled' | 'rejected'>('all');

  const filtered = reservations.filter((r) => {
    const matchesSearch =
      r.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.studentRollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.componentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.purpose.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="reservation-search-input"
              type="text"
              placeholder="Search reservations by student, roll no, or item..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-between md:justify-end">
            <div className="flex items-center bg-slate-800 p-1 rounded-lg border border-slate-700">
              {(['all', 'pending', 'approved', 'fulfilled', 'rejected'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 text-xs font-medium rounded-md capitalize transition ${
                    statusFilter === st
                      ? 'bg-teal-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <button
              id="new-reservation-btn"
              onClick={onOpenNewReservationModal}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition active:scale-95 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Reserve Equipment</span>
            </button>
          </div>
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-xl p-6">
          <CalendarCheck2 className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white">No reservations found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            There are no component reservations matching the selected filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3.5">
          {filtered.map((res) => {
            const isPending = res.status === 'pending';
            const isApproved = res.status === 'approved';

            return (
              <div
                key={res.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-slate-700 transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                {/* Left: Item & Purpose */}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 ${
                        res.status === 'pending'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : res.status === 'approved'
                          ? 'bg-blue-950 text-blue-300 border border-blue-800'
                          : res.status === 'fulfilled'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-rose-950 text-rose-300 border border-rose-800'
                      }`}
                    >
                      {res.status === 'pending' && <Clock className="w-3 h-3 text-amber-400" />}
                      {res.status === 'approved' && <CheckCircle2 className="w-3 h-3 text-blue-400" />}
                      {res.status === 'fulfilled' && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                      {res.status === 'rejected' && <XCircle className="w-3 h-3 text-rose-400" />}
                      <span>{res.status}</span>
                    </span>

                    <span className="text-xs text-slate-400">
                      Requested on {new Date(res.requestedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-white truncate">
                    {res.quantity}x {res.componentName}
                  </h4>
                  <p className="text-xs text-slate-400 font-mono">
                    Model: {res.componentModel}
                  </p>

                  <div className="text-xs text-slate-300 pt-1">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <BookOpen className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                      <span>Purpose: <strong className="text-slate-200">{res.purpose}</strong></span>
                    </div>
                    {res.labCourseCode && (
                      <span className="text-[11px] text-teal-300 font-mono pl-5">
                        Course Code: {res.labCourseCode}
                      </span>
                    )}
                  </div>

                  {res.rejectionReason && (
                    <p className="text-xs text-rose-400 italic">
                      Rejection Reason: {res.rejectionReason}
                    </p>
                  )}
                </div>

                {/* Center: Student Details */}
                <div className="text-xs text-slate-300 space-y-1 md:border-l md:border-r border-slate-800/80 md:px-4 shrink-0 w-full md:w-auto">
                  <div className="font-semibold text-white flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-teal-400" />
                    <span>{res.studentName}</span>
                    <span className="text-teal-400 font-mono">({res.studentRollNo})</span>
                  </div>
                  <div className="text-slate-400">{res.studentEmail}</div>
                  <div className="text-slate-300 pt-1">
                    Slot: <strong>{new Date(res.reservedFrom).toLocaleDateString()}</strong> to{' '}
                    <strong>{new Date(res.reservedUntil).toLocaleDateString()}</strong>
                  </div>
                  {res.reviewedBy && (
                    <div className="text-[11px] text-slate-400 pt-0.5">
                      Reviewed by: {res.reviewedBy.name}
                    </div>
                  )}
                </div>

                {/* Right: Actions */}
                <div className="flex flex-wrap items-center gap-2 shrink-0 w-full md:w-auto justify-end">
                  {/* Incharge / Instructor Actions */}
                  {currentUser.role !== 'student' && isPending && (
                    <>
                      <button
                        onClick={() => onApproveReservation(res.id)}
                        className="px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition active:scale-95"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          const reason = prompt('Enter rejection reason (optional):');
                          onRejectReservation(res.id, reason || undefined);
                        }}
                        className="px-3 py-1.5 text-xs font-semibold bg-rose-900/40 hover:bg-rose-800 text-rose-300 border border-rose-800 rounded-lg transition"
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {currentUser.role !== 'student' && isApproved && (
                    <button
                      onClick={() => onFulfillReservation(res)}
                      className="px-3.5 py-1.5 text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white rounded-lg shadow transition active:scale-95 flex items-center gap-1.5"
                    >
                      <span>Fulfill & Issue Gate Pass</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {res.status === 'fulfilled' && (
                    <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Issued to Student
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
