import React, { useState } from 'react';
import AuthenticatedLayout from '../../../Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useSelector } from 'react-redux';
import { appLangSelector } from '../../../Redux/Layout/selectors';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faCalendar, faUser, faPlus, faCog, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';

interface NewsItem {
    title: string;
    source?: string;
    url?: string;
    description?: string;
    views_count: number;
    published_at: any;
}

interface NewsIndexProps {
    news: {
        data: NewsItem[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        error?: string;
    };
    featured?: NewsItem[];
    filters?: {
        search?: string;
        status?: string;
        is_featured?: boolean;
    };
}

export default function AdminIndex({ news, featured, filters = {} }: NewsIndexProps) {
    const appLang = useSelector(appLangSelector);
    const { auth } = usePage().props as any;
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [featuredFilter, setFeaturedFilter] = useState(filters.is_featured ? 'featured' : 'all');
    const [selectedItems, setSelectedItems] = useState<number[]>([]);

    // Check if user has admin access
    const userRoles = auth?.user?.roles?.map(role => role.name) || [];
    const isAdmin = userRoles.includes('Admin') || userRoles.includes('Manager');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params = {
            search: searchTerm || undefined,
            status: statusFilter !== 'all' ? statusFilter : undefined,
            featured: featuredFilter !== 'all' ? featuredFilter : undefined,
        };
        
        router.get(route('admin.discord.news'), params, {
            preserveState: true,
            preserveScroll: true
        });
    };

    const handleBulkAction = (action: string) => {
        if (selectedItems.length === 0) {
            toast.warning('Please select at least one item');
            return;
        }

        if (confirm(`Are you sure you want to ${action} the selected items?`)) {
            router.post(route('admin.discord.bulk-action'), {
                action,
                ids: selectedItems
            }, {
                onSuccess: () => {
                    toast.success(`Bulk ${action} completed successfully`);
                    setSelectedItems([]);
                },
                onError: () => {
                    toast.error(`Failed to perform bulk ${action}`);
                }
            });
        }
    };

    const toggleSelection = (index: number) => {
        setSelectedItems(prev => 
            prev.includes(index) 
                ? prev.filter(item => item !== index)
                : [...prev, index]
        );
    };

