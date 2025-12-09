import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { FilterBar } from '@/components/filters/FilterBar';
import { SummaryCards } from '@/components/summary/SummaryCards';
import { SalesTable } from '@/components/table/SalesTable';
import { Pagination } from '@/components/table/Pagination';
import { useSalesData } from '@/hooks/useSalesData';

const Index = () => {
  const {
    data,
    searchQuery,
    handleSearch,
    filters,
    updateFilter,
    clearFilters,
    hasActiveFilters,
    uniqueValues,
    sortOption,
    sortOptions,
    handleSort,
    pagination,
    goToPage,
    goToNextPage,
    goToPrevPage,
    summaryStats,
  } = useSalesData();

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header with Search */}
        <Header searchQuery={searchQuery} onSearchChange={handleSearch} />

        {/* Filter Bar */}
        <FilterBar
          filters={filters}
          uniqueValues={uniqueValues}
          sortOption={sortOption}
          sortOptions={sortOptions}
          onFilterChange={updateFilter}
          onSortChange={handleSort}
          onClearFilters={clearFilters}
          hasActiveFilters={hasActiveFilters}
        />

        {/* Summary Cards */}
        <SummaryCards stats={summaryStats} />

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden flex flex-col bg-card">
          {/* Table */}
          <div className="flex-1 overflow-auto">
            <SalesTable data={data} />
          </div>

          {/* Pagination */}
          <Pagination
            pagination={pagination}
            onPageChange={goToPage}
            onNextPage={goToNextPage}
            onPrevPage={goToPrevPage}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
