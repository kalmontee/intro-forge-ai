import type { IntroBrief } from './intro-request-fields';
import type { MessageGenerationErrorBody, MessageGenerationSuccess } from '@/types/message-response';

export type FetchFn = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

export type MessageRequestResult = { ok: true; message: string } | { ok: false; error: string };

const CONNECTION_ERROR = "Couldn't reach the server. Check your connection, then try again.";
const UNREADABLE_RESPONSE_ERROR = "Couldn't read the server's response. Try again in a moment.";

const fallbackErrorMessage = (status: number) => `Couldn't write your message (the server returned ${status}). Try again in a moment.`;

// Talks to POST /api and turns its response into what Main.tsx can render
// directly: a message on success, or the single user-facing string to show
// on failure. `fetchFn` is injectable so tests never hit the network.
export async function requestMessage(brief: IntroBrief, fetchFn: FetchFn = fetch): Promise<MessageRequestResult> {
  let response: Response;
  try {
    response = await fetchFn('/api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(brief),
    });
  } catch (error) {
    console.error('Error reaching the API:', error);
    return { ok: false, error: CONNECTION_ERROR };
  }

  if (!response.ok) {
    // The API returns client-safe messages (see src/lib/api-errors.ts) and per-field validation errors
    const errorData: Partial<MessageGenerationErrorBody> = await response.json().catch(() => ({}));
    console.error('API Error:', errorData);
    const fieldMessages = Object.values(errorData.fieldErrors ?? {}).flat();
    return {
      ok: false,
      error: fieldMessages.length > 0 ? `${fieldMessages.join('. ')}.` : errorData.error || fallbackErrorMessage(response.status),
    };
  }

  try {
    const result: MessageGenerationSuccess = await response.json();
    return { ok: true, message: result.output };
  } catch (error) {
    console.error('Error generating message:', error);
    return { ok: false, error: UNREADABLE_RESPONSE_ERROR };
  }
}
