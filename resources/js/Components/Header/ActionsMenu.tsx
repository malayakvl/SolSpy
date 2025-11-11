import NavLink from '../../Components/Links/NavLink';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { useSelector } from 'react-redux';
import { appLangSelector } from '../../Redux/Layout/selectors';
import Lang from 'lang.js';
import lngHeader from '../../Lang/Header/translation';
import { Link, usePage } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faHeart,
    faBell, faUser, faScaleBalanced
} from '@fortawesome/free-solid-svg-icons';
import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function ActionsMenu(props) {
    const appLang = useSelector(appLangSelector);
    const lng = new Lang({
        messages: lngHeader,
        locale: appLang,
    });
    const user = usePage().props.auth.user;
    const permissions = usePage().props.auth.can;
    const [favLength, setFavLength] = useState(0);
    const [compareLength, setCompareLength] = useState(0);
    const [noticeCount, setNoticeCount] = useState(0);

    // Function to update favorite count
    const updateFavoriteCount = async () => {
        if (!user) {
            // For unregistered users, get count from localStorage
            const favoritesList = JSON.parse(localStorage.getItem('validatorFavorites') || '[]');
            setFavLength(favoritesList.length);
        } else {
            // For registered users, fetch count from server
            try {
                const response = await axios.get('/api/favorite-count', {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                });
                setFavLength(response.data.count || 0);
            } catch (error) {
                console.error('Error fetching favorite count:', error);
                // Fallback to localStorage if API fails
                const favoritesList = JSON.parse(localStorage.getItem('validatorFavorites') || '[]');
                setFavLength(favoritesList.length);
            }
        }
    };

    // Function to update comparison count
    const updateComparisonCount = async () => {
        if (!user) {
            // For unregistered users, get count from localStorage
            const compareList = JSON.parse(localStorage.getItem('validatorCompare') || '[]');
            setCompareLength(compareList.length);
        } else {
            // For registered users, fetch count from server
            try {
                const response = await axios.get('/api/comparison-count', {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                });
                setCompareLength(response.data.count || 0);
            } catch (error) {
                console.error('Error fetching comparison count:', error);
                // Fallback to localStorage if API fails
                const compareList = JSON.parse(localStorage.getItem('validatorCompare') || '[]');
                setCompareLength(compareList.length);
            }
        }
    };

    const updateNoticeCount = async () => {
        if (!user) {
            // For unregistered users, get count from localStorage
            const noticeList = JSON.parse(localStorage.getItem('validatorNotice') || '[]');
            setNoticeCount(noticeList.length);
        } else {
            // For registered users, fetch count from server
            try {
                const response = await axios.get('/api/notice-count', {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                });
                setNoticeCount(response.data.count || 0);
            } catch (error) {
                console.error('Error fetching notice count:', error);
                // Fallback to localStorage if API fails
                const noticeList = JSON.parse(localStorage.getItem('validatorNotice') || '[]');
                setNoticeCount(noticeList.length);
            }
        }
    };

    useEffect(() => {
        // Initial counts
        updateFavoriteCount();
        updateComparisonCount();
        updateNoticeCount();
        
        // Listen for favorite count changes
        window.addEventListener('favoriteCountChanged', updateFavoriteCount);
        // Listen for comparison count changes
        window.addEventListener('comparisonCountChanged', updateComparisonCount);
        // Listen for notice count changes
        window.addEventListener('noticeCountChanged', updateNoticeCount);   
        
        // Cleanup listeners
        return () => {
            window.removeEventListener('favoriteCountChanged', updateFavoriteCount);
            window.removeEventListener('comparisonCountChanged', updateComparisonCount);
            window.removeEventListener('noticeCountChanged', updateNoticeCount);
        };
    }, [user]);

    return (
        <>
            <div className="md:space-x-4 md:flex md:pr-[30px]">
                <Link
                    href={user ? '/comparisons' : `/comparisons?ids=${encodeURIComponent(localStorage.getItem('validatorCompare') || '[]')}`}
                    className="inline-flex items-center menu-main-btn text-sm relative"
                >
                    <span className="eclipse-qty">{compareLength}</span>
                    <FontAwesomeIcon icon={faScaleBalanced} className="w-[16px] h-[16px] text-white" />
                </Link>
                <Link
                    href={user ? '/favorites' : `/favorites?ids=${encodeURIComponent(localStorage.getItem('validatorFavorites') || '[]')}`}
                    className="inline-flex items-center menu-main-btn text-sm relative"
                >
                    <span className="eclipse-qty">{favLength}</span>
                    <FontAwesomeIcon icon={faHeart} className="w-[16px] h-[16px] text-white" />
                </Link>
                <Link
                    href={user ? '/notices' : `/favorites?ids=${encodeURIComponent(localStorage.getItem('validatorFavorites') || '[]')}`}
                    className="inline-flex items-center menu-main-btn text-sm relative"
                >
                    <span className="eclipse-qty">{noticeCount}</span>
                    <FontAwesomeIcon icon={faBell} className="w-[16px] h-[16px] text-white" />
                </Link>
            </div>
        </>
    );
}