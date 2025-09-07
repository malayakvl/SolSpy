import React, { useState } from 'react';
import AuthenticatedLayout from '../../../Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useSelector } from 'react-redux';
import { appLangSelector } from '../../../Redux/Layout/selectors';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faEye, 
    faCalendar, 
    faEdit, 
    faTrash, 
    faPlus,
    faStar,
    faEyeSlash
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';

interface NewsItem {
    id: number;
    slug: string;
    image_url?: string;
    status: string;
    is_featured: boolean;
    views_count: number;
    created_at: string;
    updated_at: string;
    translation?: {
        title: string;
        excerpt?: string;
        content: string;
    };
}

interface AdminNewsIndexProps {
    news: {
        data: NewsItem[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters?: {
        search?: string;
        status?: string;
        is_featured?: boolean;
    };
}

export default function AdminIndex({ news, filters = {} }: AdminNewsIndexProps) {
    const appLang = useSelector(appLangSelector);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [featuredFilter, setFeaturedFilter] = useState(filters.is_featured === true ? 'featured' : 'all');
    const [selectedItems, setSelectedItems] = useState<number[]>([]);

    const handleSearch = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        
        const params: any = {};
        
        if (searchTerm) {
            params.search = searchTerm;
        }
        
        if (statusFilter !== 'all') {
            params.status = statusFilter;
        }
        
        if (featuredFilter === 'featured') {
            params.is_featured = '1';
        }
        
        router.get(route('admin.news.index'), params, {
            preserveState: true,
            preserveScroll: true,
            replace: true
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this news article?')) {
            router.delete(route('admin.news.destroy', id), {
                onSuccess: () => {
                    toast.success('News article deleted successfully');
                },
                onError: () => {
                    toast.error('Failed to delete news article');
                }
            });
        }
    };

    const handleBulkAction = (action: string) => {
        if (selectedItems.length === 0) {
            toast.warning('Please select at least one item');
            return;
        }

        if (confirm(`Are you sure you want to ${action} the selected items?`)) {
            router.post(route('admin.news.bulk-action'), {
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

    const toggleSelection = (id: number) => {
        setSelectedItems(prev => 
            prev.includes(id) 
                ? prev.filter(item => item !== id)
                : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        setSelectedItems(
            selectedItems.length === news.data.length 
                ? [] 
                : news.data.map(item => item.id)
        );
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString(appLang === 'ru' ? 'ru-RU' : 'en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            published: { color: 'bg-green-100 text-green-800', label: 'Published' },
            draft: { color: 'bg-gray-100 text-gray-800', label: 'Draft' },
            archived: { color: 'bg-red-100 text-red-800', label: 'Archived' }
        };

        const config = statusConfig[status] || statusConfig.draft;
        return (
            <span className={`px-2 py-1 text-xs rounded-full ${config.color}`}>
                {config.label}
            </span>
        );
    };

    return (
        <AuthenticatedLayout header={<Head title="Manage News" />}>
            <Head title="Manage News" />
            
            <div className="py-0">
                <div className="p-4 sm:p-8 mb-8 content-data bg-content">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold">Manage News</h2>
                        <Link
                            href={route('admin.news.create')}
                            className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            <FontAwesomeIcon icon={faPlus} className="mr-2" />
                            Create News
                        </Link>
                    </div>

                    {/* Search and Filters */}
                    <form onSubmit={handleSearch} className="mb-6">
                        <div className="flex flex-wrap gap-4 items-end">
                            <div className="flex-1 min-w-[200px]">
                                <input
                                    type="text"
                                    placeholder="Search news..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded"
                                />
                            </div>
                            <div>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => {
                                        const newStatus = e.target.value;
                                        setStatusFilter(newStatus);
                                        
                                        // Immediately apply filter
                                        const params: any = {};
                                        
                                        if (searchTerm) {
                                            params.search = searchTerm;
                                        }
                                        
                                        if (newStatus !== 'all') {
                                            params.status = newStatus;
                                        }
                                        
                                        if (featuredFilter === 'featured') {
                                            params.is_featured = '1';
                                        }
                                        
                                        router.get(route('admin.news.index'), params, {
                                            preserveState: true,
                                            preserveScroll: true,
                                            replace: true
                                        });
                                    }}
                                    className="p-2 border border-gray-300 rounded"
                                >
                                    <option value="all">All Status</option>
                                    <option value="published">Published</option>
                                    <option value="draft">Draft</option>
                                    <option value="archived">Archived</option>
                                </select>
                            </div>
                            <div>
                                <select
                                    value={featuredFilter}
                                    onChange={(e) => {
                                        const newFeatured = e.target.value;
                                        setFeaturedFilter(newFeatured);
                                        
                                        // Immediately apply filter
                                        const params: any = {};
                                        
                                        if (searchTerm) {
                                            params.search = searchTerm;
                                        }
                                        
                                        if (statusFilter !== 'all') {
                                            params.status = statusFilter;
                                        }
                                        
                                        if (newFeatured === 'featured') {
                                            params.is_featured = '1';
                                        }
                                        
                                        router.get(route('admin.news.index'), params, {
                                            preserveState: true,
                                            preserveScroll: true,
                                            replace: true
                                        });
                                    }}
                                    className="p-2 border border-gray-300 rounded"
                                >
                                    <option value="all">All Articles</option>
                                    <option value="featured">Featured Only</option>
                                </select>
                            </div>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                                Search
                            </button>
                        </div>
                    </form>

                    {/* Bulk Actions */}
                    {selectedItems.length > 0 && (
                        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-medium">
                                    {selectedItems.length} item(s) selected
                                </span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleBulkAction('publish')}
                                        className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                                    >
                                        Publish
                                    </button>
                                    <button
                                        onClick={() => handleBulkAction('draft')}
                                        className="px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
                                    >
                                        Draft
                                    </button>
                                    <button
                                        onClick={() => handleBulkAction('feature')}
                                        className="px-3 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600"
                                    >
                                        Feature
                                    </button>
                                    <button
                                        onClick={() => handleBulkAction('delete')}
                                        className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* News Table */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
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
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Article
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Views
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Created
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {news.data.map((article) => (
                                    <tr key={article.id} className={selectedItems.includes(article.id) ? 'bg-blue-50' : ''}>
                                        <td className="px-6 py-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedItems.includes(article.id)}
                                                onChange={() => toggleSelection(article.id)}
                                                className="rounded"
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                {article.image_url && (
                                                    <img
                                                        src={article.image_url}
                                                        alt={article.translation?.title}
                                                        className="w-12 h-12 object-cover rounded mr-4"
                                                    />
                                                )}
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {article.translation?.title}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {article.slug}
                                                    </div>
                                                    {article.is_featured && (
                                                        <FontAwesomeIcon icon={faStar} className="text-yellow-400 text-xs mt-1" />
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(article.status)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            <FontAwesomeIcon icon={faEye} className="mr-1" />
                                            {article.views_count.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            <FontAwesomeIcon icon={faCalendar} className="mr-1" />
                                            {formatDate(article.created_at)}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium">
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={route('news.show', article.slug)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                    target="_blank"
                                                >
                                                    <FontAwesomeIcon icon={faEye} />
                                                </Link>
                                                <Link
                                                    href={route('admin.news.edit', article.id)}
                                                    className="text-indigo-600 hover:text-indigo-900"
                                                >
                                                    <FontAwesomeIcon icon={faEdit} />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(article.id)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    <FontAwesomeIcon icon={faTrash} />
                                                </button>
                                            </div>
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
                                {Array.from({ length: news.last_page }, (_, i) => i + 1).map((page) => {
                                    const pageParams: any = { page };
                                    
                                    if (filters.search) {
                                        pageParams.search = filters.search;
                                    }
                                    
                                    if (filters.status && filters.status !== 'all') {
                                        pageParams.status = filters.status;
                                    }
                                    
                                    if (filters.is_featured === true) {
                                        pageParams.is_featured = '1';
                                    }
                                    
                                    return (
                                        <Link
                                            key={page}
                                            href={route('admin.news.index', pageParams)}
                                            className={`px-3 py-2 text-sm rounded ${
                                                page === news.current_page
                                                    ? 'bg-blue-500 text-white'
                                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                            }`}
                                        >
                                            {page}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* No results message */}
                    {news.data.length === 0 && (
                        <div className="text-center py-8">
                            <p className="text-gray-500 mb-4">No news articles found.</p>
                            <Link
                                href={route('admin.news.create')}
                                className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                                Create your first news article
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}