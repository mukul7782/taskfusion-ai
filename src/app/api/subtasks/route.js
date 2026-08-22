import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 1. ADD SUBTASK TO TASK
export async function POST(request) {
  try {
    const { taskId, title } = await request.json();
    if (!taskId || !title) {
      return NextResponse.json({ error: 'taskId and title required' }, { status: 400 });
    }

    const subtask = await prisma.subtask.create({
      data: { taskId, title, completed: false },
    });

    return NextResponse.json(subtask, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 2. TOGGLE SUBTASK COMPLETED STATUS
export async function PATCH(request) {
  try {
    const { id, completed } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'subtask id required' }, { status: 400 });
    }

    const subtask = await prisma.subtask.update({
      where: { id },
      data: { completed },
    });

    return NextResponse.json(subtask);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}