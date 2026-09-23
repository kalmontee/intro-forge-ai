'use client';

import React, { Fragment, useState } from 'react';
import { Button } from './ui';
import { displayMessageStyles } from '@/styles/className-utils';

export const MessageDisplay: React.FC<{ generatedMessage: string; isLoading: boolean; error: string | null }> = ({
  generatedMessage,
  isLoading,
  error,
}) => {
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
    <div className="flex flex-col">
      <h2 className="text-title font-semibold text-slate">Your message</h2>
      <div className="flex-1 overflow-y-auto mt-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Generating message...</span>
          </div>
        ) : generatedMessage || error ? (
          <div className="prose max-w-none">
            {!error ? (
              <Fragment>
                <div className={displayMessageStyles}>{generatedMessage}</div>
                <Button type="button" className="w-30 mt-2 ml-2" size="sm" variant="outline" onClick={handleCopyClick}>
                  {isCopied ? 'Copied!' : 'Copy'}
                </Button>
              </Fragment>
            ) : (
              <div className={displayMessageStyles}>{error}</div>
            )}
          </div>
        ) : (
          <div className="italic py-8 text-center">
            <div className="preview-icon mb-5 opacity-50 text-[80px]">📧</div>
            <h3 className="text-black text-xl font-semibold">No message yet</h3>
            <p className="text-gray-500">
              Fill out the form and click &quot;Generate Message&quot; to create your personalized introduction.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
