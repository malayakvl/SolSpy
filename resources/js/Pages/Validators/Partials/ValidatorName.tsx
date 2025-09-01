import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faArrowUpRightFromSquare,
    faBan,
    faBeer,
    faBomb, faCheck,
    faEdit, faEnvelope,
    faEye,
    faHand,
    faHeart,
    faMoneyBill,
    faPencil,
    faScaleBalanced
} from '@fortawesome/free-solid-svg-icons';
import { Link } from "@inertiajs/react";

export default function ValidatorName({validator}) {

    return (
        <>
            <div className="flex flex-col">
                <span className="truncate v-truncate min-w-[190px]">{validator.name}</span>
                <div className="flex items-center space-x-2">
                  <span
                      className="text-[14px] truncate v-truncate max-w-[150px] hover:underline"
                      title={validator.vote_pubkey} // Full vote_pubkey on hover
                  >
                    {validator.vote_pubkey.slice(0, 4)}...{validator.vote_pubkey.slice(-4)}
                  </span>
                </div>
            </div>

        </>
    );
}
