'use client';

import { FC, useState } from 'react';
import { IntroForgeForm } from './forms';
import { MessageDisplay } from './MessageDisplay';
import { IntroForgeFormData } from '@/types/form';

export const Main: FC = () => {
  const [aiResponse, setAiResponse] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Use lazy initializer to load from localStorage synchronously on mount
  const [initialFormValues] = useState<IntroForgeFormData>(() => {
    // Check if we're on the client side
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      return {
        name: localStorage.getItem('name') || '',
        selfIntroduction: localStorage.getItem('selfIntroduction') || '',
        role: localStorage.getItem('role') || '',
        company: localStorage.getItem('company') || '',
        recipient: localStorage.getItem('recipient') || '',
        messageType: localStorage.getItem('messageType') || '',
        tone: localStorage.getItem('tone') || '',
        additionalContext: localStorage.getItem('additionalContext') || '',
      };
    }

    return {
      name: '',
      selfIntroduction: '',
      role: '',
      company: '',
      recipient: '',
      messageType: '',
      tone: '',
      additionalContext: '',
    };
  });

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
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', errorData);
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
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
    <main className="grid grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] bg-surface rounded-surface shadow-surface">
      {/* Brief (form) */}
      <section aria-labelledby="brief-heading" className="p-6 sm:p-8 lg:border-r lg:border-line">
        <div className="mb-6">
          <h2 id="brief-heading" className="text-title font-semibold text-slate">
            Your brief
          </h2>
          <p className="mt-1 text-muted">Tell us who you&apos;re writing to and what you want. We&apos;ll write the message.</p>
        </div>

        <IntroForgeForm onSubmit={handleFormSubmit} loading={isLoading} initialValues={initialFormValues} />
      </section>

      {/* Draft (generated message) */}
      <section aria-label="Your message" className="border-t border-line p-6 sm:p-8 lg:border-t-0">
        <div className="lg:sticky lg:top-8">
          <MessageDisplay generatedMessage={aiResponse} isLoading={isLoading} error={errorMessage} />
        </div>
      </section>
    </main>
  );
};
