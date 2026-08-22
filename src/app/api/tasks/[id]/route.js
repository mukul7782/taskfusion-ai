import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 1. UPDATE TASK DETAILS OR STATUS
export async function PATCH(request, { params }) {
  try {
    const body = await request.json();
    const { status, title, description, priority, storyPoints, assigneeId } = body;

    const existingTask = await prisma.task.findUnique({ where: { id: params.id } });
    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const updatedTask = await prisma.task.update({
      where: { id: params.id },
      data: {
        ...(status && { status }),
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(priority && { priority }),
        ...(storyPoints && { storyPoints: parseInt(storyPoints) }),
        ...(assigneeId !== undefined && { assigneeId }),
      },
      include: { subtasks: true, assignee: true },
    });

    // Log Activity on Status Change
    if (status && status !== existingTask.status) {
      await prisma.activityLog.create({
        data: {
          action: 'STATUS_CHANGED',
          user: 'Mukul Gupta',
          details: `Moved "${updatedTask.title}" from ${existingTask.status} to ${status}`,
        },
      });
    }

    return NextResponse.json(updatedTask);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 2. DELETE TASK
export async function DELETE(request, { params }) {
  try {
    const task = await prisma.task.findUnique({ where: { id: params.id } });
    await prisma.task.delete({ where: { id: params.id } });

    if (task) {
      await prisma.activityLog.create({
        data: {
          action: 'TASK_DELETED',
          user: 'Mukul Gupta',
          details: `Deleted task "${task.title}"`,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}