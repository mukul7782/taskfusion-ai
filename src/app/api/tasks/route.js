import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 1. GET ALL TASKS
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const sprintId = searchParams.get('sprintId');

    const where = {};
    if (status) where.status = status;
    if (sprintId) where.sprintId = sprintId;

    const tasks = await prisma.task.findMany({
      where,
      include: { subtasks: true, assignee: true, sprint: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(tasks);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 2. CREATE NEW TASK
export async function POST(request) {
  try {
    const body = await request.json();
    const { title, description, priority, storyPoints, projectId, sprintId, tags } = body;

    let targetProjectId = projectId;
    if (!targetProjectId) {
      const defaultProject = await prisma.project.findFirst();
      targetProjectId = defaultProject?.id;
    }

    if (!targetProjectId) {
      return NextResponse.json({ error: 'No active project found' }, { status: 400 });
    }

    const task = await prisma.task.create({
      data: {
        title,
        description: description || '',
        priority: priority || 'MEDIUM',
        storyPoints: storyPoints ? parseInt(storyPoints) : 1,
        projectId: targetProjectId,
        sprintId: sprintId || null,
        tags: JSON.stringify(tags || []),
      },
      include: { subtasks: true, assignee: true },
    });

    // Log Activity
    await prisma.activityLog.create({
      data: {
        action: 'TASK_CREATED',
        user: 'Mukul Gupta',
        details: `Created task "${title}"`,
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}