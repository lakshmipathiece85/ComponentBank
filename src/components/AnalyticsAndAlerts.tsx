import React from 'react';
import {
  Cpu,
  Layers,
  AlertOctagon,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Clock,
  QrCode,
  ArrowUpRight,
} from 'lucide-react';
import { ElectronicComponent, RentalRecord, ComponentReservation, LabTask } from '../types';

interface AnalyticsAndAlertsProps {
  components: ElectronicComponent[];
  rentals: RentalRecord[];
  reservations: ComponentReservation[];
  tasks: LabTask[];
  currentUser?: any;
  onNavigateToRentalsWithFilter?: (status: 'overdue' | 'active') => void;
  onNavigateRentals?: (status: 'overdue' | 'active') => void;
  onNavigateToTasks?: () => void;
  onNavigateTasks?: () => void;
  onNavigateToReservations?: () => void;
  onNavigateReservations?: () => void;
}

export const AnalyticsAndAlerts: React.FC<AnalyticsAndAlertsProps> = ({
  components,
  rentals,
  reservations,
  tasks,
  onNavigateToRentalsWithFilter,
  onNavigateRentals,
  onNavigateToTasks,
  onNavigateTasks,
  onNavigateToReservations,
  onNavigateReservations,
}) => {
  const handleNavigateRentals = (status: 'overdue' | 'active') => {
    if (typeof onNavigateToRentalsWithFilter === 'function') {
      onNavigateToRentalsWithFilter(status);
    } else if (typeof onNavigateRentals === 'function') {
      onNavigateRentals(status);
    }
  };

  const handleNavigateTasks = () => {
    if (typeof onNavigateToTasks === 'function') {
      onNavigateToTasks();
    } else if (typeof onNavigateTasks === 'function') {
      onNavigateTasks();
    }
  };

  const handleNavigateReservations = () => {
    if (typeof onNavigateToReservations === 'function') {
      onNavigateToReservations();
    } else if (typeof onNavigateReservations === 'function') {
      onNavigateReservations();
    }
  };
  const totalItems = components.reduce((acc, c) => acc + c.totalQuantity, 0);
  const totalAvailable = components.reduce((acc, c) => acc + c.availableQuantity, 0);
  const totalRented = rentals.filter((r) => r.status === 'active' || r.status === 'overdue').reduce((acc, r) => acc + r.quantity, 0);
  const overdueRentals = rentals.filter((r) => r.status === 'overdue');
  const itemsInMaintenance = components.reduce((acc, c) => acc + c.inMaintenanceQuantity, 0);
  const pendingReservations = reservations.filter((r) => r.status === 'pending');
  const openTasks = tasks.filter((t) => t.status !== 'completed');
  const lowStockItems = components.filter((c) => c.availableQuantity <= 5 && c.totalQuantity > 0);

  return (
    <div className="space-y-4 mb-6">
      {/* Critical Alert Banners (if any) */}
      {overdueRentals.length > 0 && (
        <div className="bg-rose-950/40 border border-rose-800/60 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-rose-200">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-rose-800/50 rounded-lg text-rose-300">
              <AlertOctagon className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <p className="text-sm font-semibold">
                Attention: {overdueRentals.length} Equipment Rental{overdueRentals.length > 1 ? 's are' : ' is'} Overdue!
              </p>
              <p className="text-xs text-rose-300/80">
                Components like &ldquo;{overdueRentals[0].componentName}&rdquo; have passed expected return dates. Late fines may apply.
              </p>
            </div>
          </div>
          <button
            id="view-overdue-alert-btn"
            onClick={() => handleNavigateRentals('overdue')}
            className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white transition active:scale-95 whitespace-nowrap"
          >
            <span>Review Overdue List</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Total Stock */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-xs font-medium uppercase tracking-wider">Total Equipment</span>
            <Cpu className="w-4 h-4 text-teal-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{totalItems}</span>
            <span className="text-xs text-teal-400 font-medium">({components.length} types)</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            <span className="text-emerald-400 font-medium">{totalAvailable} units</span> available now
          </p>
        </div>

        {/* Active Rentals */}
        <div
          onClick={() => handleNavigateRentals('active')}
          className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-sm cursor-pointer hover:border-slate-700 transition"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-xs font-medium uppercase tracking-wider">Currently Issued</span>
            <Layers className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{totalRented}</span>
            <span className="text-xs text-slate-400">units with students</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <Clock className="w-3 h-3 text-blue-400" />
            <span>Across active lab projects</span>
          </p>
        </div>

        {/* Pending Reservations */}
        <div
          onClick={handleNavigateReservations}
          className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-sm cursor-pointer hover:border-slate-700 transition"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-xs font-medium uppercase tracking-wider">Reservations</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{pendingReservations.length}</span>
            <span className="text-xs text-amber-400 font-medium">pending review</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Upcoming practical sessions
          </p>
        </div>

        {/* Bench & Maintenance */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-xs font-medium uppercase tracking-wider">Maintenance / Cal</span>
            <Wrench className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{itemsInMaintenance}</span>
            <span className="text-xs text-purple-300 font-medium">units at bench</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Calibration & probe checks
          </p>
        </div>

        {/* Open Tasks for Incharge & Instructor */}
        <div
          onClick={handleNavigateTasks}
          className="col-span-2 lg:col-span-1 bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-sm cursor-pointer hover:border-slate-700 transition"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-xs font-medium uppercase tracking-wider">Lab Tasks</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{openTasks.length}</span>
            <span className="text-xs text-emerald-400 font-medium">active assignments</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Incharge & Instructor duties
          </p>
        </div>
      </div>

      {/* Low Stock Warning Pill if any */}
      {lowStockItems.length > 0 && (
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-amber-950/30 border border-amber-800/40 text-xs text-amber-300">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>Low Inventory Notice:</strong> {lowStockItems.map((c) => `${c.name} (${c.availableQuantity} left)`).join(', ')}. Restocking recommended.
          </span>
        </div>
      )}
    </div>
  );
};
