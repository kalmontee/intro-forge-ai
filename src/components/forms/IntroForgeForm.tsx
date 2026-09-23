'use client';

import React, { useCallback } from 'react';
import FormController from './FormController';
import { FormField, FormData, IntroForgeFormData, IntroForgeFormProps } from '../../types/form';
import { FIELD_LIMITS, MESSAGE_TYPE_OPTIONS, TONE_OPTIONS } from '@/lib/intro-request-fields';

// The shared option labels are Title Case because the prompt uses them; the form shows sentence case
const toSentenceCase = ({ value, label }: { value: string; label: string }) => ({
  value,
  label: label.charAt(0) + label.slice(1).toLowerCase(),
});

const introForgeFields: FormField[] = [
  {
    name: 'name',
    label: 'Your name',
    type: 'text',
    placeholder: 'e.g. Alex Rivera',
    required: true,
    section: 'From you',
    maxLength: FIELD_LIMITS.name,
    validation: (value: string) => {
      if (value.length < 2) {
        return 'Enter at least 2 characters for your name';
      }
      return undefined;
    },
  },
  {
    name: 'selfIntroduction',
    label: 'About you',
    type: 'textarea',
    placeholder: 'e.g. Frontend engineer with 4 years building React apps for fintech',
    hint: 'Name specific skills or results. Shared connections or interests help too.',
    required: true,
    section: 'From you',
    maxLength: FIELD_LIMITS.selfIntroduction,
  },
  {
    name: 'recipient',
    label: 'Recipient',
    type: 'text',
    placeholder: 'e.g. Sarah',
    required: true,
    section: 'To whom',
    maxLength: FIELD_LIMITS.recipient,
    validation: (value: string) => {
      if (value.length < 2) {
        return "Enter at least 2 characters for the recipient's name";
      }
      return undefined;
    },
  },
  {
    name: 'role',
    label: 'Role you want',
    type: 'text',
    placeholder: 'e.g. Senior Frontend Engineer',
    required: true,
    section: 'To whom',
    maxLength: FIELD_LIMITS.role,
    groupWith: ['company'],
  },
  {
    name: 'company',
    label: 'Company (optional)',
    type: 'text',
    placeholder: 'e.g. Stripe',
    required: false,
    section: 'To whom',
    maxLength: FIELD_LIMITS.company,
  },
  {
    name: 'messageType',
    label: 'Message type',
    type: 'select',
    required: true,
    section: 'The message',
    options: [{ value: '', label: 'Choose a type' }, ...MESSAGE_TYPE_OPTIONS.map(toSentenceCase)],
  },
  {
    name: 'tone',
    label: 'Tone',
    type: 'radio',
    required: true,
    section: 'The message',
    // No empty option: the segmented control shows "none chosen" by having nothing selected
    options: [...TONE_OPTIONS],
  },
  {
    name: 'additionalContext',
    label: 'Extra details (optional)',
    type: 'textarea',
    placeholder: 'e.g. A project you shipped, a mutual contact, or why this company',
    required: false,
    section: 'The message',
    maxLength: FIELD_LIMITS.additionalContext,
  },
];

// Map the generic FormData to our specific type
const toIntroForgeData = (data: FormData): IntroForgeFormData => ({
  name: data.name,
  selfIntroduction: data.selfIntroduction,
  role: data.role,
  company: data.company,
  recipient: data.recipient,
  messageType: data.messageType,
  tone: data.tone,
  additionalContext: data.additionalContext,
});

const IntroForgeForm: React.FC<IntroForgeFormProps> = ({ onSubmit, onValuesChange, loading = false, initialValues = {} }) => {
  const handleSubmit = (data: FormData) => onSubmit(toIntroForgeData(data));

  const handleValuesChange = useCallback((data: FormData) => onValuesChange?.(toIntroForgeData(data)), [onValuesChange]);

  return (
    <FormController
      fields={introForgeFields}
      onSubmit={handleSubmit}
      onValuesChange={handleValuesChange}
      submitButtonText={loading ? 'Writing your message…' : 'Write my message'}
      loading={loading}
      initialValues={initialValues}
    />
  );
};

export default IntroForgeForm;
