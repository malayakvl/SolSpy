import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import { Head, usePage, router } from '@inertiajs/react';
import Lang from 'lang.js';
import lngVaidators from '../../Lang/Validators/translation';
import { useSelector } from 'react-redux';
import { appEpochSelector, appLangSelector } from '../../Redux/Layout/selectors';
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

export default function Index() {
    const user = usePage().props.auth.user;
    const [favoritesValidators, setFavoritesValidators] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const appLang = useSelector(appLangSelector);
    const msg = new Lang({
        messages: lngVaidators,
        locale: appLang,
    });
    const epoch = useSelector(appEpochSelector);

    // Fetch favorites validators on component mount
    useEffect(() => {
        fetchFavoritesValidators();
    }, []);

    const fetchFavoritesValidators = async () => {
        setLoading(true);
        try {
            let favoritesIds = [];
            
            if (user?.id) {
                // Registered user - fetch from API
                try {
                    const response = await axios.get('/api/favorites');
                    favoritesIds = response.data.map((favorite: any) => favorite.validator_id);
                } catch (apiError) {
                    // Fallback to localStorage if API fails
                    favoritesIds = JSON.parse(localStorage.getItem('favorivalidatorFavoritestes') || '[]');
                }
            } else {
                // Unregistered user - get from localStorage
                favoritesIds = JSON.parse(localStorage.getItem('validatorFavorites') || '[]');
            }

            if (favoritesIds.length === 0) {
                setFavoritesValidators([]);
                setLoading(false);
                return;
            }

            // Fetch validator details for favorites IDs using the existing API endpoint
            const response = await axios.get(`/api/fetch-by-id-validators?ids=${favoritesIds.join(',')}`);
            
            setFavoritesValidators(response.data.validators || []);
        } catch (error) {
            console.error('Error fetching favorites validators:', error);
            toast.error('Failed to load favorites validators');
        } finally {
            setLoading(false);
        }
    };

    const removeFromFavorites = async (validatorId: number) => {
        try {
            if (user?.id) {
                // Registered user - use API
                try {
                    await axios.delete(`/api/favorites/${validatorId}`);
                } catch (apiError) {
                    // Fallback to localStorage if API fails
                    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
                    const updatedList = favorites.filter((id: number) => id !== validatorId);
                    localStorage.setItem('favorites', JSON.stringify(updatedList));
                }
            } else {
                // Unregistered user - update localStorage
                const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
                const updatedList = favorites.filter((id: number) => id !== validatorId);
                localStorage.setItem('favorites', JSON.stringify(updatedList));
            }
            
            // Remove from local state
            setFavoritesValidators(prev => prev.filter(validator => validator.id !== validatorId));
            
            toast.info('Validator removed from favorites', {
                position: "top-right",
                autoClose: 2000,
            });
        } catch (error) {
            console.error('Error removing validator from favorites:', error);
            toast.error('Failed to remove validator from favorites');
        }
    };

    if (loading) {
        return (
            <AuthenticatedLayout header={<Head />}>
                <Head title="Validator favorites" />
                <div className="py-0">
                    <div className="p-4 sm:p-8 mb-8 content-data bg-content">
                        <h2>Loading Favorites...</h2>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    if (favoritesValidators.length === 0) {
        return (
            <AuthenticatedLayout header={<Head />}>
                <Head title="Validator favorites" />
                <div className="py-0">
                    <div className="p-4 sm:p-8 mb-8 content-data bg-content">
                        <h2>Validator favorites</h2>
                        <div className="mt-6">
                            <p className="text-gray-600">No validators in your favorites yet.</p>
                            <p className="text-sm text-gray-500 mt-2">Go to the validators page and click the heart icon to add validators to your favorites.</p>
                        </div>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout header={<Head />}>
            <Head title="Validator Favorites" />
            <div className="py-0">
                <div className="p-4 sm:p-8 mb-8 content-data bg-content">
                    <h2>My Favorite Validators ({favoritesValidators.length} validators)</h2>
                    <div className="mt-6">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 validator-table">
                                <thead>
                                    <tr>
                                        <th>Remove</th>
                                        <th>Spy Rank</th>
                                        <th>Avatar</th>
                                        <th>Name</th>
                                        <th>Status</th>
                                        <th>TVC Score</th>
                                        <th>Vote Credits</th>
                                        <th>Active Stake</th>
                                        <th>Vote Rate</th>
                                        <th>Inflation<br/>Commission</th>
                                        <th>MEV<br/>Commission</th>
                                        <th>Uptime</th>
                                        <th>Client/Version</th>
                                        <th>Status SFDP</th>
                                        <th>Location</th>
                                        <th>Awards</th>
                                        <th>Website</th>
                                        <th>City</th>
                                        <th>ASN</th>
                                        <th>IP</th>
                                        <th>Jiito Score</th>
                                    </tr>
                                </thead>
                                <tbody>
                                {favoritesValidators.map((validator, index) => (
                                    <tr key={validator.id}>
                                        <td className="text-center">
                                            <button 
                                                onClick={() => removeFromFavorites(validator.id)}
                                                className="text-red-500 hover:text-red-700 cursor-pointer"
                                                title="Remove from favorites"
                                            >
                                                <FontAwesomeIcon icon={faTimes} />
                                            </button>
                                        </td>
                                        <td className="text-center">
                                            <ValidatorSpyRank validator={validator} />
                                        </td>
                                        <td className="text-center py-2">
                                            {validator.avatar_file_url ? (
                                                <img
                                                    src={validator.avatar_file_url}
                                                    alt={validator.name}
                                                    style={{ width: "35px", height: "35px", objectFit: "cover", borderRadius: "50%", margin: "0px auto" }}
                                                />
                                            ) : null}
                                        </td>
                                        <td>
                                            <ValidatorName validator={validator} />
                                        </td>
                                        <td className="text-center">
                                            {!validator.delinquent ? (
                                                <FontAwesomeIcon icon={faCheck} className="mr-1 text-green-500" />
                                            ) : (
                                                <FontAwesomeIcon icon={faBan} className="mr-1 text-red-500" />
                                            )}
                                        </td>
                                        <td className="text-center">
                                            <ValidatorScore validator={validator} />
                                        </td>
                                        <td className="text-center">
                                            <ValidatorCredits epoch={epoch} validator={validator} />
                                        </td>
                                        <td className="text-center">
                                            <ValidatorActivatedStake epoch={epoch} validator={validator} />
                                        </td>
                                        <td className="text-center">
                                            <ValidatorRate epoch={epoch} validator={validator} />
                                        </td>
                                        <td className="text-center">
                                            {validator.commission}%
                                        </td>
                                        <td className="text-center">MEV %</td>
                                        <td className="text-center">
                                            <ValidatorUptime epoch={epoch} validator={validator} />
                                        </td>
                                        <td className="text-center">
                                            {`${validator.version}  ${validator.software_client || ''}`}
                                        </td>
                                        <td className="text-center">SFDP</td>
                                        <td className="text-center">{validator.country}</td>
                                        <td className="text-center">Awards</td>
                                        <td className="text-center">
                                            {validator.url ?
                                                <a href={validator.url} target="_blank" rel="noopener noreferrer">
                                                    {validator.url.slice(0, 4)}...{validator.url.slice(-4)}
                                                </a>
                                            : <></>}
                                        </td>
                                        <td className="text-center">{validator.city}</td>
                                        <td className="text-center">{validator.asn}</td>
                                        <td className="text-center">{validator.ip}</td>
                                        <td className="text-center">JS</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                        
                        {/* Summary section */}
                        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                            <h3 className="text-lg font-semibold mb-2">Favorites Summary</h3>
                            <p className="text-sm text-gray-600">
                                You have {favoritesValidators.length} validator{favoritesValidators.length !== 1 ? 's' : ''} in favorites. 
                                {!user?.id && ' (Guest mode: max 5 validators)'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}