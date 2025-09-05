import React, { useState } from 'react';
import Sortable from './Sortable';
import { ReactSortable } from "react-sortablejs";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Switch from 'react-ios-switch';

const draggableList = [
    {
        name: "Spy Rank",
        show: true
    },
    {
        name: "Avatar",
        show: true  
    },
    {
        name: "Name",
        show: true
    },
    {
        name: "Status",
        show: true
    },
    {
        name: "TVC Score",
        show: true
    },
    {
        name: "Vote Credits",
        show: true
    },
    {
        name: "Active Stake",
        show: true
    },
    {
        name: "Vote Rate",
        show: true
    },
    {
        name: "Inflation Comission",
        show: true
    },
    {
        name: "MEV Comission",
        show: true
    },
    {
        name: "Uptime",
        show: true
    },
    {
        name: "Client/Version",
        show: true
    },
    {
        name: "Status SFDP",
        show: true
    },
    {
        name: "Location",
        show: true
    },
    {
        name: "Awards",
        show: true
    },
    {
        name: "Website",
        show: true
    },
    {
        name: "City",
        show: true
    },
    {
        name: "ASN",
        show: true
    },
    {
        name: "IP",
        show: true
    },
    {
        name: "Jiito Score",
        show: true
    },
];

const Modal = ({ onClose, children }) => {
    const [list, setList] = useState(draggableList);

    return (
        <div className="modal-overlay-columns relative z-50">
            <div className="absolute top-[10px] right-[10px] p-1 cursor-pointer" onClick={onClose}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" className="w-6 h-6">
                    <path d="M160 96C124.7 96 96 124.7 96 160L96 480C96 515.3 124.7 544 160 544L480 544C515.3 544 544 515.3 544 480L544 160C544 124.7 515.3 96 480 96L160 96zM231 231C240.4 221.6 
                        255.6 221.6 264.9 231L319.9 286L374.9 231C384.3 221.6 399.5 221.6 408.8 231C418.1 240.4 418.2 255.6 408.8 264.9L353.8 319.9L408.8 374.9C418.2 384.3 418.2 399.5 408.8 
                        408.8C399.4 418.1 384.2 418.2 374.9 408.8L319.9 353.8L264.9 408.8C255.5 418.2 240.3 418.2 231 408.8C221.7 399.4 221.6 384.2 231 
                        374.9L286 319.9L231 264.9C221.6 255.5 221.6 240.3 231 231z" />
                    </svg>
            </div>
            <div className="modal-content" onClick={e => e.stopPropagation()}> {/* Prevent closing when clicking inside modal */}
                <ReactSortable
                        filter=".addImageButtonContainer"
                        dragClass="sortableDrag"
                        list={list}
                        setList={setList}
                        animation="200"
                        easing="ease-out"
                    >
                        {list.map((item, index) => (
                            <div className="draggable-item" key={index}>
                                <div className="flex">
                                    <Switch
                                        className={'switch-container'}
                                        checked={item.show}
                                        onChange={(checked) => {
                                            const updatedList = list.map((listItem, listIndex) => {
                                                if (listIndex === index) {
                                                    return { ...listItem, show: checked };
                                                }
                                                return listItem;
                                            });
                                            setList(updatedList);
                                        }}
                                    />
                                    <span className="ml-2">{item.name}</span>
                                </div>
                            </div>
                        ))}
                    </ReactSortable>
            </div>
        </div>
    );
};

export default Modal;