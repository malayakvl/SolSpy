import React, { useState } from 'react';
import AuthenticatedLayout from '../../../Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useSelector } from 'react-redux';
import { appLangSelector } from '../../../Redux/Layout/selectors';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faSave, faEye } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import RichTextEditor from '../../../Components/Form/RichTextEditor';

interface NewsFormData {
    slug: string;
    image_url: string;
    status: string;
    is_featured: boolean;
    translations: {
        [key: string]: {
            title: string;
            excerpt: string;
            content: string;
            meta_description: string;
            meta_keywords: string;
        };
    };
}

interface CreateEditProps {
    article?: any;
    isEdit?: boolean;
    languages?: Array<{ code: string; name: string; }>;
}

export default function CreateEdit({ article, isEdit = false, languages = [
    { code: 'en', name: 'English' },
    { code: 'ru', name: 'Русский' }
] }: CreateEditProps) {
    const appLang = useSelector(appLangSelector);
    const [activeTab, setActiveTab] = useState(languages[0]?.code || 'en');
    const [previewMode, setPreviewMode] = useState(false);
    
    const { data, setData, post, put, processing, errors, transform } = useForm<NewsFormData>({
        slug: article?.slug || '',
        image_url: article?.image_url || '',
        status: article?.status || 'draft',
        is_featured: article?.is_featured || false,
        translations: languages.reduce((acc, lang) => {
            const translation = article?.translations?.find(t => t.language === lang.code);
            acc[lang.code] = {
                title: translation?.title || '',
                excerpt: translation?.excerpt || '',
                content: translation?.content || '',
                meta_description: translation?.meta_tags?.description || '',
                meta_keywords: translation?.meta_tags?.keywords || '',
            };
            return acc;
        }, {} as any)
    });

    // Transform the data before submission
    transform((data) => {
        // Filter out empty translations
        const validTranslations = Object.entries(data.translations)
            .filter(([language, translation]) => translation.title.trim() !== '' || translation.content.trim() !== '');
        
        return {
            ...data,
            translations: validTranslations.map(([language, translation]) => {
                const existingTranslation = article?.translations?.find(t => t.language === language);
                return {
                    ...(existingTranslation && { id: existingTranslation.id }),
                    language,
                    title: translation.title,
                    excerpt: translation.excerpt || null,
                    content: translation.content,
                    meta_tags: {
                        description: translation.meta_description || '',
                        keywords: translation.meta_keywords || ''
                    }
                };
            })
        };
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Check if at least one translation has content before submitting
        const validTranslations = Object.entries(data.translations)
            .filter(([language, translation]) => translation.title.trim() !== '' || translation.content.trim() !== '');
        
        if (validTranslations.length === 0) {
            toast.error('At least one translation must be provided!');
            return;
        }

        if (isEdit) {
            put(route('admin.news.update', article.id), {
                onSuccess: () => {
                    toast.success('News article updated successfully!');
                },
                onError: () => {
                    toast.error('Failed to update news article');
                }
            });
        } else {
            post(route('admin.news.store'), {
                onSuccess: () => {
                    toast.success('News article created successfully!');
                },
                onError: () => {
                    toast.error('Failed to create news article');
                }
            });
        }
    };

    const generateSlug = (title: string) => {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim('-');
    };

    const handleTitleChange = (language: string, title: string) => {
        setData('translations', {
            ...data.translations,
            [language]: {
                ...data.translations[language],
                title
            }
        });

        // Auto-generate slug from English title if it's empty
        if (language === 'en' && !data.slug) {
            setData('slug', generateSlug(title));
        }
    };

    const previewUrl = data.slug ? route('news.show', data.slug) : '#';

    return (
        <AuthenticatedLayout header={<Head title={isEdit ? 'Edit News' : 'Create News'} />}>
            <Head title={isEdit ? 'Edit News' : 'Create News'} />
            
            <div className="py-0">
                <div className="p-4 sm:p-8 mb-8 content-data bg-content">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-4">
                            <Link
                                href={route('admin.news.index')}
                                className="inline-flex items-center text-blue-500 hover:text-blue-700"
                            >
                                <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                                Back to News
                            </Link>
                            <h2 className="text-2xl font-bold">
                                {isEdit ? 'Edit News Article' : 'Create News Article'}
                            </h2>
                        </div>
                        <div className="flex gap-2">
                            {data.slug && (
                                <a
                                    href={previewUrl}
                                    target="_blank"
                                    className="inline-flex items-center px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                                >
                                    <FontAwesomeIcon icon={faEye} className="mr-2" />
                                    Preview
                                </a>
                            )}
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* General Settings */}
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h3 className="text-lg font-semibold mb-4">General Settings</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Slug *
                                    </label>
                                    <input
                                        type="text"
                                        value={data.slug}
                                        onChange={(e) => setData('slug', e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                    {errors.slug && <p className="text-red-500 text-xs mt-1">{errors.slug}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Status
                                    </label>
                                    <select
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="draft">Draft</option>
                                        <option value="published">Published</option>
                                        <option value="archived">Archived</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Featured Image URL
                                    </label>
                                    <input
                                        type="url"
                                        value={data.image_url}
                                        onChange={(e) => setData('image_url', e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="https://example.com/image.jpg"
                                    />
                                    {errors.image_url && <p className="text-red-500 text-xs mt-1">{errors.image_url}</p>}
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="is_featured"
                                        checked={data.is_featured}
                                        onChange={(e) => setData('is_featured', e.target.checked)}
                                        className="rounded"
                                    />
                                    <label htmlFor="is_featured" className="ml-2 text-sm font-medium text-gray-700">
                                        Featured Article
                                    </label>
                                </div>
                            </div>

                            {/* Image preview */}
                            {data.image_url && (
                                <div className="mt-4">
                                    <p className="text-sm font-medium text-gray-700 mb-2">Image Preview:</p>
                                    <img
                                        src={data.image_url}
                                        alt="Preview"
                                        className="w-48 h-32 object-cover rounded border"
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                        }}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Language Tabs */}
                        <div className="bg-white rounded-lg shadow">
                            <div className="border-b">
                                <nav className="flex space-x-8 px-6">
                                    {languages.map((language) => (
                                        <button
                                            key={language.code}
                                            type="button"
                                            onClick={() => setActiveTab(language.code)}
                                            className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                                activeTab === language.code
                                                    ? 'border-blue-500 text-blue-600'
                                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            }`}
                                        >
                                            {language.name}
                                            {data.translations[language.code]?.title && (
                                                <span className="ml-2 inline-block w-2 h-2 bg-green-400 rounded-full"></span>
                                            )}
                                        </button>
                                    ))}
                                </nav>
                            </div>

                            {/* Language Content */}
                            <div className="p-6">
                                {languages.map((language) => (
                                    <div
                                        key={language.code}
                                        className={activeTab === language.code ? 'block' : 'hidden'}
                                    >
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Title *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={data.translations[language.code]?.title || ''}
                                                    onChange={(e) => handleTitleChange(language.code, e.target.value)}
                                                    className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                                                    required={language.code === 'en'}
                                                />
                                                {errors[`translations.${language.code}.title`] && (
                                                    <p className="text-red-500 text-xs mt-1">
                                                        {errors[`translations.${language.code}.title`]}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Excerpt
                                                </label>
                                                <textarea
                                                    value={data.translations[language.code]?.excerpt || ''}
                                                    onChange={(e) => setData('translations', {
                                                        ...data.translations,
                                                        [language.code]: {
                                                            ...data.translations[language.code],
                                                            excerpt: e.target.value
                                                        }
                                                    })}
                                                    rows={3}
                                                    className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder="Brief description of the article..."
                                                />
                                            </div>

                                            <div>
                                                <div className="flex justify-between items-center mb-2">
                                                    <label className="block text-sm font-medium text-gray-700">
                                                        Content *
                                                    </label>
                                                    <button
                                                        type="button"
                                                        onClick={() => setPreviewMode(!previewMode)}
                                                        className="px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
                                                    >
                                                        {previewMode ? 'Edit' : 'Preview'}
                                                    </button>
                                                </div>
                                                
                                                {previewMode ? (
                                                    <div 
                                                        className="w-full p-4 border border-gray-300 rounded min-h-[600px] bg-gray-50 prose max-w-none"
                                                        dangerouslySetInnerHTML={{ 
                                                            __html: data.translations[language.code]?.content || '<p class="text-gray-500 italic">No content to preview</p>' 
                                                        }}
                                                    />
                                                ) : (
                                                    <RichTextEditor
                                                        value={data.translations[language.code]?.content || ''}
                                                        onChange={(content) => setData('translations', {
                                                            ...data.translations,
                                                            [language.code]: {
                                                                ...data.translations[language.code],
                                                                content: content
                                                            }
                                                        })}
                                                        placeholder="Article content..."
                                                        height={600}
                                                    />
                                                )}
                                                
                                                {errors[`translations.${language.code}.content`] && (
                                                    <p className="text-red-500 text-xs mt-1">
                                                        {errors[`translations.${language.code}.content`]}
                                                    </p>
                                                )}
                                            </div>

                                            {/* SEO Settings */}
                                            <div className="border-t pt-4">
                                                <h4 className="text-md font-semibold mb-3">SEO Settings</h4>
                                                
                                                <div className="space-y-3">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Meta Description
                                                        </label>
                                                        <textarea
                                                            value={data.translations[language.code]?.meta_description || ''}
                                                            onChange={(e) => setData('translations', {
                                                                ...data.translations,
                                                                [language.code]: {
                                                                    ...data.translations[language.code],
                                                                    meta_description: e.target.value
                                                                }
                                                            })}
                                                            rows={2}
                                                            maxLength={160}
                                                            className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                                                            placeholder="Brief description for search engines (max 160 characters)..."
                                                        />
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {(data.translations[language.code]?.meta_description || '').length}/160 characters
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Meta Keywords
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={data.translations[language.code]?.meta_keywords || ''}
                                                            onChange={(e) => setData('translations', {
                                                                ...data.translations,
                                                                [language.code]: {
                                                                    ...data.translations[language.code],
                                                                    meta_keywords: e.target.value
                                                                }
                                                            })}
                                                            className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                                                            placeholder="keyword1, keyword2, keyword3..."
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end gap-4">
                            <Link
                                href={route('admin.news.index')}
                                className="px-6 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                            >
                                <FontAwesomeIcon icon={faSave} className="mr-2" />
                                {processing ? 'Saving...' : (isEdit ? 'Update Article' : 'Create Article')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}