import { useState, useMemo, useEffect, useCallback } from 'react';

interface UseTableOptions<T> {
    initialData?: T[];
    fetchData?: () => Promise<T[]>;
    itemsPerPage?: number;
    searchKey?: keyof T;
}

export function useTable<T>({ initialData = [], fetchData, itemsPerPage = 10, searchKey }: UseTableOptions<T>) {
    const [data, setData] = useState<T[]>(initialData);
    const [loading, setLoading] = useState(!!fetchData);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState<string | null>(null);

    const loadData = useCallback(async () => {
        if (!fetchData) return;

        try {
            setLoading(true);
            setError(null);
            const result = await fetchData();
            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Veriler yüklenirken hata oluştu');
        } finally {
            setLoading(false);
        }
    }, [fetchData]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const filteredData = useMemo(() => {
        if (!searchQuery || !searchKey) return data;

        return data.filter(item => {
            const value = item[searchKey];
            if (typeof value === 'string') {
                return value.toLowerCase().includes(searchQuery.toLowerCase());
            }
            return false;
        });
    }, [data, searchQuery, searchKey]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    const currentItems = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredData.slice(start, start + itemsPerPage);
    }, [filteredData, currentPage, itemsPerPage]);

    const goToPage = (page: number) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    };

    const deleteItem = (predicate: (item: T) => boolean) => {
        setData(prev => prev.filter(item => !predicate(item)));
    };

    const updateItem = (predicate: (item: T) => boolean, newData: Partial<T>) => {
        setData(prev => prev.map(item => predicate(item) ? { ...item, ...newData } : item));
    };

    return {
        data: currentItems,
        rawData: data,
        setData,
        loading,
        error,
        refresh: loadData,
        currentPage,
        totalPages,
        searchQuery,
        setSearchQuery,
        goToPage,
        deleteItem,
        updateItem,
        totalItems: filteredData.length,
    };
}