    const toggleSelectAll = () => {
        setSelectedItems(
            selectedItems.length === news.data.length 
                ? [] 
                : news.data.map((_, index) => index)
        );
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString(appLang === 'ru' ? 'ru-RU' : 'en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const truncateText = (text: string, maxLength: number = 150) => {
        if (text.length <= maxLength) return text;
        return text.substr(0, maxLength) + '...';
    };

    return (
        <AuthenticatedLayout header={<Head title="News" />}>
            <Head title="News" />
            
            <div className="py-0">
                <div className="p-4 sm:p-8 mb-8 content-data bg-content">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold">Discord News</h2>
                    </div>

                    {/* Error message display */}
                    {news.error && (
                        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                            <div className="flex items-center">
                                <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
                                <strong>Error:</strong>
                            </div>
                            <p className="mt-2">{news.error}</p>
                        </div>
                    )}

                    {/* Bulk Actions */}
                    {selectedItems.length > 0 && (
                        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-medium">
                                    {selectedItems.length} item(s) selected
                                </span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleBulkAction('feature')}
                                        className="px-3 py-1 text-xs bg-violet-500 text-white rounded hover:bg-yellow-600"
                                    >
                                        Toggle Top
                                    </button>
                                    {/* <button
                                        onClick={() => handleBulkAction('unfeature')}
                                        className="px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
                                    >
                                        Unfeature
                                    </button>
                                    <button
                                        onClick={() => handleBulkAction('delete')}
                                        className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                                    >
                                        Delete
                                    </button> */}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Featured News Section */}
                    {/* Regular News Grid */}
                    {/* Replace the grid with a table */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white rounded-lg overflow-hidden">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left">
                                        <input
                                            type="checkbox"
                                            checked={selectedItems.length === news.data.length && news.data.length > 0}
                                            onChange={toggleSelectAll}
                                            className="rounded"
                                        />
                                    </th>
                                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title & Description</th>
                                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Published Date</th>
                                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Featured</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {news.data && news.data.map((article, index) => (
                                    <tr key={`${article.title}-${index}`} className={selectedItems.includes(index) ? 'bg-blue-50' : ''}>
                                        <td className="px-6 py-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedItems.includes(index)}
                                                onChange={() => toggleSelection(index)}
                                                className="rounded"
                                            />
                                        </td>
                                        <td className="py-3 px-4">
                                            <a
                                                href={article.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-gray-900 hover:text-blue-600 font-medium"
                                            >
                                                {article.title}
                                            </a>
                                            <div className="text-sm text-gray-500 mt-1">
                                                {article.description}
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-500">
                                            <FontAwesomeIcon icon={faCalendar} className="mr-1" />
                                            {formatDate(article.published_at)}
                                        </td>
                                        <td className="py-3 px-4">
                                            {article.source}<br/>
                                            {article.url && (
                                                <a 
                                                    href={article.url} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:text-blue-800 underline text-sm flex items-center"
                                                >
                                                    {article.url.length > 30 ? `${article.url.substring(0, 30)}...` : article.url}
                                                    <FontAwesomeIcon icon={faEye} className="ml-1 text-xs" />
                                                </a>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 whitespace-nowrap">
                                            <span className="text-gray-500 text-sm">No</span>
                                        </td>
                                        
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {news.last_page > 1 && (
                        <div className="mt-8 flex justify-center">
                            <div className="flex space-x-1">
                                {/* Previous button */}
                                {parseInt(news.current_page) > 1 && (
                                    <Link
                                        href={route('admin.discord.news', { ...filters, page: parseInt(news.current_page) - 1 })}
                                        className="px-3 py-2 text-sm rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                                    >
                                        Previous
                                    </Link>
                                )}

                                {/* First page */}
                                {parseInt(news.current_page) > 3 && (
                                    <>
                                        <Link
                                            href={route('admin.discord.news', { ...filters, page: 1 })}
                                            className={`px-3 py-2 text-sm rounded ${
                                                parseInt(news.current_page) === 1
                                                    ? 'bg-blue-500 text-white'
                                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                            }`}
                                        >
                                            1
                                        </Link>
                                        {parseInt(news.current_page) > 4 && (
                                            <span className="px-3 py-2 text-sm text-gray-500">...</span>
                                        )}
                                    </>
                                )}

                                {/* Pages around current page */}
                                {Array.from({ length: Math.min(5, news.last_page) }, (_, i) => {
                                    let page;
                                    if (news.last_page <= 5) {
                                        page = i + 1;
                                    } else {
                                        const start = Math.max(1, news.current_page - 2);
                                        const end = Math.min(news.last_page, start + 4);
                                        page = start + i;
                                        if (page > end) return null;
                                    }

                                    // Ensure we're comparing numbers
                                    const currentPage = parseInt(news.current_page);
                                    const pageNumber = parseInt(page);

                                    return (
                                        <Link
                                            key={page}
                                            href={route('admin.discord.news', { ...filters, page })}
                                            className={`px-3 py-2 text-sm rounded ${
                                                pageNumber === currentPage
                                                    ? 'bg-blue-500 text-white'
                                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                            }`}
                                        >
                                            {page}
                                        </Link>
                                    );
                                })}

                                {/* Last page */}
                                {parseInt(news.current_page) < parseInt(news.last_page) - 2 && (
                                    <>
                                        {parseInt(news.current_page) < parseInt(news.last_page) - 3 && (
                                            <span className="px-3 py-2 text-sm text-gray-500">...</span>
                                        )}
                                        <Link
                                            href={route('admin.discord.news', { ...filters, page: news.last_page })}
                                            className={`px-3 py-2 text-sm rounded ${
                                                parseInt(news.current_page) === parseInt(news.last_page)
                                                    ? 'bg-blue-500 text-white'
                                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                            }`}
                                        >
                                            {news.last_page}
                                        </Link>
                                    </>
                                )}

                                {/* Next button */}
                                {parseInt(news.current_page) < parseInt(news.last_page) && (
                                    <Link
                                        href={route('admin.discord.news', { ...filters, page: parseInt(news.current_page) + 1 })}
                                        className="px-3 py-2 text-sm rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                                    >
                                        Next
                                    </Link>
                                )}
                            </div>
                        </div>
                    )}

                    {/* No results message */}
                    {(!news.data || news.data.length === 0) && !news.error && (
                        <div className="text-center py-8">
                            <p className="text-gray-500">No news articles found.</p>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}