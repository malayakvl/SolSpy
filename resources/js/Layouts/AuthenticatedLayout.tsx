import ApplicationLogo from '../Components/Header/ApplicationLogo';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import Lang from 'lang.js';
import lngHeader from '../Lang/Header/translation';
import { useSelector } from 'react-redux';
import { appLangSelector, isShowOverlaySelector } from '../Redux/Layout/selectors';
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
  const showOverlay = useSelector(isShowOverlaySelector);
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);


  const handleNavCollapse = () => {
    setIsNavCollapsed(!isNavCollapsed);
  };
  return (
    <div className="min-h-screen" style={{overflowY: showOverlay ? 'hidden' : 'auto'}}>
      <Header auth={auth} />
      <main className="pt-[0px]">
        <div className="mx-auto w-full">
          <div>{children}</div>
        </div>
      </main>
      <div className={`overlay-bg-popup ${showOverlay ? 'show' : 'hidden'}`} />
    </div>
  );
}
