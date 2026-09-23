'use client';

import { FC, useEffect, useState } from 'react';
import { IntroForgeForm } from './forms';
import { MessageDisplay } from './MessageDisplay';
import { IntroForgeFormData } from '@/types/form';
import { EMPTY_FORM, clearSavedForm, loadSavedForm } from '@/lib/form-storage';
import { Button } from './ui';

export const Main: FC = () => {
  const [aiResponse, setAiResponse] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Saved values are read after mount, not during render: the server renders empty fields,
  // and React won't patch a mismatched select or radio during hydration.
  // Bumping formKey remounts the form so it takes new initial values (after loading or clearing).
  const [initialFormValues, setInitialFormValues] = useState<IntroForgeFormData>(EMPTY_FORM);
  const [formKey, setFormKey] = useState(0);
  const [clearedNotice, setClearedNotice] = useState(false);

  useEffect(() => {
    setInitialFormValues(loadSavedForm());
    setFormKey(key => key + 1);
  }, []);

  const handleClearSavedData = () => {
    clearSavedForm();
    setInitialFormValues({ ...EMPTY_FORM });
    setFormKey(key => key + 1);
    setClearedNotice(true);
    setTimeout(() => setClearedNotice(false), 3000);
  };

  // Live values drive the draft pane's summary; the submitted ones label the finished message
  const [brief, setBrief] = useState<IntroForgeFormData>(EMPTY_FORM);
  const [submittedBrief, setSubmittedBrief] = useState<IntroForgeFormData | null>(null);

  const handleFormSubmit = async (data: IntroForgeFormData) => {
    setIsLoading(true);
    setAiResponse('');
    setErrorMessage(null);
    setSubmittedBrief(data);

    let response: Response;
    try {
      response = await fetch('/api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('Error reaching the API:', error);
      setErrorMessage("Couldn't reach the server. Check your connection, then try again.");
      setIsLoading(false);
      return;
    }

    try {
      if (!response.ok) {
        // The API returns client-safe messages (see src/lib/api-errors.ts) and per-field validation errors
        const errorData: { error?: string; fieldErrors?: Record<string, string[]> } = await response.json().catch(() => ({}));
        console.error('API Error:', errorData);
        const fieldMessages = Object.values(errorData.fieldErrors ?? {}).flat();
        setErrorMessage(
          fieldMessages.length > 0
            ? `${fieldMessages.join('. ')}.`
            : errorData.error || `Couldn't write your message (the server returned ${response.status}). Try again in a moment.`
        );
        return;
      }

      const result = await response.json();
      setAiResponse(result.output);
    } catch (error) {
      console.error('Error generating message:', error);
      setErrorMessage("Couldn't read the server's response. Try again in a moment.");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <main className="grid grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] bg-surface rounded-surface shadow-surface">
      {/* Brief (form) */}
      <section aria-labelledby="brief-heading" className="p-6 sm:p-8 lg:border-r lg:border-line">
        <div className="mb-6">
          <h2 id="brief-heading" className="text-title font-semibold text-slate">
            Your brief
          </h2>
          <p className="mt-1 text-muted">Tell us who you&apos;re writing to and what you want. We&apos;ll write the message.</p>
        </div>

        <IntroForgeForm
          key={formKey}
          onSubmit={handleFormSubmit}
          onValuesChange={setBrief}
          loading={isLoading}
          initialValues={initialFormValues}
        />

        {/* Privacy notice and saved-data control */}
        <div className="mt-6 space-y-3 border-t border-line pt-5 text-meta leading-relaxed text-muted">
          <p>
            Your details are sent to Google Gemini to write the message. Form values are saved only in this browser, so they&apos;re
            still here when you come back.
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
      </section>

      {/* Draft (generated message) */}
      <section aria-label="Your message" className="border-t border-line p-6 sm:p-8 lg:border-t-0">
        <div className="lg:sticky lg:top-8">
          <MessageDisplay
            generatedMessage={aiResponse}
            isLoading={isLoading}
            error={errorMessage}
            brief={submittedBrief && (isLoading || aiResponse || errorMessage) ? submittedBrief : brief}
          />
        </div>
      </section>
    </main>
  );
};
