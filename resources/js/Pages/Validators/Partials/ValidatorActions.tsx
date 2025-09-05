import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faBan,
    faEnvelope,
    faHeart,
    faMoneyBill,
    faPencil,
    faScaleBalanced,
    faScaleUnbalanced
} from '@fortawesome/free-solid-svg-icons';
import { Link, router, usePage } from "@inertiajs/react";
import axios from 'axios';
import { toast } from 'react-toastify';

export default function ValidatorActions({validator, onBanToggle}) {
    const user = usePage().props.auth.user;
    const [isInComparison, setIsInComparison] = useState(false);
    const [isInFavorites, setIsInFavorites] = useState(false);
    const [isBanned, setIsBanned] = useState(false);

    // Check if validator is already in comparison on component mount
    useEffect(() => {
        if (!user?.id) {
            const compareList = JSON.parse(localStorage.getItem('validatorCompare') || '[]');
            setIsInComparison(compareList.includes(validator.id));
            
            const favoritesList = JSON.parse(localStorage.getItem('validatorFavorites') || '[]');
            setIsInFavorites(favoritesList.includes(validator.id));
            
            const bannedList = JSON.parse(localStorage.getItem('validatorBanned') || '[]');
            setIsBanned(bannedList.includes(validator.id));
        }
    }, [validator.id, user?.id]);

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
            }
        }
    }

    const addToBanned = async (validatorId) => {
        if (user?.id) {
            // Registered user - use API
            try {
                await axios.post('/api/ban-validator', {
                    validatorId: validatorId
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                });
                setIsBanned(!isBanned);
                // Notify parent component about ban status change
                if (onBanToggle) {
                    onBanToggle(validatorId, !isBanned);
                }
                toast.success('Ban status updated', {
                    position: "top-right",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
            } catch (error) {
                console.error('Error:', error);
                toast.error('Failed to update ban status', {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
            }
        } else {
            // Unregistered user - use localStorage
            const bannedList = JSON.parse(localStorage.getItem('validatorBanned') || '[]');
            
            if (bannedList.includes(validatorId)) {
                // Remove from banned list
                const updatedList = bannedList.filter(id => id !== validatorId);
                localStorage.setItem('validatorBanned', JSON.stringify(updatedList));
                setIsBanned(false);
                toast.info('Validator unbanned', {
                    position: "top-right",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
                // Notify parent component
                if (onBanToggle) {
                    onBanToggle(validatorId, false);
                }
            } else {
                // Add to banned list
                bannedList.push(validatorId);
                localStorage.setItem('validatorBanned', JSON.stringify(bannedList));
                setIsBanned(true);
                toast.warning('Validator banned and hidden from list', {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
                // Notify parent component
                if (onBanToggle) {
                    onBanToggle(validatorId, true);
                }
            }
        }
    }

    return (
        <>
            <Link href={`/validator/${validator.vote_pubkey}`}>
                <FontAwesomeIcon icon={faPencil} className="mr-2" />
            </Link>
            <span className="cursor-pointer" onClick={() => addToCompare(validator.id)}>
                <FontAwesomeIcon 
                    icon={isInComparison ? faScaleUnbalanced : faScaleBalanced} 
                    className={`mr-2 ${isInComparison ? 'text-red-500' : ''}`}
                />
            </span>
            <span className="cursor-pointer" onClick={() => addToFavorite(validator.id)}>
                <FontAwesomeIcon 
                    icon={faHeart} 
                    className={`mr-2 ${isInFavorites ? 'text-red-500' : ''}`}
                />
            </span>
            <span>
                <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
            </span>
            <span>
                <FontAwesomeIcon icon={faMoneyBill} className="mr-2" />
            </span>
            {/* <span className="cursor-pointer" onClick={() => addToBanned(validator.id)}>
                <FontAwesomeIcon 
                    icon={faBan} 
                    className={`mr-2 ${isBanned ? 'text-red-500' : ''}`}
                />
            </span> */}
        </>
    );
}
