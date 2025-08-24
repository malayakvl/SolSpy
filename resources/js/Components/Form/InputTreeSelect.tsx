import InputLabel from './InputLabel';
import React, { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';

export default function InputTreeSelect({
  className = '',
  name,
  label,
  values,
  onChange,
  ...props
}) {
  const { errors } = usePage().props;

  return (
    <div className="relative">
      <InputLabel htmlFor={name} value={label} />
      {props.options.length > 0 && (
        <select
          id={name}
          name={name}
          className="input-text"
          onChange={onChange}
        >
          <option>Select</option>
          {props.options.map((option: any) => (
            <option
              key={option.id}
              value={option.id}
              selected={option.id === values[name]}
            >
              {option.level > 0 ? '\u00A0\u00A0\u00A0' : ''}
              {option.name}
            </option>
          ))}
        </select>
      )}
      {errors[name] && <div className="form-error">{errors[name]}</div>}
    </div>
  );
}
