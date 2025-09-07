import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { useSelector } from 'react-redux';
import { appLangSelector } from '../../Redux/Layout/selectors';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faCalendar } from '@fortawesome/free-solid-svg-icons';

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

interface FeaturedProps {
    featured: NewsItem[];
}

export default function Featured({ featured }: FeaturedProps) {
    const appLang = useSelector(appLangSelector);

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
        <div className="py-0">
            <Head title="Featured News" />
            
            <div className="p-4 sm:p-8 mb-8 content-data bg-content">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Featured News</h2>
                    <Link
                        href={route('news.index')}
                        className="text-blue-500 hover:text-blue-700"
                    >
                        View All News →
                    </Link>
                </div>

                {featured.length > 0 ? (
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
                                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                                        <Link
                                            href={route('news.show', article.slug)}
                                            className="text-gray-900 hover:text-blue-600"
                                        >
                                            {article.translation?.title}
                                        </Link>
                                    </h3>
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
                ) : (
                    <div className="text-center py-8">
                        <p className="text-gray-500 mb-4">No featured articles available at the moment.</p>
                        <Link
                            href={route('news.index')}
                            className="text-blue-500 hover:text-blue-700"
                        >
                            Browse All News →
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}