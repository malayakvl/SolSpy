import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '../../../Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGripLines, faStar, faStarHalfAlt } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { toast } from 'react-toastify';
import { ReactSortable } from "react-sortablejs";

interface DiscordNewsItem {
    id: number;
    title: string;
    content: string;
    url: string;
    author: string;
    published_at: string;
    image_url: string;
    sort_order: number;
    is_top: boolean; // Add is_top field
    created_at: string;
    updated_at: string;
}

export default function DiscordNewsOrder() {
    const [newsItems, setNewsItems] = useState<DiscordNewsItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNewsItems();
    }, []);

    const fetchNewsItems = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/discord-news');
            setNewsItems(response.data);
        } catch (error) {
            console.error('Error fetching news items:', error);
            toast.error('Failed to fetch news items');
        } finally {
            setLoading(false);
        }
    };

    const handleSortChange = (newList: DiscordNewsItem[]) => {
        setNewsItems(newList);
    };

    const handleApplyChanges = async () => {
        try {
            const newsIds = newsItems.map(item => item.id);
            
            const response = await axios.post('/api/discord-news-order/update', {
                newsIds: newsIds
            });
            
            toast.success('Order updated successfully');
        } catch (error) {
            console.error('Error updating order:', error);
            toast.error('Failed to update order');
        }
    };

    // Toggle is_top status for a news item
    const toggleTopStatus = async (id: number) => {
        try {
            await axios.post('/api/discord-news/top', {
                ids: [id]
            });
            
            // Update the local state
            setNewsItems(prevItems => 
                prevItems.map(item => 
                    item.id === id ? { ...item, is_top: !item.is_top } : item
                )
            );
            
            toast.success('Top status updated successfully');
        } catch (error) {
            console.error('Error updating top status:', error);
            toast.error('Failed to update top status');
        }
    };

    if (loading) {
        return (
            <AuthenticatedLayout header={<Head title="Order Discord News" />}>
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout header={<Head title="Order Discord News" />}>
            <Head title="Order Discord News" />
            <div className="py-0">
                <div className="p-4 sm:p-8 mb-8 content-data bg-content">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-2xl font-bold">Order Discord News</h2>
                            <p className="text-gray-600">Drag and drop to reorder news items</p>
                        </div>
                        <button 
                            className="btn-submit"
                            onClick={handleApplyChanges}
                        >
                            Apply Changes
                        </button>
                    </div>
                    
                    <div className="mt-6">
                        <div className="overflow-x-auto">
                            <ReactSortable
                                list={newsItems}
                                setList={handleSortChange}
                                tag="ul"
                                animation={200}
                                easing="ease-out"
                                filter=".no-drag"
                                preventOnFilter={false}
                                className="space-y-3"
                            >
                                {newsItems.map((item) => (
                                    <li key={item.id} className="bg-white sortable-item border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <FontAwesomeIcon 
                                                    icon={faGripLines} 
                                                    className="text-gray-400 mr-2 cursor-move sortable-handle"
                                                />
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    {item.image_url ? (
                                                        <img 
                                                            src={item.image_url} 
                                                            alt={item.title} 
                                                            className="h-10 w-10 rounded-full object-cover"
                                                            onError={(e) => {
                                                                const target = e.target as HTMLImageElement;
                                                                target.style.display = 'none';
                                                                target.parentElement!.innerHTML = 
                                                                    `<div class="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                                        <span class="text-gray-500 text-xs font-bold">
                                                                            ${item.title.charAt(0)}
                                                                        </span>
                                                                    </div>`;
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                            <span className="text-gray-500 text-xs font-bold">
                                                                {item.title.charAt(0)}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {item.title}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {item.author}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-4">
                                                <div className="text-sm text-gray-500">
                                                    {new Date(item.published_at).toLocaleDateString()}
                                                </div>
                                                <button 
                                                    onClick={() => toggleTopStatus(item.id)}
                                                    className="text-yellow-500 hover:text-yellow-600"
                                                >
                                                    <FontAwesomeIcon 
                                                        icon={item.is_top ? faStar : faStarHalfAlt} 
                                                        className={item.is_top ? "text-yellow-500" : "text-gray-300"}
                                                    />
                                                </button>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ReactSortable>
                            
                            {newsItems.length === 0 && (
                                <div className="text-center py-8">
                                    <p className="text-gray-500">No news items found.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}