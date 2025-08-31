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

export default function ValidatorActions({validator}) {

    return (
        <>
            <span>
                <FontAwesomeIcon icon={faPencil} className="mr-2" />
            </span>
            <span>
                <FontAwesomeIcon icon={faScaleBalanced} className="mr-2" />
            </span>
            <span>
                <FontAwesomeIcon icon={faHeart} className="mr-2" />
            </span>
            <span>
                <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
            </span>
            <span>
                <FontAwesomeIcon icon={faMoneyBill} className="mr-2" />
            </span>
            <span>
                <FontAwesomeIcon icon={faBan} className="mr-2" />
            </span>
        </>
    );
}
