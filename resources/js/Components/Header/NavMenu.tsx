import NavLink from '../../Components/Links/NavLink';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { useSelector } from 'react-redux';
import { appLangSelector } from '../../Redux/Layout/selectors';
import Lang from 'lang.js';
import lngHeader from '../../Lang/Header/translation';
import { usePage } from '@inertiajs/react';
import NavCustomers from './Menu/NavCustomers';

interface NavMenuProps {
  [key: string]: any;
}

interface AuthProps {
  user?: any;
  can?: any;
  role?: string;
}

interface PageProps {
  auth?: AuthProps;
  [key: string]: any;
}

export default function NavMenu(props: NavMenuProps) {
  const appLang = useSelector(appLangSelector);
  const lng = new Lang({
    messages: lngHeader,
    locale: appLang as string,
  });
  
  const { props: pageProps } = usePage<PageProps>();

  return (
    <>
      <div className="md:space-x-4 md:flex md:pr-[30px]">
        {pageProps?.auth?.role && (
          <div className="md:mt-[3px]">
            <Menu as="div" className="relative top-menu-nav">
              <MenuButton className="inline-flex items-center text-sm">
                <NavLink href={'/dashboard'}>
                  {lng.get('menu.dashboard')}
                </NavLink>
              </MenuButton>
            </Menu>

            <NavCustomers />

          </div>
        )}
      </div>
    </>
  );
}