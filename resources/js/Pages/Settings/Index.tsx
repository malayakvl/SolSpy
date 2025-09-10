import React, { useState } from 'react';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useSelector } from 'react-redux';
import { appLangSelector } from '../../Redux/Layout/selectors';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faCalendar, faUser, faPlus, faCog } from '@fortawesome/free-solid-svg-icons';

export default function Index(settingsData) {

    return (
        <AuthenticatedLayout> 
            <Head title="Settings" />
            <div className="py-0">
                <div className="p-4 sm:p-8 mb-8 content-data bg-content">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold">Settings</h2>
                    </div>
                </div>
            </div>
            
            
        </AuthenticatedLayout>
    );
}