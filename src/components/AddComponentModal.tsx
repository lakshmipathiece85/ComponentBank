import React, { useState } from 'react';
import { X, Plus, Cpu, MapPin } from 'lucide-react';
import { ElectronicComponent, ComponentCategory, ComponentCondition, LabUser } from '../types';

interface AddComponentModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: LabUser;
  onSaveComponent: (comp: ElectronicComponent) => Promise<void>;
}

export const AddComponentModal: React.FC<AddComponentModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSaveComponent,
}) => {
  const [name, setName] = useState('');
  const [modelNumber, setModelNumber] = useState('');
  const [category, setCategory] = useState<ComponentCategory>('Microcontrollers & SoC');
  const [description, setDescription] = useState('');
  const [totalQuantity, setTotalQuantity] = useState<number>(10);
  const [rack, setRack] = useState('Rack A');
  const [shelf, setShelf] = useState('Shelf 1');
  const [bin, setBin] = useState('Bin 01');
  const [dailyRentRate, setDailyRentRate] = useState<number>(0);
  const [securityDeposit, setSecurityDeposit] = useState<number>(200);
  const [condition, setCondition] = useState<ComponentCondition>('Good');
  const [isHighValue, setIsHighValue] = useState(false);
  const [maxRentalDays, setMaxRentalDays] = useState<number>(14);
  const [specPairs, setSpecPairs] = useState<{ key: string; val: string }[]>([
    { key: 'Operating Voltage', val: '5V' },
    { key: 'Interface', val: 'I2C / SPI' },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleAddSpecRow = () => {
    setSpecPairs([...specPairs, { key: '', val: '' }]);
  };

  const handleUpdateSpecRow = (index: number, key: string, val: string) => {
    const next = [...specPairs];
    next[index] = { key, val };
    setSpecPairs(next);
  };

  const handleRemoveSpecRow = (index: number) => {
    setSpecPairs(specPairs.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim() || !modelNumber.trim()) {
      setErrorMsg('Component Name and Model Number are required.');
      return;
    }

    const specsObj: Record<string, string> = {};
    specPairs.forEach((p) => {
      if (p.key.trim() && p.val.trim()) {
        specsObj[p.key.trim()] = p.val.trim();
      }
    });

    const newComponent: ElectronicComponent = {
      id: 'comp-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      name: name.trim(),
      modelNumber: modelNumber.trim(),
      category,
      description: description.trim() || 'Electronic component for lab practicals & student hardware research.',
      specifications: specsObj,
      totalQuantity,
      availableQuantity: totalQuantity,
      reservedQuantity: 0,
      rentedQuantity: 0,
      inMaintenanceQuantity: 0,
      location: {
        rack: rack.trim(),
        shelf: shelf.trim(),
        bin: bin.trim(),
      },
      dailyRentRate,
      securityDeposit,
      condition,
      isHighValueEquipment: isHighValue,
      maxRentalDays,
      lastAuditedAt: new Date().toISOString().split('T')[0],
    };

    try {
      setIsSubmitting(true);
      await onSaveComponent(newComponent);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to add component');
    } finally {
      setIsSubmitting(false);
    }
  };

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
              <h3 className="text-base font-bold text-white">Add New Electronic Component</h3>
              <p className="text-xs text-slate-400">Register equipment into laboratory inventory catalog</p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 text-xs rounded-lg">
              {errorMsg}
            </div>
          )}

          {/* Name and Model */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Component Name *</label>
              <input
                type="text"
                placeholder="e.g. Raspberry Pi Pico W"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Model / Part Number *</label>
              <input
                type="text"
                placeholder="e.g. RP2040-PICOW"
                value={modelNumber}
                onChange={(e) => setModelNumber(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-lg text-white font-mono focus:ring-2 focus:ring-teal-500 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Category & Condition */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ComponentCategory)}
                className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none"
              >
                <option value="Microcontrollers & SoC">Microcontrollers & SoC</option>
                <option value="Test & Measurement">Test & Measurement</option>
                <option value="Sensors & Modules">Sensors & Modules</option>
                <option value="Motors & Actuators">Motors & Actuators</option>
                <option value="Power & Batteries">Power & Batteries</option>
                <option value="Discrete & ICs">Discrete & ICs</option>
                <option value="Prototyping & Tools">Prototyping & Tools</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Condition Status</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as ComponentCondition)}
                className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none"
              >
                <option value="New">Brand New</option>
                <option value="Good">Tested & Working (Good)</option>
                <option value="Needs Calibration">Needs Bench Calibration</option>
                <option value="Damaged">Damaged / Under Repair</option>
              </select>
            </div>
          </div>

          {/* Location in Lab */}
          <div className="pt-2 border-t border-slate-800">
            <label className="block text-xs font-semibold text-teal-400 mb-1.5 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>Lab Storage Location (Rack / Shelf / Bin) *</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <input
                  type="text"
                  placeholder="Rack (e.g. Rack B)"
                  value={rack}
                  onChange={(e) => setRack(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none"
                  required
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Shelf (e.g. Shelf 3)"
                  value={shelf}
                  onChange={(e) => setShelf(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none"
                  required
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Bin / Bay (e.g. Bin 12)"
                  value={bin}
                  onChange={(e) => setBin(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* Stock, Rate & Deposit */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Total Quantity *</label>
              <input
                type="number"
                min={1}
                value={totalQuantity}
                onChange={(e) => setTotalQuantity(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Daily Rent (₹, 0=Free)</label>
              <input
                type="number"
                min={0}
                value={dailyRentRate}
                onChange={(e) => setDailyRentRate(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Security Deposit (₹)</label>
              <input
                type="number"
                min={0}
                value={securityDeposit}
                onChange={(e) => setSecurityDeposit(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none"
              />
            </div>
          </div>

          {/* High Value & Max Rental Days */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Max Rental Duration (Days)</label>
              <input
                type="number"
                min={1}
                max={90}
                value={maxRentalDays}
                onChange={(e) => setMaxRentalDays(parseInt(e.target.value) || 14)}
                className="w-full px-3 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-4">
              <input
                type="checkbox"
                id="isHighValue"
                checked={isHighValue}
                onChange={(e) => setIsHighValue(e.target.checked)}
                className="rounded border-slate-700 text-teal-600 focus:ring-teal-500 w-4 h-4"
              />
              <label htmlFor="isHighValue" className="text-xs text-slate-300 cursor-pointer">
                Flag as <strong>High-Value Equipment</strong> (e.g. DSO, Spectrum Analyzer)
              </label>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
            <textarea
              rows={2}
              placeholder="Brief description of microprocessor, frequency response, pin count, or lab usage..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none"
            />
          </div>

          {/* Specifications Key-Value */}
          <div className="pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-300">Technical Specifications</span>
              <button
                type="button"
                onClick={handleAddSpecRow}
                className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Spec Row</span>
              </button>
            </div>

            <div className="space-y-1.5">
              {specPairs.map((pair, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Key (e.g. Clock Speed)"
                    value={pair.key}
                    onChange={(e) => handleUpdateSpecRow(idx, e.target.value, pair.val)}
                    className="flex-1 px-3 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Value (e.g. 133 MHz)"
                    value={pair.val}
                    onChange={(e) => handleUpdateSpecRow(idx, pair.key, e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none"
                  />
                  {specPairs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSpecRow(idx)}
                      className="text-slate-500 hover:text-rose-400 p-1"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
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
              {isSubmitting ? 'Saving...' : 'Add to Inventory'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
