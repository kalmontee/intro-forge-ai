'use client';

import { FC, FormEvent, useState } from 'react';
import { IntroForgeForm } from './forms';
import { MessageDisplay } from './MessageDisplay';
import type { IntroBrief } from '@/lib/intro-request-fields';
import { firstInvalidField } from '@/lib/brief-form';
import { useBriefForm } from '@/hooks/use-brief-form';
import { requestMessage } from '@/lib/message-request';
import { Button } from './ui';

export const Main: FC = () => {
  const form = useBriefForm();
  const [aiResponse, setAiResponse] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [clearedNotice, setClearedNotice] = useState(false);

  // Live values (form.values) drive the draft pane's summary; the submitted ones label the finished message
  const [submittedBrief, setSubmittedBrief] = useState<IntroBrief | null>(null);

  const handleClearSavedData = () => {
    form.clear();
    setAiResponse('');
    setErrorMessage(null);
    setSubmittedBrief(null);
    setClearedNotice(true);
    setTimeout(() => setClearedNotice(false), 3000);
  };

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const errors = form.validate();
    if (Object.keys(errors).length > 0) {
      const field = firstInvalidField(errors);
      if (field) document.getElementById(field)?.focus();
      return;
    }

    setIsLoading(true);
    setAiResponse('');
    setErrorMessage(null);
    setSubmittedBrief(form.values);

    const result = await requestMessage(form.values);
    if (result.ok) {
      setAiResponse(result.message);
    } else {
      setErrorMessage(result.error);
    }
    setIsLoading(false);
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

        <IntroForgeForm values={form.values} errors={form.errors} onChange={form.change} onSubmit={handleFormSubmit} loading={isLoading} />

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
            brief={submittedBrief && (isLoading || aiResponse || errorMessage) ? submittedBrief : form.values}
          />
        </div>
      </section>
    </main>
  );
};
