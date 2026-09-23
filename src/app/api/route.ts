import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import { GENERATION_UNAVAILABLE, toErrorResponse } from '@/lib/api-errors';
import { parseIntroRequest } from '@/lib/intro-request';
import { GENERATION_TIMEOUT_MS, MAX_OUTPUT_TOKENS, SYSTEM_INSTRUCTION, buildUserPrompt } from '@/lib/prompt';

export async function POST(req: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not set');
      return NextResponse.json(GENERATION_UNAVAILABLE.body, { status: GENERATION_UNAVAILABLE.status });
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
    // Full detail stays in server logs; the client only gets a fixed message.
    console.error('Message generation failed:', error);
    const { status, body } = toErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}
