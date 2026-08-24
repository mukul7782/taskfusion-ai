'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { KanbanBoard } from '@/components/board/KanbanBoard';
import { TaskModal } from '@/components/board/TaskModal';
import { LayoutDashboard, FileText, ArrowLeft } from 'lucide-react';

export default function BoardPage() {
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = () => setRefreshTrigger((prev) => prev + 1);

  const handleOpenNewTask = () => {
    setSelectedTask(null);
    setIsTaskModalOpen(true);
  };

  const handleOpenTaskDetail = (task) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Navigation Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur sticky top-0 z-40 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-slate-400 hover:text-slate-200 transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center font-bold text-white shadow-md shadow-sky-500/20 text-sm">
            TF
          </div>
          <h1 className="font-bold text-base">Jira Board View</h1>
        </div>

        <nav className="flex items-center gap-3 text-xs font-medium text-slate-300">
          <Link href="/board" className="px-3 py-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 font-semibold flex items-center gap-1.5">
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Board</span>
          </Link>
        </nav>
      </header>

      {/* Main Board Container */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
        <KanbanBoard
          onOpenNewTask={handleOpenNewTask}
          onOpenTaskDetail={handleOpenTaskDetail}
          refreshTrigger={refreshTrigger}
        />
      </main>

      {/* Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        taskToEdit={selectedTask}
        onSaveSuccess={triggerRefresh}
      />
    </div>
  );
}