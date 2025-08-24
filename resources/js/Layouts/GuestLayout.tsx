import Footer from '../Components/Footer/Footer';
import Header from '../Components/Header/Header';
import { Head, Link } from '@inertiajs/react';


export default function GuestLayout({ children, auth }) {
  return (
    <>
      <Head title="Welcome" />
        <Header auth={auth} />
        <div className="flex min-h-screen flex-col items-center pt-6 sm:justify-center sm:pt-0">
            <div className="w-full overflow-hidden bg-white px-6 py-4 shadow-md sm:max-w-md sm:rounded-lg">
                {children}
            </div>
        </div>
        <Footer />
    </>

  );
}
