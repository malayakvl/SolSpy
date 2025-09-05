import AuthenticatedLayout from '../Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import Lang from 'lang.js';
import lngDashboard from '../Lang/Dashboard/translation';
import { useSelector } from 'react-redux';
import { appLangSelector } from '../Redux/Layout/selectors';
import React, { useEffect, useState } from 'react';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import MovingGridTable from "../Components/GridResult";
import Example from "../Components/GridResult/Ts";
import { useMemo } from 'react';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import DataTable from 'react-data-table-component';





export default function Dashboard(clinicName) {
    const appLang = useSelector(appLangSelector);
    const msg = new Lang({
        messages: lngDashboard,
        locale: appLang,
    });

    return (
        <AuthenticatedLayout header={<Head />}>
            <Head title={msg.get('dashboard.title')} />
            <div className="py-0">
                <div className="p-4 sm:p-8 mb-8 content-data bg-content">
                    <h2>{msg.get('dashboard.title')}&nbsp;</h2>
                    <div className="mt-6">
                        Dashboard content coming here
                    </div>

                </div>
            </div>

        </AuthenticatedLayout>
    );
}
