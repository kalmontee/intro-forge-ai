'use client';

import React from 'react';
import FormController from './FormController';
import { FormField, FormData, IntroForgeFormData, IntroForgeFormProps } from '../../types/form';

const introForgeFields: FormField[] = [
  {
    name: 'name',
    label: 'Your Name',
    type: 'text',
    placeholder: 'Enter your full name',
    required: true,
    validation: (value: string) => {
      if (value.length < 2) {
        return 'Name must be at least 2 characters long';
      }
      return undefined;
    },
  },
  {
    name: 'selfIntroduction',
    label: 'Self-Introduction',
    type: 'textarea',
    placeholder: "I'm a software engineer with almost 4 years of experience",
    required: true,
    validation: (value: string) => {
      if (value.length < 50) {
        return 'Please provide a more detailed introduction (at least 50 characters)';
      }
      if (value.length > 1000) {
        return 'Introduction should be less than 1000 characters';
      }
      return undefined;
    },
  },
  {
    name: 'role',
    label: 'Role',
    type: 'text',
    placeholder: 'e.g. Engineering Manager, Software Developer',
    required: true,
  },
  {
    name: 'company',
    label: 'Company',
    type: 'text',
    placeholder: 'e.g. Google, Microsoft, Apple',
    required: true,
  },
  {
    name: 'recipient',
    label: 'Recipient',
    type: 'text',
    placeholder: 'e.g. John, Sarah',
    required: true,
    validation: (value: string) => {
      if (value.length < 2) {
        return 'Recipient name must be at least 2 characters long';
      }
      return undefined;
    },
  },
  {
    name: 'messageType',
    label: 'Message Type',
    type: 'select',
    required: true,
    options: [
      { value: '', label: 'Select message type' },
      { value: 'cold_message', label: 'Cold Message' },
      { value: 'follow_up', label: 'Follow Up' },
      { value: 'introduction', label: 'Introduction' },
      { value: 'networking', label: 'Networking' },
      { value: 'job_inquiry', label: 'Job Inquiry' },
    ],
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
    };

    return onSubmit(introForgeData);
  };

  return (
    <FormController
      fields={introForgeFields}
      onSubmit={handleSubmit}
      submitButtonText="Write the Message"
      title="✖️ IntroForge AI"
      loading={loading}
      initialValues={initialValues}
    />
  );
};

export default IntroForgeForm;
