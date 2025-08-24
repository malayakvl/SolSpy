import React from 'react';

export default function PrimaryButton({
  className = '',
  disabled = null,
  children = null,
  ...props
}) {
  return (
    <button
      {...props}
      className={`btn-submit ${disabled && 'opacity-25'} ` + className}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
