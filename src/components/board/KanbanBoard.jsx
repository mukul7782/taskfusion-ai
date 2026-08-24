'use client';

import React, { useState, useEffect } from 'react';
import { TaskCard } from './TaskCard';
import { Plus, RefreshCw, Layers } from 'lucide-react';

export function KanbanBoard({
  onOpenNewTask,
  onOpenTaskDetail,
  refreshTrigger,
}) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/tasks');
      const data = await res.json();
      if (Array.isArray(data)) setTasks(data);
    } catch (e) {
      console.error('Failed to fetch tasks:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [refreshTrigger]);

  const handleStatusChange = async (taskId, newStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
    await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
  };

  const handleDelete = async (taskId) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
  };

  const handleAISuggestSubtasks = async (task) => {
    try {
      const res = await fetch('/api/ai/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: task.title, description: task.description }),
      });
      const data = await res.json();
      if (data.subtasks && Array.isArray(data.subtasks)) {
        for (const title of data.subtasks) {
          await fetch('/api/subtasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ taskId: task.id, title }),
          });
        }
        fetchTasks();
      }
    } catch (e) {
      console.error('AI subtask suggestion failed:', e);
    }
  };

  const columns = [
    { key: 'TODO', title: 'To Do' },
    { key: 'IN_PROGRESS', title: 'In Progress' },
    { key: 'IN_REVIEW', title: 'In Review' },
    { key: 'DONE', title: 'Done' },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">Sprint Kanban Board</h2>
            <p className="text-xs text-slate-400">TaskFusion Workspace &bull; Sprint 1</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchTasks}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition"
            title="Refresh Board"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={onOpenNewTask}
            className="px-4 py-2 rounded-lg bg-sky-500 font-semibold text-white text-xs hover:bg-sky-400 transition flex items-center gap-1.5 shadow-lg shadow-sky-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* 4 Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-1 items-start">
        {columns.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.key);
          return (
            <div
              key={col.key}
              className="flex flex-col rounded-2xl bg-slate-950/60 border border-slate-900 p-3 min-h-[500px]"
            >
              {/* Column Title */}
              <div className="flex items-center justify-between px-2 py-2 mb-3 border-b border-slate-900">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${col.key === 'DONE' ? 'bg-emerald-500' : col.key === 'IN_PROGRESS' ? 'bg-sky-500' : col.key === 'IN_REVIEW' ? 'bg-amber-500' : 'bg-slate-500'}`} />
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300">{col.title}</h3>
                </div>
                <span className="text-xs font-bold text-slate-500 px-2 py-0.5 rounded-full bg-slate-900">
                  {colTasks.length}
                </span>
              </div>

              {/* Cards List */}
              <div className="flex flex-col gap-3 flex-1">
                {colTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onSelect={onOpenTaskDetail}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDelete}
                    onAISuggestSubtasks={handleAISuggestSubtasks}
                  />
                ))}
                {colTasks.length === 0 && (
                  <div className="flex-1 flex items-center justify-center p-6 border-2 border-dashed border-slate-900 rounded-xl text-xs text-slate-600">
                    No tasks in {col.title}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}