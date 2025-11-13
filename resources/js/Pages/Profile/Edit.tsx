import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status }) {
  return (
    <AuthenticatedLayout header={<Head title="Profile" />} auth={usePage().props.auth}>
      <Head title="Profile" />
      <div className="py-0">
        <div>
          <div className="p-4 sm:p-8 mb-8 content-data bg-content">
            <UpdateProfileInformationForm
              mustVerifyEmail={mustVerifyEmail}
              status={status}
              className="max-w-xl"
            />
          </div>

          <div className="p-4 sm:p-8 mb-8 content-data bg-content">
            <UpdatePasswordForm className="max-w-xl" />
          </div>

          {/* <div className="p-4 sm:p-8 mb-8 content-data bg-content">
            <DeleteUserForm className="max-w-xl" />
          </div> */}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}