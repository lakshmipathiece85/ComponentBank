import React from 'react';
import {
  X,
  MapPin,
  Cpu,
  Layers,
  ShieldCheck,
  Calendar,
  AlertOctagon,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { ElectronicComponent, LabUser } from '../types';

interface ComponentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  component: ElectronicComponent | null;
  currentUser: LabUser;
  onOpenIssueModal: (comp: ElectronicComponent) => void;
  onOpenReserveModal: (comp: ElectronicComponent) => void;
  onOpenAdjustModal: (comp: ElectronicComponent) => void;
}

export const ComponentDetailModal: React.FC<ComponentDetailModalProps> = ({
  isOpen,
  onClose,
  component,
  currentUser,
  onOpenIssueModal,
  onOpenReserveModal,
  onOpenAdjustModal,
}) => {
  if (!isOpen || !component) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-6">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-800/60">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-teal-600/20 text-teal-400 rounded-lg border border-teal-500/30">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{component.name}</h3>
              <p className="text-xs text-slate-400 font-mono">Model / Part: {component.modelNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* High Value Warning Badge */}
          {component.isHighValueEquipment && (
            <div className="bg-amber-950/40 border border-amber-800/60 rounded-xl p-3 flex items-center gap-2 text-xs text-amber-300">
              <AlertOctagon className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>High-Value Equipment:</strong> Incharge counter-signature & security deposit verification required upon issue.
              </span>
            </div>
          )}

          {/* Description */}
          <p className="text-sm text-slate-300 leading-relaxed">
            {component.description}
          </p>

          {/* Live Inventory Breakdown */}
          <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-4">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Inventory & Availability Status
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <div className="text-[10px] uppercase text-slate-400 font-medium">Total Stock</div>
                <div className="text-lg font-bold text-white mt-0.5">{component.totalQuantity}</div>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-lg border border-emerald-950/80">
                <div className="text-[10px] uppercase text-emerald-400 font-medium">Available</div>
                <div className="text-lg font-bold text-emerald-400 mt-0.5">{component.availableQuantity}</div>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-lg border border-blue-950/80">
                <div className="text-[10px] uppercase text-blue-400 font-medium">Rented Out</div>
                <div className="text-lg font-bold text-blue-400 mt-0.5">{component.rentedQuantity}</div>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-lg border border-purple-950/80">
                <div className="text-[10px] uppercase text-purple-400 font-medium">Reserved</div>
                <div className="text-lg font-bold text-purple-400 mt-0.5">{component.reservedQuantity}</div>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-lg border border-amber-950/80">
                <div className="text-[10px] uppercase text-amber-400 font-medium">Maintenance</div>
                <div className="text-lg font-bold text-amber-400 mt-0.5">{component.inMaintenanceQuantity}</div>
              </div>
            </div>
          </div>

          {/* Location & Rental Terms Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-3.5 space-y-2 text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-teal-400">
                <MapPin className="w-4 h-4" />
                <span>Lab Location Coordinates</span>
              </div>
              <div className="space-y-1 text-slate-300">
                <div>Rack: <strong className="text-white">{component.location.rack}</strong></div>
                <div>Shelf: <strong className="text-white">{component.location.shelf}</strong></div>
                <div>Storage Bin: <strong className="text-white">{component.location.bin}</strong></div>
              </div>
            </div>

            <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-3.5 space-y-2 text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-teal-400">
                <ShieldCheck className="w-4 h-4" />
                <span>Rental & Security Terms</span>
              </div>
              <div className="space-y-1 text-slate-300">
                <div>Daily Rent Rate: <strong className="text-white">₹{component.dailyRentRate} / day</strong></div>
                <div>Security Deposit: <strong className="text-white">₹{component.securityDeposit}</strong></div>
                <div>Max Borrowing Period: <strong className="text-white">{component.maxRentalDays} days</strong></div>
              </div>
            </div>
          </div>

          {/* Technical Specifications */}
          {Object.keys(component.specifications).length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Technical Specifications & Pinouts
              </h4>
              <div className="bg-slate-800/40 border border-slate-800 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <tbody className="divide-y divide-slate-800">
                    {Object.entries(component.specifications).map(([key, val]) => (
                      <tr key={key} className="hover:bg-slate-800/30">
                        <td className="py-2 px-3 text-slate-400 font-medium w-1/3 border-r border-slate-800">
                          {key}
                        </td>
                        <td className="py-2 px-3 text-slate-200 font-mono">
                          {val}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Footer Action Buttons */}
          <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div>
              {currentUser.role !== 'student' && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenAdjustModal(component);
                  }}
                  className="px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition"
                >
                  Adjust Stock / Maintenance
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onClose();
                  onOpenReserveModal(component);
                }}
                className="px-4 py-2 text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition active:scale-95"
              >
                Reserve Item
              </button>

              {currentUser.role !== 'student' && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenIssueModal(component);
                  }}
                  disabled={component.availableQuantity <= 0}
                  className="px-4 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white rounded-lg shadow transition active:scale-95 disabled:opacity-50"
                >
                  Issue to Student
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
