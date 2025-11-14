'use client';

import { FC, useState } from 'react';
import { IntroForgeForm } from './forms';
import { MessageDisplay } from './MessageDisplay';
import { IntroForgeFormData } from '@/types/form';

export const Main: FC = () => {
  const [generatedMessage, setGeneratedMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleFormSubmit = async (data: IntroForgeFormData) => {
    setIsLoading(true);

    try {
      // TODO: Simulate API call - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock generated message based on form data - replace with actual AI-generated content
      const mockMessage = `Hi ${data.recipient},

      I'm a ${data.role} with nearly four years of experience specializing in SQL and full-stack development. I came across ${data.company}'s ${data.role} role and believe my background in data-driven product design aligns closely with your team's focus. I've led projects where I utilized SQL to optimize database performance, resulting in a 30% increase in query efficiency. I'd love to discuss how my skills and experiences could contribute to ${data.company}'s engineering team.
    
      Best regards,
      ${data.name}`;

      setGeneratedMessage(mockMessage);
    } catch (error) {
      console.error('Error generating message:', error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Form Component */}
      <aside className="lg:col-span-1">
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
          }}
        />
      </aside>

      {/* Generated Message Display */}
      <section className="lg:col-span-1">
        <MessageDisplay generatedMessage={generatedMessage} isLoading={isLoading} />
      </section>
    </main>
  );
};
