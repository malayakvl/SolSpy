import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useSelector } from 'react-redux';
import { appLangSelector } from '../../Redux/Layout/selectors';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faCalendar, faUser, faPlus, faCog } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

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
        meta_tags?: any;
    };
}

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

interface NewsIndexProps {
    news: {
        data: NewsItem[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    featured?: NewsItem[];
    filters?: {
        search?: string;
        status?: string;
        is_featured?: boolean;
    };
}

export default function Index({ news, featured, filters = {} }: NewsIndexProps) {
    const appLang = useSelector(appLangSelector);
    const { auth } = usePage().props as any;
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [featuredFilter, setFeaturedFilter] = useState(filters.is_featured ? 'featured' : 'all');
    const [topNews, setTopNews] = useState<TopNewsItem[]>([]);
    const [loadingTopNews, setLoadingTopNews] = useState(true);

    // Check if user has admin access
    const userRoles = auth?.user?.roles?.map(role => role.name) || [];
    const isAdmin = userRoles.includes('Admin') || userRoles.includes('Manager');

    // Fetch top news in correct sort order
    useEffect(() => {
        const fetchTopNews = async () => {
            try {
                const response = await axios.get('/api/top-news');
                setTopNews(response.data);
            } catch (error) {
                console.error('Error fetching top news:', error);
            } finally {
                setLoadingTopNews(false);
            }
        };

        fetchTopNews();
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params = {
            search: searchTerm || undefined,
            status: statusFilter !== 'all' ? statusFilter : undefined,
            featured: featuredFilter !== 'all' ? featuredFilter : undefined,
        };
        
        router.get(route('news.index'), params, {
            preserveState: true,
            preserveScroll: true
        });
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
                        <h2 className="text-2xl font-bold">News</h2>
                        {isAdmin && (
                            <div className="flex gap-2">
                                <Link
                                    href="/admin/news/create"
                                    className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                >
                                    <FontAwesomeIcon icon={faPlus} className="mr-2" />
                                    Create News
                                </Link>
                                <Link
                                    href="/admin/news"
                                    className="inline-flex items-center px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                                >
                                    <FontAwesomeIcon icon={faCog} className="mr-2" />
                                    Manage News
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Top News Carousel */}
                    {topNews.length > 0 && (
                        <div className="mb-8">
                            <h3 className="text-xl font-semibold mb-4">Top News</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {topNews.map((article, index) => (
                                    <div key={`${article.type}-${article.id}`} className="bg-white rounded-lg shadow-md overflow-hidden border-2 border-purple-400">
                                        {article.image_url && (
                                            <img
                                                src={article.image_url}
                                                alt={article.title}
                                                className="w-full h-48 object-cover"
                                            />
                                        )}
                                        <div className="p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                                                    Top #{index + 1}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    <FontAwesomeIcon icon={faCalendar} className="mr-1" />
                                                    {formatDate(article.published_at)}
                                                </span>
                                            </div>
                                            <h4 className="font-semibold text-lg mb-2 line-clamp-2">
                                                <a
                                                    href={article.url}
                                                    className="text-gray-900 hover:text-blue-600"
                                                >
                                                    {article.title}
                                                </a>
                                            </h4>
                                            {article.description && (
                                                <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                                                    {truncateText(article.description)}
                                                </p>
                                            )}
                                            <div className="flex items-center justify-between text-xs text-gray-500">
                                                <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                                                    {article.type === 'news' ? 'News' : 'Discord'}
                                                </span>
                                                <a
                                                    href={article.url}
                                                    className="text-blue-500 hover:text-blue-700"
                                                >
                                                    Read more →
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

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
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="p-2 border border-gray-300 rounded"
                                >
                                    <option value="all">All Status</option>
                                    <option value="published">Published</option>
                                    <option value="draft">Draft</option>
                                </select>
                            </div>
                            <div>
                                <select
                                    value={featuredFilter}
                                    onChange={(e) => setFeaturedFilter(e.target.value)}
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

                    {/* Featured News Section */}
                    {featured && featured.length > 0 && (
                        <div className="mb-8">
                            <h3 className="text-xl font-semibold mb-4">Featured News</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {featured.map((article) => (
                                    <div key={article.id} className="bg-white rounded-lg shadow-md overflow-hidden border-2 border-yellow-400">
                                        {article.image_url && (
                                            <img
                                                src={article.image_url}
                                                alt={article.translation?.title}
                                                className="w-full h-48 object-cover"
                                            />
                                        )}
                                        <div className="p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                                                    Featured
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    <FontAwesomeIcon icon={faCalendar} className="mr-1" />
                                                    {formatDate(article.created_at)}
                                                </span>
                                            </div>
                                            <h4 className="font-semibold text-lg mb-2 line-clamp-2">
                                                <Link
                                                    href={route('news.show', article.slug)}
                                                    className="text-gray-900 hover:text-blue-600"
                                                >
                                                    {article.translation?.title}
                                                </Link>
                                            </h4>
                                            {article.translation?.excerpt && (
                                                <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                                                    {truncateText(article.translation.excerpt)}
                                                </p>
                                            )}
                                            <div className="flex items-center justify-between text-xs text-gray-500">
                                                <span>
                                                    <FontAwesomeIcon icon={faEye} className="mr-1" />
                                                    {article.views_count} views
                                                </span>
                                                <Link
                                                    href={route('news.show', article.slug)}
                                                    className="text-blue-500 hover:text-blue-700"
                                                >
                                                    Read more →
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Regular News Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {news.data.map((article) => (
                            <div key={article.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                                {article.image_url && (
                                    <img
                                        src={article.image_url}
                                        alt={article.translation?.title}
                                        className="w-full h-48 object-cover"
                                    />
                                )}
                                <div className="p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`text-xs px-2 py-1 rounded ${
                                            article.status === 'published' 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-gray-100 text-gray-800'
                                        }`}>
                                            {article.status}
                                        </span>
                                        {article.is_featured && (
                                            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                                                Featured
                                            </span>
                                        )}
                                        <span className="text-xs text-gray-500">
                                            <FontAwesomeIcon icon={faCalendar} className="mr-1" />
                                            {formatDate(article.created_at)}
                                        </span>
                                    </div>
                                    <h4 className="font-semibold text-lg mb-2 line-clamp-2">
                                        <Link
                                            href={route('news.show', article.slug)}
                                            className="text-gray-900 hover:text-blue-600"
                                        >
                                            {article.translation?.title}
                                        </Link>
                                    </h4>
                                    {article.translation?.excerpt && (
                                        <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                                            {truncateText(article.translation.excerpt)}
                                        </p>
                                    )}
                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                        <span>
                                            <FontAwesomeIcon icon={faEye} className="mr-1" />
                                            {article.views_count} views
                                        </span>
                                        <Link
                                            href={route('news.show', article.slug)}
                                            className="text-blue-500 hover:text-blue-700"
                                        >
                                            Read more →
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {news.last_page > 1 && (
                        <div className="mt-8 flex justify-center">
                            <div className="flex space-x-1">
                                {Array.from({ length: news.last_page }, (_, i) => i + 1).map((page) => (
                                    <Link
                                        key={page}
                                        href={route('news.index', { ...filters, page })}
                                        className={`px-3 py-2 text-sm rounded ${
                                            page === news.current_page
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                        }`}
                                    >
                                        {page}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* No results message */}
                    {news.data.length === 0 && (
                        <div className="text-center py-8">
                            <p className="text-gray-500">No news articles found.</p>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}