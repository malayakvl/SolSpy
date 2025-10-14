import NavLink from '../../Components/Links/NavLink';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { useSelector } from 'react-redux';
import { appLangSelector } from '../../Redux/Layout/selectors';
import Lang from 'lang.js';
import lngHeader from '../../Lang/Header/translation';
import { Link, usePage } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faHeart,
    faBell, faUser, faScaleBalanced
} from '@fortawesome/free-solid-svg-icons';
import React from "react";

export default function ActionsMenu(props) {
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
                <Link href={'/comparisons'} className="inline-flex items-center menu-main-btn text-sm">
                    <FontAwesomeIcon icon={faScaleBalanced} className="w-[16px] h-[16px] text-white" />
                </Link>
                <Link href={'/favorites'} className="inline-flex items-center menu-main-btn text-sm">
                    <FontAwesomeIcon icon={faHeart} className="w-[16px] h-[16px] text-white" />
                </Link>
                <Link href={'/blocked'} className="inline-flex items-center menu-main-btn text-sm">
                    <FontAwesomeIcon icon={faBell} className="w-[16px] h-[16px] text-white" />
                </Link>
            </div>
        </>
    );
}
