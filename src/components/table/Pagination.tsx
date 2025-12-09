import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PaginationState } from '@/types/sales';
import { cn } from '@/lib/utils';

interface PaginationProps {
  pagination: PaginationState;
  onPageChange: (page: number) => void;
  onNextPage: () => void;
  onPrevPage: () => void;
}

export const Pagination = ({
  pagination,
  onPageChange,
  onNextPage,
  onPrevPage,
}: PaginationProps) => {
  const { currentPage, totalPages, totalItems, pageSize } = pagination;

  // Calculate visible page numbers
  const getVisiblePages = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  if (totalPages === 0) return null;

  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-card">
      <div className="text-sm text-muted-foreground">
        Showing {startItem}-{endItem} of {totalItems} results
      </div>

      <div className="flex items-center gap-1">
        {/* Previous button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onPrevPage}
          disabled={currentPage === 1}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Page numbers */}
        {getVisiblePages().map((page, index) => {
          if (page === '...') {
            return (
              <span
                key={`ellipsis-${index}`}
                className="px-2 text-muted-foreground"
              >
                ...
              </span>
            );
          }

          return (
            <button
              key={page}
              onClick={() => onPageChange(page as number)}
              className={cn(
                'pagination-btn',
                currentPage === page
                  ? 'pagination-btn-active'
                  : 'pagination-btn-inactive'
              )}
            >
              {page}
            </button>
          );
        })}

        {/* Next button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onNextPage}
          disabled={currentPage === totalPages}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
