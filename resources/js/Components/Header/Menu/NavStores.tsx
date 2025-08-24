import NavLink from '../../../Components/Links/NavLink';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { useSelector } from 'react-redux';
import { appLangSelector } from '../../../Redux/Layout/selectors';
import Lang from 'lang.js';
import lngHeader from '../../../Lang/Header/translation';
import { Link, usePage } from '@inertiajs/react';

export default function NavStores() {
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
        permissions['store-all']) && (
        <Menu as="div" className="relative top-menu-nav">
          <MenuButton className="inline-flex items-center menu-main-btn text-sm">
            {lng.get('menu.materials')}
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
              {permissions['store-create'] && (
                <MenuItem>
                  <Link className="submenu" href={'/units'}>
                    {lng.get('menu.units')}
                  </Link>
                </MenuItem>
              )}
              {permissions['store-create'] && (
                <MenuItem>
                  <Link className="submenu" href={'/producers'}>
                    {lng.get('menu.material.brands')}
                  </Link>
                </MenuItem>
              )}
              <MenuItem>
                <Link href={'/stores'} className="submenu">
                  {lng.get('menu.stores')}
                </Link>
              </MenuItem>

              {permissions['store-create'] && (
                <MenuItem>
                  <Link className="submenu" href={'/material-categories'}>
                    {lng.get('menu.material.categories')}
                  </Link>
                </MenuItem>
              )}
              {permissions['store-create'] && (
                <MenuItem>
                  <Link className="submenu" href={'/materials'}>
                    {lng.get('menu.materials')}
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
// export default NavStores;
