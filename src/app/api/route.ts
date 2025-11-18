import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not set');
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    const data = await req.json();
    const genAI: GoogleGenerativeAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Construct the prompt using the form data
    const userPrompt = `
      You are a professional career strategist, an expert at writing professional and personalized messages for networking and job applications, or any of the selection of Message Type the user selects. Given the user's details, craft a message that is engaging, concise, and tailored to the recipient. Ensure the tone is polite and professional, and avoid using generic phrases. Focus on highlighting the user's strengths and aligning them with the target role and company.
      
      From: ${data.name}
      Self-introduction: ${data.selfIntroduction}
      Target Role: ${data.role}
      Target Company: ${data.company}
      Recipient: ${data.recipient}
      Message Type: ${data.messageType}
      Additional Context: ${data.additionalContext}

      Do not display the "Subject: Connecting:" label. Thank you so much.
    `;

    // Generate content
    const response = (await model.generateContent(userPrompt)).response;
    const text = response.text();

    return NextResponse.json({ output: text });
  } catch (error) {
    console.error('Detailed error in API route:', error);

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
