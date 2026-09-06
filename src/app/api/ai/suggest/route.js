import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request) {
  try {
    const { title, description } = await request.json();
    if (!title) {
      return NextResponse.json({ error: 'Task title is required' }, { status: 400 });
    }

    const prompt = `You are an expert Agile project manager. Given the task title and description, break it down into 3-5 concise, actionable subtasks.
Return ONLY a valid JSON object with the following structure:
{
  "subtasks": ["subtask 1", "subtask 2", "subtask 3"]
}

Task Title: "${title}"
Task Description: "${description || 'None'}"`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const data = JSON.parse(response.text);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Gemini AI Subtask Generation Error:', error);
    // Safe fallback subtasks if API key is missing or request fails
    return NextResponse.json({
      subtasks: [
        `Research requirements for ${title}`,
        `Implement core logic for ${title}`,
        `Write tests & verify ${title}`,
      ],
    });
  }
}