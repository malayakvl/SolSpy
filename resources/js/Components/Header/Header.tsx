import { useSelector } from 'react-redux';
import { appLangSelector } from '../../Redux/Layout/selectors';
import Lang from 'lang.js';
import lngHeader from '../../Lang/Header/translation';
import { usePage } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import ApplicationLogo from "./ApplicationLogo";

export default function Header(auth) {
  const user = usePage().props.auth.user;
  const appLang = useSelector(appLangSelector);
  const lng = new Lang({
    messages: lngHeader,
    locale: appLang,
  });

  return (
    <header className="bg-white">
      <div className="bg-gray-200 w-full min-h-[80px] flex align-center justify-between">
        <div className="grid w-full grid-cols-2 items-center gap-1 px-4 lg:grid-cols-2">
          <div className="logo w-[40px] h-[40px]">
            <ApplicationLogo />
          </div>
          <nav className="flex flex-1 justify-end">
            <nav className="flex flex-1 justify-end">
              {auth.user ? (
                  <Link
                      href={route('dashboard')}
                      className="rounded-md px-3 py-2 text-black ring-1 ring-transparent transition hover:text-black/70 focus:outline-none focus-visible:ring-[#FF2D20] dark:text-white dark:hover:text-white/80 dark:focus-visible:ring-white"
                  >
                    Dashboard
                  </Link>
              ) : (
                  <>

                    <Link
                        href="/login"
                        className="rounded-md px-3 py-2 text-black ring-1 ring-transparent transition hover:text-black/70 focus:outline-none focus-visible:ring-[#FF2D20] dark:text-white dark:hover:text-white/80 dark:focus-visible:ring-white"
                    >
                      Log in
                    </Link>
                    <Link
                        href="/register"
                        className="rounded-md px-3 py-2 text-black ring-1 ring-transparent transition hover:text-black/70 focus:outline-none focus-visible:ring-[#FF2D20] dark:text-white dark:hover:text-white/80 dark:focus-visible:ring-white"
                    >
                      Register
                    </Link>
                  </>
              )}
            </nav>
          </nav>
        </div>
      </div>
    </header>
  );
}
