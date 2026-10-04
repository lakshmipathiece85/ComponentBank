import React, { useState } from 'react';
import {
  History,
  Search,
  RotateCcw,
  ShieldAlert,
  Cpu,
  Layers,
  CalendarCheck2,
  ClipboardList,
  AlertCircle,
  Download,
} from 'lucide-react';
import { LabAuditLog, LabUser } from '../types';
import { exportAuditLogsToCSV } from '../utils/csvExport';

interface AuditLogsViewProps {
  logs: LabAuditLog[];
  currentUser: LabUser;
  onResetDemo: () => void;
}

export const AuditLogsView: React.FC<AuditLogsViewProps> = ({
  logs,
  currentUser,
  onResetDemo,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredLogs = logs.filter((l) => {
    const matchesSearch =
      l.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.performedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.details.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCat = selectedCategory === 'all' || l.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'inventory':
        return <Cpu className="w-4 h-4 text-teal-400" />;
      case 'rental':
        return <Layers className="w-4 h-4 text-blue-400" />;
      case 'reservation':
        return <CalendarCheck2 className="w-4 h-4 text-amber-400" />;
      case 'task':
        return <ClipboardList className="w-4 h-4 text-emerald-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="logs-search-input"
              type="text"
              placeholder="Search audit trail by action, user or details..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-between md:justify-end">
            <div className="flex items-center bg-slate-800 p-1 rounded-lg border border-slate-700">
              {(['all', 'inventory', 'rental', 'reservation', 'task'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 text-xs rounded-md capitalize transition ${
                    selectedCategory === cat
                      ? 'selected-btn bg-sky-200 text-slate-950 font-bold border border-sky-500 shadow-xs'
                      : 'text-slate-400 hover:text-slate-200 font-medium'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Export Audit Trail CSV */}
            <button
              id="export-audit-logs-csv-btn"
              onClick={() => exportAuditLogsToCSV(filteredLogs.length > 0 ? filteredLogs : logs)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 rounded-lg transition active:scale-95 whitespace-nowrap shadow-sm"
              title={`Download ${filteredLogs.length} audit logs as CSV`}
            >
              <Download className="w-3.5 h-3.5 text-teal-400" />
              <span>Export CSV</span>
            </button>

            {(currentUser.role === 'incharge' || currentUser.role === 'hod') && (
              <button
                id="reset-lab-data-btn"
                onClick={onResetDemo}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-rose-900/40 hover:bg-rose-800 text-rose-300 border border-rose-800 rounded-lg transition active:scale-95 whitespace-nowrap"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Lab Demo State</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Logs Timeline */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            No audit records matching your search.
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {filteredLogs.map((log) => (
              <div key={log.id} className="py-3.5 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-slate-800 border border-slate-700 shrink-0 mt-0.5">
                  {getCategoryIcon(log.category)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      {log.action}
                      <span className="text-[10px] font-normal uppercase px-2 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                        {log.category}
                      </span>
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 mb-1">
                    {log.details}
                  </p>

                  <div className="text-[11px] text-slate-400">
                    Logged by: <strong className="text-teal-300">{log.performedBy}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
