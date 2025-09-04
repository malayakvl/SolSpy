import InputError from '../../../Components/Form/InputError';
import InputLabel from '../../../Components/Form/InputLabel';
import PrimaryButton from '../../../Components/Form/PrimaryButton';
import TextInput from '../../../Components/Form/TextInput';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { useSelector } from 'react-redux';
import { appLangSelector } from '../../../Redux/Layout/selectors';
import Lang from 'lang.js';
import lngProfile from '../../../Lang/Profile/translation';

export default function UpdateProfileInformation({
  mustVerifyEmail,
  status,
  className = '',
}) {
  const user = usePage().props.auth.user;
  const appLang = useSelector(appLangSelector);
  const msg = new Lang({
    messages: lngProfile,
    locale: appLang,
  });
  const { data, setData, patch, errors, processing, recentlySuccessful } =
    useForm({
      name: user.name,
      email: user.email,
    });

  const submit = e => {
    e.preventDefault();

    patch(route('profile.update'));
  };

  return (
    <section className={className}>
      <header>
        <h2>{msg.get('profile.information')}</h2>

        <p className="mt-1 text-sm text-gray-600">
          {msg.get('profile.information.descr')}
        </p>
      </header>

      <form onSubmit={submit} className="mt-6 space-y-6">
        <div>
          <InputLabel htmlFor="name" value={msg.get('profile.name')} />

          <TextInput
            id="name"
            className="mt-1 block w-full"
            value={data.name}
            onChange={e => setData('name', e.target.value)}
            required
            isFocused
            autoComplete="name"
          />

          <InputError className="mt-2" message={errors.name} />
        </div>

        <div>
          <InputLabel htmlFor="email" value="Email" />

          <TextInput
            id="email"
            type="email"
            className="mt-1 block w-full"
            value={data.email}
            onChange={e => setData('email', e.target.value)}
            required
            autoComplete="username"
          />

          <InputError className="mt-2" message={errors.email} />
        </div>

        {mustVerifyEmail && user.email_verified_at === null && (
          <div>
            <p className="mt-2 text-sm text-gray-800">
              Your email address is unverified.
              <Link
                href={route('verification.send')}
                method="post"
                as="button"
                className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Click here to re-send the verification email.
              </Link>
            </p>

            {status === 'verification-link-sent' && (
              <div className="mt-2 text-sm font-medium text-green-600">
                A new verification link has been sent to your email address.
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-4">
          <PrimaryButton disabled={processing}>
            {msg.get('profile.save')}
          </PrimaryButton>

          <Transition
            show={recentlySuccessful}
            enter="transition ease-in-out"
            enterFrom="opacity-0"
            leave="transition ease-in-out"
            leaveTo="opacity-0"
          >
            <p className="text-sm text-gray-600">{msg.get('profile.saved')}</p>
          </Transition>
        </div>
      </form>
    </section>
  );
}
