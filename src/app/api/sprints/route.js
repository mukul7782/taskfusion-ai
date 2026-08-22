import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 1. GET ALL SPRINTS
export async function GET() {
  try {
    const sprints = await prisma.sprint.findMany({
      include: { tasks: true },
      orderBy: { startDate: 'desc' },
    });
    return NextResponse.json(sprints);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 2. CREATE NEW SPRINT
export async function POST(request) {
  try {
    const { name, goal, startDate, endDate, projectId } = await request.json();
    let targetProjectId = projectId;
    if (!targetProjectId) {
      const defaultProject = await prisma.project.findFirst();
      targetProjectId = defaultProject?.id;
    }

    const sprint = await prisma.sprint.create({
      data: {
        name,
        goal: goal || '',
        startDate: new Date(startDate || Date.now()),
        endDate: new Date(endDate || Date.now() + 14 * 24 * 60 * 60 * 1000),
        projectId: targetProjectId,
        status: 'ACTIVE',
      },
    });

    return NextResponse.json(sprint, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}