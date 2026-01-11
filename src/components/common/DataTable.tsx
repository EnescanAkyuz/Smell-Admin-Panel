import { type ReactNode } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

export interface Column<T> {
    header: string;
    key: keyof T | string;
    render?: (item: T) => ReactNode;
}

interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    loading?: boolean;
    searchable?: boolean;
    searchQuery?: string;
    onSearchChange?: (query: string) => void;
    pagination?: {
        currentPage: number;
        totalPages: number;
        onPageChange: (page: number) => void;
    };
    emptyMessage?: string;
    actions?: (item: T) => ReactNode;
}

export default function DataTable<T>({
    columns,
    data,
    loading,
    searchable,
    searchQuery,
    onSearchChange,
    pagination,
    emptyMessage = 'Kayıt bulunamadı.',
    actions,
}: DataTableProps<T>) {
    return (
        <div className="data-table-wrapper">
            {searchable && (
                <div className="table-actions mb-lg">
                    <div className="search-input">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Ara..."
                            className="input"
                            value={searchQuery}
                            onChange={(e) => onSearchChange?.(e.target.value)}
                        />
                    </div>
                </div>
            )}

            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            {columns.map((col, idx) => (
                                <th key={idx}>{col.header}</th>
                            ))}
                            {actions && <th className="text-right">İşlemler</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={columns.length + (actions ? 1 : 0)} className="text-center py-xl">
                                    <div className="loading-spinner-sm mx-auto"></div>
                                </td>
                            </tr>
                        ) : data.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length + (actions ? 1 : 0)} className="text-center py-xl text-muted">
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            data.map((item, idx) => (
                                <tr key={idx}>
                                    {columns.map((col, colIdx) => (
                                        <td key={colIdx}>
                                            {col.render ? col.render(item) : (item[col.key as keyof T] as ReactNode)}
                                        </td>
                                    ))}
                                    {actions && (
                                        <td>
                                            <div className="flex justify-end gap-sm">
                                                {actions(item)}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {pagination && pagination.totalPages > 1 && (
                <div className="pagination mt-lg">
                    <button
                        className="pagination-btn"
                        onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
                        disabled={pagination.currentPage === 1}
                    >
                        <ChevronLeft size={18} />
                    </button>
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                            key={page}
                            className={`pagination-btn ${pagination.currentPage === page ? 'active' : ''}`}
                            onClick={() => pagination.onPageChange(page)}
                        >
                            {page}
                        </button>
                    ))}
                    <button
                        className="pagination-btn"
                        onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
                        disabled={pagination.currentPage === pagination.totalPages}
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            )}
        </div>
    );
}
