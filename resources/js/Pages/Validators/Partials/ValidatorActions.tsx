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

export default function ValidatorActions({validator}) {
    const user = usePage().props.auth.user;

    const addToCompare = async (validatorId) => {
        if (user?.id) {
            try {
                router.post(`/add-compare`, {validatorId: validatorId});
            } catch (error) {
                console.error('Error:', error);
            }
        } else {

        }
    }

    const addToFavorite = (validatorId) => {
        if (user?.id) {

        } else {

        }
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
