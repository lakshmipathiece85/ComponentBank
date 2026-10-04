import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Plus,
  Grid,
  List,
  MapPin,
  CheckCircle,
  AlertTriangle,
  Wrench,
  ShieldCheck,
  Eye,
  ArrowRight,
  ExternalLink,
  Package,
  Download,
} from 'lucide-react';
import { ElectronicComponent, ComponentCategory, LabUser } from '../types';
import { exportInventoryToCSV } from '../utils/csvExport';

interface InventoryViewProps {
  components: ElectronicComponent[];
  currentUser: LabUser;
  onOpenAddComponentModal: () => void;
  onOpenIssueModalWithComponent?: (component: ElectronicComponent) => void;
  onOpenIssueModal?: (component: ElectronicComponent) => void;
  onOpenReserveModalWithComponent?: (component: ElectronicComponent) => void;
  onOpenReserveModal?: (component: ElectronicComponent) => void;
  onOpenAdjustStockModal?: (component: ElectronicComponent) => void;
  onOpenAdjustModal?: (component: ElectronicComponent) => void;
  onSelectComponentDetail?: (component: ElectronicComponent) => void;
  onOpenDetailModal?: (component: ElectronicComponent) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  components,
  currentUser,
  onOpenAddComponentModal,
  onOpenIssueModalWithComponent,
  onOpenIssueModal,
  onOpenReserveModalWithComponent,
  onOpenReserveModal,
  onOpenAdjustStockModal,
  onOpenAdjustModal,
  onSelectComponentDetail,
  onOpenDetailModal,
}) => {
  const isHod = currentUser.role === 'hod';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [stockFilter, setStockFilter] = useState<'all' | 'available' | 'low' | 'maintenance'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>(isHod ? 'table' : 'grid');

  useEffect(() => {
    if (isHod) {
      setViewMode('table');
    }
  }, [isHod]);

  const effectiveViewMode = isHod ? 'table' : viewMode;

  const handleIssue = (comp: ElectronicComponent) => {
    if (onOpenIssueModalWithComponent) onOpenIssueModalWithComponent(comp);
    else if (onOpenIssueModal) onOpenIssueModal(comp);
  };

  const handleReserve = (comp: ElectronicComponent) => {
    if (onOpenReserveModalWithComponent) onOpenReserveModalWithComponent(comp);
    else if (onOpenReserveModal) onOpenReserveModal(comp);
  };

  const handleAdjust = (comp: ElectronicComponent) => {
    if (onOpenAdjustStockModal) onOpenAdjustStockModal(comp);
    else if (onOpenAdjustModal) onOpenAdjustModal(comp);
  };

  const handleDetail = (comp: ElectronicComponent) => {
    if (onSelectComponentDetail) onSelectComponentDetail(comp);
    else if (onOpenDetailModal) onOpenDetailModal(comp);
  };

  const categories: (ComponentCategory | 'All')[] = [
    'All',
    'Microcontrollers & SoC',
    'Test & Measurement',
    'Sensors & Modules',
    'Motors & Actuators',
    'Power & Batteries',
    'Discrete & ICs',
    'Prototyping & Tools',
  ];

  // Filtering
  const filteredComponents = components.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.modelNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.rack.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.bin.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;

    let matchesStock = true;
    if (stockFilter === 'available') matchesStock = item.availableQuantity > 0;
    if (stockFilter === 'low') matchesStock = item.availableQuantity <= 5;
    if (stockFilter === 'maintenance') matchesStock = item.inMaintenanceQuantity > 0;

    return matchesSearch && matchesCategory && matchesStock;
  });

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="inventory-search-input"
              type="text"
              placeholder="Search by name, model, rack or bin (e.g. ESP32, DSO, Rack A)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Quick Filters & View Toggles */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-between md:justify-end">
            {/* Stock Filter Dropdown */}
            <select
              id="stock-filter-select"
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value as any)}
              className="px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              <option value="all">All Inventory Status</option>
              <option value="available">In Stock & Ready</option>
              <option value="low">Low Stock (≤ 5 units)</option>
              <option value="maintenance">Bench Maintenance</option>
            </select>

            {/* View Mode Toggle */}
            {isHod ? (
              <div className="flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-semibold text-teal-300">
                <List className="w-4 h-4 text-teal-400" />
                <span>HOD List View</span>
              </div>
            ) : (
              <div className="flex items-center bg-slate-800 p-1 rounded-lg border border-slate-700">
                <button
                  id="view-mode-grid"
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded transition ${
                    viewMode === 'grid'
                      ? 'selected-btn bg-sky-200 text-slate-950 font-bold border border-sky-500 shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Grid View"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  id="view-mode-table"
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded transition ${
                    viewMode === 'table'
                      ? 'selected-btn bg-sky-200 text-slate-950 font-bold border border-sky-500 shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Dense Table View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Export Inventory CSV Button */}
            <button
              id="export-inventory-csv-btn"
              onClick={() => exportInventoryToCSV(filteredComponents.length > 0 ? filteredComponents : components)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 rounded-lg transition active:scale-95 whitespace-nowrap shadow-sm"
              title={`Download ${filteredComponents.length} inventory records as CSV`}
            >
              <Download className="w-3.5 h-3.5 text-teal-400" />
              <span>Export CSV</span>
            </button>

            {/* Add Component Button (Staff Only) */}
            {currentUser.role !== 'student' && (
              <button
                id="add-component-btn"
                onClick={onOpenAddComponentModal}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white rounded-lg transition active:scale-95 whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>Add Component</span>
              </button>
            )}
          </div>
        </div>

        {/* Category Horizontal Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs rounded-lg whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'selected-btn active-tab bg-sky-200 text-slate-950 font-bold border-2 border-sky-600 shadow-xs'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-slate-700/60 font-medium'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {filteredComponents.length === 0 && (
        <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-xl p-6">
          <Package className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white">No components match your search</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Try adjusting your search keywords or switching category filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setStockFilter('all');
            }}
            className="mt-4 px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* GRID VIEW */}
      {effectiveViewMode === 'grid' && filteredComponents.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredComponents.map((comp) => {
            const isAvailable = comp.availableQuantity > 0;
            const isLowStock = comp.availableQuantity <= 5 && comp.availableQuantity > 0;

            return (
              <div
                key={comp.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-slate-700 transition flex flex-col justify-between"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {comp.category}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {comp.isHighValueEquipment && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          High Value
                        </span>
                      )}

                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          comp.condition === 'New'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : comp.condition === 'Needs Calibration'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : comp.condition === 'Damaged'
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}
                      >
                        {comp.condition}
                      </span>
                    </div>
                  </div>

                  {/* Title & Model */}
                  <h4
                    onClick={() => handleDetail(comp)}
                    className="text-base font-semibold text-white hover:text-teal-400 cursor-pointer transition line-clamp-1"
                  >
                    {comp.name}
                  </h4>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    Model: {comp.modelNumber}
                  </p>

                  {/* Location Coordinate Tag */}
                  <div className="flex items-center gap-1 text-xs text-teal-300/90 font-medium bg-teal-950/40 border border-teal-900/60 px-2.5 py-1 rounded-md my-2.5 w-fit">
                    <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                    <span>
                      {comp.location.rack} • {comp.location.shelf} • {comp.location.bin}
                    </span>
                  </div>

                  {/* Brief Specs or Description */}
                  <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                    {comp.description}
                  </p>
                </div>

                {/* Stock Meter & Actions Footer */}
                <div className="pt-3 border-t border-slate-800/80 space-y-3">
                  {/* Stock Breakdown */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-400">Inventory Allocation:</span>
                      <span className="font-semibold text-white">
                        {comp.availableQuantity} / {comp.totalQuantity} Available
                      </span>
                    </div>

                    {/* Multi-segment stock bar */}
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden flex">
                      <div
                        style={{ width: `${(comp.availableQuantity / comp.totalQuantity) * 100}%` }}
                        className="bg-emerald-500 h-full"
                        title={`Available: ${comp.availableQuantity}`}
                      />
                      <div
                        style={{ width: `${(comp.rentedQuantity / comp.totalQuantity) * 100}%` }}
                        className="bg-blue-500 h-full"
                        title={`Rented: ${comp.rentedQuantity}`}
                      />
                      <div
                        style={{ width: `${(comp.reservedQuantity / comp.totalQuantity) * 100}%` }}
                        className="bg-amber-500 h-full"
                        title={`Reserved: ${comp.reservedQuantity}`}
                      />
                      <div
                        style={{ width: `${(comp.inMaintenanceQuantity / comp.totalQuantity) * 100}%` }}
                        className="bg-purple-500 h-full"
                        title={`Maintenance: ${comp.inMaintenanceQuantity}`}
                      />
                    </div>

                    {/* Stock Legend Mini */}
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                      <span className="text-emerald-400 font-medium">
                        ● {comp.availableQuantity} Avail
                      </span>
                      <span className="text-blue-400">
                        ● {comp.rentedQuantity} Out
                      </span>
                      <span className="text-amber-400">
                        ● {comp.reservedQuantity} Resvd
                      </span>
                      {comp.inMaintenanceQuantity > 0 && (
                        <span className="text-purple-400">
                          ● {comp.inMaintenanceQuantity} Maint
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Pricing / Terms */}
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <div>
                      <span className="text-slate-400">Rental Rate: </span>
                      <strong className="text-white">
                        {comp.dailyRentRate === 0 ? 'Free (Academic)' : `₹${comp.dailyRentRate}/day`}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400">Max: </span>
                      <span className="text-white font-medium">{comp.maxRentalDays} days</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1.5 pt-1">
                    {/* View Details */}
                    <button
                      onClick={() => handleDetail(comp)}
                      title="Inspect Specifications & Serial Numbers"
                      className="p-1.5 text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {/* Adjust Stock (Staff only) */}
                    {currentUser.role !== 'student' && (
                      <button
                        onClick={() => handleAdjust(comp)}
                        title="Adjust Stock or Report Maintenance"
                        className="p-1.5 text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition"
                      >
                        <Wrench className="w-4 h-4" />
                      </button>
                    )}

                    {/* Reserve Button (for Student or Instructor) */}
                    <button
                      onClick={() => handleReserve(comp)}
                      disabled={comp.availableQuantity === 0}
                      className={`flex-1 py-1.5 px-2 text-xs font-semibold rounded-lg border transition ${
                        comp.availableQuantity > 0
                          ? 'border-amber-600/60 text-amber-300 hover:bg-amber-950/40'
                          : 'border-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      Reserve
                    </button>

                    {/* Quick Issue Button (Staff only) */}
                    {currentUser.role !== 'student' ? (
                      <button
                        onClick={() => handleIssue(comp)}
                        disabled={comp.availableQuantity === 0}
                        className={`flex-1 py-1.5 px-2 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1 ${
                          comp.availableQuantity > 0
                            ? 'bg-teal-600 hover:bg-teal-500 text-white shadow-sm active:scale-95'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        <span>Issue</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">
                        {comp.availableQuantity > 0 ? 'Ready for pickup' : 'Out of stock'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TABLE / LIST VIEW (Default & Mandatory for HOD Login, Optional for other roles) */}
      {effectiveViewMode === 'table' && filteredComponents.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/80 text-slate-400 uppercase font-medium border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Component & Model</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Location (Rack/Shelf/Bin)</th>
                  <th className="py-3 px-3 text-center">Total</th>
                  <th className="py-3 px-3 text-center">Available</th>
                  <th className="py-3 px-3 text-center">Rented</th>
                  <th className="py-3 px-3 text-center">Reserved</th>
                  <th className="py-3 px-3 text-center">Maint.</th>
                  <th className="py-3 px-3">Condition</th>
                  <th className="py-3 px-3">Rate / Dep</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredComponents.map((comp, idx) => (
                  <tr key={comp.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-mono text-slate-500">{idx + 1}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          onClick={() => handleDetail(comp)}
                          className="font-semibold text-white hover:text-teal-400 cursor-pointer transition"
                        >
                          {comp.name}
                        </span>
                        {comp.isHighValueEquipment && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 flex items-center gap-1 shrink-0">
                            <ShieldCheck className="w-3 h-3" />
                            High Value
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">{comp.modelNumber}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px] whitespace-nowrap">
                        {comp.category}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-medium text-teal-300 whitespace-nowrap">
                      {comp.location.rack} • {comp.location.shelf} • {comp.location.bin}
                    </td>
                    <td className="py-3 px-3 font-bold text-white text-center">{comp.totalQuantity}</td>
                    <td className="py-3 px-3 font-bold text-emerald-400 text-center">{comp.availableQuantity}</td>
                    <td className="py-3 px-3 font-medium text-blue-400 text-center">{comp.rentedQuantity}</td>
                    <td className="py-3 px-3 font-medium text-amber-400 text-center">{comp.reservedQuantity}</td>
                    <td className="py-3 px-3 font-medium text-purple-400 text-center">{comp.inMaintenanceQuantity}</td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          comp.condition === 'New'
                            ? 'bg-emerald-950 text-emerald-300'
                            : comp.condition === 'Needs Calibration'
                            ? 'bg-amber-950 text-amber-300'
                            : comp.condition === 'Damaged'
                            ? 'bg-rose-950 text-rose-300'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {comp.condition}
                      </span>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div>{comp.dailyRentRate === 0 ? 'Free' : `₹${comp.dailyRentRate}/d`}</div>
                      <div className="text-[10px] text-slate-400">Dep: ₹{comp.securityDeposit}</div>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleDetail(comp)}
                          title="Inspect Specifications & Serial Numbers"
                          className="px-2 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded transition flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5 text-teal-400" />
                          <span>Specs</span>
                        </button>
                        {currentUser.role !== 'student' && (
                          <button
                            onClick={() => handleAdjust(comp)}
                            title="Adjust Stock or Report Maintenance"
                            className="p-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded transition"
                          >
                            <Wrench className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleReserve(comp)}
                          disabled={comp.availableQuantity === 0}
                          className={`px-2 py-1 text-xs font-semibold rounded border transition ${
                            comp.availableQuantity > 0
                              ? 'border-amber-600/60 text-amber-300 hover:bg-amber-950/40'
                              : 'border-slate-800 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          Reserve
                        </button>
                        {currentUser.role !== 'student' && (
                          <button
                            onClick={() => handleIssue(comp)}
                            disabled={comp.availableQuantity === 0}
                            className={`px-2 py-1 text-xs font-semibold rounded transition ${
                              comp.availableQuantity > 0
                                ? 'bg-teal-600 hover:bg-teal-500 text-white'
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            }`}
                          >
                            Issue
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
