import React, { useState } from 'react';
import Lang from 'lang.js';
import lngHeader from '../Lang/Header/translation';
import { useSelector } from 'react-redux';
import { appLangSelector, isShowOverlaySelector } from '../Redux/Layout/selectors';
import Header from "../Components/Header/Header";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { type ReactNode } from 'react';

interface AuthenticatedLayoutProps {
  header: ReactNode;
  children: ReactNode;
  auth: any;
}

export default function AuthenticatedLayout({ header, children, auth }: AuthenticatedLayoutProps) {
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
    <div className="min-h-screen bg-black text-white" style={{overflowY: showOverlay ? 'hidden' : 'auto'}}>
      <Header auth={auth} />
      <main className="pt-[0px]">
        <div className="mx-auto w-full">
          <div>{children}</div>
        </div>
      </main>
      <div className={`overlay-bg-popup ${showOverlay ? 'show' : 'hidden'}`} />
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </div>
  );
}