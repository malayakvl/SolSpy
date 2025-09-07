import React from 'react';
import { router } from '@inertiajs/react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    filterType: string;
    onPageChange: (page: number) => void;
}

export default function ValidatorPagination({ 
    currentPage, 
    totalPages, 
    filterType, 
    onPageChange 
}: PaginationProps) {
    // Generate page numbers to display (first 5, ..., last 5)
    const getPageNumbers = () => {
        const pages = [];
        const firstPages = 5; // First 5 pages
        const lastPages = 5; // Last 5 pages

        // Add first 5 pages
        for (let i = 1; i <= Math.min(firstPages, totalPages); i++) {
            pages.push(i);
        }

        // Add ellipsis if there are more pages between first 5 and last 5
        if (totalPages > firstPages + lastPages) {
            pages.push('...');
        }

        // Add last 5 pages
        for (let i = Math.max(firstPages + 1, totalPages - lastPages + 1); i <= totalPages; i++) {
            pages.push(i);
        }

        return pages;
    };

    const paginate = (pageNumber: number) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            onPageChange(pageNumber);
            
            // Update URL with new page number
            const params: any = { page: pageNumber };
            // Only add filterType if it's not 'all' (default)
            if (filterType !== 'all') {
                params.filterType = filterType;
            }
            
            // Add search parameter if it exists in current URL
            const urlParams = new URLSearchParams(window.location.search);
            const searchParam = urlParams.get('search');
            if (searchParam) {
                params.search = searchParam;
            }
            
            router.get('/admin/validators', params, {
                preserveState: true,
                preserveScroll: true,
                replace: true
            });
        }
    };

    return (
        <div className="mt-4 flex justify-center items-center space-x-2 text-[12px]">
            <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-4 py-2 bg-gray-200 text-gray-700 rounded ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-300'}`}
            >
                Previous
            </button>
            {getPageNumbers().map((page, index) => (
                <span key={index}>
                    {page === '...' ? (
                        <span className="px-4 py-2 text-gray-700">...</span>
                    ) : (
                        <button
                            onClick={() => paginate(page as number)}
                            className={`px-4 py-2 rounded ${
                                Number(currentPage) === page
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            {page}
                        </button>
                    )}
                </span>
            ))}
            <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 bg-gray-200 text-gray-700 rounded ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-300'}`}
            >
                Next
            </button>
        </div>
    );
}