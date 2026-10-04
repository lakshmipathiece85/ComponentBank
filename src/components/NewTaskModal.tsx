import React, { useState } from 'react';
import { X, ClipboardList, Plus, UserCheck, Calendar, CheckSquare } from 'lucide-react';
import { LabTask, LabUser, TaskCategory, TaskPriority, ElectronicComponent } from '../types';

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: LabUser;
  components: ElectronicComponent[];
  onSaveTask: (task: LabTask) => Promise<void>;
}

export const NewTaskModal: React.FC<NewTaskModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  components,
  onSaveTask,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TaskCategory>('Calibration');
  const [priority, setPriority] = useState<TaskPriority>('high');
  const [assigneeId, setAssigneeId] = useState<'instructor' | 'incharge'>('instructor');
  
  // Default due date: +3 days
  const defaultDueDate = new Date();
  defaultDueDate.setDate(defaultDueDate.getDate() + 3);
  const [dueDate, setDueDate] = useState(defaultDueDate.toISOString().split('T')[0]);

  const [relatedCompId, setRelatedCompId] = useState('');
  const [benchNotes, setBenchNotes] = useState('');
  const [checklistItems, setChecklistItems] = useState<string[]>([
    'Inspect hardware physical condition & terminals',
    'Perform multimeter/oscilloscope bench verification',
  ]);
  const [newChecklistText, setNewChecklistText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleAddChecklist = () => {
    if (newChecklistText.trim()) {
      setChecklistItems([...checklistItems, newChecklistText.trim()]);
      setNewChecklistText('');
    }
  };

  const handleRemoveChecklist = (index: number) => {
    setChecklistItems(checklistItems.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!title.trim()) {
      setErrorMsg('Task Title is required.');
      return;
    }

    const assignedTo =
      assigneeId === 'instructor'
        ? {
            id: 'user-instructor-01',
            name: 'Er. Ramesh Varma',
            designation: 'Lab Instructor' as const,
          }
        : {
            id: 'user-incharge-01',
            name: 'Dr. M. Lakshmipathy',
            designation: 'Lab Incharge' as const,
          };

    const relatedComponent = components.find((c) => c.id === relatedCompId);

    const newTask: LabTask = {
      id: 'task-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      title: title.trim(),
      description: description.trim() || 'Laboratory workbench task and equipment quality control check.',
      category,
      priority,
      status: 'todo',
      assignedTo,
      assignedBy: {
        id: currentUser.id,
        name: currentUser.name,
      },
      dueDate,
      createdAt: new Date().toISOString(),
      checklist: checklistItems.map((text, i) => ({
        id: 'chk-' + Date.now() + '-' + i,
        text,
        completed: false,
      })),
      relatedComponentId: relatedComponent?.id,
      relatedComponentName: relatedComponent ? `${relatedComponent.name} (${relatedComponent.modelNumber})` : undefined,
      benchNotes: benchNotes.trim() || undefined,
    };

    try {
      setIsSubmitting(true);
      await onSaveTask(newTask);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create task');
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
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Create Lab Task & Duty</h3>
              <p className="text-xs text-slate-400">Assign maintenance, calibration or kit preparations</p>
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

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Task Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Calibrate DSO probes on Bench 4 before Thursday practicals"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
              required
            />
          </div>

          {/* Category & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TaskCategory)}
                className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none"
              >
                <option value="Calibration">Calibration</option>
                <option value="Testing & Verification">Testing & Verification</option>
                <option value="Kit Preparation">Kit Preparation</option>
                <option value="Restocking">Restocking</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Inventory Audit">Inventory Audit</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none"
              >
                <option value="urgent">Urgent (Immediate Lab Attention)</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          {/* Assignee & Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Assigned Personnel *
              </label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value as any)}
                className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none font-medium"
              >
                <option value="instructor">Er. Ramesh Varma (Lab Instructor - Assistant)</option>
                <option value="incharge">Dr. M. Lakshmipathy (Lab Incharge)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Due Date *</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Related Component */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Related Component (Optional)
            </label>
            <select
              value={relatedCompId}
              onChange={(e) => setRelatedCompId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none"
            >
              <option value="">-- No specific component (General Lab Task) --</option>
              {components.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.modelNumber}) — {c.location.rack}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Description / Task Steps</label>
            <textarea
              rows={2}
              placeholder="Instructions, procedures or safety precautions for this task..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none"
            />
          </div>

          {/* Interactive Checklist Generator */}
          <div className="pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-300">
                Bench Verification Checklist
              </span>
              <span className="text-[11px] text-slate-400">({checklistItems.length} steps)</span>
            </div>

            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Type checklist step and click Add..."
                value={newChecklistText}
                onChange={(e) => setNewChecklistText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddChecklist();
                  }
                }}
                className="flex-1 px-3 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddChecklist}
                className="px-3 py-1.5 text-xs bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
              >
                Add Step
              </button>
            </div>

            <div className="space-y-1">
              {checklistItems.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-2 p-2 rounded bg-slate-800/40 text-xs text-slate-300 border border-slate-800"
                >
                  <span className="flex items-center gap-1.5">
                    <CheckSquare className="w-3.5 h-3.5 text-teal-400" />
                    <span>{item}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveChecklist(idx)}
                    className="text-slate-500 hover:text-rose-400 px-1"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Bench Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Workbench / Special Tools Remarks
            </label>
            <input
              type="text"
              placeholder="e.g. Use Soldering Station 2, check anti-static wrist strap"
              value={benchNotes}
              onChange={(e) => setBenchNotes(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none"
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
              {isSubmitting ? 'Assigning...' : 'Assign Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
