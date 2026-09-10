import React, { useState, useRef } from 'react';
import Lang from 'lang.js';
import lngVaidators from '../../../Lang/Validators/translation';
import Sortable from './Sortable';
import { ReactSortable } from "react-sortablejs";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useSelector } from 'react-redux';
import Switch from 'react-ios-switch';
import { appEpochSelector, appLangSelector } from '../../../Redux/Layout/selectors';

const NoticeModal = ({ onClose, onSave, onColumnChange, onSort, initialColumns, user,children }) => {
    const appLang = useSelector(appLangSelector);
    const msg = new Lang({
        messages: lngVaidators,
        locale: appLang,
    });
    const [list, setList] = useState(initialColumns || []);
    const [activeTab, setActiveTab] = useState('telegram');
    const [loading, setLoading] = useState(false);
    // Store the original initial state to revert to on Cancel
    const originalColumnsRef = useRef(JSON.parse(JSON.stringify(initialColumns || [])));

    const connectTelegram = async () => {
        try {
            const res = await fetch("/api/telegram/connect-link", {
            method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": document
                    .querySelector('meta[name="csrf-token"]')
                    ?.getAttribute("content"),
                },
                credentials: "include",
            });

            const data = await res.json();
            setTimeout(() => {
                window.open(data.url, "_blank");
            }, 200); // 200 ms, can be increased up to 500 ms

            if (data.url) {
                window.open(data.url, "_blank");
            }
        } catch (e) {
            console.error("Telegram connect error", e);
        }
    };

    const applyChanges = async (data) => {
        try {
            console.log(data);
            onSave();
            // const res = await fetch("/api/save-notice-settings", {
            // method: "POST",
            //     headers: {
            //         "Content-Type": "application/json",
            //         "X-CSRF-TOKEN": document
            //         .querySelector('meta[name="csrf-token"]')
            //         ?.getAttribute("content"),
            //     },
            //     credentials: "include",
            //     data: data
            // });

            // const data = await res.json();

            // if (data.url) {
            //     window.open(data.url, "_blank");
            // }
        } catch (e) {
            console.error("Telegram connect error", e);
        }
    }


    return (
        <div className="modal-overlay-columns relative z-50">
            <div className="modal-header">
                <div className="modal-title mt-3">
                    <span className="mt-2 inline-block">{msg.get('validators.notice-settings')}</span>
                    {!user.telegram_links?.length && (
                        <span className="float-right">
                            <button
                              onClick={connectTelegram}
                              style={{
                                    display: 'inline-block',
                                    padding: '6px 12px',
                                    backgroundColor: '#703ea2',
                                    color: 'white',
                                    borderRadius: '6px',
                                    fontWeight: '600',
                                    textDecoration: 'none',
                                    border: 'none',
                                    cursor: 'pointer'
                                }}
                            >{msg.get('validators.connect-telegram')}</button>
                        </span>
                    )}
                </div>
                <div className="modal-close cursor-pointer" onClick={onClose}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" className="w-6 h-6">
                        <path
                          d="M160 96C124.7 96 96 124.7 96 160L96 480C96 515.3 124.7 544 160 544L480 544C515.3 544 544 515.3 544 480L544 160C544 124.7 515.3 96 480 96L160 96zM231 231C240.4 221.6 
                            255.6 221.6 264.9 231L319.9 286L374.9 231C384.3 221.6 399.5 221.6 408.8 231C418.1 240.4 418.2 255.6 408.8 264.9L353.8 319.9L408.8 374.9C418.2 384.3 418.2 399.5 408.8 
                            408.8C399.4 418.1 384.2 418.2 374.9 408.8L319.9 353.8L264.9 408.8C255.5 418.2 240.3 418.2 231 408.8C221.7 399.4 221.6 384.2 231 
                            374.9L286 319.9L231 264.9C221.6 255.5 221.6 240.3 231 231z" 
                          fill="white"
                        />
                    </svg>
                </div>
            </div>
            <div className="modal-content mt-6" onClick={e => e.stopPropagation()}>
                {/* Tab content */}
                <div className="mt-4">
                    {activeTab === 'telegram' && (
                        <div id="telegram">
                            <div className="grid grid-cols-2 gap-4">
                                {list.map((item, index) => (
                                    <div key={index} className="flex py-1">
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
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                
                
                <div className="flex justify-end mt-4">
                     <button 
                       className="btn-cancel mr-2"
                       onClick={() => {
                            // Reset to original initial state without saving
                            onClose();
                        }}
                     >
                       {msg.get('validators.btnCancel')}
                    </button>
                    <button 
                      className="btn-submit"
                      onClick={() => {
                            // applyChanges(list);
                            if (onSave) {
                                onSave(list);
                            }
                            onClose();
                        }}
                    >
                        {msg.get('validators.btnApplyChanges')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NoticeModal;