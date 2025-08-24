import Checkbox from '../../Components/Form/Checkbox';
import PrimaryButton from '../../Components/Form/PrimaryButton';
import GuestLayout from '../../Layouts/GuestLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import React, { useState } from 'react';
import InputText from '../../Components/Form/InputText';
import { useSelector } from 'react-redux';
import { appLangSelector } from '../../Redux/Layout/selectors';
import Lang from 'lang.js';
import lngAuth from '../../Lang/Auth/translation';
import axios from 'axios';

export default function Login({ status, canResetPassword }) {
  const { processing } = useForm({});
  const [values, setValues] = useState({
    name: '',
    password: '',
    remember: '',
  });
  const appLang = useSelector(appLangSelector);
  const msg = new Lang({
    messages: lngAuth,
    locale: appLang,
  });

  const handleChange = e => {
    const key = e.target.id;
    const value = e.target.value;
    setValues(values => ({
      ...values,
      [key]: value,
    }));
  };

  const submit = e => {
    e.preventDefault();
    // post(route('password.confirm'), {
    //     onFinish: () => reset('password'),
    // });
    axios
      .post('/login', values)
      .then(response => {
        if (response.data.dashboardSelect) {
          location.href = '/dashboard-select';
        } else {
          location.href = '/dashboard';
        }
      })
      .catch(error => {
        console.log('ERROR:: ', error.response.data);
      });
  };

  return (
    <GuestLayout>
      <Head title={msg.get('auth.login')} />

      {status && (
        <div className="mb-4 text-sm font-medium text-green-600">{status}</div>
      )}

      <form onSubmit={submit}>
        <div>
          <InputText
            name={'email'}
            type="email"
            values={values}
            onChange={handleChange}
            label={msg.get('auth.email')}
            required
          />

          <InputText
            name={'password'}
            type="password"
            values={values}
            onChange={handleChange}
            required
            label={msg.get('auth.password')}
          />
        </div>

        <div className="mt-4 block">
          <label className="flex items-center">
            <Checkbox
              name="remember"
              checked={values.remember}
              onChange={
                e => handleChange(e)
                // setData('remember', e.target.checked)
              }
            />
            <span className="ms-2 text-sm text-gray-600">
              {msg.get('auth.remember')}
            </span>
          </label>
        </div>

        <div className="mt-4 flex items-center justify-end">
          {canResetPassword && (
            <Link
              // href={route('password.request')}
              href={'/reset'}
              className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              {msg.get('auth.forgot')}
            </Link>
          )}

          <PrimaryButton className="ms-4" disabled={processing}>
            {msg.get('auth.login')}
          </PrimaryButton>
        </div>
        <div className="flex">
          <div className="mt-4 flex items-center">
            <a href="/auth/google/redirect"
               className="bg-gray-700 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded flex items-center">
              <svg className="w-6 h-6 mr-2" viewBox="0 0 48 48">
                <path
                    fill="#4285F4"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                />
                <path
                    fill="#34A853"
                    d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                />
                <path
                    fill="#FBBC05"
                    d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.28-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                />
                <path
                    fill="#EA4335"
                    d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                />
              </svg>
              Login with Google
            </a>
          </div>
        </div>
      </form>
    </GuestLayout>
  );
}
