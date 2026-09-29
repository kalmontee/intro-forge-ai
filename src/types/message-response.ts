export interface MessageGenerationSuccess {
  output: string;
}

export interface MessageGenerationErrorBody {
  error: string;
  fieldErrors?: Record<string, string[]>;
}

export type MessageGenerationResponseBody = MessageGenerationSuccess | MessageGenerationErrorBody;
