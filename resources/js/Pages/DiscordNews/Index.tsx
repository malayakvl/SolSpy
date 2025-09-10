import React, { useState } from 'react';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useSelector } from 'react-redux';
import { appLangSelector } from '../../Redux/Layout/selectors';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faCalendar, faUser, faPlus, faCog } from '@fortawesome/free-solid-svg-icons';
import AdminIndex from './Admin/Index';

export default function Index(props: any) {
    return <AdminIndex {...props} />;
}

