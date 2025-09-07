import React, { useState, useRef } from 'react';
import Lang from 'lang.js';
import lngVaidators from '../../../Lang/Validators/translation';
import Sortable from './Sortable';
import { ReactSortable } from "react-sortablejs";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useSelector } from 'react-redux';
import Switch from 'react-ios-switch';
import { appEpochSelector, appLangSelector } from '../../../Redux/Layout/selectors';

const Modal = ({ onClose, onSave, onColumnChange, onSort, initialColumns, children }) => {
    const appLang = useSelector(appLangSelector);
    const msg = new Lang({
        messages: lngVaidators,
        locale: appLang,
    });
    const [list, setList] = useState(initialColumns || []);
    // Store the original initial state to revert to on Cancel
    const originalColumnsRef = useRef(JSON.parse(JSON.stringify(initialColumns || [])));
    return (
        <div className="modal-overlay-columns relative z-50">
            <h2>{msg.get('validators.title')}&nbsp;</h2>
            <div className="absolute top-[10px] right-[10px] p-1 cursor-pointer" onClick={onClose}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" className="w-6 h-6">
                    <path d="M160 96C124.7 96 96 124.7 96 160L96 480C96 515.3 124.7 544 160 544L480 544C515.3 544 544 515.3 544 480L544 160C544 124.7 515.3 96 480 96L160 96zM231 231C240.4 221.6 
                        255.6 221.6 264.9 231L319.9 286L374.9 231C384.3 221.6 399.5 221.6 408.8 231C418.1 240.4 418.2 255.6 408.8 264.9L353.8 319.9L408.8 374.9C418.2 384.3 418.2 399.5 408.8 
                        408.8C399.4 418.1 384.2 418.2 374.9 408.8L319.9 353.8L264.9 408.8C255.5 418.2 240.3 418.2 231 408.8C221.7 399.4 221.6 384.2 231 
                        374.9L286 319.9L231 264.9C221.6 255.5 221.6 240.3 231 231z" 
                    />
                </svg>
            </div>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="columns">
                    <ReactSortable
                        filter=".addImageButtonContainer"
                        dragClass="sortableDrag"
                        list={list}
                        setList={(newList) => {
                            setList(newList);
                            // Call onSort callback when order changes
                            if (onSort) {
                                onSort(newList);
                            }
                        }}
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
                                            
                                            // Call the callback to notify parent component
                                            if (onColumnChange) {
                                                onColumnChange(item.name, checked, index, updatedList);
                                            }
                                        }}
                                    />
                                    <span className="ml-2">{item.name}</span>
                                </div>
                            </div>
                        ))}
                    </ReactSortable>
                </div>
                
                <div className="flex justify-end mt-4">
                     <button 
                        className="btn-cancel mr-2"
                        onClick={() => {
                            // Reset to original initial state without saving
                            const originalColumns = originalColumnsRef.current;
                            setList(originalColumns);
                            // Also revert the parent component's state to original
                            if (onColumnChange) {
                                onColumnChange(null, null, null, originalColumns);
                            }
                            onClose();
                        }}
                    >
                       Cancel
                    </button>
                    <button 
                        className="btn-submit"
                        onClick={() => {
                            if (onSave) {
                                onSave(list);
                            }
                            onClose();
                        }}
                    >
                        Apply Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Modal;