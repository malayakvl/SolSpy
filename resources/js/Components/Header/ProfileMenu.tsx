import { useSelector } from 'react-redux';
import { appLangSelector } from '../../Redux/Layout/selectors';
import Lang from 'lang.js';
import lngHeader from '../../Lang/Header/translation';
import Dropdown from '../../Components/Form/Dropdown';
import { usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Link } from '@inertiajs/react';
import {changeLangAction} from "../../Redux/Layout";

export default function ProfileMenu() {
  const [showingNavigationDropdown, setShowingNavigationDropdown] =
    useState(false);
  const user = usePage().props.auth.user;
  const appLang = useSelector(appLangSelector);
  const lng = new Lang({
    messages: lngHeader,
    locale: appLang,
  });
  const permissions = usePage().props.auth.can;
  const source = user.name;
  const array = source.split(' ');
  const fioResult =
    array[0] +
    ' ' +
    (array[1] ? array[1][0] : '');

  return (
    <div>
      <div className="space-x-8 sm:-my-px sm:flex md:flex md:mt-[-8px] relative md:mr-[15px] pt-[10px]">
        <div className="icon-user" />
        <Dropdown>
          <Dropdown.Trigger>
          <span className="inline-flex">
            <button
                type="button"
                className="inline-flex items-center
                                bg-white px-2 text-sm lng-menu
                                font-medium leading-4 text-gray-500
                                transition duration-150
                                ease-in-out hover:text-gray-700 focus:outline-none"
            >
              <b className="text-white">{fioResult}</b>
              <span className="icon-arrow-down" />
            </button>
          </span>
          </Dropdown.Trigger>

          <Dropdown.Content>
          <span
              className="dropdown-span"
          >
            Укр
          </span>
            <span
                className="dropdown-span"
            >
            En
          </span>
          </Dropdown.Content>
        </Dropdown>
      </div>
      {/*<div className="md:space-x-4 md:flex md:pr-[30px] relative">*/}
      {/*  <div className="profile-block">*/}
      {/*    /!*<div className="icon-user"></div>*!/*/}
      {/*    <Dropdown>*/}
      {/*      <Dropdown.Trigger>*/}
      {/*        <div className="relative">*/}
      {/*          <button*/}
      {/*            type="button"*/}
      {/*            className="inline-flex items-center*/}
      {/*                              px-2 text-sm*/}
      {/*                              font-medium leading-4 text-gray-500*/}
      {/*                              transition duration-150*/}
      {/*                              ease-in-out hover:text-gray-700 focus:outline-none"*/}
      {/*          >*/}
      {/*            <div className="mt-0 relative text-white">*/}
      {/*              <div className="icon-user"></div>*/}
      {/*              <span className="truncate text-white">{fioResult}</span>*/}
      {/*            </div>*/}
      {/*            <span className="icon-arrow-down" />*/}
      {/*          </button>*/}
      {/*        </div>*/}
      {/*      </Dropdown.Trigger>*/}

            {/*<Dropdown.Content>*/}
            {/*  <Link className="dropdown-span" href={'/profile'}>*/}
            {/*    {lng.get('menu.profile')}*/}
            {/*  </Link>*/}
            {/*</Dropdown.Content>*/}
      {/*    </Dropdown>*/}
      {/*  </div>*/}
      {/*</div>*/}
    </div>
  );
}
