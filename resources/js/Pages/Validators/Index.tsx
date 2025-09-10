import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import { Head, usePage, router } from '@inertiajs/react';
import Lang from 'lang.js';
import lngVaidators from '../../Lang/Validators/translation';
import { useSelector, useDispatch } from 'react-redux';
import { appEpochSelector, appLangSelector } from '../../Redux/Layout/selectors';
import { setFilterAction } from '../../Redux/Validators/actions';
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faBan,
    faCheck,
    faStar,
    faChevronDown,
    faGear
} from '@fortawesome/free-solid-svg-icons';
import ValidatorCredits from "./Partials/ValidatorCredits";
import ValidatorRate from "./Partials/ValidatorRate";
import ValidatorActions from "./Partials/ValidatorActions";
import ValidatorName from "./Partials/ValidatorName";
import ValidatorActivatedStake from "./Partials/ValidatorActivatedStake";
import ValidatorUptime from "./Partials/ValidatorUptime";
import ValidatorScore from "./Partials/ValidatorScore";
import axios from 'axios';
import { toast } from 'react-toastify';
import ValidatorSpyRank from "./Partials/ValidatorSpyRank";
import { perPageSelector, filterTypeSelector } from '../../Redux/Validators/selectors';
import { Link } from "@inertiajs/react";
import { userSelector } from '../../Redux/Users/selectors';
import { fetchUpdatedValidators } from '../../Redux/Validators/index';
import Modal from './Partials/ColumnsModal';
import AdminIndex from './Admin/Index';

export default function Index(props: any) {
    return <AdminIndex {...props} />;
}
