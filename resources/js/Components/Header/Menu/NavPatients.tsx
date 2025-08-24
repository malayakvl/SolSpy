import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { useSelector } from 'react-redux';
import { appLangSelector } from '../../../Redux/Layout/selectors';
import Lang from 'lang.js';
import lngHeader from '../../../Lang/Header/translation';
import { Link, usePage } from '@inertiajs/react';

export default function NavPatients(props) {
  const appLang = useSelector(appLangSelector);
  const lng = new Lang({
    messages: lngHeader,
    locale: appLang,
  });
  const permissions = usePage().props.auth.can;

  return (
    <>
      {(usePage().props.auth.user?.roles[0]?.name === 'Admin' ||
        permissions['patient-edit']) && (
        <Menu as="div" className="relative top-menu-nav">
          <MenuButton className="inline-flex items-center menu-main-btn text-sm">
            {lng.get('menu.patients')}
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
              {permissions['patient-edit'] && (
                <MenuItem>
                  <Link className="submenu" href={'/patients'}>
                    {lng.get('menu.patients')}
                  </Link>
                </MenuItem>
              )}
              {permissions['patient-edit'] && (
                <MenuItem>
                  <Link href={'/patient-statuses'} className="submenu">
                    {lng.get('menu.patient.statuses')}
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
