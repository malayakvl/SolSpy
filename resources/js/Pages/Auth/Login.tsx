import Checkbox from '../../Components/Form/Checkbox';
import PrimaryButton from '../../Components/Form/PrimaryButton';
import GuestLayout from '../../Layouts/GuestLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import React, { useState } from 'react';
import InputText from '../../Components/Form/InputText';
import { useDispatch, useSelector } from 'react-redux';
import { appLangSelector } from '../../Redux/Layout/selectors';
import Lang from 'lang.js';
import lngAuth from '../../Lang/Auth/translation';
import axios from 'axios';
import { setUserAction } from "../../Redux/Users";

export default function Login({ status, canResetPassword }) {
  const { processing } = useForm({});
  const dispatch  = useDispatch();
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
        dispatch(setUserAction(response.config.data))
        location.href = '/dashboard';
      })
      .catch(error => {
        console.error('ERROR:: ', error.response.data);
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
          <div className="pb-4">
            <InputText
              name={'email'}
              type="email"
              values={values}
              onChange={handleChange}
              label={msg.get('auth.email')}
              required
            />
          </div>
          <div className="pb-4">
            <InputText
              name={'password'}
              type="password"
              values={values}
              onChange={handleChange}
              required
              label={msg.get('auth.password')}
            />
          </div>
        </div>

        {/* <div className="mt-4 block hidden">
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
        </div> */}

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
        <div className="flex mx-auto">
          <div className="flex justify-between items-center pt-4 w-full">
            <div>
              <a href="/auth/google/redirect"
                className="bg-blue-800 hover:bg-gray-500 text-white text-sm font-bold py-2 px-4 rounded flex flex-start">
                <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="24" height="24" className="google-icon" viewBox="0 0 50 50">
                  <path d="M 25.996094 48 C 13.3125 48 2.992188 37.683594 2.992188 25 C 2.992188 12.316406 13.3125 2 25.996094 2 C 31.742188 2 37.242188 4.128906 41.488281 7.996094 L 42.261719 8.703125 L 34.675781 16.289063 L 33.972656 15.6875 C 31.746094 13.78125 28.914063 12.730469 25.996094 12.730469 C 19.230469 12.730469 13.722656 18.234375 13.722656 25 C 13.722656 31.765625 19.230469 37.269531 25.996094 37.269531 C 30.875 37.269531 34.730469 34.777344 36.546875 30.53125 L 24.996094 30.53125 L 24.996094 20.175781 L 47.546875 20.207031 L 47.714844 21 C 48.890625 26.582031 47.949219 34.792969 43.183594 40.667969 C 39.238281 45.53125 33.457031 48 25.996094 48 Z"></path>
                </svg>
                <span className="inline-block pl-[5px] pt-[2px]">Login with Google</span>
              </a>
            </div>
            
           <div>
            <a href="/auth/google/redirect"
                className="bg-blue-800 hover:bg-gray-500 text-white text-sm font-bold py-2 px-4 rounded flex flex-start">
                <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="24" height="24" className="apple-icon" viewBox="0 0 50 50">
                  <path d="M 44.527344 34.75 C 43.449219 37.144531 42.929688 38.214844 41.542969 40.328125 C 39.601563 43.28125 36.863281 46.96875 33.480469 46.992188 C 30.46875 47.019531 29.691406 45.027344 25.601563 45.0625 C 21.515625 45.082031 20.664063 47.03125 17.648438 47 C 14.261719 46.96875 11.671875 43.648438 9.730469 40.699219 C 4.300781 32.429688 3.726563 22.734375 7.082031 17.578125 C 9.457031 13.921875 13.210938 11.773438 16.738281 11.773438 C 20.332031 11.773438 22.589844 13.746094 25.558594 13.746094 C 28.441406 13.746094 30.195313 11.769531 34.351563 11.769531 C 37.492188 11.769531 40.8125 13.480469 43.1875 16.433594 C 35.421875 20.691406 36.683594 31.78125 44.527344 34.75 Z M 31.195313 8.46875 C 32.707031 6.527344 33.855469 3.789063 33.4375 1 C 30.972656 1.167969 28.089844 2.742188 26.40625 4.78125 C 24.878906 6.640625 23.613281 9.398438 24.105469 12.066406 C 26.796875 12.152344 29.582031 10.546875 31.195313 8.46875 Z"></path>
                </svg>
                <span className="inline-block pl-[5px] pt-[2px]">Login with Apple</span>
              </a>
           </div>
          </div>
          {/* <div className="mt-4 flex">
            <a href="/auth/google/redirect"
               className="bg-gray-700 hover:bg-gray-500 text-white text-sm font-bold py-2 px-4 rounded flex flex-start">
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
            <a href="/auth/google/redirect"
               className="bg-gray-700 hover:bg-gray-500 text-white text-sm py-2 px-4 rounded flex items-center flex-end">
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
              Login with Apple
            </a>
          </div> */}
        </div>
      </form>
    </GuestLayout>
  );
}
