'use client';

import React, { useState, useEffect } from 'react';
import { X, Sparkles, CheckSquare } from 'lucide-react';

export function TaskModal({ isOpen, onClose, taskToEdit, onSaveSuccess }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [storyPoints, setStoryPoints] = useState(1);
  const [tags, setTags] = useState('UI, Feature');
  const [subtasks, setSubtasks] = useState([]);
  const [newSubtaskInput, setNewSubtaskInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title || '');
      setDescription(taskToEdit.description || '');
      setPriority(taskToEdit.priority || 'MEDIUM');
      setStoryPoints(taskToEdit.storyPoints || 1);
      setSubtasks(taskToEdit.subtasks || []);
      try {
        const parsed = JSON.parse(taskToEdit.tags || '[]');
        setTags(parsed.join(', '));
      } catch {
        setTags('');
      }
    } else {
      setTitle('');
      setDescription('');
      setPriority('MEDIUM');
      setStoryPoints(1);
      setSubtasks([]);
      setTags('UI, Feature');
    }
  }, [taskToEdit, isOpen]);

  if (!isOpen) return null;

  const handleAddManualSubtask = () => {
    if (!newSubtaskInput.trim()) return;
    setSubtasks((prev) => [...prev, { title: newSubtaskInput.trim(), completed: false }]);
    setNewSubtaskInput('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);
    try {
      const tagArray = tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      if (taskToEdit) {
        await fetch(`/api/tasks/${taskToEdit.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            description,
            priority,
            storyPoints: parseInt(storyPoints),
            tags: JSON.stringify(tagArray),
          }),
        });
      } else {
        const res = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            description,
            priority,
            storyPoints: parseInt(storyPoints),
            tags: tagArray,
          }),
        });
        const createdTask = await res.json();

        if (createdTask.id && subtasks.length > 0) {
          for (const s of subtasks) {
            await fetch('/api/subtasks', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ taskId: createdTask.id, title: s.title }),
            });
          }
        }
      }

      onSaveSuccess();
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl p-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <h3 className="font-bold text-slate-100 text-base">
            {taskToEdit ? 'Edit Task Details' : 'Create New Task'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
              Task Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Implement OAuth Google Sign-In"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details or acceptance criteria..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="URGENT">URGENT</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                Story Points
              </label>
              <input
                type="number"
                min={1}
                max={21}
                value={storyPoints}
                onChange={(e) => setStoryPoints(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                Tags
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="UI, Backend"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
              />
            </div>
          </div>

          {/* Subtasks checklist */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">
              Subtasks ({subtasks.length})
            </label>
            <div className="space-y-1.5 mb-2">
              {subtasks.map((st, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300">
                  <span className="flex items-center gap-2">
                    <CheckSquare className="w-3.5 h-3.5 text-sky-400" />
                    <span>{st.title}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setSubtasks((prev) => prev.filter((_, idx) => idx !== i))}
                    className="text-slate-500 hover:text-rose-400"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newSubtaskInput}
                onChange={(e) => setNewSubtaskInput(e.target.value)}
                placeholder="Add subtask manually..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200"
              />
              <button
                type="button"
                onClick={handleAddManualSubtask}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 text-xs hover:bg-slate-700"
              >
                Add
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-sky-500 font-semibold text-white text-xs hover:bg-sky-400 transition shadow-lg shadow-sky-500/20"
            >
              {submitting ? 'Saving...' : taskToEdit ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}