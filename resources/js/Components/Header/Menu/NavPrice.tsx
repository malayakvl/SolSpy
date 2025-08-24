import NavLink from '../../../Components/Links/NavLink';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { useSelector } from 'react-redux';
import { appLangSelector } from '../../../Redux/Layout/selectors';
import Lang from 'lang.js';
import lngHeader from '../../../Lang/Header/translation';
import { Link, usePage } from '@inertiajs/react';

export default function NavPrice() {
  const appLang = useSelector(appLangSelector);
  const lng = new Lang({
    messages: lngHeader,
    locale: appLang,
  });
  const user = usePage().props.auth.user;
  const permissions = usePage().props.auth.can;

  return (
    <>
      {(usePage().props.auth.user?.roles[0]?.name === 'Admin' ||
        permissions['price-all']) && (
        <Menu as="div" className="relative top-menu-nav">
          <MenuButton className="inline-flex items-center text-sm">
            <NavLink href={'/pricing'}>{lng.get('menu.price')}</NavLink>
          </MenuButton>
        </Menu>
      )}
    </>
  );
}
