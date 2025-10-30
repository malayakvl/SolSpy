import Footer from '../Components/Footer/Footer';
import Header from '../Components/Header/Header';
import { Head, Link } from '@inertiajs/react';


export default function GuestLayout({ children, auth }) {
  return (
    <>
      <Head title="Welcome" />
        <Header auth={auth} />
        <div className="flex min-h-screen flex-col items-center sm:justify-center sm:pt-0">
            <div className="w-full overflow-hidden px-6 py-4 border border-[#4f4957] sm:max-w-md login-form mt-[-200px]">
                {children}
            </div>
        </div>
        <Footer />
    </>

  );
}
