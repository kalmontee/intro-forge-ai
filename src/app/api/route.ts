import { GoogleGenerativeAI, GoogleGenerativeAIAbortError } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import { parseIntroRequest } from '@/lib/intro-request';
import { GENERATION_TIMEOUT_MS, MAX_OUTPUT_TOKENS, SYSTEM_INSTRUCTION, buildUserPrompt } from '@/lib/prompt';

export async function POST(req: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not set');
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    const parsed = await parseIntroRequest(req);
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error, fieldErrors: parsed.fieldErrors }, { status: parsed.status });
    }

    const genAI: GoogleGenerativeAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: 'gemini-3-flash-preview',
      systemInstruction: SYSTEM_INSTRUCTION,
      generationConfig: { maxOutputTokens: MAX_OUTPUT_TOKENS },
    });

    const result = await model.generateContent(buildUserPrompt(parsed.data), { timeout: GENERATION_TIMEOUT_MS });
    const text = result.response.text();

    return NextResponse.json({ output: text });
  } catch (error) {
    console.error('Detailed error in API route:', error);

    if (error instanceof GoogleGenerativeAIAbortError) {
      return NextResponse.json({ error: 'Message generation timed out' }, { status: 504 });
    }

    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);

      // Handle specific Gemini API errors
      if (error.message.includes('API_KEY_INVALID') || error.message.includes('403')) {
        return NextResponse.json({ error: 'Invalid API key' }, { status: 403 });
      }

      if (error.message.includes('quota') || error.message.includes('rate limit')) {
        return NextResponse.json({ error: 'API quota exceeded' }, { status: 429 });
      }
    }

    return NextResponse.json(
      {
        error: 'Failed to generate AI response.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
