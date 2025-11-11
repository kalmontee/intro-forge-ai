'use client';

import { JSX, useState } from 'react';
import { IntroForgeForm } from '@/components/forms';
import { IntroForgeFormData } from '@/types/form';

export default function Home(): JSX.Element {
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
    <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 min-h-screen">
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
          <main className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Generated Message</h2>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">Generating message...</span>
                </div>
              ) : generatedMessage ? (
                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap text-gray-800 bg-gray-50 p-4 rounded-md">{generatedMessage}</div>
                </div>
              ) : (
                <div className="text-gray-500 italic py-8 text-center">
                  Fill out the form and click &ldquo;Write the Message&rdquo; to generate your personalized introduction.
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
