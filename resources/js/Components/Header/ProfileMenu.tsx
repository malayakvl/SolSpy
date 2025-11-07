import { useSelector } from 'react-redux';
import { appLangSelector } from '../../Redux/Layout/selectors';
import Lang from 'lang.js';
import lngHeader from '../../Lang/Header/translation';
import Dropdown from '../../Components/Form/Dropdown';
import { usePage, router } from '@inertiajs/react';
import { useState } from 'react';

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

  // Function to handle logout with proper CSRF handling
  const handleLogout = (e) => {
    e.preventDefault();
    
    // Clear localStorage
    localStorage.removeItem('filialName');
    
    // Update CSRF token before logout as per the memory specification
    if (typeof window.updateCSRFToken === 'function') {
      window.updateCSRFToken();
    }
    
    // Use Inertia's post method for logout as per the memory specification
    router.post('/logout', {}, {
      onError: (errors) => {
        console.error('Logout error:', errors);
        // If there's a CSRF error, force a full page refresh
        if (errors && errors.message && errors.message.includes('CSRF')) {
          window.location.href = '/login';
        }
      }
    });
  };

  return (
    <div>
      <div className="space-x-4 sm:-my-px sm:flex md:flex md:mt-[-8px] relative md:mr-[0px] pt-[10px]">
        <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="" className="size-8 rounded-full bg-gray-800 outline -outline-offset-1 outline-white/10" />
        <Dropdown>
          <Dropdown.Trigger>
          <span className="inline-flex">
            <button
                type="button"
                className="inline-flex items-center
                                px-2 text-sm lng-menu
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
            <Dropdown.Link
                href={'/profile'}
                method="get"
                as="button"
              >
              {lng.get('menu.profile')}
            </Dropdown.Link>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm leading-5 text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 transition duration-150 ease-in-out"
            >
              {lng.get('menu.logout')}
            </button>
          </Dropdown.Content>
        </Dropdown>
      </div>
    </div>
  );
}