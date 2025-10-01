import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '../../../Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faStar, faComments, faNewspaper, faGripLines } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import axios from 'axios';
import { ReactSortable } from "react-sortablejs";

interface TopNewsItem {
    id: number;
    type: 'news' | 'discord';
    title: string;
    description: string;
    source: string;
    url: string;
    published_at: string;
    created_at: string;
    updated_at: string;
    image_url?: string;
}

interface SortTopNewsProps {
    topNews: TopNewsItem[];
}

export default function SortTopNews({ topNews }: SortTopNewsProps) {
    const [newsItems, setNewsItems] = useState<TopNewsItem[]>(topNews);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [originalOrder, setOriginalOrder] = useState<TopNewsItem[]>([]);

    // Initialize the sort order when the component mounts
    useEffect(() => {
        const initializeSortOrder = async () => {
            setIsLoading(true);
            try {
                // Fetch the current order from the API
                const response = await axios.get('/api/top-news-order');
                const orderData = response.data;
                
                // Create a map of item IDs to their sort order
                const sortOrderMap = new Map();
                
                // Add items to the sort order map
                orderData.forEach((item: any) => {
                    const key = `${item.news_type}-${item.news_id}`;
                    sortOrderMap.set(key, item.sort_order);
                });
                
                // Sort the news items based on their sort order
                const sortedItems = [...topNews].sort((a, b) => {
                    const orderA = sortOrderMap.get(`${a.type}-${a.id}`) ?? 0;
                    const orderB = sortOrderMap.get(`${b.type}-${b.id}`) ?? 0;
                    return orderA - orderB;
                });
                
                setNewsItems(sortedItems);
                setOriginalOrder(sortedItems);
            } catch (error) {
                console.error('Error initializing sort order:', error);
                toast.error('Failed to initialize sort order');
            } finally {
                setIsLoading(false);
            }
        };
        
        // Only initialize if we have data
        if (topNews && topNews.length > 0) {
            initializeSortOrder();
        }
    }, []);

    // Auto-save when the order changes
    useEffect(() => {
        // Don't auto-save on initial load
        if (isLoading || newsItems.length === 0 || originalOrder.length === 0) {
            return;
        }
        
        // Check if the order has actually changed
        const hasChanged = newsItems.some((item, index) => {
            const originalItem = originalOrder[index];
            return !originalItem || item.id !== originalItem.id || item.type !== originalItem.type;
        });
        
        if (hasChanged) {
            const saveTimer = setTimeout(() => {
                saveOrder();
            }, 1000); // Save 1 second after the last change
            
            return () => clearTimeout(saveTimer);
        }
    }, [newsItems, originalOrder, isLoading]);

    const handleSetList = (newList: TopNewsItem[]) => {
        setNewsItems(newList);
    };

    const saveOrder = async () => {
        // Check if the order has actually changed before saving
        const hasChanged = newsItems.some((item, index) => {
            const originalItem = originalOrder[index];
            return !originalItem || item.id !== originalItem.id || item.type !== originalItem.type;
        });
        
        if (!hasChanged) {
            return;
        }
        
        setIsSaving(true);
        
        try {
            // Separate news items by type
            const newsIds = newsItems
                .filter(item => item.type === 'news')
                .map(item => item.id);
                
            const discordIds = newsItems
                .filter(item => item.type === 'discord')
                .map(item => item.id);
            
            // Send the new order to the server
            await axios.post('/api/top-news-order/update', { 
                newsIds, 
                discordIds 
            });
            
            // Update the original order to reflect the saved state
            setOriginalOrder([...newsItems]);
            toast.success('Top news order saved successfully');
        } catch (error) {
            console.error('Error saving order:', error);
            toast.error('Failed to save order');
        } finally {
            setIsSaving(false);
        }
    };

    const cancelSort = () => {
        // Reset to the original order
        setNewsItems([...originalOrder]);
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

    if (isLoading) {
        return (
            <AuthenticatedLayout header={<Head title="Sort Top News" />}>
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout header={<Head title="Sort Top News" />}>
            <Head title="Sort Top News" />
            
            <div className="py-0">
                <div className="p-4 sm:p-8 mb-8 content-data bg-content">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold">Sort Top News</h2>
                        <div className="flex gap-2">
                            {isSaving && (
                                <div className="flex items-center text-sm text-yellow-600">
                                    <span>Saving...</span>
                                </div>
                            )}
                            <button
                                onClick={cancelSort}
                                className="inline-flex items-center px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
                            >
                                <FontAwesomeIcon icon={faTimes} className="mr-2" />
                                Cancel
                            </button>
                        </div>
                    </div>

                    <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">
                            Drag and drop items to reorder them. Changes are automatically saved.
                        </p>
                    </div>

                    {newsItems.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500">No top news items found.</p>
                            <Link 
                                href="/admin/news" 
                                className="mt-4 inline-block text-blue-500 hover:text-blue-700"
                            >
                                Back to News Management
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <ReactSortable
                                list={newsItems}
                                setList={handleSetList}
                                animation={200}
                                easing="ease-out"
                                filter=".no-drag"
                                preventOnFilter={false}
                                className="space-y-3"
                            >
                                {newsItems.map((item) => (
                                    <div key={`${item.type}-${item.id}`} className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex items-center sortable-item">
                                        <div className="flex items-center">
                                            <FontAwesomeIcon 
                                                icon={faGripLines} 
                                                className="text-gray-400 mr-2 cursor-move sortable-handle"
                                            />
                                            <div className="flex-shrink-0 h-12 w-12">
                                                {item.type === 'news' ? (
                                                    item.image_url ? (
                                                        <img 
                                                            src={item.image_url} 
                                                            alt={item.title} 
                                                            className="h-12 w-12 rounded object-cover"
                                                        />
                                                    ) : (
                                                        <div className="h-12 w-12 rounded bg-gray-200 flex items-center justify-center">
                                                            <FontAwesomeIcon icon={faNewspaper} className="text-gray-600" />
                                                        </div>
                                                    )
                                                ) : (
                                                    <div className="h-12 w-12 rounded bg-indigo-100 flex items-center justify-center">
                                                        <FontAwesomeIcon icon={faComments} className="text-indigo-600" />
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="ml-4 flex-grow">
                                                <div className="flex items-center">
                                                    <span className="text-sm font-medium" style={{ color: '#111827' }}>
                                                        {truncateText(item.title, 60)}
                                                    </span>
                                                    <FontAwesomeIcon icon={faStar} className="ml-2 text-yellow-500" />
                                                </div>
                                                <p className="text-xs mt-1" style={{ color: '#4b5563' }}>
                                                    {truncateText(item.description, 80)}
                                                </p>
                                                <div className="flex items-center mt-1 text-xs" style={{ color: '#6b7280' }}>
                                                    <span>{item.source}</span>
                                                    <span className="mx-2">•</span>
                                                    <span>{formatDate(item.published_at)}</span>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    item.type === 'news' 
                                                        ? 'bg-blue-100 text-blue-800' 
                                                        : 'bg-indigo-100 text-indigo-800'
                                                }`}>
                                                    {item.type === 'news' ? 'News' : 'Discord'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </ReactSortable>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}