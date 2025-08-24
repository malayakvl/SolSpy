import InputLabel from './InputLabel';
import React, { useState } from 'react';
import { usePage } from '@inertiajs/react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function InputCalendar({
  className = '',
  name,
  label,
  values,
  onChange,
  type,
  ...props
}) {
  const { errors } = usePage().props;
  const [startDate, setStartDate] = useState(new Date());

  return (
    <div className={`relative`}>
      <InputLabel htmlFor={name} value={label} />
      <DatePicker
        id={name}
        name={name}
        value={values[name]}
        className={`input-text`}
        selected={startDate}
        onChange={date => {
          setStartDate(date);
          onChange(date);
        }}
      />
      {/*<input*/}
      {/*    id={name}*/}
      {/*    onChange={onChange}*/}
      {/*    onClick={() => {*/}
      {/*        console.log('show calendar')*/}
      {/*    }}*/}
      {/*    type={type ? type : 'text'}*/}
      {/*    value={values[name]}*/}

      {/*    className={*/}
      {/*        'input-text ' +*/}
      {/*        className*/}
      {/*    }*/}
      {/*/>*/}
      {errors[name] && <div className="form-error">{errors[name]}</div>}
    </div>
  );
}
