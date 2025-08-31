import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import Lang from 'lang.js';
import lngVaidators from '../../Lang/Validators/translation';
import { useSelector } from 'react-redux';
import { appEpochSelector, appLangSelector } from '../../Redux/Layout/selectors';
import React, { useEffect, useState, Suspense } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faBan,
    faCheck,
} from '@fortawesome/free-solid-svg-icons';
import ValidatorCredits from "./ValidatorCredits";
import ValidatorRate from "./ValidatorRate";
import ValidatorActions from "./ValidatorActions";
import ValidatorName from "./ValidatorName";
import ValidatorActivatedStake from "./ValidatorActivatedStake";
import ValidatorUptime from "./ValidatorUptime";
import ValidatorScore from "./ValidatorScore";
import axios from 'axios';
import ValidatorSpyRank from "./ValidatorSpyRank";

export default function Index(validatorsData) {
    const [data, setData] = useState<any>(validatorsData.validatorsData);
    const appLang = useSelector(appLangSelector);
    const msg = new Lang({
        messages: lngVaidators,
        locale: appLang,
    });
    const epoch = useSelector(appEpochSelector);



    return (
        <AuthenticatedLayout header={<Head />}>
            <Head title={msg.get('validators.title')} />
            <div className="py-0">
                <div className="p-4 sm:p-8 mb-8 content-data bg-content">
                    <h2>{msg.get('validators.view-title')}&nbsp;</h2>
                </div>
            </div>

        </AuthenticatedLayout>
    );
}
