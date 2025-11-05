import React from 'react';
import { Link } from "@inertiajs/react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear, faTable, faTh } from '@fortawesome/free-solid-svg-icons';
import { route } from 'ziggy-js';
import axios from 'axios';

interface ActionButtonsProps {
    user: any;
    viewMode: 'table' | 'grid';
    setViewMode: (mode: 'table' | 'grid') => void;
    toggleModal: () => void;
    toggleNotificationModal: () => void;
    handleExport: () => void;
    msgProfile: any;
}

export default function ActionButtons({
    user,
    viewMode,
    setViewMode,
    toggleModal,
    toggleNotificationModal,
    handleExport,
    msgProfile
}: ActionButtonsProps) {
    return (
        <>
            <div className="flex justify-end mt-4">
                <button 
                    onClick={toggleNotificationModal}
                    className="px-4 py-2 bg-[#703ea2] text-white rounded hover:bg-[#78549c] text-[13px]"
                >
                    {msgProfile.get('profile.setup.notice')}
                </button>
                <button 
                    onClick={handleExport}
                    className="px-4 py-2 bg-[#703ea2] text-white rounded hover:bg-[#78549c] text-[13px] ml-3"
                >
                    {msgProfile.get('profile.export')}
                </button>
            </div>
        </>
    );
}