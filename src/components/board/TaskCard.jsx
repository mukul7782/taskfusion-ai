'use client';

import React from 'react';
import { Sparkles, CheckSquare, Trash2 } from 'lucide-react';

export function TaskCard({
  task,
  onSelect,
  onStatusChange,
  onDelete,
  onAISuggestSubtasks,
}) {
  const subtasks = task.subtasks || [];
  const completedSubtasks = subtasks.filter((s) => s.completed).length;
  const progressPercent = subtasks.length > 0 ? Math.round((completedSubtasks / subtasks.length) * 100) : 0;

  const priorityColors = {
    LOW: 'bg-slate-700/50 text-slate-300 border-slate-600',
    MEDIUM: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    HIGH: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    URGENT: 'bg-rose-500/15 text-rose-400 border-rose-500/40 animate-pulse',
  };

  const parsedTags = (() => {
    try {
      return JSON.parse(task.tags || '[]');
    } catch {
      return [];
    }
  })();

  return (
    <div className="group relative p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 hover:shadow-lg hover:shadow-sky-500/5 transition-all">
      {/* Card Header: Priority Pill & Action Buttons */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
            priorityColors[task.priority] || priorityColors.MEDIUM
          }`}
        >
          {task.priority}
        </span>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onAISuggestSubtasks(task)}
            title="Expand with AI Subtasks"
            className="p-1 rounded-md bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 text-xs transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            title="Delete Task"
            className="p-1 rounded-md hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 text-xs transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Task Title */}
      <h4
        onClick={() => onSelect(task)}
        className="font-semibold text-slate-100 text-sm leading-snug cursor-pointer hover:text-sky-400 transition mb-2"
      >
        {task.title}
      </h4>

      {/* Subtasks Progress Bar */}
      {subtasks.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span className="flex items-center gap-1">
              <CheckSquare className="w-3 h-3 text-sky-400" />
              <span>
                {completedSubtasks}/{subtasks.length} Subtasks
              </span>
            </span>
            <span>{progressPercent}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Tags */}
      {parsedTags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {parsedTags.map((tag, idx) => (
            <span key={idx} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Card Footer: Story Points & Status Selector */}
      <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60">
        <div className="flex items-center gap-1.5">
          <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[10px] font-bold">
            {task.storyPoints}
          </span>
          <span className="text-[11px]">pts</span>
        </div>

        <select
          value={task.status}
          onChange={(e) => onStatusChange(task.id, e.target.value)}
          className="bg-slate-950 text-slate-300 text-[11px] px-2 py-0.5 rounded border border-slate-800 focus:outline-none focus:border-sky-500 cursor-pointer"
        >
          <option value="TODO">To Do</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="IN_REVIEW">In Review</option>
          <option value="DONE">Done</option>
        </select>
      </div>
    </div>
  );
}