import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '../../../Layouts/AuthenticatedLayout';
import { Head, usePage, router } from '@inertiajs/react';
import Lang from 'lang.js';
import lngVaidators from '../../../Lang/Validators/translation';
import { useSelector } from 'react-redux';
import { appEpochSelector, appLangSelector } from '../../../Redux/Layout/selectors';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faBan,
    faCheck,
    faStar,
    faGear,
    faGripLines
} from '@fortawesome/free-solid-svg-icons';
import ValidatorName from "../Partials/ValidatorName";
import axios from 'axios';
import { toast } from 'react-toastify';
import { perPageSelector } from '../../../Redux/Validators/selectors';
import { userSelector } from '../../../Redux/Users/selectors';
import ValidatorPagination from './Pagination';
import { Link } from '@inertiajs/react';
import { ReactSortable } from "react-sortablejs";

export default function TopIndex(validatorsData) {
    const [data, setData] = useState<any>([]);
    const perPage = useSelector(perPageSelector);
    const appLang = useSelector(appLangSelector);
    const [isLoading, setIsLoading] = useState(false);
    const [list, setList] = useState(validatorsData.validatorsData || []);

    const msg = new Lang({
        messages: lngVaidators,
        locale: appLang,
    });
    const user = usePage().props.auth.user;
    const [dataFetched, setDataFetched] = useState(false);
    const [currentPage, setCurrentPage] = useState(validatorsData.currentPage);
    const [itemsPerPage] = useState(perPage);
    const [totalRecords, setTotalRecords] = useState(validatorsData.totalCount);

    
    
    // Pagination logic - server-side
    const totalPages = Math.ceil(totalRecords / itemsPerPage);

    // Handle apply changes button click
    const handleApplyChanges = async () => {
        try {
            const validatorIds = list.map(v => v.id);
            const response = await axios.post('/api/validator-order/update', {
                validatorIds: validatorIds,
                listType: 'top'
            });
            
            toast.success('Order updated successfully');
        } catch (error) {
            console.error('Error updating order:', error);
            toast.error('Failed to update order');
        }
    };

    return (
        <AuthenticatedLayout header={<Head />}>
            <Head title="Top Validators" />
            <div className="py-0">
                {/* Loading overlay - only shown during pagination */}
                {isLoading && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg">
                            <div className="flex flex-col items-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                                <p className="text-gray-700">Завантаження даних...</p>
                            </div>
                        </div>
                    </div>
                )}
                
                <div className="p-4 sm:p-8 mb-8 content-data bg-content">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-2xl font-bold">{msg.get('validators.topTitle')}</h2>
                            <Link href={route('admin.validators.index')} className="text-blue-500 hover:underline">
                                ← {msg.get('validators.btnBack')}
                            </Link>
                        </div>
                    </div>
                    
                    <div className="mt-6">
                        <div className="overflow-x-auto">
                            <ReactSortable
                                filter=".addImageButtonContainer"
                                dragClass="sortableDrag"
                                list={list}
                                setList={(newList) => {
                                    setList(newList);
                                }}
                                animation="200"
                                easing="ease-out"
                            >
                                {list.map((validator, index) => (
                                    <div className="draggable-item" key={index}>
                                        <div className="flex">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <FontAwesomeIcon 
                                                        icon={faGripLines} 
                                                        className="text-gray-400 mr-2 cursor-move sortable-handle"
                                                    />
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        {validator.avatar_file_url ? (
                                                            <img 
                                                                src={validator.avatar_file_url} 
                                                                alt={validator.name} 
                                                                className="h-10 w-10 rounded-full"
                                                                onError={(e) => {
                                                                    const target = e.target as HTMLImageElement;
                                                                    target.style.display = 'none';
                                                                    target.parentElement!.innerHTML = 
                                                                        `<div class="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                                            <span class="text-gray-500 text-xs font-bold">
                                                                                ${validator.name.charAt(0)}
                                                                            </span>
                                                                        </div>`;
                                                                }}
                                                            />
                                                        ) : (
                                                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                                <span className="text-gray-500 text-xs font-bold">
                                                                    {validator.name.charAt(0)}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {validator.name}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </ReactSortable>
                            <div className="flex justify-end mt-4">
                                <button 
                                    className="btn-submit"
                                    onClick={handleApplyChanges}
                                >
                                    {msg.get('validators.btnApplyChanges')}
                                </button>
                            </div>
                        </div>
                        
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}