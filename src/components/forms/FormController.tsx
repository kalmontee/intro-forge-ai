'use client';

import React, { useState, useCallback } from 'react';

import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select } from '../ui/select';
import { Button } from '../ui/button';
import { FormField, FormData, FormErrors, FormControllerProps } from '../../types/form';

const FormController: React.FC<FormControllerProps> = ({
  fields,
  onSubmit,
  submitButtonText = 'Submit',
  title,
  initialValues = {},
  loading = false,
}) => {
  // Initialize form data with initial values
  const [formData, setFormData] = useState<FormData>(() => {
    const initialData: FormData = {};
    fields.forEach(field => {
      initialData[field.name] = initialValues[field.name] || '';
    });
    return initialData;
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle input changes
  const handleInputChange = useCallback(
    (name: string, value: string) => {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));

      // Clear error when user starts typing
      if (errors[name]) {
        setErrors(prev => ({
          ...prev,
          [name]: '',
        }));
      }
    },
    [errors]
  );

  // Validate form
  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    fields.forEach(field => {
      const value = formData[field.name];

      // Required field validation
      if (field.required && (!value || value.trim() === '')) {
        newErrors[field.name] = `${field.label} is required`;
        return;
      }

      // Custom validation
      if (field.validation && value) {
        const error = field.validation(value);
        if (error) {
          newErrors[field.name] = error;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [fields, formData]);

  // Handle form submission
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateForm()) {
        return;
      }

      setIsSubmitting(true);
      try {
        await onSubmit(formData);
      } catch (error) {
        console.error('Form submission error:', error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, onSubmit, validateForm]
  );

  // Render field based on type
  const renderField = (field: FormField) => {
    const commonProps = {
      id: field.name,
      name: field.name,
      value: formData[field.name],
      placeholder: field.placeholder,
      error: errors[field.name],
      label: field.label,
    };

    switch (field.type) {
      case 'textarea':
        return <Textarea key={field.name} {...commonProps} onChange={e => handleInputChange(field.name, e.target.value)} />;

      case 'select':
        return (
          <Select
            key={field.name}
            {...commonProps}
            options={field.options || []}
            onChange={e => handleInputChange(field.name, e.target.value)}
          />
        );

      case 'text':
      default:
        return <Input key={field.name} {...commonProps} type="text" onChange={e => handleInputChange(field.name, e.target.value)} />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {title && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {fields.map(renderField)}

        <div className="pt-4">
          <Button type="submit" className="w-full" size="lg" loading={isSubmitting || loading} disabled={isSubmitting || loading}>
            {submitButtonText}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default FormController;
