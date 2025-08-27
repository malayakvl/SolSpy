import NavLink from '../../Components/Links/NavLink';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { useSelector } from 'react-redux';
import { appLangSelector } from '../../Redux/Layout/selectors';
import Lang from 'lang.js';
import lngHeader from '../../Lang/Header/translation';
import { Link, usePage } from '@inertiajs/react';
import NavCustomers from './Menu/NavCustomers';

export default function NavMenu(props) {
  const appLang = useSelector(appLangSelector);
  const lng = new Lang({
    messages: lngHeader,
    locale: appLang,
  });
  const user = usePage().props.auth.user;
  const permissions = usePage().props.auth.can;

  return (
    <>
      <div className="md:space-x-4 md:flex md:pr-[30px]">
        {usePage().props?.auth.role && (
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
