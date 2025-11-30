// frontend/app/api/ask/route.ts
import { NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import type { NextRequest } from 'next/server';

// FIX: Match the backend endpoint defined in main.py
const FASTAPI_URL = 'http://127.0.0.1:8000/ask-ai/';

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) return new NextResponse('Unauthorized', { status: 401 });

    const { question } = await req.json();
    if (!question) return new NextResponse('Question is required', { status: 400 });

    const apiResponse = await fetch(FASTAPI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: question,
        user_id: userId, // Backend schema expects 'user_id'
      }),
    });

    if (!apiResponse.ok) {
      const errorData = await apiResponse.json();
      throw new Error(errorData.detail || 'Error from FastAPI backend');
    }

    const data = await apiResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[API_ASK_ERROR]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}