import React, { useState } from 'react';
import { X, Layers, PlusCircle, Wrench, Trash2 } from 'lucide-react';
import { ElectronicComponent, LabUser } from '../types';

interface AdjustStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  component: ElectronicComponent | null;
  currentUser: LabUser;
  onConfirmAdjustment: (
    componentId: string,
    action: 'add_stock' | 'send_to_maintenance' | 'retire_damaged' | 'return_from_maintenance',
    quantity: number,
    notes: string
  ) => Promise<void>;
}

export const AdjustStockModal: React.FC<AdjustStockModalProps> = ({
  isOpen,
  onClose,
  component,
  currentUser,
  onConfirmAdjustment,
}) => {
  if (!isOpen || !component) return null;

  const [action, setAction] = useState<
    'add_stock' | 'send_to_maintenance' | 'retire_damaged' | 'return_from_maintenance'
  >('add_stock');
  const [quantity, setQuantity] = useState<number>(1);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getMaxQuantity = () => {
    switch (action) {
      case 'send_to_maintenance':
        return component.availableQuantity;
      case 'return_from_maintenance':
        return component.inMaintenanceQuantity;
      case 'retire_damaged':
        return component.inMaintenanceQuantity + component.availableQuantity;
      default:
        return 999;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await onConfirmAdjustment(component.id, action, quantity, notes.trim());
      onClose();
    } catch (err) {
      console.error('Error adjusting stock:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-800/60">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-teal-600/20 text-teal-400 rounded-lg border border-teal-500/30">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Adjust Equipment Stock</h3>
              <p className="text-xs text-slate-400">{component.name} ({component.modelNumber})</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Breakdown */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-4 gap-2 text-center text-xs bg-slate-800/50 p-3 rounded-xl border border-slate-800">
            <div>
              <div className="text-slate-400 text-[10px] uppercase">Total</div>
              <div className="text-sm font-bold text-white">{component.totalQuantity}</div>
            </div>
            <div>
              <div className="text-emerald-400 text-[10px] uppercase">Available</div>
              <div className="text-sm font-bold text-emerald-400">{component.availableQuantity}</div>
            </div>
            <div>
              <div className="text-blue-400 text-[10px] uppercase">Rented</div>
              <div className="text-sm font-bold text-blue-400">{component.rentedQuantity}</div>
            </div>
            <div>
              <div className="text-amber-400 text-[10px] uppercase">Maintenance</div>
              <div className="text-sm font-bold text-amber-400">{component.inMaintenanceQuantity}</div>
            </div>
          </div>

          {/* Action Choice */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Adjustment Action</label>
            <select
              value={action}
              onChange={(e) => {
                setAction(e.target.value as any);
                setQuantity(1);
              }}
              className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none"
            >
              <option value="add_stock">Procurement / Add New Stock (+)</option>
              <option value="send_to_maintenance" disabled={component.availableQuantity <= 0}>
                Move to Bench Maintenance Queue ({component.availableQuantity} available)
              </option>
              <option value="return_from_maintenance" disabled={component.inMaintenanceQuantity <= 0}>
                Return from Maintenance to Active Stock ({component.inMaintenanceQuantity} in repair)
              </option>
              <option value="retire_damaged">Scrap / Retire Defective Hardware (-)</option>
            </select>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Quantity</label>
            <input
              type="number"
              min={1}
              max={getMaxQuantity()}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-3 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none"
            />
          </div>

          {/* Audit Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Audit Justification / Purchase Order / Lab Remarks
            </label>
            <input
              type="text"
              placeholder="e.g. Department annual procurement PO-8841 / Routine calibration"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
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
              className="px-5 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white rounded-lg shadow transition active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? 'Updating...' : 'Confirm Stock Adjustment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
