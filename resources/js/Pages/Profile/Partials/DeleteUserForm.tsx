import DangerButton from '../../../Components/Form/DangerButton';
import InputError from '../../../Components/Form/InputError';
import InputLabel from '../../../Components/Form/InputLabel';
import Modal from '../../../Components/Modal/Modal';
import SecondaryButton from '../../../Components/Form/SecondaryButton';
import TextInput from '../../../Components/Form/TextInput';
import { useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { appLangSelector } from '../../../Redux/Layout/selectors';
import Lang from 'lang.js';
import lngProfile from '../../../Lang/Profile/translation';

export default function DeleteUserForm({ className = '' }) {
  const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
  const passwordInput = useRef();
  const appLang = useSelector(appLangSelector);
  const msg = new Lang({
    messages: lngProfile,
    locale: appLang,
  });

  const {
    data,
    setData,
    delete: destroy,
    processing,
    reset,
    errors,
    clearErrors,
  } = useForm({
    password: '',
  });

  const confirmUserDeletion = () => {
    setConfirmingUserDeletion(true);
  };

  const deleteUser = e => {
    e.preventDefault();

    destroy(route('profile.destroy'), {
      preserveScroll: true,
      onSuccess: () => closeModal(),
      onError: () => passwordInput.current.focus(),
      onFinish: () => reset(),
    });
  };

  const closeModal = () => {
    setConfirmingUserDeletion(false);

    clearErrors();
    reset();
  };

  return (
    <section className={`space-y-6 ${className}`}>
      <header>
        <h2>{msg.get('profile.delete.title')}</h2>

        <p className="mt-1 text-sm text-gray-600">
          {msg.get('profile.delete.suredescr1')}
        </p>
      </header>

      {/*<DangerButton onClick={confirmUserDeletion}>*/}
      {/*    {msg.get('profile.delete.title')}*/}
      {/*</DangerButton>*/}

      <Modal show={confirmingUserDeletion} onClose={closeModal}>
        <form onSubmit={deleteUser} className="p-6">
          <h2 className="text-lg font-medium text-gray-900">
            {msg.get('profile.delete.sure')}
          </h2>

          <p className="mt-1 text-sm text-gray-600">
            {msg.get('profile.delete.suredescr')}
          </p>

          <div className="mt-6">
            <InputLabel
              htmlFor="password"
              value="Password"
              className="sr-only"
            />

            <TextInput
              id="password"
              type="password"
              name="password"
              ref={passwordInput}
              value={data.password}
              onChange={e => setData('password', e.target.value)}
              className="mt-1 block w-3/4"
              isFocused
              placeholder="Password"
            />

            <InputError message={errors.password} className="mt-2" />
          </div>

          <div className="mt-6 flex justify-end">
            <SecondaryButton onClick={closeModal}>
              {msg.get('profile.cancel.title')}
            </SecondaryButton>

            <DangerButton className="ms-3" disabled={processing}>
              {msg.get('profile.delete.title')}
            </DangerButton>
          </div>
        </form>
      </Modal>
    </section>
  );
}
