import { type LabelHTMLAttributes, type ReactNode } from 'react';

interface InputLabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  value?: string;
  className?: string;
  children?: ReactNode;
}

export default function InputLabel({
  value,
  className = '',
  children,
  ...props
}: InputLabelProps) {
  return (
    <label
      {...props}
      className={`block text-sm font-medium text-white ` + className}
    >
      {value ? value : children}
    </label>
  );
}