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
import {Link, usePage} from "@inertiajs/react";

export default function ValidatorActions({validator}) {
    const user = usePage().props.auth.user;
    console.log(user);
    const addToCompare = (validatorId) => {

    }

    const addToFavorite = (validatorId) => {

    }

    return (
        <>
            <Link href={`/validator/${validator.vote_pubkey}`}>
                <FontAwesomeIcon icon={faPencil} className="mr-2" />
            </Link>
            <span className="cursor-pointer" onClick={() => addToCompare(validator.id)}>
                <FontAwesomeIcon icon={faScaleBalanced} className="mr-2" />
            </span>
            <span className="cursor-pointer" onClick={() => addToFavorite(validator.id)}>
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
