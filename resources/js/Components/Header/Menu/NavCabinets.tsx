import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { useSelector } from 'react-redux';
import { appLangSelector } from '../../../Redux/Layout/selectors';
import Lang from 'lang.js';
import lngHeader from '../../../Lang/Header/translation';
import { Link, usePage } from '@inertiajs/react';
import NavLink from '../../Links/NavLink';

export default function NavCabinets(props) {
  const appLang = useSelector(appLangSelector);
  const lng = new Lang({
    messages: lngHeader,
    locale: appLang,
  });
  const permissions = usePage().props.auth.can;

  return (
    <>
      {(usePage().props.auth.user?.roles[0]?.name === 'Admin' ||
        permissions['cabinet-all']) && (
        <NavLink className="top-menu-nav" href={'/cabinets'}>
          {lng.get('menu.cabinets')}
        </NavLink>
      )}
    </>
  );
}
