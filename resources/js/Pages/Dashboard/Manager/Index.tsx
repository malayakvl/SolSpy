import AuthenticatedLayout from '../../../Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import Lang from 'lang.js';
import lngDashboard from '../../../Lang/Dashboard/translation';
import { useSelector } from 'react-redux';
import { appLangSelector } from '../../../Redux/Layout/selectors';
import React, { useState } from 'react';


export default function Dashboard({auth}) {
    const appLang = useSelector(appLangSelector);
    const msg = new Lang({
        messages: lngDashboard,
        locale: appLang,
    });
    const user = usePage().props.auth.user;
  
    // State for managing active tab
    const [activeTab, setActiveTab] = useState('favorites');

    // Extract role name from user roles array
    const userRole = user.roles && user.roles.length > 0 ? user.roles[0].name : null;
    console.log('User role:', userRole);

    // Show tabs interface only for users without roles (guests) or with specific role handling
    return (
            <AuthenticatedLayout header={<Head />}>
                <Head title={msg.get('dashboard.title')} />
                <div className="py-0">
                    <div className="p-4 sm:p-8 mb-8 content-data bg-content">
                        <h2>{msg.get('dashboard.title')}&nbsp;Manager</h2>
                        <div className="mt-6">
                            {/* Tabs navigation */}
                            <div className="border-b border-gray-200">
                                <nav className="flex space-x-8">
                                    <button
                                        onClick={() => setActiveTab('favorites')}
                                        className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                            activeTab === 'favorites'
                                                ? 'border-blue-500 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        {msg.get('dashboard.favorites')}
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('comparisons')}
                                        className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                            activeTab === 'comparisons'
                                                ? 'border-blue-500 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        {msg.get('dashboard.comparisons')}
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('blocked')}
                                        className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                            activeTab === 'blocked'
                                                ? 'border-blue-500 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        {msg.get('dashboard.blocked')}
                                    </button>
                                </nav>
                            </div>
                            
                            {/* Tab content */}
                            <div className="mt-4">
                                {activeTab === 'favorites' && (
                                    <div id="favorites">
                                        
                                        {/* Favorites content will go here */}
                                    </div>
                                )}
                                {activeTab === 'comparisons' && (
                                    <div id="comparisons">
                                        Comparisons
                                        {/* Comparisons content will go here */}
                                    </div>
                                )}
                                {activeTab === 'blocked' && (
                                    <div id="blocked">
                                        Blocked
                                        {/* Blocked content will go here */}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </AuthenticatedLayout>
        )
}