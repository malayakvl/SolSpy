import NavLink from '../../../Components/Links/NavLink';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { useSelector } from 'react-redux';
import { appLangSelector } from '../../../Redux/Layout/selectors';
import Lang from 'lang.js';
import lngHeader from '../../../Lang/Header/translation';
import { Link, usePage } from '@inertiajs/react';

export default function NavInvoices(props) {
  const appLang = useSelector(appLangSelector);
  const lng = new Lang({
    messages: lngHeader,
    locale: appLang,
  });
  const permissions = usePage().props.auth.can;
  let showMenuInvoice = false;
  if (
    permissions['invoice-incoming-all'] ||
    permissions['invoice-outgoing-all'] ||
    permissions['invoice-exchange-all']
  ) {
    showMenuInvoice = true;
  }
  return (
    <>
      {(usePage().props.auth.user?.roles[0]?.name === 'Admin' ||
        showMenuInvoice) && (
        <Menu as="div" className="relative top-menu-nav">
          <MenuButton className="inline-flex items-center menu-main-btn text-sm">
            {lng.get('menu.invoices')}
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
              {permissions['price-all'] && (
                <MenuItem>
                  <Link className="submenu" href={'/pricing'}>
                    {lng.get('menu.price')}
                  </Link>
                </MenuItem>
              )}
              {permissions['store-create'] && (
                <MenuItem>
                  <Link className="submenu" href={'/store-report'}>
                    {lng.get('menu.material.report')}
                  </Link>
                </MenuItem>
              )}
              {permissions['invoice-incoming-all'] && (
                <MenuItem>
                  <Link className="submenu" href={'/invoice-incoming'}>
                    {lng.get('menu.invoice-incoming')}
                  </Link>
                </MenuItem>
              )}
              {permissions['invoice-outgoing-all'] && (
                <MenuItem>
                  <Link className="submenu" href={'/invoice-outgoing'}>
                    {lng.get('menu.invoice-outgoing')}
                  </Link>
                </MenuItem>
              )}
              {permissions['invoice-exchange-all'] && (
                <MenuItem>
                  <Link className="submenu" href={'/invoice-change'}>
                    {lng.get('menu.invoice-change')}
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
