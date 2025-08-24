import React from 'react';
import { usePage } from '@inertiajs/react';
import InputLabel from './InputLabel';

interface Props {
  style: string | null;
  icon: string | null;
  name: string;
  label: string | null;
  placeholder: string | null;
  props: any;
  rows?: number;
}

export default function InputTextarea({
  className = '',
  name,
  label,
  values,
  onChange,
  placeholder = null,
  style = null,
  icon = null,
  rows = 4,
  ...props
}) {
  const { errors } = usePage().props;

  const clear = () => {
    props.setFieldValue(name, '');
  };

  return (
    <div className={`mb-4 ${style}`}>
      {label && <InputLabel htmlFor={name} value={label} children={null} />}
      <div className="relative">
        {icon && <i className={`f-icon ${icon}`} />}

        <textarea
          style={{ whiteSpace: 'pre-wrap' }}
          className={icon ? 'form-control-icon' : 'input-textarea'}
          placeholder={placeholder ? placeholder : ''}
          onChange={onChange}
          value={values[name]}
          name={name}
          id={name}
          rows={rows ? rows : 4}
        />
        <i
          role="presentation"
          className="input-close cursor-pointer"
          onClick={() => clear()}
        />
        {errors[name] && <div className="form-error">{errors[name]}</div>}
      </div>
    </div>
  );
}
