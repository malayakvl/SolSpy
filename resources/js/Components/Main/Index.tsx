import { useSelector } from 'react-redux';
import { appLangSelector } from '../../Redux/Layout/selectors';
import Lang from 'lang.js';
import lngHeader from '../../Lang/Header/translation';
import Dropdown from '../../Components/Form/Dropdown';
import { usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Link } from '@inertiajs/react';

export default function Footer({type = 'relative'}) {
    const user = usePage().props.auth.user;
    const appLang = useSelector(appLangSelector);
    const lng = new Lang({
        messages: lngHeader,
        locale: appLang,
    });

    return (
        <>
            Validators table come here
        </>
    );
}
