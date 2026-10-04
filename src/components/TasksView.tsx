import React, { useState } from 'react';
import {
  ClipboardList,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Plus,
  Filter,
  UserCheck,
  Calendar,
  CheckSquare,
  Square,
  Wrench,
  Cpu,
  Trash2,
} from 'lucide-react';
import { LabTask, LabUser, TaskStatus, TaskPriority, TaskCategory } from '../types';

interface TasksViewProps {
  tasks: LabTask[];
  currentUser: LabUser;
  onOpenNewTaskModal: () => void;
  onUpdateTaskStatus: (taskId: string, status: TaskStatus) => void;
  onToggleChecklistItem: (taskId: string, itemId: string) => void;
  onDeleteTask: (taskId: string) => void;
}

export const TasksView: React.FC<TasksViewProps> = ({
  tasks,
  currentUser,
  onOpenNewTaskModal,
  onUpdateTaskStatus,
  onToggleChecklistItem,
  onDeleteTask,
}) => {
  const [assigneeFilter, setAssigneeFilter] = useState<'all' | 'instructor' | 'incharge'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | TaskStatus>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  const categories: (TaskCategory | 'All')[] = [
    'All',
    'Calibration',
    'Testing & Verification',
    'Kit Preparation',
    'Restocking',
    'Maintenance',
    'Inventory Audit',
  ];

  const filteredTasks = tasks.filter((t) => {
    let matchesAssignee = true;
    if (assigneeFilter === 'instructor') {
      matchesAssignee = t.assignedTo.designation === 'Lab Instructor';
    } else if (assigneeFilter === 'incharge') {
      matchesAssignee = t.assignedTo.designation === 'Lab Incharge';
    }

    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchesCategory = categoryFilter === 'All' || t.category === categoryFilter;

    return matchesAssignee && matchesStatus && matchesCategory;
  });

  return (
    <div className="space-y-4">
      {/* Filters and Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
          
          {/* Assignee Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-slate-400 font-medium mr-1">Assignee:</span>
            <button
              onClick={() => setAssigneeFilter('all')}
              className={`px-3 py-1 text-xs rounded-md transition ${
                assigneeFilter === 'all'
                  ? 'selected-btn bg-sky-200 text-slate-950 font-bold border border-sky-500 shadow-xs'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200 font-medium'
              }`}
            >
              All Assignments ({tasks.length})
            </button>
            <button
              onClick={() => setAssigneeFilter('instructor')}
              className={`px-3 py-1 text-xs rounded-md transition flex items-center gap-1 ${
                assigneeFilter === 'instructor'
                  ? 'selected-btn bg-sky-200 text-slate-950 font-bold border border-sky-500 shadow-xs'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200 font-medium'
              }`}
            >
              <span>Er. Ramesh Varma (Lab Instructor)</span>
              <span className="px-1.5 py-0.2 bg-blue-900/60 rounded-full text-[10px]">
                {tasks.filter((t) => t.assignedTo.designation === 'Lab Instructor').length}
              </span>
            </button>
            <button
              onClick={() => setAssigneeFilter('incharge')}
              className={`px-3 py-1 text-xs rounded-md transition flex items-center gap-1 ${
                assigneeFilter === 'incharge'
                  ? 'selected-btn bg-sky-200 text-slate-950 font-bold border border-sky-500 shadow-xs'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200 font-medium'
              }`}
            >
              <span>Dr. M. Lakshmipathy (Incharge)</span>
              <span className="px-1.5 py-0.2 bg-teal-900/60 rounded-full text-[10px]">
                {tasks.filter((t) => t.assignedTo.designation === 'Lab Incharge').length}
              </span>
            </button>
          </div>

          {/* Action Button */}
          {currentUser.role !== 'student' && (
            <button
              id="new-lab-task-btn"
              onClick={onOpenNewTaskModal}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white rounded-lg transition active:scale-95 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Create Lab Task</span>
            </button>
          )}
        </div>

        {/* Second Row: Status Filter & Category Filter */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-2 border-t border-slate-800">
          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none w-full sm:w-auto">
            <span className="text-xs text-slate-400 mr-1">Status:</span>
            {(['all', 'todo', 'in_progress', 'under_review', 'completed'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 text-xs rounded-md capitalize whitespace-nowrap transition ${
                  statusFilter === st
                    ? 'selected-btn bg-sky-200 text-slate-950 font-bold border border-sky-500 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 font-medium'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-2.5 py-1 text-xs bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Task Cards Grid */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-xl p-6">
          <ClipboardList className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white">No lab tasks found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            All bench assignments, calibrations, and student kit preparations are up to date!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTasks.map((task) => {
            const completedChecklistCount = task.checklist.filter((i) => i.completed).length;
            const progressPercent = task.checklist.length > 0
              ? Math.round((completedChecklistCount / task.checklist.length) * 100)
              : 0;

            const isInstructorAssigned = task.assignedTo.designation === 'Lab Instructor';

            return (
              <div
                key={task.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-slate-700 transition flex flex-col justify-between space-y-3"
              >
                <div>
                  {/* Top Bar: Category & Priority */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {task.category}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          task.priority === 'urgent'
                            ? 'bg-rose-950 text-rose-300 border border-rose-800 animate-pulse'
                            : task.priority === 'high'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : task.priority === 'medium'
                            ? 'bg-blue-950 text-blue-300 border border-blue-800'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {task.priority}
                      </span>

                      {/* Status Dropdown */}
                      <select
                        value={task.status}
                        onChange={(e) => onUpdateTaskStatus(task.id, e.target.value as TaskStatus)}
                        className={`text-[11px] font-semibold rounded px-2 py-0.5 border focus:outline-none ${
                          task.status === 'completed'
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                            : task.status === 'in_progress'
                            ? 'bg-blue-950 text-blue-300 border-blue-800'
                            : task.status === 'under_review'
                            ? 'bg-purple-950 text-purple-300 border-purple-800'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        <option value="todo">To Do</option>
                        <option value="in_progress">In Progress</option>
                        <option value="under_review">Under Review</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h4 className="text-base font-bold text-white mb-1">
                    {task.title}
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed mb-3">
                    {task.description}
                  </p>

                  {/* Related Component (if any) */}
                  {task.relatedComponentName && (
                    <div className="flex items-center gap-1.5 text-xs text-teal-300 bg-teal-950/40 border border-teal-900/60 px-2.5 py-1 rounded-md mb-3 w-fit">
                      <Cpu className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                      <span>Component: {task.relatedComponentName}</span>
                    </div>
                  )}

                  {/* Interactive Checklist */}
                  {task.checklist.length > 0 && (
                    <div className="space-y-1.5 bg-slate-800/40 p-3 rounded-lg border border-slate-800 mb-3">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-semibold text-slate-300">
                          Bench Checklist ({completedChecklistCount}/{task.checklist.length})
                        </span>
                        <span className="text-[11px] text-teal-400 font-mono font-bold">
                          {progressPercent}%
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden mb-2">
                        <div
                          style={{ width: `${progressPercent}%` }}
                          className={`h-full transition-all ${
                            progressPercent === 100 ? 'bg-emerald-400' : 'bg-teal-500'
                          }`}
                        />
                      </div>

                      {/* Checklist Items */}
                      <div className="space-y-1">
                        {task.checklist.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => onToggleChecklistItem(task.id, item.id)}
                            className="flex items-start gap-2 text-xs cursor-pointer p-1 rounded hover:bg-slate-800/60 transition select-none"
                          >
                            {item.completed ? (
                              <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                            )}
                            <span
                              className={`${
                                item.completed ? 'line-through text-slate-500' : 'text-slate-300'
                              }`}
                            >
                              {item.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bench Notes */}
                  {task.benchNotes && (
                    <p className="text-xs text-amber-300/90 italic bg-amber-950/20 border border-amber-900/30 p-2 rounded mb-3">
                      Bench Note: {task.benchNotes}
                    </p>
                  )}
                </div>

                {/* Footer: Assignee & Due Date */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-teal-400" />
                    <span>
                      Assigned to:{' '}
                      <strong className={isInstructorAssigned ? 'text-blue-300' : 'text-teal-300'}>
                        {task.assignedTo.name}
                      </strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      <span>Due: {task.dueDate}</span>
                    </div>

                    {(currentUser.role === 'incharge' || currentUser.role === 'hod') && (
                      <button
                        onClick={() => onDeleteTask(task.id)}
                        title="Delete Task"
                        className="p-1 text-slate-500 hover:text-rose-400 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
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
