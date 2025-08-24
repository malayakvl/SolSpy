import { Head, Link } from '@inertiajs/react';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { appLangSelector } from '../Redux/Layout/selectors';
import Lang from 'lang.js';
import Footer from '../Components/Footer/Footer';
import Header from '../Components/Header/Header';
import lngHeader from '../Lang/Header/translation';

export default function Welcome({ auth, laravelVersion, phpVersion }) {
  const appLang = useSelector(appLangSelector);
  const lng = new Lang({
    messages: lngHeader,
    locale: appLang,
  });
  const handleImageError = () => {
    document.getElementById('screenshot-container')?.classList.add('!hidden');
    document.getElementById('docs-card')?.classList.add('!row-span-1');
    document.getElementById('docs-card-content')?.classList.add('!flex-row');
    document.getElementById('background')?.classList.add('!hidden');
  };

  useEffect(() => {
    if (auth.user) {
      location.href = '/dashboard';
    }
  }, [auth.user]);

  return (
    <>
      <Head title="Welcome" />
      <div className="flex flex-col min-h-screen">
        <Header auth={auth} />
        <main className="flex-1 bg-white p-4">
          <div className="w-full">
            <h1 className="text-2xl font-bold mb-4">Vote Accounts</h1>
          </div>
        </main>

        <footer className="bg-gray-800 text-white p-4 mt-auto">
          <p>© 2025 Your Site. All rights reserved.</p>
        </footer>
      </div>
    </>
  );
}
