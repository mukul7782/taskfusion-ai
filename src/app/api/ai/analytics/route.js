import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function GET() {
  try {
    const tasks = await prisma.task.findMany({
      include: { subtasks: true },
    });

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === 'DONE').length;
    const inProgressTasks = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
    const todoTasks = tasks.filter((t) => t.status === 'TODO').length;
    const totalStoryPoints = tasks.reduce((sum, t) => sum + (t.storyPoints || 1), 0);
    const completedStoryPoints = tasks
      .filter((t) => t.status === 'DONE')
      .reduce((sum, t) => sum + (t.storyPoints || 1), 0);

    const prompt = `Analyze this Agile workspace sprint performance telemetry and provide actionable sprint intelligence.
Telemetry:
- Total Tasks: ${totalTasks}
- Completed Tasks: ${completedTasks}
- In Progress Tasks: ${inProgressTasks}
- To Do Tasks: ${todoTasks}
- Total Story Points: ${totalStoryPoints}
- Completed Story Points: ${completedStoryPoints}

Return ONLY a valid JSON object with this exact structure:
{
  "focusHours": 32.5,
  "distractionHours": 4.2,
  "productivityScore": 85,
  "predictedCompletionDays": 3,
  "summaryText": "Sprint 1 velocity is strong with high completion rate on core story points.",
  "recommendations": [
    "Prioritize moving remaining IN_PROGRESS tasks to review.",
    "Break down multi-point tasks into subtasks.",
    "Address potential blockers in pending reviews."
  ]
}`;

    let aiAnalytics = null;
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });
      aiAnalytics = JSON.parse(response.text);
    } catch (e) {
      console.warn('Fallback analytics triggered:', e.message);
      const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 50;
      aiAnalytics = {
        focusHours: Math.round(completedTasks * 3.5),
        distractionHours: Math.round(inProgressTasks * 1.2),
        productivityScore: Math.min(100, Math.max(40, completionRate + 20)),
        predictedCompletionDays: Math.ceil((totalTasks - completedTasks) * 1.5),
        summaryText: `Sprint velocity is steady with ${completedTasks} of ${totalTasks} tasks completed. Team focus remains on track.`,
        recommendations: [
          'Prioritize high-priority tasks in the IN_PROGRESS column.',
          'Decompose large story point tasks into smaller subtasks.',
          'Review blocked or long-standing items in review.',
        ],
      };
    }

    // Save summary record into database
    await prisma.aISummary.create({
      data: {
        completedCount: completedTasks,
        focusHours: aiAnalytics.focusHours,
        distractionHours: aiAnalytics.distractionHours,
        productivityScore: aiAnalytics.productivityScore,
        summaryText: aiAnalytics.summaryText,
      },
    });

    return NextResponse.json({
      metrics: {
        totalTasks,
        completedTasks,
        inProgressTasks,
        todoTasks,
        totalStoryPoints,
        completedStoryPoints,
      },
      ai: aiAnalytics,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}