import InputLabel from './InputLabel';
import React, { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';
import { useSelector } from 'react-redux';
import Lang from 'lang.js';
import { appLangSelector } from '../../Redux/Layout/selectors';
import lngRole from '../../Lang/Role/translation';

export default function InputRoleSelect({
  className = '',
  name,
  label,
  values,
  onChange,
  ...props
}) {
  const { errors } = usePage().props;
  const appLang = useSelector(appLangSelector);
  const msg = new Lang({
    messages: lngRole,
    locale: appLang,
  });
  const defaultValue = values?.role_id ? values.role_id : null;

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
          <option value="-1">Select</option>
          {props.options.map((option: any) => (
            <option
              key={option.id}
              value={option.id}
              selected={defaultValue === option.id}
            >
              {option.clinic_id ? option.name : msg.get(`role.${option.name}`)}
            </option>
          ))}
        </select>
      )}
      {errors[name] && <div className="form-error">{errors[name]}</div>}
    </div>
  );
}
