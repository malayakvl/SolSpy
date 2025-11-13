import InputLabel from './InputLabel';
import React, { useState } from 'react';
import { usePage } from '@inertiajs/react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface InputCalendarProps {
  className?: string;
  name: string;
  label: string;
  values: Record<string, any>;
  onChange: (date: Date | null) => void;
  type?: string;
  [key: string]: any; // Allow additional props to be passed through
}

export default function InputCalendar({
  className = '',
  name,
  label,
  values,
  onChange,
  type,
  ...props
}: InputCalendarProps) {
  const { errors } = usePage().props;
  const [startDate, setStartDate] = useState<Date | null>(new Date());

  return (
    <div className={`relative`}>
      <InputLabel htmlFor={name} value={label}>
        {label}
      </InputLabel>
      <DatePicker
        id={name}
        name={name}
        selected={startDate}
        className={`input-text`}
        onChange={(date: Date | null) => {
          setStartDate(date);
          onChange(date);
        }}
        {...props}
      />
      {errors[name] && <div className="form-error">{errors[name]}</div>}
    </div>
  );
}