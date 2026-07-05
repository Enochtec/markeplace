import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { PaginationMeta } from '../../types';

interface PaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
}

export default function Pagination({ meta, onPageChange }: PaginationProps) {
  const { page, totalPages, hasNextPage, hasPrevPage } = meta;

  const pages = Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
    const start = Math.max(1, Math.min(page - 2, totalPages - 4));
    return start + i;
  }).filter((p) => p >= 1 && p <= totalPages);

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-1 mt-8">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={!hasPrevPage}
        className="btn-ghost text-xs disabled:opacity-30"
      >
        <ChevronLeft size={15} /> Prev
      </button>

      {pages[0] > 1 && (
        <>
          <button onClick={() => onPageChange(1)}
            className="w-9 h-9 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">1</button>
          {pages[0] > 2 && <span className="text-gray-300 text-sm">...</span>}
        </>
      )}

      {pages.map((p) => (
        <button key={p} onClick={() => onPageChange(p)}
          className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${
            p === page ? 'bg-orange-500 text-white shadow-sm shadow-orange-200' : 'text-gray-600 hover:bg-gray-100'
          }`}>
          {p}
        </button>
      ))}

      {pages[pages.length - 1] < totalPages && (
        <>
          {pages[pages.length - 1] < totalPages - 1 && <span className="text-gray-300 text-sm">...</span>}
          <button onClick={() => onPageChange(totalPages)}
            className="w-9 h-9 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">{totalPages}</button>
        </>
      )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={!hasNextPage}
        className="btn-ghost text-xs disabled:opacity-30"
      >
        Next <ChevronRight size={15} />
      </button>
    </div>
  );
}
