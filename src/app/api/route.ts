import { createGeminiGenerator } from '@/lib/gemini-adapter';
import { handleMessageGeneration } from '@/lib/message-generation';

export async function POST(req: Request): Promise<Response> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('GEMINI_API_KEY is not set');
  }

  const generator = apiKey ? createGeminiGenerator(apiKey) : null;
  return handleMessageGeneration(req, generator);
}
