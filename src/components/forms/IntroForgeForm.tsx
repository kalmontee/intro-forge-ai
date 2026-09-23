'use client';

import React from 'react';
import FormController from './FormController';
import { FormField, FormData, IntroForgeFormData, IntroForgeFormProps } from '../../types/form';
import { FIELD_LIMITS, MESSAGE_TYPE_OPTIONS, TONE_OPTIONS } from '@/lib/intro-request-fields';

const introForgeFields: FormField[] = [
  {
    name: 'name',
    label: '👤 Your Name',
    type: 'text',
    placeholder: 'Enter your full name',
    required: true,
    maxLength: FIELD_LIMITS.name,
    validation: (value: string) => {
      if (value.length < 2) {
        return 'Name must be at least 2 characters long';
      }
      return undefined;
    },
  },
  {
    name: 'selfIntroduction',
    label: '💼 Self-Introduction',
    type: 'textarea',
    placeholder: "I'm a software engineer with almost 4 years of experience",
    required: true,
    maxLength: FIELD_LIMITS.selfIntroduction,
  },
  {
    name: 'role',
    label: '🎯 Role',
    type: 'text',
    placeholder: 'e.g. Engineering Manager, Software Developer',
    required: true,
    maxLength: FIELD_LIMITS.role,
    groupWith: ['company'],
  },
  {
    name: 'company',
    label: '🏢 Company',
    type: 'text',
    placeholder: 'e.g. Google, Microsoft, Apple',
    required: false,
    maxLength: FIELD_LIMITS.company,
  },
  {
    name: 'recipient',
    label: '👋 Recipient',
    type: 'text',
    placeholder: 'e.g. John, Sarah',
    required: true,
    maxLength: FIELD_LIMITS.recipient,
    groupWith: ['messageType'],
    validation: (value: string) => {
      if (value.length < 2) {
        return 'Recipient name must be at least 2 characters long';
      }
      return undefined;
    },
  },
  {
    name: 'messageType',
    label: '✉️ Message Type',
    type: 'select',
    required: true,
    options: [{ value: '', label: 'Select message type' }, ...MESSAGE_TYPE_OPTIONS],
  },
  {
    name: 'tone',
    label: '🎨 Tone',
    type: 'select',
    required: true,
    options: [{ value: '', label: 'Select tone' }, ...TONE_OPTIONS],
  },
  {
    name: 'additionalContext',
    label: '📝 Additional Context (Optional)',
    type: 'textarea',
    placeholder: "Any extra details you'd like to include, such as specific projects, skills, or achievements...",
    required: false,
    maxLength: FIELD_LIMITS.additionalContext,
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
      submitButtonText="✨ Generate Message"
      loading={loading}
      initialValues={initialValues}
    />
  );
};

export default IntroForgeForm;
