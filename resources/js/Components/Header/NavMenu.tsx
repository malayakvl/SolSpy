import NavLink from '../../Components/Links/NavLink';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { useSelector } from 'react-redux';
import { appLangSelector } from '../../Redux/Layout/selectors';
import Lang from 'lang.js';
import lngHeader from '../../Lang/Header/translation';
import { Link, usePage } from '@inertiajs/react';
import NavStores from './Menu/NavStores';
import NavCustomers from './Menu/NavCustomers';
import NavScheduler from './Menu/NavScheduler';
import NavInvoices from './Menu/NavInvoices';
import NavPatients from './Menu/NavPatients';

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
        {usePage().props.auth.role.length > 0 && (
          <div className="md:mt-[3px]">
            <Menu as="div" className="relative top-menu-nav">
              <MenuButton className="inline-flex items-center text-sm">
                <NavLink href={'/dashboard'}>
                  {lng.get('menu.dashboard')}
                </NavLink>
              </MenuButton>
            </Menu>

            <NavCustomers />

            <NavPatients />

            <NavStores />

            <NavInvoices />

            <NavScheduler />
          </div>
        )}
      </div>
      {/*{usePage().props.auth.user?.roles[0]?.name !== 'Admin' && usePage().props.auth.user?.roles.length > 0 && (*/}
      {/*    <div className="md:space-x-4 md:flex md:pr-[30px] mt-[8px]">*/}
      {/*        <>*/}
      {/*            <NavLink*/}
      {/*                className="top-menu-nav"*/}
      {/*                href={'/dashboard'}*/}
      {/*            >*/}
      {/*                {lng.get('menu.dashboard')}*/}
      {/*            </NavLink>*/}
      {/*            {(permissions['store-all'] || permissions['store-view']) && (*/}
      {/*                <Menu as="div" className="relative top-menu-nav">*/}
      {/*                    <MenuButton className="inline-flex items-center text-sm font-bold">*/}
      {/*                        {lng.get('menu.stores')}*/}
      {/*                    </MenuButton>*/}
      {/*                    <MenuItems*/}
      {/*                        transition*/}
      {/*                        className="absolute right-0 top-[20px] z-10 w-56 origin-top-right divide-y divide-gray-100*/}
      {/*                            bg-white*/}
      {/*                            transition focus:outline-none*/}
      {/*                            data-[closed]:scale-95 data-[closed]:transform*/}
      {/*                            data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75*/}
      {/*                            data-[enter]:ease-out data-[leave]:ease-in mt-[10px] border rounded-md"*/}
      {/*                    >*/}
      {/*                        <div>*/}
      {/*                            {permissions['store-all'] && (*/}
      {/*                                <MenuItem>*/}
      {/*                                    <Link href={'/stores'} className="submenu">*/}
      {/*                                        {lng.get('menu.stores')}*/}
      {/*                                    </Link>*/}
      {/*                                </MenuItem>*/}
      {/*                            )}*/}
      {/*                            {permissions['store-create'] && (*/}
      {/*                                <MenuItem>*/}
      {/*                                    <Link*/}
      {/*                                        className="submenu"*/}
      {/*                                        href={'/producers'}*/}
      {/*                                    >*/}
      {/*                                        {lng.get('menu.material.brands')}*/}
      {/*                                    </Link>*/}
      {/*                                </MenuItem>*/}
      {/*                            )}*/}
      {/*                            {permissions['store-create'] && (*/}
      {/*                                <MenuItem>*/}
      {/*                                    <Link*/}
      {/*                                        className="submenu"*/}
      {/*                                        href={'/units'}*/}
      {/*                                    >*/}
      {/*                                        {lng.get('menu.units')}*/}
      {/*                                    </Link>*/}
      {/*                                </MenuItem>*/}
      {/*                            )}*/}
      {/*                            {permissions['store-create'] && (*/}
      {/*                                <MenuItem>*/}
      {/*                                    <Link*/}
      {/*                                        className="submenu"*/}
      {/*                                        href={'/material-categories'}*/}
      {/*                                    >*/}
      {/*                                        {lng.get('menu.material.categories')}*/}
      {/*                                    </Link>*/}
      {/*                                </MenuItem>*/}
      {/*                            )}*/}
      {/*                            {permissions['store-create'] && (*/}
      {/*                                <MenuItem>*/}
      {/*                                    <Link*/}
      {/*                                        className="submenu"*/}
      {/*                                        href={'/materials'}*/}
      {/*                                    >*/}
      {/*                                        {lng.get('menu.materials')}*/}
      {/*                                    </Link>*/}
      {/*                                </MenuItem>*/}
      {/*                            )}*/}
      {/*                            {permissions['store-create'] && (*/}
      {/*                                <MenuItem>*/}
      {/*                                    <Link*/}
      {/*                                        className="submenu"*/}
      {/*                                        href={'/store-report'}*/}
      {/*                                    >*/}
      {/*                                        {lng.get('menu.material.report')}*/}
      {/*                                    </Link>*/}
      {/*                                </MenuItem>*/}
      {/*                            )}*/}
      {/*                        </div>*/}
      {/*                    </MenuItems>*/}
      {/*                </Menu>*/}
      {/*            )}*/}
      {/*            <Menu as="div" className="relative top-menu-nav">*/}
      {/*                <MenuButton className="inline-flex items-center text-sm font-bold">*/}
      {/*                    <Link href={'/pricing'} className="submenu">*/}
      {/*                        {lng.get('menu.price')}*/}
      {/*                    </Link>*/}
      {/*                </MenuButton>*/}
      {/*            </Menu>*/}
      {/*            {(permissions['invoice-incoming-all']) && (*/}
      {/*                <Menu as="div" className="relative top-menu-nav">*/}
      {/*                    <MenuButton className="inline-flex items-center text-sm font-bold">*/}
      {/*                        {lng.get('menu.invoices')}*/}
      {/*                    </MenuButton>*/}
      {/*                    <MenuItems*/}
      {/*                        transition*/}
      {/*                        className="absolute right-0 top-[20px] z-10 w-56 origin-top-right divide-y divide-gray-100*/}
      {/*                            bg-white*/}
      {/*                            transition focus:outline-none*/}
      {/*                            data-[closed]:scale-95 data-[closed]:transform*/}
      {/*                            data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75*/}
      {/*                            data-[enter]:ease-out data-[leave]:ease-in mt-[10px] border rounded-md"*/}
      {/*                    >*/}
      {/*                        <div>*/}
      {/*                            {permissions['invoice-incoming-all'] && (*/}
      {/*                                <MenuItem>*/}
      {/*                                    <Link*/}
      {/*                                        className="submenu"*/}
      {/*                                        href={'/invoice-incoming'}*/}
      {/*                                    >*/}
      {/*                                        {lng.get('menu.invoice-incoming')}*/}
      {/*                                    </Link>*/}
      {/*                                </MenuItem>*/}
      {/*                            )}*/}
      {/*                            {permissions['invoice-outgoing-all'] && (*/}
      {/*                                <MenuItem>*/}
      {/*                                    <Link*/}
      {/*                                        className="submenu"*/}
      {/*                                        href={'/invoice-outgoing'}*/}
      {/*                                    >*/}
      {/*                                        {lng.get('menu.invoice-outgoing')}*/}
      {/*                                    </Link>*/}
      {/*                                </MenuItem>*/}
      {/*                            )}*/}
      {/*                            {permissions['invoice-exchange-all'] && (*/}
      {/*                                <MenuItem>*/}
      {/*                                    <Link*/}
      {/*                                        className="submenu"*/}
      {/*                                        href={'/invoice-change'}*/}
      {/*                                    >*/}
      {/*                                        {lng.get('menu.invoice-change')}*/}
      {/*                                    </Link>*/}
      {/*                                </MenuItem>*/}
      {/*                            )}*/}
      {/*                        </div>*/}
      {/*                    </MenuItems>*/}
      {/*                </Menu>*/}
      {/*            )}*/}
      {/*            {(permissions['schedule-all'] || permissions['schedule-view']) && (*/}
      {/*                <NavLink*/}
      {/*                    className="top-menu-nav"*/}
      {/*                    href={'/scheduler'}*/}
      {/*                >*/}
      {/*                    {lng.get('menu.scheduler')}*/}
      {/*                </NavLink>*/}
      {/*            )}*/}
      {/*        </>*/}
      {/*    </div>*/}
      {/*)}*/}
      {/*{usePage().props.auth.user?.roles.length === 0 && (*/}
      {/*    <div className="md:space-x-4 md:flex md:pr-[30px] mt-[8px]">*/}
      {/*        <>*/}
      {/*            <NavLink*/}
      {/*                className="top-menu-nav"*/}
      {/*                href={'/dashboard-select'}*/}
      {/*            >*/}
      {/*                {lng.get('menu.dashboard')}*/}
      {/*            </NavLink>*/}
      {/*        </>*/}
      {/*    </div>*/}
      {/*)}*/}
    </>
  );
}
