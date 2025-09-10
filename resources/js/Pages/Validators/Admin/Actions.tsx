import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';

interface AdminActionsProps {
    checkedIds: string[];
    onActionComplete?: () => void;
}

export default function ValidatorAdminActions({ checkedIds, onActionComplete }: AdminActionsProps) {
    const [showAdminDropdown, setShowAdminDropdown] = useState(false);

    const addMarkToValidators = (value: string) => {
        if (checkedIds.length === 0) {
            toast.warning('Please select at least one validator');
            return;
        }

        router.get(`/mark-validators`, {
            value: value,
            checkedIds: checkedIds
        }, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                toast.success(`Validator ${value} status updated successfully!`);
                if (onActionComplete) {
                    onActionComplete();
                }
            },
            onError: (error) => {
                console.error('Error:', error);
                toast.error('Failed to update validator status');
            }
        });
    };

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setShowAdminDropdown(!showAdminDropdown)}
                className="px-2 py-1 text-xs"
            >
                <FontAwesomeIcon icon={faChevronDown} />
            </button>
            {showAdminDropdown && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                    <div className="py-1">
                        <button
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => {
                                addMarkToValidators('top');
                                setShowAdminDropdown(false);
                            }}
                        >
                            Set Top
                        </button>
                        <button
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => {
                                addMarkToValidators('highlight');
                                setShowAdminDropdown(false);
                            }}
                        >
                            Highlight
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}