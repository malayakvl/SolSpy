import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faBan,
    faCheck,
    faTimes
} from '@fortawesome/free-solid-svg-icons';
import ValidatorCredits from "../Validators/Partials/ValidatorCredits";
import ValidatorRate from "../Validators/Partials/ValidatorRate";
import ValidatorName from "../Validators/Partials/ValidatorName";
import ValidatorActivatedStake from "../Validators/Partials/ValidatorActivatedStake";
import ValidatorUptime from "../Validators/Partials/ValidatorUptime";
import ValidatorScore from "../Validators/Partials/ValidatorScore";
import axios from 'axios';
import ValidatorSpyRank from "../Validators/Partials/ValidatorSpyRank";
import { toast } from 'react-toastify';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import Lang from 'lang.js';
import lngVaidators from '../../Lang/Validators/translation';
import { useSelector } from 'react-redux';
import { appEpochSelector, appLangSelector } from '../../Redux/Layout/selectors';

export default function Index() {
    const user = usePage().props.auth.user;
    const [comparisonValidators, setComparisonValidators] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const appLang = useSelector(appLangSelector);
    const msg = new Lang({
        messages: lngVaidators,
        locale: appLang,
    });
    const epoch = useSelector(appEpochSelector);

    // Fetch comparison validators on component mount
    useEffect(() => {
        fetchComparisonValidators();
    }, []);

    const fetchComparisonValidators = async () => {
        setLoading(true);
        try {
            let comparisonIds = [];
            
            if (user?.id) {
                // Registered user - fetch from API
                // TODO: Implement API endpoint for getting user's comparison list
                // For now, use localStorage as fallback
                comparisonIds = JSON.parse(localStorage.getItem('validatorCompare') || '[]');
            } else {
                // Unregistered user - get from localStorage
                comparisonIds = JSON.parse(localStorage.getItem('validatorCompare') || '[]');
            }

            if (comparisonIds.length === 0) {
                setComparisonValidators([]);
                setLoading(false);
                return;
            }

            // Fetch validator details for comparison IDs using the existing API endpoint
            const response = await axios.get(`/api/fetch-by-id-validators`, {
                params: { ids: comparisonIds.join(',') },
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            
            setComparisonValidators(response.data.validators || []);
        } catch (error) {
            console.error('Error fetching comparison validators:', error);
            toast.error('Failed to load comparison validators');
        } finally {
            setLoading(false);
        }
    };

    const removeFromComparison = async (validatorId: number) => {
        try {
            if (user?.id) {
                // Registered user - use API (TODO: implement remove-compare endpoint)
                // For now, use localStorage as fallback
                const compareList = JSON.parse(localStorage.getItem('validatorCompare') || '[]');
                const updatedList = compareList.filter(id => id !== validatorId);
                localStorage.setItem('validatorCompare', JSON.stringify(updatedList));
            } else {
                // Unregistered user - update localStorage
                const compareList = JSON.parse(localStorage.getItem('validatorCompare') || '[]');
                const updatedList = compareList.filter(id => id !== validatorId);
                localStorage.setItem('validatorCompare', JSON.stringify(updatedList));
            }
            
            // Remove from local state
            setComparisonValidators(prev => prev.filter(validator => validator.id !== validatorId));
            
            toast.success('Validator removed from comparison', {
                position: "top-right",
                autoClose: 2000,
            });
        } catch (error) {
            console.error('Error removing validator from comparison:', error);
            toast.error('Failed to remove validator from comparison');
        }
    };

    if (loading) {
        return (
            <AuthenticatedLayout header={<Head />}>
                <Head title="Validator Comparison" />
                <div className="py-0">
                    <div className="p-4 sm:p-8 mb-8 content-data bg-content">
                        <h2>Loading comparison...</h2>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    if (comparisonValidators.length === 0) {
        return (
            <AuthenticatedLayout header={<Head />}>
                <Head title="Validator Comparison" />
                <div className="py-0">
                    <div className="p-4 sm:p-8 mb-8 content-data bg-content">
                        <h2>Validator Comparison</h2>
                        <div className="mt-6">
                            <p className="text-gray-600">No validators selected for comparison.</p>
                            <p className="text-sm text-gray-500 mt-2">Go to the validators page and add some validators to compare.</p>
                        </div>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout header={<Head />}>
            <Head title="Validator Comparison" />
            <div className="py-0">
                <div className="p-4 sm:p-8 mb-8 content-data bg-content">
                    <h2>Validator Comparison ({comparisonValidators.length} validators)</h2>
                    <div className="mt-6">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 validator-table">
                                <thead>
                                    <tr>
                                        <th className="px-4 py-2 text-left font-semibold">Metric</th>
                                        {comparisonValidators.map((validator) => (
                                            <th key={validator.id} className="px-4 py-2 text-center font-semibold">
                                                <div className="flex flex-col items-center space-y-2">
                                                    {validator.avatar_file_url ? (
                                                        <img
                                                            src={validator.avatar_file_url}
                                                            alt={validator.name}
                                                            className="w-10 h-10 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full bg-gray-300"></div>
                                                    )}
                                                    <div className="text-sm">
                                                        <ValidatorName validator={validator} />
                                                    </div>
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* Remove Row */}
                                    <tr className="border-b">
                                        <td className="px-4 py-3 font-medium text-gray-900">Remove</td>
                                        {comparisonValidators.map((validator) => (
                                            <td key={validator.id} className="px-4 py-3 text-center">
                                                <button 
                                                    onClick={() => removeFromComparison(validator.id)}
                                                    className="text-red-500 hover:text-red-700 cursor-pointer"
                                                    title="Remove from comparison"
                                                >
                                                    <FontAwesomeIcon icon={faTimes} />
                                                </button>
                                            </td>
                                        ))}
                                    </tr>
                                    
                                    {/* Spy Rank Row */}
                                    <tr className="border-b bg-gray-50">
                                        <td className="px-4 py-3 font-medium text-gray-900">Spy Rank</td>
                                        {comparisonValidators.map((validator) => (
                                            <td key={validator.id} className="px-4 py-3 text-center">
                                                <ValidatorSpyRank validator={validator} />
                                            </td>
                                        ))}
                                    </tr>
                                    
                                    {/* Status Row */}
                                    <tr className="border-b">
                                        <td className="px-4 py-3 font-medium text-gray-900">Status</td>
                                        {comparisonValidators.map((validator) => (
                                            <td key={validator.id} className="px-4 py-3 text-center">
                                                {!validator.delinquent ? (
                                                    <FontAwesomeIcon icon={faCheck} className="mr-1 text-green-500" />
                                                ) : (
                                                    <FontAwesomeIcon icon={faBan} className="mr-1 text-red-500" />
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                    
                                    {/* TVC Score Row */}
                                    <tr className="border-b bg-gray-50">
                                        <td className="px-4 py-3 font-medium text-gray-900">TVC Score</td>
                                        {comparisonValidators.map((validator) => (
                                            <td key={validator.id} className="px-4 py-3 text-center">
                                                <ValidatorScore validator={validator} />
                                            </td>
                                        ))}
                                    </tr>
                                    
                                    {/* Vote Credits Row */}
                                    <tr className="border-b">
                                        <td className="px-4 py-3 font-medium text-gray-900">Vote Credits</td>
                                        {comparisonValidators.map((validator) => (
                                            <td key={validator.id} className="px-4 py-3 text-center">
                                                <ValidatorCredits epoch={epoch} validator={validator} />
                                            </td>
                                        ))}
                                    </tr>
                                    
                                    {/* Active Stake Row */}
                                    <tr className="border-b bg-gray-50">
                                        <td className="px-4 py-3 font-medium text-gray-900">Active Stake</td>
                                        {comparisonValidators.map((validator) => (
                                            <td key={validator.id} className="px-4 py-3 text-center">
                                                <ValidatorActivatedStake epoch={epoch} validator={validator} />
                                            </td>
                                        ))}
                                    </tr>
                                    
                                    {/* Vote Rate Row */}
                                    <tr className="border-b">
                                        <td className="px-4 py-3 font-medium text-gray-900">Vote Rate</td>
                                        {comparisonValidators.map((validator) => (
                                            <td key={validator.id} className="px-4 py-3 text-center">
                                                <ValidatorRate epoch={epoch} validator={validator} />
                                            </td>
                                        ))}
                                    </tr>
                                    
                                    {/* Inflation Commission Row */}
                                    <tr className="border-b bg-gray-50">
                                        <td className="px-4 py-3 font-medium text-gray-900">Inflation Commission</td>
                                        {comparisonValidators.map((validator) => (
                                            <td key={validator.id} className="px-4 py-3 text-center">
                                                {validator.commission}%
                                            </td>
                                        ))}
                                    </tr>
                                    
                                    {/* MEV Commission Row */}
                                    <tr className="border-b">
                                        <td className="px-4 py-3 font-medium text-gray-900">MEV Commission</td>
                                        {comparisonValidators.map((validator) => (
                                            <td key={validator.id} className="px-4 py-3 text-center">
                                                MEV %
                                            </td>
                                        ))}
                                    </tr>
                                    
                                    {/* Uptime Row */}
                                    <tr className="border-b bg-gray-50">
                                        <td className="px-4 py-3 font-medium text-gray-900">Uptime</td>
                                        {comparisonValidators.map((validator) => (
                                            <td key={validator.id} className="px-4 py-3 text-center">
                                                <ValidatorUptime epoch={epoch} validator={validator} />
                                            </td>
                                        ))}
                                    </tr>
                                    
                                    {/* Client/Version Row */}
                                    <tr className="border-b">
                                        <td className="px-4 py-3 font-medium text-gray-900">Client/Version</td>
                                        {comparisonValidators.map((validator) => (
                                            <td key={validator.id} className="px-4 py-3 text-center">
                                                {`${validator.version} ${validator.software_client || ''}`}
                                            </td>
                                        ))}
                                    </tr>
                                    
                                    {/* Status SFDP Row */}
                                    <tr className="border-b bg-gray-50">
                                        <td className="px-4 py-3 font-medium text-gray-900">Status SFDP</td>
                                        {comparisonValidators.map((validator) => (
                                            <td key={validator.id} className="px-4 py-3 text-center">
                                                SFDP
                                            </td>
                                        ))}
                                    </tr>
                                    
                                    {/* Location Row */}
                                    <tr className="border-b">
                                        <td className="px-4 py-3 font-medium text-gray-900">Location</td>
                                        {comparisonValidators.map((validator) => (
                                            <td key={validator.id} className="px-4 py-3 text-center">
                                                {validator.country}
                                            </td>
                                        ))}
                                    </tr>
                                    
                                    {/* Awards Row */}
                                    <tr className="border-b bg-gray-50">
                                        <td className="px-4 py-3 font-medium text-gray-900">Awards</td>
                                        {comparisonValidators.map((validator) => (
                                            <td key={validator.id} className="px-4 py-3 text-center">
                                                Awards
                                            </td>
                                        ))}
                                    </tr>
                                    
                                    {/* Website Row */}
                                    <tr className="border-b">
                                        <td className="px-4 py-3 font-medium text-gray-900">Website</td>
                                        {comparisonValidators.map((validator) => (
                                            <td key={validator.id} className="px-4 py-3 text-center">
                                                {validator.url ?
                                                    <a href={validator.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                                                        {validator.url.slice(0, 4)}...{validator.url.slice(-4)}
                                                    </a>
                                                : '-'}
                                            </td>
                                        ))}
                                    </tr>
                                    
                                    {/* City Row */}
                                    <tr className="border-b bg-gray-50">
                                        <td className="px-4 py-3 font-medium text-gray-900">City</td>
                                        {comparisonValidators.map((validator) => (
                                            <td key={validator.id} className="px-4 py-3 text-center">
                                                {validator.city || '-'}
                                            </td>
                                        ))}
                                    </tr>
                                    
                                    {/* ASN Row */}
                                    <tr className="border-b">
                                        <td className="px-4 py-3 font-medium text-gray-900">ASN</td>
                                        {comparisonValidators.map((validator) => (
                                            <td key={validator.id} className="px-4 py-3 text-center">
                                                {validator.asn || '-'}
                                            </td>
                                        ))}
                                    </tr>
                                    
                                    {/* IP Row */}
                                    <tr className="border-b bg-gray-50">
                                        <td className="px-4 py-3 font-medium text-gray-900">IP</td>
                                        {comparisonValidators.map((validator) => (
                                            <td key={validator.id} className="px-4 py-3 text-center">
                                                {validator.ip || '-'}
                                            </td>
                                        ))}
                                    </tr>
                                    
                                    {/* Jiito Score Row */}
                                    <tr className="border-b">
                                        <td className="px-4 py-3 font-medium text-gray-900">Jiito Score</td>
                                        {comparisonValidators.map((validator) => (
                                            <td key={validator.id} className="px-4 py-3 text-center">
                                                JS
                                            </td>
                                        ))}
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        
                        {/* Summary section */}
                        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                            <h3 className="text-lg font-semibold mb-2">Comparison Summary</h3>
                            <p className="text-sm text-gray-600">
                                Comparing {comparisonValidators.length} validator{comparisonValidators.length !== 1 ? 's' : ''}. 
                                {!user?.id && ' (Guest mode: max 2 validators)'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}