import { type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react'

interface FieldWrapperProps {
  label: string
  error?: string
  children: React.ReactNode
}

interface LabeledFieldProps {
  label: string
  error?: string
}

function FieldWrapper({ label, error, children }: FieldWrapperProps) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-gray-700">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-red-500">{error}</span>}
    </label>
  )
}

const baseInputClass =
  'w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500'

export function TextField({
  label,
  error,
  className = '',
  ...rest
}: LabeledFieldProps & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <FieldWrapper label={label} error={error}>
      <input className={`${baseInputClass} ${className}`} {...rest} />
    </FieldWrapper>
  )
}

export function TextAreaField({
  label,
  error,
  className = '',
  ...rest
}: LabeledFieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <FieldWrapper label={label} error={error}>
      <textarea className={`${baseInputClass} resize-none ${className}`} {...rest} />
    </FieldWrapper>
  )
}
