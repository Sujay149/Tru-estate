import { useState, useMemo, useCallback } from 'react';
import { SalesRecord, FilterState, SortOption, PaginationState, SummaryStats } from '@/types/sales';
import { salesData, getUniqueValues } from '@/data/salesData';

const PAGE_SIZE = 10;

const initialFilters: FilterState = {
  customerRegion: [],
  gender: [],
  ageRange: null,
  productCategory: [],
  tags: [],
  paymentMethod: [],
  dateRange: null,
};

const sortOptions: SortOption[] = [
  { field: 'date', direction: 'desc', label: 'Date (Newest First)' },
  { field: 'date', direction: 'asc', label: 'Date (Oldest First)' },
  { field: 'quantity', direction: 'desc', label: 'Quantity (High to Low)' },
  { field: 'quantity', direction: 'asc', label: 'Quantity (Low to High)' },
  { field: 'customerName', direction: 'asc', label: 'Customer Name (A–Z)' },
  { field: 'customerName', direction: 'desc', label: 'Customer Name (Z–A)' },
];

export const useSalesData = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [sortOption, setSortOption] = useState<SortOption>(sortOptions[0]);
  const [currentPage, setCurrentPage] = useState(1);

  const uniqueValues = useMemo(() => getUniqueValues(salesData), []);

  // Filter logic
  const filteredData = useMemo(() => {
    let result = [...salesData];

    // Search filter (case-insensitive)
    // Handles empty strings gracefully (trim check prevents no-op filtering)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (record) =>
          record.customerName.toLowerCase().includes(query) ||
          record.phoneNumber.replace(/\s/g, '').includes(query.replace(/\s/g, ''))
      );
    }

    // Region filter: OR logic within array, AND with other filters
    // Edge case: Empty array treated as "no filter active"
    if (filters.customerRegion.length > 0) {
      result = result.filter((record) =>
        filters.customerRegion.includes(record.customerRegion)
      );
    }

    // Gender filter: OR logic within array
    if (filters.gender.length > 0) {
      result = result.filter((record) =>
        filters.gender.includes(record.gender)
      );
    }

    // Age range filter: Tuple comparison with safe boundary checking
    // Edge case: Invalid range (min > max) results in 0 matches (handled gracefully)
    if (filters.ageRange) {
      const [minAge, maxAge] = filters.ageRange;
      result = result.filter(
        (record) => record.age >= minAge && record.age <= maxAge
      );
    }

    // Product category filter: OR logic within array
    if (filters.productCategory.length > 0) {
      result = result.filter((record) =>
        filters.productCategory.includes(record.productCategory)
      );
    }

    // Tags filter: Any-match logic (record satisfies if has ANY selected tag)
    // Edge case: Missing tags array safely handled by empty Array.some() returning false
    if (filters.tags.length > 0) {
      result = result.filter((record) =>
        Array.isArray(record.tags) && record.tags.length > 0 
          ? record.tags.some((tag) => filters.tags.includes(tag))
          : false
      );
    }

    // Payment method filter: OR logic within array
    if (filters.paymentMethod.length > 0) {
      result = result.filter((record) =>
        filters.paymentMethod.includes(record.paymentMethod)
      );
    }

    // Date range filter: ISO string comparison
    // Edge case: Invalid range (startDate > endDate) results in 0 matches
    if (filters.dateRange) {
      const [startDate, endDate] = filters.dateRange;
      result = result.filter((record) => {
        const recordDate = record.date;
        return recordDate >= startDate && recordDate <= endDate;
      });
    }

    return result;
  }, [searchQuery, filters]);

  // Sort logic
  const sortedData = useMemo(() => {
    const sorted = [...filteredData];

    sorted.sort((a, b) => {
      let comparison = 0;

      switch (sortOption.field) {
        case 'date':
          comparison = a.date.localeCompare(b.date);
          break;
        case 'quantity':
          comparison = a.quantity - b.quantity;
          break;
        case 'customerName':
          comparison = a.customerName.localeCompare(b.customerName);
          break;
      }

      return sortOption.direction === 'desc' ? -comparison : comparison;
    });

    return sorted;
  }, [filteredData, sortOption]);

  // Pagination
  const pagination: PaginationState = useMemo(() => {
    const totalItems = sortedData.length;
    const totalPages = Math.ceil(totalItems / PAGE_SIZE);

    return {
      currentPage,
      pageSize: PAGE_SIZE,
      totalItems,
      totalPages,
    };
  }, [sortedData.length, currentPage]);

  // Paginated data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, currentPage]);

  // Summary stats based on filtered data
  const summaryStats: SummaryStats = useMemo(() => {
    return filteredData.reduce(
      (acc, record) => {
        acc.totalUnitsSold += record.quantity;
        acc.totalAmount += record.totalAmount;
        acc.totalDiscount += record.totalAmount - record.finalAmount;
        acc.recordCount += 1;
        return acc;
      },
      { totalUnitsSold: 0, totalAmount: 0, totalDiscount: 0, recordCount: 0 }
    );
  }, [filteredData]);

  // Filter update handlers
  const updateFilter = useCallback(<K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page on filter change
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(initialFilters);
    setCurrentPage(1);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setCurrentPage(1);
  }, []);

  // Pagination handlers with boundary validation
  // Edge case: Invalid page number prevented by boundary checks
  // Edge case: Filter result reduction handled by totalPages update
  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setCurrentPage(page);
    }
    // Silently ignore invalid page numbers (no error thrown)
  }, [pagination.totalPages]);

  // Edge case: Prevents going beyond last page
  const goToNextPage = useCallback(() => {
    if (currentPage < pagination.totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [currentPage, pagination.totalPages]);

  // Edge case: Prevents going below page 1
  const goToPrevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  }, [currentPage]);

  // Search handler
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  }, []);

  // Sort handler
  const handleSort = useCallback((option: SortOption) => {
    setSortOption(option);
    setCurrentPage(1);
  }, []);

  const hasActiveFilters = useMemo(() => {
    return (
      filters.customerRegion.length > 0 ||
      filters.gender.length > 0 ||
      filters.ageRange !== null ||
      filters.productCategory.length > 0 ||
      filters.tags.length > 0 ||
      filters.paymentMethod.length > 0 ||
      filters.dateRange !== null
    );
  }, [filters]);

  return {
    // Data
    data: paginatedData,
    allData: salesData,
    filteredData,
    sortedData,

    // Search
    searchQuery,
    handleSearch,
    clearSearch,

    // Filters
    filters,
    updateFilter,
    clearFilters,
    hasActiveFilters,
    uniqueValues,

    // Sorting
    sortOption,
    sortOptions,
    handleSort,

    // Pagination
    pagination,
    goToPage,
    goToNextPage,
    goToPrevPage,

    // Summary
    summaryStats,
  };
};
