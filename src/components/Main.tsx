'use client';

import { FC, useState } from 'react';
import { IntroForgeForm } from './forms';
import { MessageDisplay } from './MessageDisplay';
import { IntroForgeFormData } from '@/types/form';
import { EMPTY_FORM, clearSavedForm, loadSavedForm } from '@/lib/form-storage';
import { Button } from './ui';

export const Main: FC = () => {
  const [aiResponse, setAiResponse] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Lazy initializer loads the saved form synchronously on mount.
  const [initialFormValues, setInitialFormValues] = useState<IntroForgeFormData>(() => loadSavedForm());
  const [formKey, setFormKey] = useState(0);
  const [clearedNotice, setClearedNotice] = useState(false);

  const handleClearSavedData = () => {
    clearSavedForm();
    setInitialFormValues({ ...EMPTY_FORM });
    setFormKey(key => key + 1);
    setClearedNotice(true);
    setTimeout(() => setClearedNotice(false), 3000);
  };

  const handleFormSubmit = async (data: IntroForgeFormData) => {
    setIsLoading(true);
    setAiResponse('');
    setErrorMessage(null);

    try {
      const response = await fetch('/api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData: { error?: string; fieldErrors?: Record<string, string[]> } = await response.json().catch(() => ({}));
        console.error('API Error:', errorData);
        const fieldMessages = Object.values(errorData.fieldErrors ?? {}).flat();
        throw new Error(
          fieldMessages.length > 0
            ? fieldMessages.join('. ')
            : errorData.error || `The server returned an unexpected response (${response.status}). Please try again.`
        );
      }

      const result = await response.json();
      setAiResponse(result.output);
    } catch (error) {
      console.error('Error generating message:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setErrorMessage(`Sorry, there was an error generating your message: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <main className="grid grid-cols-1 lg:grid-cols-2 gap-8 overflow-hidden">
      {/* Form Section */}
      <aside className="lg:col-span-1 overflow-y-auto rounded-3xl h-fit bg-white p-10">
        <div className="mb-[30px]">
          <h2 className="text-[var(--card-title)] text-xl font-bold mb-2">Create Your Message</h2>
          <p className="text-[var(--card-subtitle)] text-[15px] leading-[1.6]">
            Fill in the details below and we&apos;ll generate a personalized professional message tailored to your needs.
          </p>
        </div>

        <IntroForgeForm key={formKey} onSubmit={handleFormSubmit} loading={isLoading} initialValues={initialFormValues} />

        <div className="mt-4 space-y-3 text-[13px] leading-[1.6] text-[var(--card-subtitle)]">
          <p>
            Your details are sent to Google Gemini to generate the message. Form values are saved only in this browser so they are still
            here when you come back.
          </p>
          <div className="flex items-center gap-3">
            <Button type="button" variant="outline" size="sm" onClick={handleClearSavedData}>
              Clear saved data
            </Button>
            <span role="status" aria-live="polite">
              {clearedNotice ? 'Saved data cleared.' : ''}
            </span>
          </div>
        </div>
      </aside>

      {/* Generated Message Display */}
      <section className="lg:col-span-1 overflow-y-auto max-h-[calc(100vh-8rem)]">
        <MessageDisplay generatedMessage={aiResponse} isLoading={isLoading} error={errorMessage} />
      </section>
    </main>
  );
};
