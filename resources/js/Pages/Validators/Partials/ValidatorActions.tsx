import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faEnvelope,
    faHeart,
    faMoneyBill,
    faEye,
    faScaleBalanced,
    faScaleUnbalanced,
    faBell
} from '@fortawesome/free-solid-svg-icons';
import { Link, usePage } from "@inertiajs/react";
import axios from 'axios';
import { toast } from 'react-toastify';

export default function ValidatorActions({validator, onBanToggle, showViewBtn = true}) {
    const user = usePage().props.auth.user;
    const [isInComparison, setIsInComparison] = useState(false);
    const [isInFavorites, setIsInFavorites] = useState(false);
    const [isInNotice, setIsInNotice] = useState(false);
    // Get role names as array of strings
    const userRoleNames = user?.roles?.map(role => role.name) || [];
    // Check if user has Admin role
    const isAdmin = userRoleNames.includes('Admin');

    // Check if validator is already in comparison on component mount
    useEffect(() => {
        if (!user?.id) {
            const compareList = JSON.parse(localStorage.getItem('validatorCompare') || '[]');
            setIsInComparison(compareList.includes(validator.id));
            
            const favoritesList = JSON.parse(localStorage.getItem('validatorFavorites') || '[]');
            setIsInFavorites(favoritesList.includes(validator.id));
        } else {
            // For registered users, use the is_favorite property from the validator object
            setIsInFavorites(validator.is_favorite || false);
            setIsInComparison(validator.is_compare || false);
            setIsInNotice(validator.is_notice || false);
        }
    }, [validator.id, validator.is_favorite, user?.id]);

    const addToCompare = async (validatorId) => {
        if (user?.id) {
            // Registered user - use API
            try {
                await axios.post('/api/add-compare', {
                    validatorId: validatorId
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                });
                setIsInComparison(!isInComparison);
                toast.success('Comparison list updated', {
                    position: "top-right",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
                // Dispatch event for registered users
                window.dispatchEvent(new CustomEvent('comparisonCountChanged'));
            } catch (error) {
                console.error('Error:', error);
                toast.error('Failed to update comparison list', {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
            }
        } else {
            // Unregistered user - use localStorage with max 2 items
            const compareList = JSON.parse(localStorage.getItem('validatorCompare') || '[]');
            
            if (compareList.includes(validatorId)) {
                // Remove from comparison
                const updatedList = compareList.filter(id => id !== validatorId);
                localStorage.setItem('validatorCompare', JSON.stringify(updatedList));
                setIsInComparison(false);
                toast.info('Validator removed from comparison', {
                    position: "top-right",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
                // Dispatch event when removing
                window.dispatchEvent(new CustomEvent('comparisonCountChanged'));
            } else {
                // Add to comparison
                if (compareList.length >= 2) {
                    toast.error('Maximum 2 validators can be compared for unregistered users', {
                        position: "top-right",
                        autoClose: 2000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                    });
                    return;
                }
                compareList.push(validatorId);
                localStorage.setItem('validatorCompare', JSON.stringify(compareList));
                setIsInComparison(true);
                toast.success('Validator added to comparison', {
                    position: "top-right",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
                // Dispatch event when adding
                window.dispatchEvent(new CustomEvent('comparisonCountChanged'));
            }
        }
    }

    const addToFavorite = async (validatorId) => {
        if (user?.id) {
            // Registered user - use API
            try {
                await axios.post('/api/add-favorite', {
                    validatorId: validatorId
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                });
                setIsInFavorites(!isInFavorites);
                toast.success('Favorites list updated', {
                    position: "top-right",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
                // Dispatch event for registered users
                window.dispatchEvent(new CustomEvent('favoriteCountChanged'));
            } catch (error) {
                console.error('Error:', error);
                toast.error('Failed to update favorites list', {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
            }
        } else {
            // Unregistered user - use localStorage with max 5 items
            const favoritesList = JSON.parse(localStorage.getItem('validatorFavorites') || '[]');
            
            if (favoritesList.includes(validatorId)) {
                // Remove from favorites
                const updatedList = favoritesList.filter(id => id !== validatorId);
                localStorage.setItem('validatorFavorites', JSON.stringify(updatedList));
                setIsInFavorites(false);
                toast.info('Validator removed from favorites', {
                    position: "top-right",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
                // Dispatch event when removing
                window.dispatchEvent(new CustomEvent('favoriteCountChanged'));
            } else {
                // Add to favorites
                if (favoritesList.length >= 5) {
                    toast.error('Maximum 5 validators can be added to favorites for unregistered users', {
                        position: "top-right",
                        autoClose: 1000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                    });
                    
                    return;
                }
                favoritesList.push(validatorId);
                localStorage.setItem('validatorFavorites', JSON.stringify(favoritesList));
                setIsInFavorites(true);
                toast.success('Validator added to favorites', {
                    position: "top-right",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
                // Dispatch event when adding
                window.dispatchEvent(new CustomEvent('favoriteCountChanged'));
            }
        }
    }

    const addToNotice = async (validatorId) => {
        if (user?.id) {
            // Registered user - use API
            try {
                await axios.post('/api/add-notice', {
                    validatorId: validatorId
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                });
                setIsInNotice(!isInNotice);
                toast.success('Notice list updated', {
                    position: "top-right",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
                // Dispatch event for registered users
                window.dispatchEvent(new CustomEvent('noticeCountChanged'));
            } catch (error) {
                console.error('Error:', error);
                    toast.error('Failed to update notice list', {
                        position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
            }
        } else {
            // Unregistered user - use localStorage with max 5 items
            const favoritesList = JSON.parse(localStorage.getItem('validatorNotice') || '[]');
            
            if (favoritesList.includes(validatorId)) {
                // Remove from favorites
                const updatedList = favoritesList.filter(id => id !== validatorId);
                localStorage.setItem('validatorNotice', JSON.stringify(updatedList));
                setIsInNotice(false);
                toast.info('Validator removed from notice', {
                    position: "top-right",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
                // Dispatch event when removing
                window.dispatchEvent(new CustomEvent('noticeCountChanged'));
            } else {
                // Add to favorites
                if (favoritesList.length >= 5) {
                    toast.error('Maximum 5 validators can be added to notice for unregistered users', {
                        position: "top-right",
                        autoClose: 1000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                    });
                    
                    return;
                }
                favoritesList.push(validatorId);
                localStorage.setItem('validatorNotice', JSON.stringify(favoritesList));
                setIsInNotice(true);
                toast.success('Validator added to notice', {
                    position: "top-right",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
                // Dispatch event when adding
                window.dispatchEvent(new CustomEvent('noticeCountChanged'));
            }
        }
    }

    return (
        <>
            <div className="flex items-center">
                {showViewBtn && (
                    <Link href={`/validator/${validator.vote_pubkey}`}>
                        <FontAwesomeIcon icon={faEye} className="mr-2" />
                    </Link>
                )}
                {!isAdmin && (
                    <>
                        <span className="cursor-pointer" onClick={() => addToCompare(validator.id)}>
                            <FontAwesomeIcon 
                              icon={isInComparison ? faScaleUnbalanced : faScaleBalanced} 
                              className={`mr-2 ${isInComparison ? 'text-purple-500' : ''}`}
                            />
                        </span>
                        <span className="cursor-pointer" onClick={() => addToFavorite(validator.id)}>
                            <FontAwesomeIcon 
                              icon={faHeart} 
                              className={`mr-2 ${isInFavorites ? 'text-purple-500' : ''}`}
                            />
                        </span>
                        {user?.id && (
                            <span className="cursor-pointer" onClick={() => addToNotice(validator.id)}>
                                <FontAwesomeIcon
                                  icon={faBell} 
                                  className={`mr-2 ${isInNotice ? 'text-purple-500' : ''}`}
                                />
                            </span>
                        )}
                        <span>
                            <FontAwesomeIcon icon={faMoneyBill} className="mr-2" />
                        </span>
                    </>
                )}
            </div>
        </>
    );
}