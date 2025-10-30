import React from 'react';
// Remove router import since we're not using it
// import { router } from '@inertiajs/react';

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
    // Generate page numbers to display
    const getPageNumbers = () => {
        const pages = [];
        const delta = 2; // Number of pages to show around current page
        
        // Add first page
        pages.push(1);
        
        // Add ellipsis if needed
        if (currentPage - delta > 2) {
            pages.push('...');
        }
        
        // Add pages around current page
        for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
            pages.push(i);
        }
        
        // Add ellipsis if needed
        if (currentPage + delta < totalPages - 1) {
            pages.push('...');
        }
        
        // Add last page if it's not the same as first
        if (totalPages > 1) {
            pages.push(totalPages);
        }
        
        return pages;
    };

    const paginate = (pageNumber: number) => {
        if (pageNumber >= 1 && pageNumber <= totalPages && pageNumber !== currentPage) {
            onPageChange(pageNumber);
        }
    };

    // Don't show pagination if there's only one page
    if (totalPages <= 1) {
        return null;
    }

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
                                    ? 'bg-[#703ea2] text-white'
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