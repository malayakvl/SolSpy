import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { useSelector } from 'react-redux';
import { appLangSelector } from '../../../Redux/Layout/selectors';
import Lang from 'lang.js';
import lngHeader from '../../../Lang/Header/translation';
import { Link, usePage } from '@inertiajs/react';

interface UserRole {
  name?: string;
  [key: string]: any;
}

interface UserProps {
  name?: string;
  roles?: UserRole[];
  [key: string]: any;
}

interface AuthProps {
  user?: UserProps;
  can?: any;
  role?: string;
}

interface PageProps {
  auth?: AuthProps;
  [key: string]: any;
}

export default function NavCustomers(props: any) {
  const appLang = useSelector(appLangSelector);
  const lng = new Lang({
    messages: lngHeader,
    locale: appLang as string,
  });
  const { props: pageProps } = usePage<PageProps>();
  const permissions = pageProps.auth?.can;

  return (
    <>
      {(pageProps.auth?.user?.roles?.[0]?.name === 'Admin' ||
        permissions?.['customer-all']) && (
        <Menu as="div" className="relative top-menu-nav">
          <MenuButton className="inline-flex items-center menu-main-btn text-sm">
            {lng.get('menu.customers')}
          </MenuButton>
          <MenuItems
            transition
            className="absolute right-0 top-[26px] z-10 w-56 origin-top-right divide-y divide-gray-100
                                        top-submenu menu-btn
                                        transition focus:outline-none
                                        data-[closed]:scale-95 data-[closed]:transform
                                        data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75
                                        data-[enter]:ease-out data-[leave]:ease-in mt-[10px]"
          >
            <div>
              {permissions?.['customer-all'] && (
                <MenuItem>
                  <Link 
                    className="submenu block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" 
                    href={route('admin.customers.index')}
                  >
                    {lng.get('menu.customer.list')}
                  </Link>
                </MenuItem>
              )}
              {permissions?.['customer-all'] && (
                <MenuItem>
                  <Link 
                    href={'/roles'} 
                    className="submenu block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    {lng.get('menu.customer.roles')}
                  </Link>
                </MenuItem>
              )}
            </div>
          </MenuItems>
        </Menu>
      )}
    </>
  );
}