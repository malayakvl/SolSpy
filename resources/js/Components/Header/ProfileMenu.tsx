import { useSelector } from 'react-redux';
import { appLangSelector } from '../../Redux/Layout/selectors';
import Lang from 'lang.js';
import lngHeader from '../../Lang/Header/translation';
import Dropdown from '../../Components/Form/Dropdown';
import { usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Link } from '@inertiajs/react';

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
    (array[1] ? array[1][0] : '') +
    '. ' +
    (array[2] ? array[2][0] : '') +
    '.';

  return (
    <div>
      <div className="md:space-x-4 md:flex md:pr-[30px] relative">
        <div className="profile-block">
          {/*<div className="icon-user"></div>*/}
          <Dropdown>
            <Dropdown.Trigger>
              <div className="relative">
                <button
                  type="button"
                  className="inline-flex items-center
                                    px-2 text-sm
                                    font-medium leading-4 text-gray-500
                                    transition duration-150
                                    ease-in-out hover:text-gray-700 focus:outline-none"
                >
                  <div className="mt-0 relative text-white">
                    <div className="icon-user"></div>
                    <span className="truncate text-white">{fioResult}</span>
                    <small className="user-profile-role">
                      {usePage().props.auth.role.length > 0
                        ? `${localStorage.getItem('filialName')} [${usePage().props.auth.role}]`
                        : ''}
                    </small>
                    {!localStorage.getItem('filialName') && (
                      <small className="user-profile-role">
                        {localStorage.getItem('filialName')}
                      </small>
                    )}
                  </div>
                  <span className="icon-arrow-down" />
                </button>
              </div>
            </Dropdown.Trigger>

            <Dropdown.Content>
              <Link className="dropdown-span" href={'/profile'}>
                {lng.get('menu.profile')}
              </Link>
              <Link className="dropdown-span" href={'/clinic/create'}>
                {lng.get('menu.clinic')}
              </Link>
              {(permissions['filial-all'] || permissions['filial-view']) && (
                <Link className="dropdown-span" href={'/filials'}>
                  {lng.get('menu.filials')}
                </Link>
              )}
              <Link className="dropdown-span" href={'/currency'}>
                {lng.get('menu.currencies')}
              </Link>
              <Link className="dropdown-span" href={'/clinic/create'}>
                {lng.get('menu.taxes')}
              </Link>
              <Link className="dropdown-span" href={'/import-data'}>
                {lng.get('menu.import')}
              </Link>
              <Dropdown.Link
                href={'/logout'}
                method="post"
                as="button"
                onClick={() => {
                  localStorage.removeItem('filialName');
                }}
              >
                {lng.get('menu.logout')}
              </Dropdown.Link>
            </Dropdown.Content>
          </Dropdown>
        </div>
      </div>
    </div>
  );
}
