'use client';

import React, { useState, useCallback, Fragment } from 'react';

import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select } from '../ui/select';
import { RadioGroup } from '../ui/radio-group';
import { Button } from '../ui/button';
import { FormField, FormData, FormErrors, FormControllerProps } from '../../types/form';

type FieldRow = FormField | FormField[];

const rowSection = (row: FieldRow) => (Array.isArray(row) ? row[0].section : row.section);

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

  const handleInputChange = useCallback(
    (name: string, value: string) => {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));

      if (value === '') {
        localStorage.removeItem(name);
        return;
      }

      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.setItem(name, value);
      }

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
      hint: field.hint,
      error: errors[field.name],
      label: field.label,
    };

    switch (field.type) {
      case 'radio':
        return (
          <RadioGroup
            key={field.name}
            id={field.name}
            name={field.name}
            label={field.label}
            value={formData[field.name]}
            options={field.options || []}
            hint={field.hint}
            error={errors[field.name]}
            onChange={value => handleInputChange(field.name, value)}
          />
        );

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
    const grouped: FieldRow[] = [];
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

  // Split rows into sections: a new section starts whenever the section name changes
  const groupSections = (rows: FieldRow[]) => {
    const sections: { title?: string; rows: FieldRow[] }[] = [];

    rows.forEach(row => {
      const title = rowSection(row);
      const current = sections[sections.length - 1];

      if (current && current.title === title) {
        current.rows.push(row);
      } else {
        sections.push({ title, rows: [row] });
      }
    });

    return sections;
  };

  const renderRow = (fieldOrGroup: FieldRow, index: number) => {
    // If it's a single field
    if (!Array.isArray(fieldOrGroup)) {
      return renderField(fieldOrGroup);
    }

    // If it's a group of fields
    return (
      <div key={`group-${index}`} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {fieldOrGroup.map(field => (
          <Fragment key={field.name}>{renderField(field)}</Fragment>
        ))}
      </div>
    );
  };

  const sections = groupSections(groupFields());

  return (
    <Fragment>
      <form onSubmit={handleSubmit} noValidate>
        {sections.map((section, sectionIndex) => (
          <fieldset
            key={section.title ?? `section-${sectionIndex}`}
            className={`min-w-0 ${sectionIndex > 0 ? 'mt-6 border-t border-line pt-6' : ''}`}
          >
            {/* Floated so the legend sits inside the section instead of on its top border */}
            {section.title && <legend className="float-left mb-3 w-full text-body font-semibold text-slate">{section.title}</legend>}
            <div className="clear-both space-y-4">{section.rows.map(renderRow)}</div>
          </fieldset>
        ))}

        <div className="mt-8">
          <Button type="submit" className="w-full" size="lg" loading={isSubmitting || loading} disabled={isSubmitting || loading}>
            {submitButtonText}
          </Button>
        </div>
      </form>
    </Fragment>
  );
};

export default FormController;
