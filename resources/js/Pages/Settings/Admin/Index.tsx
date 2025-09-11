import React, { useState } from 'react';
import AuthenticatedLayout from '../../../Layouts/AuthenticatedLayout';
import Lang from 'lang.js';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useSelector } from 'react-redux';
import { appLangSelector } from '../../../Redux/Layout/selectors';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faSave, faEye } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import RichTextEditor from '../../../Components/Form/RichTextEditor';
import lngSettings from '../../../Lang/Settings/translation';

interface SettingsFormData {
    update_interval: numerber;
}

interface CreateEditProps {
    settings?: any;
    isEdit?: boolean;
    languages?: Array<{ code: string; name: string; }>;
}

export default function CreateEdit({ settingsData, isEdit = true, languages = [
    { code: 'en', name: 'English' },
    { code: 'ru', name: 'Русский' }
] }: CreateEditProps) {
    const appLang = useSelector(appLangSelector);
    const [activeTab, setActiveTab] = useState(languages[0]?.code || 'en');
    const [previewMode, setPreviewMode] = useState(false);
    const msg = new Lang({
      messages: lngSettings,
      locale: appLang,
  });
    
    const { data, setData, post, put, processing, errors, transform } = useForm<SettingsFormData>({
        update_interval: settingsData?.update_interval || '2',
    });

    // Transform the data before submission
    // transform((data) => {
    //     // Filter out empty translations
    //     const validTranslations = Object.entries(data.translations)
    //         .filter(([language, translation]) => translation.title.trim() !== '' || translation.content.trim() !== '');
        
    //     return {
    //         ...data,
    //     };
    // });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Check if at least one translation has content before submitting
        put(route('admin.settings.update'), {
                data: data,
                onSuccess: () => {
                    toast.success('Settings updated successfully!');
                },
                onError: () => {
                    toast.error('Failed to update settings');
                }
            });
    };


    

    return (
        <AuthenticatedLayout header={<Head title={msg.get('settings.title')} />}>
            <Head title={isEdit ? 'Edit News' : 'Create News'} />
            
            <div className="py-0">
                <div className="p-4 sm:p-8 mb-8 content-data bg-content">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6 ">
                        <div className="flex items-center gap-4">
                            <h2 className="text-2xl font-bold">
                                {msg.get('settings.title')}
                            </h2>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* General Settings */}
                        <div className="bg-white p-6 rounded-lg shadow">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {msg.get('settings.update_interval')}
                                    </label>
                                    <select
                                        value={data.update_interval}
                                        onChange={(e) => setData('update_interval', e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="2">2</option>
                                        <option value="5">5</option>
                                        <option value="7">7</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end gap-4">
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 text-sm"
                            >
                                <FontAwesomeIcon icon={faSave} className="mr-2" />
                                {processing ? 'Saving...' : (msg.get('settings.save'))}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}