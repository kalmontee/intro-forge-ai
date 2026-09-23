'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button } from './ui';
import { displayMessageStyles } from '@/styles/className-utils';
import { describeBrief, getMessageStats } from '@/lib/message-meta';
import { IntroForgeFormData } from '@/types/form';

type CopyStatus = 'idle' | 'copied' | 'failed';

export const MessageDisplay: React.FC<{
  generatedMessage: string;
  isLoading: boolean;
  error: string | null;
  brief: IntroForgeFormData;
}> = ({ generatedMessage, isLoading, error, brief }) => {
  const [copyStatus, setCopyStatus] = useState<CopyStatus>('idle');
  const paneRef = useRef<HTMLDivElement>(null);

  // A new message resets the copy confirmation
  useEffect(() => setCopyStatus('idle'), [generatedMessage]);

  // On stacked (mobile) layouts the pane sits below the form, so bring the result into view
  useEffect(() => {
    const pane = paneRef.current;
    if (!pane || (!generatedMessage && !error) || window.matchMedia('(min-width: 1024px)').matches) {
      return;
    }

    const { top } = pane.getBoundingClientRect();
    if (top < 0 || top > window.innerHeight / 2) {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      pane.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    }
  }, [generatedMessage, error]);

  const handleCopyClick = async () => {
    try {
      await navigator.clipboard.writeText(generatedMessage);
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      setCopyStatus('failed');
    }
  };

  const summary = describeBrief(brief);
  const hasMessage = Boolean(generatedMessage) && !error;

  // Short status for screen readers; the message itself stays out of the live region
  const liveStatus = isLoading ? 'Writing your message…' : error ? error : hasMessage ? 'Your message is ready.' : '';

  return (
    <div ref={paneRef} className="flex scroll-mt-4 flex-col">
      <h2 className="text-title font-semibold text-slate">Your message</h2>
      <p className="sr-only" aria-live="polite">
        {liveStatus}
      </p>

      {/* The brief summary, or an invitation when the brief is empty */}
      <p className={`mt-4 max-w-[40ch] text-title leading-snug ${summary ? 'text-slate' : 'text-muted'}`}>
        {summary ?? 'Fill in the brief and your message appears here.'}
      </p>

      <div className="mt-6 border-t border-line pt-6">
        {isLoading ? (
          <div aria-hidden="true">
            <p className="mb-5 text-muted">Writing your message…</p>
            <div className="max-w-[65ch] space-y-3 motion-safe:animate-pulse">
              {['w-1/3', 'w-full', 'w-11/12', 'w-full', 'w-4/5', 'w-2/3'].map((width, i) => (
                <div key={i} className={`h-3 rounded-full bg-canvas ${width}`} />
              ))}
            </div>
          </div>
        ) : error ? (
          <p className="max-w-[65ch] text-error">{error}</p>
        ) : hasMessage ? (
          // Keyed by message so the arrival animation plays once per new message, not on re-renders
          <MessageBody key={generatedMessage} message={generatedMessage} copyStatus={copyStatus} onCopy={handleCopyClick} />
        ) : (
          <p className="max-w-[48ch] text-muted">
            {summary
              ? 'When the summary looks right, select Write my message.'
              : 'As you fill it in, a summary of your message shows here so you can check it before writing.'}
          </p>
        )}
      </div>
    </div>
  );
};

const MessageBody: React.FC<{ message: string; copyStatus: CopyStatus; onCopy: () => void }> = ({ message, copyStatus, onCopy }) => {
  const { words, readTime } = getMessageStats(message);
  const paragraphs = message.trim().split(/\n\s*\n/);

  return (
    <div>
      <div className={`${displayMessageStyles} space-y-[1.7em]`}>
        {paragraphs.map((paragraph, i) => (
          // Stagger capped so long messages still settle within about half a second
          <p key={i} className="message-arrive" style={{ animationDelay: `${Math.min(i * 60, 240)}ms` }}>
            {paragraph}
          </p>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line pt-4">
        <p className="text-meta text-muted">
          {words} words, {readTime}
        </p>
        <div className="ml-auto flex items-center gap-3">
          <span className={`text-meta ${copyStatus === 'failed' ? 'text-error' : 'text-muted'}`} aria-live="polite">
            {copyStatus === 'copied' && 'Copied'}
            {copyStatus === 'failed' && "Couldn't copy. Select the text and copy it yourself."}
          </span>
          <Button type="button" size="sm" variant="outline" onClick={onCopy}>
            Copy message
          </Button>
        </div>
      </div>
    </div>
  );
};
