import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import Lang from 'lang.js';
import lngVaidators from '../../Lang/Validators/translation';
import React, { useEffect, useState, Suspense } from 'react';
import { useSelector } from 'react-redux';
import { GrDrag } from "react-icons/gr";
import moment from "moment";
import { ReactSortable } from "react-sortablejs";
import { appLangSelector } from '../../Redux/Layout/selectors';


const draggableList = [
    {
        name: "Spy Rank"
    },
    {
        name: "Name"
    },
    {
        name: "Status"
    },
    {
        name: "TVC Score"
    },
    {
        name: "Vote Credits"
    },
    {
        name: "Active Stake"
    },
    {
        name: "Vote Rate"
    },
    {
        name: "Inflation/Comission"
    },
    {
        name: "MEV Comission"
    },
    {
        name: "Uptime"
    },
    {
        name: "Client/Version"
    },
    {
        name: "Status SFDP"
    },
    {
        name: "Location"
    },
    {
        name: "Awards"
    },
    {
        name: "Website"
    },
    {
        name: "City"
    },
    {
        name: "ASN"
    },
    {
        name: "IP"
    },
    {
        name: "Jiito Score"
    },
];


export default function Index(validatorsData) {
    const appLang = useSelector(appLangSelector);
    const msg = new Lang({
        messages: lngVaidators,
        locale: appLang,
    });
    
    const [list, setList] = useState(draggableList);



    return (
        <AuthenticatedLayout header={<Head />}>
            <Head title={msg.get('validators.title')} />
            <div className="py-0">
                <div className="p-4 sm:p-8 mb-8 content-data bg-content">
                    <h2>{msg.get('validators.view-title')}&nbsp;</h2>
                    <ReactSortable
                        filter=".addImageButtonContainer"
                        dragClass="sortableDrag"
                        list={list}
                        setList={setList}
                        animation="200"
                        easing="ease-out"
                    >
                        {list.map(item => (
                            <div className="draggable-item">{item.name}</div>
                        ))}
                    </ReactSortable>
                </div>
            </div>

        </AuthenticatedLayout>
    );
}
