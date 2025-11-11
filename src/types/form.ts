export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select';
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  validation?: (value: string) => string | undefined;
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
  title?: string;
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
}

export interface IntroForgeFormProps {
  onSubmit: (data: IntroForgeFormData) => void | Promise<void>;
  loading?: boolean;
  initialValues?: Partial<IntroForgeFormData>;
}
