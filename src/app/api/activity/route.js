import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const logs = await prisma.activityLog.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(logs);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}