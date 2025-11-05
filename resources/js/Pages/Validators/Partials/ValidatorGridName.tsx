import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faArrowUpRightFromSquare,
    faBan,
    faBeer,
    faBomb, faCheck,
    faCopy,
    faEdit, faEnvelope,
    faEye,
    faHand,
    faHeart,
    faMoneyBill,
    faPencil,
    faScaleBalanced
} from '@fortawesome/free-solid-svg-icons';
import { Link } from "@inertiajs/react";
import { toast } from 'react-toastify';

export default function ValidatorGridName({validator, align = 'left', noTruncate = false}) {
    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            toast.success('Vote pubkey copied to clipboard!', {
                position: "top-right",
                autoClose: 2000,
            });
        } catch (err) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            toast.success('Vote pubkey copied to clipboard!', {
                position: "top-right",
                autoClose: 2000,
            });
        }
    };

    return (
        <>
            <div className="flex flex-col">
                <span className={`${noTruncate ? '' : 'truncate v-truncate min-w-[220px]'} block text-right text-[#e3d4f3] font-bold`}>{validator.name}</span>
                <div className={`flex justify-end`}>
                  <span
                      className={`text-[14px] ${noTruncate ? '' : 'truncate v-truncate max-w-[150px]'} hover:underline`}
                      title={validator.vote_pubkey} // Full vote_pubkey on hover
                  >
                    {validator.vote_pubkey.slice(0, 4)}...{validator.vote_pubkey.slice(-4)}
                  </span>
                  <button
                      onClick={() => copyToClipboard(validator.vote_pubkey)}
                      className="text-gray-500 hover:text-blue-500 transition-colors duration-200"
                      title="Copy vote pubkey to clipboard"
                  >
                      <FontAwesomeIcon icon={faCopy} className="text-xs" />
                  </button>
                </div>
            </div>

        </>
    );
}
