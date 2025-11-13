import React, { useEffect } from 'react';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useSelector } from 'react-redux';
import { appLangSelector } from '../../Redux/Layout/selectors';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faCalendar, faArrowLeft, faShare } from '@fortawesome/free-solid-svg-icons';

interface NewsTranslation {
    title: string;
    excerpt?: string;
    content: string;
    meta_tags?: {
        description?: string;
        keywords?: string;
        [key: string]: any;
    };
}

interface NewsItem {
    id: number;
    slug: string;
    image_url?: string;
    status: string;
    is_featured: boolean;
    views_count: number;
    created_at: string;
    updated_at: string;
    translation: NewsTranslation;
}

interface NewsShowProps {
    article: NewsItem;
    relatedArticles?: NewsItem[];
}

export default function Show({ article, relatedArticles = [] }: NewsShowProps) {
    const appLang = useSelector(appLangSelector);

    // Increment view count when component mounts
    useEffect(() => {
        // This will be handled by the backend when the page loads
        // but we could also make an AJAX call here if needed
    }, []);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString(appLang === 'ru' ? 'ru-RU' : 'en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: article.translation.title,
                text: article.translation.excerpt || '',
                url: window.location.href,
            });
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(window.location.href);
            // You could show a toast notification here
        }
    };

    const getMetaDescription = () => {
        return article.translation.meta_tags?.description || 
               article.translation.excerpt || 
               article.translation.content.substring(0, 160) + '...';
    };

    const getMetaKeywords = () => {
        return article.translation.meta_tags?.keywords || '';
    };

    return (
        <AuthenticatedLayout header={<Head title={article.translation.title} />}>
            <Head title={article.translation.title}>
                <meta name="description" content={getMetaDescription()} />
                {getMetaKeywords() && <meta name="keywords" content={getMetaKeywords()} />}
                <meta property="og:title" content={article.translation.title} />
                <meta property="og:description" content={getMetaDescription()} />
                {article.image_url && <meta property="og:image" content={article.image_url} />}
                <meta property="og:type" content="article" />
                <meta property="article:published_time" content={article.created_at} />
                <meta property="article:modified_time" content={article.updated_at} />
            </Head>
            
            <div className="py-0">
                <div className="p-4 sm:p-8 mb-8 content-data bg-content">
                    {/* Navigation */}
                    <div className="mb-6">
                        <Link
                          href={route('admin.news.index')}
                          className="inline-flex items-center text-blue-500 hover:text-blue-700"
                        >
                            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                            Back to News
                        </Link>
                    </div>

                    {/* Article Header */}
                    <article className="max-w-4xl mx-auto">
                        <header className="mb-8">
                            {/* Featured badge and status */}
                            <div className="flex items-center gap-2 mb-4">
                                {article.is_featured && (
                                    <span className="bg-yellow-100 text-yellow-800 text-sm px-3 py-1 rounded-full">
                                        Featured
                                    </span>
                                )}
                                <span
                                  className={`text-sm px-3 py-1 rounded-full ${
                                    article.status === 'published' 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-gray-100 text-gray-800'
                                }`}
                                >
                                    {article.status.charAt(0).toUpperCase() + article.status.slice(1)}
                                </span>
                            </div>

                            {/* Title */}
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                                {article.translation.title}
                            </h1>

                            {/* Excerpt */}
                            {article.translation.excerpt && (
                                <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                                    {article.translation.excerpt}
                                </p>
                            )}

                            {/* Meta information */}
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6">
                                <span className="flex items-center">
                                    <FontAwesomeIcon icon={faCalendar} className="mr-2" />
                                    {formatDate(article.created_at)}
                                </span>
                                <span className="flex items-center">
                                    <FontAwesomeIcon icon={faEye} className="mr-2" />
                                    {article.views_count.toLocaleString()} views
                                </span>
                                <button
                                  onClick={handleShare}
                                  className="flex items-center text-blue-500 hover:text-blue-700"
                                >
                                    <FontAwesomeIcon icon={faShare} className="mr-2" />
                                    Share
                                </button>
                            </div>

                            {/* Featured image */}
                            {article.image_url && (
                                <div className="mb-8">
                                    <img
                                      src={article.image_url}
                                      alt={article.translation.title}
                                      className="w-full h-64 md:h-96 object-cover rounded-lg shadow-lg"
                                    />
                                </div>
                            )}
                        </header>

                        {/* Article content */}
                        <div 
                          className="prose prose-lg max-w-none mb-12"
                          dangerouslySetInnerHTML={{ __html: article.translation.content }}
                        />

                        {/* Article footer */}
                        <footer className="border-t pt-8">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-500">
                                    Published on {formatDate(article.created_at)}
                                    {article.updated_at !== article.created_at && (
                                        <span className="ml-2">
                                            • Updated on {formatDate(article.updated_at)}
                                        </span>
                                    )}
                                </div>
                                <button
                                  onClick={handleShare}
                                  className="flex items-center px-4 py-2 text-sm bg-[#703ea2] text-white rounded hover:bg-blue-600"
                                >
                                    <FontAwesomeIcon icon={faShare} className="mr-2" />
                                    Share Article
                                </button>
                            </div>
                        </footer>
                    </article>

                    {/* Related Articles */}
                    {relatedArticles.length > 0 && (
                        <section className="mt-16">
                            <h2 className="text-2xl font-bold mb-8">Related Articles</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {relatedArticles.map((relatedArticle) => (
                                    <div key={relatedArticle.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                                        {relatedArticle.image_url && (
                                            <img
                                              src={relatedArticle.image_url}
                                              alt={relatedArticle.translation.title}
                                              className="w-full h-48 object-cover"
                                            />
                                        )}
                                        <div className="p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                {relatedArticle.is_featured && (
                                                    <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                                                        Featured
                                                    </span>
                                                )}
                                                <span className="text-xs text-gray-500">
                                                    <FontAwesomeIcon icon={faCalendar} className="mr-1" />
                                                    {formatDate(relatedArticle.created_at)}
                                                </span>
                                            </div>
                                            <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                                                <Link
                                                  href={route('news.show', relatedArticle.slug)}
                                                  className="text-gray-900 hover:text-blue-600"
                                                >
                                                    {relatedArticle.translation.title}
                                                </Link>
                                            </h3>
                                            {relatedArticle.translation.excerpt && (
                                                <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                                                    {relatedArticle.translation.excerpt}
                                                </p>
                                            )}
                                            <div className="flex items-center justify-between text-xs text-gray-500">
                                                <span>
                                                    <FontAwesomeIcon icon={faEye} className="mr-1" />
                                                    {relatedArticle.views_count} views
                                                </span>
                                                <Link
                                                  href={route('news.show', relatedArticle.slug)}
                                                  className="text-blue-500 hover:text-blue-700"
                                                >
                                                    Read more →
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}