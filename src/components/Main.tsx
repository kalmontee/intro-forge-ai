'use client';

import { FC, useState } from 'react';
import { IntroForgeForm } from './forms';
import { MessageDisplay } from './MessageDisplay';
import { IntroForgeFormData } from '@/types/form';

export const Main: FC = () => {
  const [aiResponse, setAiResponse] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleFormSubmit = async (data: IntroForgeFormData) => {
    setIsLoading(true);
    setAiResponse('');

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
      setAiResponse(`Sorry, there was an error generating your message: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <main className="grid grid-cols-1 lg:grid-cols-2 gap-8 overflow-hidden">
      {/* Form Component */}
      <aside className="lg:col-span-1 overflow-y-auto">
        <IntroForgeForm
          onSubmit={handleFormSubmit}
          loading={isLoading}
          initialValues={{
            name: '',
            selfIntroduction: '',
            role: '',
            company: '',
            recipient: '',
            messageType: '',
            additionalContext: '',
          }}
        />
      </aside>

      {/* Generated Message Display */}
      <section className="lg:col-span-1 overflow-y-auto max-h-[calc(100vh-8rem)]">
        <MessageDisplay generatedMessage={aiResponse} isLoading={isLoading} />
      </section>
    </main>
  );
};
