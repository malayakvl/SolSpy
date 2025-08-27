import ApplicationLogo from '../Components/Header/ApplicationLogo';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import Lang from 'lang.js';
import lngHeader from '../Lang/Header/translation';
import { useSelector } from 'react-redux';
import { appFilialSelector, appLangSelector, isShowOverlaySelector } from '../Redux/Layout/selectors';
import NavMenu from '../Components/Header/NavMenu';
import ProfileMenu from '../Components/Header/ProfileMenu';
import LangMenu from '../Components/Header/LangMenu';
import Header from "../Components/Header/Header";

export default function AuthenticatedLayout({ header, children, auth }) {
  const appLang = useSelector(appLangSelector);
  const lng = new Lang({
    messages: lngHeader,
    locale: appLang,
  });
  const filialName = useSelector(appFilialSelector);
  const showOverlay = useSelector(isShowOverlaySelector);
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);
  const user = usePage().props.auth.user;
  const handleNavCollapse = () => {
    setIsNavCollapsed(!isNavCollapsed);
  };
  return (
    <div className="min-h-screen" style={{overflowY: showOverlay ? 'hidden' : 'auto'}}>
      <Header auth={auth} />
      {/*{header && (*/}
      {/*  <header className="bg-white shadow">*/}
      {/*    <div className="flex shadow-md py-2 px-4 sm:px-10 top-header font-sans min-h-[50px] tracking-wide relative z-50 header-fixed">*/}
      {/*      <div className="relative flex w-full">*/}
      {/*        <div>*/}
      {/*          <Link href="/">*/}
      {/*            <ApplicationLogo className="block w-auto fill-current text-gray-800" />*/}
      {/*          </Link>*/}
      {/*        </div>*/}
      {/*        <button*/}
      {/*          className="navbar-toggler"*/}
      {/*          type="button"*/}
      {/*          onClick={handleNavCollapse}*/}
      {/*        >*/}
      {/*          <svg*/}
      {/*            className="w-7 h-7"*/}
      {/*            fill="#000"*/}
      {/*            viewBox="0 0 20 20"*/}
      {/*            xmlns="http://www.w3.org/2000/svg"*/}
      {/*          >*/}
      {/*            <path*/}
      {/*              fillRule="evenodd"*/}
      {/*              d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"*/}
      {/*              clipRule="evenodd"*/}
      {/*            ></path>*/}
      {/*          </svg>*/}
      {/*        </button>*/}
      {/*        <div*/}
      {/*          className={`nav-content ${isNavCollapsed ? 'left-side-close' : 'left-side-open'}`}*/}
      {/*          id="navbarsExample09"*/}
      {/*        >*/}
      {/*          <div className="flex collapsed-content">*/}
      {/*            <div className="">*/}
      {/*              <NavMenu />*/}
      {/*            </div>*/}
      {/*            <div className="">*/}
      {/*              <LangMenu />*/}
      {/*            </div>*/}
      {/*            {user && (*/}
      {/*                <div className="">*/}
      {/*                  <ProfileMenu />*/}
      {/*                </div>*/}
      {/*            )}*/}
      {/*          </div>*/}
      {/*        </div>*/}
      {/*      </div>*/}
      {/*    </div>*/}
      {/*  </header>*/}
      {/*)}*/}

      <main className="pt-[60px]">
        <div className="mx-auto w-full">
          <div>{children}</div>
        </div>
      </main>
      <div className={`overlay-bg-popup ${showOverlay ? 'show' : 'hidden'}`} />
    </div>
  );
}
