'use client';

import React, { useState, useCallback, Fragment } from 'react';

import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select } from '../ui/select';
import { Button } from '../ui/button';
import { FormField, FormData, FormErrors, FormControllerProps } from '../../types/form';

const FormController: React.FC<FormControllerProps> = ({
  fields,
  onSubmit,
  submitButtonText = 'Submit',
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

  // Group fields for layout
  const groupFields = () => {
    const grouped: (FormField | FormField[])[] = [];
    const processedFields = new Set<string>();

    fields.forEach(field => {
      if (processedFields.has(field.name)) {
        return;
      }

      // If field has groupWith property, group it with specified fields
      if (field.groupWith && field.groupWith.length > 0) {
        const group: FormField[] = [field];

        field.groupWith.forEach(groupedFieldName => {
          const groupedField = fields.find(f => f.name === groupedFieldName);
          if (groupedField && !processedFields.has(groupedFieldName)) {
            group.push(groupedField);
          }
        });

        group.forEach(f => processedFields.add(f.name));
        grouped.push(group);
      } else {
        // Single field
        processedFields.add(field.name);
        grouped.push(field);
      }
    });

    return grouped;
  };

  const groupedFields = groupFields();

  return (
    <Fragment>
      <div className="card-header">
        <h2 className="card-title">Create Your Message</h2>
        <p className="card-subtitle">
          Fill in the details below and we&apos;ll generate a personalized professional message tailored to your needs.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {groupedFields.map((fieldOrGroup, index) => {
          // If it's a single field
          if (!Array.isArray(fieldOrGroup)) {
            return renderField(fieldOrGroup);
          }

          // If it's a group of fields
          return (
            <div key={`group-${index}`} className="grid grid-cols-2 gap-4">
              {fieldOrGroup.map(field => (
                <Fragment key={field.name}>{renderField(field)}</Fragment>
              ))}
            </div>
          );
        })}

        {/* <Tips /> */}
        <div className="tips-section">
          <div className="tips-title">💡 Pro Tips</div>
          <ul className="tips-list">
            <li>Be specific about your relevant experience and skills</li>
            <li>Mention mutual connections or shared interests if applicable</li>
            <li>Keep your introduction concise but impactful</li>
          </ul>
        </div>

        <div className="pt-4">
          <Button type="submit" className="w-full" size="lg" loading={isSubmitting || loading} disabled={isSubmitting || loading}>
            {submitButtonText}
          </Button>
        </div>
      </form>
    </Fragment>
  );
};

export default FormController;
