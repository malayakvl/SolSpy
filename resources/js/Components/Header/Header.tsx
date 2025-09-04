import { useSelector, useDispatch } from 'react-redux';
import { appLangSelector } from '../../Redux/Layout/selectors';
import Lang from 'lang.js';
import lngHeader from '../../Lang/Header/translation';
import { usePage } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import ApplicationLogo from "./ApplicationLogo";
import ActionsMenu from "./ActionsMenu";
import LangMenu from "./LangMenu";
import axios from 'axios';
import {useEffect, useState} from "react";
import ProgressBar from "./ProgressBar";
import { setEpochAction } from "../../Redux/Layout";

export default function Header(auth) {
  const dispatch = useDispatch();
  const user = usePage().props.auth.user;
  const appLang = useSelector(appLangSelector);
  const [solRate, setSolRate] = useState({})
  const [epochPersent, setEpochPersent] = useState<any>(0)
  const [settingsData, setSettingsData] = useState('');
  const [settingsFetched, setSettingsFetched] = useState(false)
  const [barProgress, setBarProgress] = useState(null);
  const [barProgressCaption, setBarProgressCaption] = useState('');


  const lng = new Lang({
    messages: lngHeader,
    locale: appLang,
  });

  const fetchData = async () => {
    try {
      const response = await axios.get('/api/fetch-settings');

      setSolRate(response.data.data.sol_rate)
      setSettingsData(response.data.data);
      dispatch(setEpochAction(response.data.data.epoch));

      const progressPercent = (response.data.data.slot_index / response.data.data.slot_in_epoch) * 100;
      setEpochPersent(progressPercent.toFixed(2));
      // console.log(`Прогрес епохи: ${progressPercent.toFixed(2)}%`);

      const progress = response.data.data.slot_index / response.data.data.slot_in_epoch;
      setBarProgress(progress); // надо уточнить
      const slotsLeft = response.data.data.slot_in_epoch - response.data.data.slot_index;
      const timeLeftSeconds = slotsLeft * 0.4; // час до кінця епохи в секундах

      const days = Math.floor(timeLeftSeconds / (24 * 3600));
      const hours = Math.floor((timeLeftSeconds % (24 * 3600)) / 3600);
      const minutes = Math.floor((timeLeftSeconds % 3600) / 60);
      const seconds = Math.floor(timeLeftSeconds % 60);
      setBarProgressCaption(`${days} d, ${hours} h, ${minutes} m`);


      // console.log(`Залишилось: ${days} дн, ${hours} год, ${minutes} хв, ${seconds} сек`);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    if (!settingsFetched) {
      fetchData();
      setSettingsFetched(true);
    }
    const intervalId = setInterval(fetchData, 50000);
    return () => clearInterval(intervalId);
  }, [settingsFetched])

  const userRoleNames = user?.roles?.map(role => role.name) || [];
  const isAdmin = userRoleNames.includes('Admin');
  const isManager = userRoleNames.includes('Manager');

  return (
    <header className="bg-white">
      <nav className="relative bg-blue-900">
        <div className="mx-auto max-w-8xl px-2 sm:px-6 lg:px-8">
          <div className="relative flex h-16 items-center justify-between">
            <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
              {/* <!-- Mobile menu button--> */}
              <button type="button" className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-white/5 hover:text-white focus:outline-2 focus:-outline-offset-1 focus:outline-indigo-500">
                <span className="absolute -inset-0.5"></span>
                <span className="sr-only">Open main menu</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-6">
                  <path d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-6">
                  <path d="M6 18 18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
            <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
              <div className="flex shrink-0 items-center">
                <ApplicationLogo />
              </div>
              <div className="hidden sm:ml-6 sm:flex flex-row">
                <div className="flex space-x-4">
                 
                  {/* <!-- Current: "bg-gray-900 text-white", Default: "text-gray-300 hover:bg-white/5 hover:text-white" --> */}
                  <Link href={'/validators'} className="inline-flex items-center menu-main-btn text-sm nav-link">
                    Validators
                  </Link>
                  {isAdmin && (
                    <>
                      <Link href={'/customers'}  className="inline-flex items-center menu-main-btn text-sm nav-link">
                        Customers
                      </Link>
                      <Link href={'/customers'}  className="inline-flex items-center menu-main-btn text-sm nav-link">
                        News
                      </Link>
                    </>
                  )}

                  
                </div>
              </div>
            </div>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0 nav-link">
              <div className="flex whitespace-nowrap text-[#fff] ml-[0px]">
                 <ProgressBar progress={barProgress*100} caption={`Left ${barProgressCaption}`} />
              </div>
            </div>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0 nav-link">
              <div className="flex whitespace-nowrap text-[#fff] ml-[0px]">
                  <div className="md:space-x-4 md:flex md:pr-[30px] inline align-middle text-[14px] whitespace-nowrap w-[150px]">
                    Epoch  {settingsData?.epoch} ({epochPersent}%)
                  </div>
                  <div className="md:space-x-4 md:flex md:pr-[30px] inline align-middle text-[14px] whitespace-nowrap">
                    1 SOL = {settingsData?.sol_rate}$
                  </div>
                </div>
            </div>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
              {!isAdmin && !isManager && <ActionsMenu />}
              <LangMenu />

              {/* <!-- Profile dropdown --> */}
              <div className="relative ml-3">
                {user?.id ? (
                  <button className="relative flex rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500">
                    <span className="absolute -inset-1.5"></span>
                    <span className="sr-only">Open user menu</span>
                    <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="" className="size-8 rounded-full bg-gray-800 outline -outline-offset-1 outline-white/10" />
                  </button>
                ) : (
                  <>
                  <Link
                        href="/login"
                        className="rounded-md px-3 py-2 text-white text-sm"
                    >
                      Log in
                    </Link>
                    <Link
                        href="/register"
                        className="rounded-md px-3 py-2 text-white text-sm"
                    >
                      Register
                    </Link>
                  </>
                )}
                {/* Profile Dropdown */}
                {/* <div popover className="w-48 origin-top-right rounded-md bg-white py-1 shadow-lg outline outline-black/5 transition transition-discrete [--anchor-gap:--spacing(2)] data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in">
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 focus:bg-gray-100 focus:outline-hidden">Your profile</a>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 focus:bg-gray-100 focus:outline-hidden">Settings</a>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 focus:bg-gray-100 focus:outline-hidden">Sign out</a>
                </div> */}
              </div>
            </div>
          </div>
        </div>

        <div id="mobile-menu" hidden className="block sm:hidden">
          <div className="space-y-1 px-2 pt-2 pb-3">
            {/* <!-- Current: "bg-gray-900 text-white", Default: "text-gray-300 hover:bg-white/5 hover:text-white" --> */}
            <a href="#" aria-current="page" className="block rounded-md bg-gray-900 px-3 py-2 text-base font-medium text-white">Dashboard</a>
            <a href="#" className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-white/5 hover:text-white">Team</a>
            <a href="#" className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-white/5 hover:text-white">Projects</a>
            <a href="#" className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-white/5 hover:text-white">Calendar</a>
          </div>
        </div>
      </nav>
    </header>
  );
}
