export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'radio';
  placeholder?: string;
  hint?: string; // Short help text shown under the field
  required?: boolean;
  options?: { value: string; label: string }[];
  validation?: (value: string) => string | undefined;
  groupWith?: string[]; // Field names to group horizontally
  section?: string; // Consecutive fields with the same section render under one heading
}

export interface FormData {
  [key: string]: string;
}

export interface FormErrors {
  [key: string]: string;
}

export interface FormControllerProps {
  fields: FormField[];
  onSubmit: (data: FormData) => void | Promise<void>;
  submitButtonText?: string;
  initialValues?: Partial<FormData>;
  loading?: boolean;
}

export interface IntroForgeFormData {
  name: string;
  selfIntroduction: string;
  role: string;
  company: string;
  recipient: string;
  messageType: string;
  tone: string;
  additionalContext?: string;
}

export interface IntroForgeFormProps {
  onSubmit: (data: IntroForgeFormData) => void | Promise<void>;
  loading?: boolean;
  initialValues?: Partial<IntroForgeFormData>;
}
