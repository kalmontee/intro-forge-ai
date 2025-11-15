'use client';

import React, { useState } from 'react';
import { Button } from './ui';

export const MessageDisplay: React.FC<{ generatedMessage: string; isLoading: boolean }> = ({ generatedMessage, isLoading }) => {
  const [isCopied, setIsCopied] = useState(false);

  async function copyTextToClipboard() {
    try {
      if ('clipboard' in navigator) {
        return await navigator.clipboard.writeText(generatedMessage);
      }
    } catch (err) {
      console.error('Failed to copy text: ', err);
      alert('Failed to copy text.');
    }
  }

  const handleCopyClick = () => {
    copyTextToClipboard()
      .then(() => {
        setIsCopied(true);
        setTimeout(() => {
          setIsCopied(false);
        }, 1500);
      })
      .catch(err => {
        console.error(err);
      });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 h-full flex flex-col">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex-shrink-0">Generated Message</h2>
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Generating message...</span>
          </div>
        ) : generatedMessage ? (
          <div className="prose max-w-none">
            <div className="whitespace-pre-wrap text-gray-800 bg-gray-50 p-4 rounded-md overflow-y-auto max-h-full">{generatedMessage}</div>
            <Button type="button" className="w-30 mt-2 ml-2" size="sm" variant="outline" onClick={handleCopyClick}>
              {isCopied ? 'Copied!' : 'Copy'}
            </Button>
          </div>
        ) : (
          <div className="text-gray-500 italic py-8 text-center">
            Fill out the form and click &ldquo;Write the Message&rdquo; to generate your personalized introduction.
          </div>
        )}
      </div>
    </div>
  );
};
