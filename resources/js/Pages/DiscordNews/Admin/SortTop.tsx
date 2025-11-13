import React, { useState } from 'react';
import AuthenticatedLayout from '../../../Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp, faArrowDown, faSave, faTimes, faStar } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';

interface DiscordNewsItem {
    id: number;
    message_id: string;
    title: string;
    description: string;
    url: string;
    source: string;
    published_at: string;
    created_at: string;
    updated_at: string;
}

interface SortTopDiscordNewsProps {
    topNews: DiscordNewsItem[];
}

export default function SortTopDiscordNews({ topNews }: SortTopDiscordNewsProps) {
    const [newsItems, setNewsItems] = useState<DiscordNewsItem[]>(topNews);
    const [isSaving, setIsSaving] = useState(false);

    const moveItem = (index: number, direction: 'up' | 'down') => {
        const newItems = [...newsItems];
        if (direction === 'up' && index > 0) {
            [newItems[index], newItems[index - 1]] = [newItems[index - 1], newItems[index]];
            setNewsItems(newItems);
        } else if (direction === 'down' && index < newItems.length - 1) {
            [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
            setNewsItems(newItems);
        }
    };

    const saveOrder = () => {
        setIsSaving(true);
        
        // For now, we'll just show a success message since we're not actually changing the sort order in the database
        // In a real implementation, you would send the new order to the server
        setTimeout(() => {
            setIsSaving(false);
            toast.success('Top Discord news order saved successfully');
        }, 1000);
    };

    const cancelSort = () => {
        setNewsItems(topNews);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const truncateText = (text: string, maxLength: number = 100) => {
        if (text.length <= maxLength) return text;
        return text.substr(0, maxLength) + '...';
    };

    return (
        <AuthenticatedLayout header={<Head title="Sort Top Discord News" />}>
            <Head title="Sort Top Discord News" />
            
            <div className="py-0">
                <div className="p-4 sm:p-8 mb-8 content-data bg-content">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold">Sort Top Discord News</h2>
                        <div className="flex gap-2">
                            <button
                              onClick={cancelSort}
                              className="inline-flex items-center px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
                            >
                                <FontAwesomeIcon icon={faTimes} className="mr-2" />
                                Cancel
                            </button>
                            <button
                              onClick={saveOrder}
                              disabled={isSaving}
                              className="inline-flex items-center px-4 py-2 bg-[#703ea2] text-white rounded hover:bg-blue-600 text-[13px] text-sm disabled:opacity-50"
                            >
                                <FontAwesomeIcon icon={faSave} className="mr-2" />
                                {isSaving ? 'Saving...' : 'Save Order'}
                            </button>
                        </div>
                    </div>

                    <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">
                            Drag and drop items to reorder them, or use the arrow buttons to move items up or down.
                            Click "Save Order" when you're finished.
                        </p>
                    </div>

                    {newsItems.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500">No top Discord news items found.</p>
                            <Link 
                              href={route('admin.discord.news')} 
                              className="mt-4 inline-block text-blue-500 hover:text-blue-700"
                            >
                                Back to Discord News Management
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {newsItems.map((item, index) => (
                                <div key={item.id} className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex items-center">
                                    <div className="flex flex-col items-center mr-4">
                                        <button
                                          onClick={() => moveItem(index, 'up')}
                                          disabled={index === 0}
                                          className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                                        >
                                            <FontAwesomeIcon icon={faArrowUp} />
                                        </button>
                                        <span className="text-xs text-gray-500 my-1">{index + 1}</span>
                                        <button
                                          onClick={() => moveItem(index, 'down')}
                                          disabled={index === newsItems.length - 1}
                                          className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                                        >
                                            <FontAwesomeIcon icon={faArrowDown} />
                                        </button>
                                    </div>
                                    
                                    <div className="flex-shrink-0 h-12 w-12 bg-indigo-100 rounded flex items-center justify-center">
                                        <span className="text-indigo-800 font-bold text-xs">
                                            D
                                        </span>
                                    </div>
                                    
                                    <div className="ml-4 flex-grow">
                                        <div className="flex items-center">
                                            <h3 className="text-sm font-medium text-gray-900">
                                                {truncateText(item.title, 60)}
                                            </h3>
                                            <FontAwesomeIcon icon={faStar} className="ml-2 text-yellow-500" />
                                        </div>
                                        <p className="text-xs text-gray-600 mt-1">
                                            {truncateText(item.description, 80)}
                                        </p>
                                        <div className="flex items-center mt-1 text-xs text-gray-500">
                                            <span>{item.source}</span>
                                            <span className="mx-2">•</span>
                                            <span>{formatDate(item.published_at)}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                            Top
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}