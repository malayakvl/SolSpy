import InputLabel from './InputLabel';
import React, { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';
import lngDropdown from '../../Lang/Dropdown/translation';
import { useSelector } from 'react-redux';
import { appLangSelector } from '../../Redux/Layout/selectors';
import Lang from 'lang.js';

export default function InputSelect({
  className = '',
  elId = '',
  name,
  label,
  values,
  onChange,
  translatable = false,
  defaultValue = null,
  ...props
}) {
  const { errors } = usePage().props;
  const appLang = useSelector(appLangSelector);
  const msg = new Lang({
    messages: lngDropdown,
    locale: appLang,
  });
  return (
    <div className={`relative`}>
      <InputLabel htmlFor={name} value={label} children={null} />
      {props.options.length > 0 && (
        <select
          id={`${elId || name}`}
          name={name}
          className={`input-text ${className}`}
          defaultValue={`${defaultValue ? defaultValue : values[name]}`}
          onChange={onChange}
        >
          <option value="">{msg.get('dropdown.select')}</option>
          {props.options.map((option: any) => (
            <option key={option.id} value={option.id} selected={option.id === defaultValue}>
              {translatable ? msg.get('dropdown.' + option.name) : option.name}
            </option>
          ))}
        </select>
      )}
      {errors[name] && <div className="form-error">{errors[name]}</div>}
    </div>
  );
}
