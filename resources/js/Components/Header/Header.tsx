import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { appLangSelector } from '../../Redux/Layout/selectors';
import Lang from 'lang.js';
import lngHeader from '../../Lang/Header/translation';
import { usePage, Link } from '@inertiajs/react';
import ApplicationLogo from './ApplicationLogo';
import ActionsMenu from './ActionsMenu';
import LangMenu from './LangMenu';
import ProfileMenu from './ProfileMenu';
import axios from 'axios';
import ProgressBar from './ProgressBar';
import { setEpochAction, setSettingsAction } from '../../Redux/Layout';

type HeaderProps = {
  auth?: {
    user?: any;
  };
};

export default function Header({ auth }: HeaderProps) {
  const dispatch = useDispatch();
  const inertiaAuth = usePage().props.auth;
  const user = auth?.user ?? inertiaAuth?.user;
  const appLang = useSelector(appLangSelector);
  const [epochPercent, setEpochPercent] = useState<number>(0);
  const [settingsData, setSettingsData] = useState<any>(null);
  const [settingsFetched, setSettingsFetched] = useState(false);
  const [barProgressCaption, setBarProgressCaption] = useState('');
  const [completedPercent, setCompletedPercent] = useState<number>(100);

  const msg = new Lang({
      messages: lngHeader,
      locale: appLang,
  });


  const fetchData = async () => {
    try {
      const response = await axios.get('/api/fetch-settings');
      const data = response.data.data;
      setSettingsData(data);
      dispatch(setEpochAction(data.epoch));
      dispatch(setSettingsAction(data));
      setEpochPercent(data.epoch_completed_percent);
      setCompletedPercent(data.epoch_completed_percent);

      setBarProgressCaption(data.epoch_remaining_time);


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
    const intervalId = setInterval(fetchData, 60000);
    return () => clearInterval(intervalId);
  }, [settingsFetched]);

  const userRoleNames = user?.roles?.map(role => role.name) || [];
  const isAdmin = userRoleNames.includes('Admin');
  const isManager = userRoleNames.includes('Manager');
  // const isCustomer = userRoleNames.includes('Customer');

  return (
    <header className="bg-gray-900">
      <nav className="relative bg-black">
        <div className="mx-auto max-w-8xl px-2 sm:px-6 lg:px-8">
          <div className="relative flex h-16 items-center justify-between">
            <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
              {/* <!-- Mobile menu button--> */}
              <button type="button" className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-300 hover:bg-gray-700 hover:text-white focus:outline-2 focus:-outline-offset-1 focus:outline-indigo-500">
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
                  {isAdmin ? (
                    <>
                      <Link href={'/admin/validators'} className="inline-flex items-center menu-main-btn text-sm nav-link text-gray-300  hover:text-[#703ea2]">
                        {msg.get('menu.validators')}
                      </Link>
                      <Link href={'/admin/customers'}  className="inline-flex items-center menu-main-btn text-sm nav-link text-gray-300  hover:text-[#703ea2]">
                        {msg.get('menu.customers')}
                      </Link>
                      <Link href={'/admin/discord-news'}  className="inline-flex items-center menu-main-btn text-sm nav-link text-gray-300  hover:text-[#703ea2]">
                        {msg.get('menu.discord-news')}
                      </Link>
                      <Link href={'/admin/news'}  className="inline-flex items-center menu-main-btn text-sm nav-link text-gray-300  hover:text-[#703ea2]">
                        {msg.get('menu.news')}
                      </Link>
                      <Link href={'/admin/settings'}  className="inline-flex items-center menu-main-btn text-sm nav-link text-gray-300  hover:text-[#703ea2]">
                          {msg.get('menu.settings')}
                      </Link>
                    </>
                  ) : (
                    <> 
                      {/* <Link href={'/validators'} className="inline-flex items-center menu-main-btn text-sm nav-link text-gray-300 hover:bg-gray-700 hover:text-white">
                        {msg.get('menu.validators')}
                      </Link> */}
                    </>
                  )}

                  
                </div>
              </div>
            </div>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0 nav-link">
              <div className="progress-block">
                 <ProgressBar progress={100 - completedPercent} caption={`${barProgressCaption} ${msg.get('menu.left')}`} />
                 <div className="text-sm epoch-data">
                    {msg.get('menu.epoch')}  {settingsData?.epoch} ({(100 - epochPercent).toFixed(2)}%)
                  </div>
              </div>
            </div>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0 nav-link">
              <div className="flex whitespace-nowrap text-[#fff] ml-[0px]  mt-[0px]">
                  
                  <div className="sol-block">
                    1 SOL {settingsData?.sol_rate}$
                  </div>
                </div>
            </div>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
              {!isAdmin && !isManager && <ActionsMenu />}
              <LangMenu />

              {/* <!-- Profile dropdown --> */}
              <div className="relative ml-3">
                {user?.id ? (
                  <ProfileMenu />
                ) : (
                  <>
                  <Link
                    href="/login"
                    className="rounded-md px-3 py-2 text-gray-300 hover:bg-gray-700 hover:text-white text-sm"
                  >
                      {msg.get('menu.login')}
                    </Link>
                    <Link
                      href="/register"
                      className="rounded-md px-3 py-2 text-gray-300 hover:bg-gray-700 hover:text-white text-sm"
                    >
                      {msg.get('menu.register')}
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div id="mobile-menu" hidden className="block sm:hidden">
          <div className="space-y-1 px-2 pt-2 pb-3">
            {/* <!-- Current: "bg-gray-900 text-white", Default: "text-gray-300 hover:bg-white/5 hover:text-white" --> */}
            <a href="#" aria-current="page" className="block rounded-md bg-gray-900 px-3 py-2 text-base font-medium text-white">Dashboard</a>
          </div>
        </div>
      </nav>
    </header>
  );
}