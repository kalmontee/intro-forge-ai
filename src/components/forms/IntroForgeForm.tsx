'use client';

import React, { FormEvent } from 'react';
import { Input, Textarea, Select, RadioGroup, Button } from '../ui';
import { FIELD_LIMITS, MESSAGE_TYPE_OPTIONS, TONE_OPTIONS, type BriefFieldName, type IntroBrief } from '@/lib/intro-request-fields';

export interface IntroForgeFormProps {
  values: IntroBrief;
  errors: Record<string, string[]>;
  onChange: (field: BriefFieldName, value: string) => void;
  onSubmit: (e: FormEvent) => void;
  loading?: boolean;
}

// The shared option labels are Title Case because the prompt uses them; the form shows sentence case
const toSentenceCase = ({ value, label }: { value: string; label: string }) => ({
  value,
  label: label.charAt(0) + label.slice(1).toLowerCase(),
});

const MESSAGE_TYPE_SELECT_OPTIONS = [{ value: '', label: 'Choose a type' }, ...MESSAGE_TYPE_OPTIONS.map(toSentenceCase)];
// No empty option: the segmented control shows "none chosen" by having nothing selected
const TONE_RADIO_OPTIONS = TONE_OPTIONS.map(({ value, label }) => ({ value, label }));

type TextChangeEvent = React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;

const IntroForgeForm: React.FC<IntroForgeFormProps> = ({ values, errors, onChange, onSubmit, loading = false }) => {
  const fieldError = (field: BriefFieldName) => errors[field]?.[0];
  const handleTextChange = (field: BriefFieldName) => (e: TextChangeEvent) => onChange(field, e.target.value);

  return (
    <form onSubmit={onSubmit} noValidate>
      <fieldset className="min-w-0">
        <legend className="float-left mb-3 w-full text-body font-semibold text-slate">From you</legend>
        <div className="clear-both space-y-4">
          <Input
            id="name"
            label="Your name"
            placeholder="e.g. Alex Rivera"
            maxLength={FIELD_LIMITS.name}
            value={values.name}
            error={fieldError('name')}
            onChange={handleTextChange('name')}
          />
          <Textarea
            id="selfIntroduction"
            label="About you"
            placeholder="e.g. Frontend engineer with 4 years building React apps for fintech"
            hint="Name specific skills or results. Shared connections or interests help too."
            maxLength={FIELD_LIMITS.selfIntroduction}
            value={values.selfIntroduction}
            error={fieldError('selfIntroduction')}
            onChange={handleTextChange('selfIntroduction')}
          />
        </div>
      </fieldset>

      <fieldset className="min-w-0 mt-6 border-t border-line pt-6">
        <legend className="float-left mb-3 w-full text-body font-semibold text-slate">To whom</legend>
        <div className="clear-both space-y-4">
          <Input
            id="recipient"
            label="Recipient"
            placeholder="e.g. Sarah"
            maxLength={FIELD_LIMITS.recipient}
            value={values.recipient}
            error={fieldError('recipient')}
            onChange={handleTextChange('recipient')}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              id="role"
              label="Role you want"
              placeholder="e.g. Senior Frontend Engineer"
              maxLength={FIELD_LIMITS.role}
              value={values.role}
              error={fieldError('role')}
              onChange={handleTextChange('role')}
            />
            <Input
              id="company"
              label="Company (optional)"
              placeholder="e.g. Stripe"
              maxLength={FIELD_LIMITS.company}
              value={values.company}
              error={fieldError('company')}
              onChange={handleTextChange('company')}
            />
          </div>
        </div>
      </fieldset>

      <fieldset className="min-w-0 mt-6 border-t border-line pt-6">
        <legend className="float-left mb-3 w-full text-body font-semibold text-slate">The message</legend>
        <div className="clear-both space-y-4">
          <Select
            id="messageType"
            label="Message type"
            options={MESSAGE_TYPE_SELECT_OPTIONS}
            value={values.messageType}
            error={fieldError('messageType')}
            onChange={handleTextChange('messageType')}
          />
          <RadioGroup
            id="tone"
            name="tone"
            label="Tone"
            value={values.tone}
            options={TONE_RADIO_OPTIONS}
            error={fieldError('tone')}
            onChange={value => onChange('tone', value)}
          />
          <Textarea
            id="additionalContext"
            label="Extra details (optional)"
            placeholder="e.g. A project you shipped, a mutual contact, or why this company"
            maxLength={FIELD_LIMITS.additionalContext}
            value={values.additionalContext}
            error={fieldError('additionalContext')}
            onChange={handleTextChange('additionalContext')}
          />
        </div>
      </fieldset>

      <div className="mt-8">
        <Button type="submit" className="w-full" size="lg" loading={loading} disabled={loading}>
          {loading ? 'Writing your message…' : 'Write my message'}
        </Button>
      </div>
    </form>
  );
};

export default IntroForgeForm;
