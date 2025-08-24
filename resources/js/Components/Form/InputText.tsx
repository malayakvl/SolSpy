import InputLabel from './InputLabel';
import React, { useState } from 'react';
import { usePage } from '@inertiajs/react';

export default function InputText({
  className = '',
  name,
  label,
  values,
  placeholder = '',
  showLabel = true,
  onChange,
  type = 'text',
  ...props
}) {
  const { errors } = usePage().props;

  return (

    <div className={`relative`}>
      {showLabel && <InputLabel htmlFor={name} value={label} children={null} />}

      <input
        id={name}
        onChange={onChange}
        type={type ? type : 'text'}
        value={values[name]}
        placeholder={placeholder}
        className={'input-text ' + className}
      />
      {errors[name] && <div className="form-error">{errors[name]}</div>}
    </div>
  );
}
