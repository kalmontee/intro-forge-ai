'use client';

import React from 'react';
import FormController from './FormController';
import { FormField, FormData, IntroForgeFormData, IntroForgeFormProps } from '../../types/form';

const introForgeFields: FormField[] = [
  {
    name: 'name',
    label: 'Your name',
    type: 'text',
    placeholder: 'e.g. Alex Rivera',
    required: true,
    section: 'From you',
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
  },
  {
    name: 'recipient',
    label: 'Recipient',
    type: 'text',
    placeholder: 'e.g. Sarah',
    required: true,
    section: 'To whom',
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
    groupWith: ['company'],
  },
  {
    name: 'company',
    label: 'Company (optional)',
    type: 'text',
    placeholder: 'e.g. Stripe',
    required: false,
    section: 'To whom',
  },
  {
    name: 'messageType',
    label: 'Message type',
    type: 'select',
    required: true,
    section: 'The message',
    options: [
      { value: '', label: 'Choose a type' },
      { value: 'cold_message', label: 'Cold message' },
      { value: 'follow_up', label: 'Follow-up' },
      { value: 'introduction', label: 'Introduction' },
      { value: 'job_inquiry', label: 'Job inquiry' },
      { value: 'cover_letter', label: 'Cover letter' },
    ],
  },
  {
    name: 'tone',
    label: 'Tone',
    type: 'radio',
    required: true,
    section: 'The message',
    options: [
      { value: 'formal', label: 'Formal' },
      { value: 'casual', label: 'Casual' },
      { value: 'enthusiastic', label: 'Enthusiastic' },
    ],
  },
  {
    name: 'additionalContext',
    label: 'Extra details (optional)',
    type: 'textarea',
    placeholder: 'e.g. A project you shipped, a mutual contact, or why this company',
    required: false,
    section: 'The message',
  },
];

const IntroForgeForm: React.FC<IntroForgeFormProps> = ({ onSubmit, loading = false, initialValues = {} }) => {
  const handleSubmit = (data: FormData) => {
    // Cast the generic FormData to our specific type
    const introForgeData: IntroForgeFormData = {
      name: data.name,
      selfIntroduction: data.selfIntroduction,
      role: data.role,
      company: data.company,
      recipient: data.recipient,
      messageType: data.messageType,
      tone: data.tone,
      additionalContext: data.additionalContext,
    };

    return onSubmit(introForgeData);
  };

  return (
    <FormController
      fields={introForgeFields}
      onSubmit={handleSubmit}
      submitButtonText={loading ? 'Writing your message…' : 'Write my message'}
      loading={loading}
      initialValues={initialValues}
    />
  );
};

export default IntroForgeForm;
