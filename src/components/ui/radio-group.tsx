import React from 'react';
import { getDescriptionA11yProps } from '@/styles/className-utils';
import { Field } from './field';

export interface RadioGroupProps {
  id: string;
  name: string;
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  hint?: string;
  error?: string;
}

// Segmented control built on native radios, so arrow keys and form semantics work without extra code
const RadioGroup: React.FC<RadioGroupProps> = ({ id, name, label, value, options, onChange, hint, error }) => {
  const labelId = `${id}-label`;

  return (
    <Field id={id} label={label} labelId={labelId} hint={hint} error={error}>
      <div
        role="radiogroup"
        aria-labelledby={labelId}
        {...getDescriptionA11yProps(id, error, hint)}
        className={`flex gap-1 rounded-field border bg-canvas p-1 ${error ? 'border-error' : 'border-line'}`}
      >
        {options.map((option, index) => (
          <label key={option.value} className="flex-1">
            <input
              type="radio"
              id={index === 0 ? id : undefined}
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={e => onChange(e.target.value)}
              className="peer sr-only"
            />
            <span
              className={[
                'flex h-8 cursor-pointer items-center justify-center rounded-[6px] px-3 text-ui text-muted transition-colors',
                'hover:text-slate peer-checked:bg-forge peer-checked:text-white',
                'peer-focus-visible:outline-2 peer-focus-visible:outline-offset-1 peer-focus-visible:outline-forge',
              ].join(' ')}
            >
              {option.label}
            </span>
          </label>
        ))}
      </div>
    </Field>
  );
};

export { RadioGroup };
