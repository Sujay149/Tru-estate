import { FilterDropdown } from './FilterDropdown';
import { AgeRangeFilter } from './AgeRangeFilter';
import { DateRangeFilter } from './DateRangeFilter';
import { SortDropdown } from './SortDropdown';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { FilterState, SortOption } from '@/types/sales';

interface FilterBarProps {
  filters: FilterState;
  uniqueValues: {
    regions: string[];
    genders: string[];
    categories: string[];
    tags: string[];
    paymentMethods: string[];
    ageRange: { min: number; max: number };
  };
  sortOption: SortOption;
  sortOptions: SortOption[];
  onFilterChange: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  onSortChange: (option: SortOption) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export const FilterBar = ({
  filters,
  uniqueValues,
  sortOption,
  sortOptions,
  onFilterChange,
  onSortChange,
  onClearFilters,
  hasActiveFilters,
}: FilterBarProps) => {
  return (
    <div className="bg-card border-b border-border px-6 py-3">
      <div className="flex items-center gap-2 flex-wrap">
        {/* Filter dropdowns */}
        <FilterDropdown
          label="Customer Region"
          options={uniqueValues.regions}
          selectedValues={filters.customerRegion}
          onSelectionChange={(values) => onFilterChange('customerRegion', values)}
        />

        <FilterDropdown
          label="Gender"
          options={uniqueValues.genders}
          selectedValues={filters.gender}
          onSelectionChange={(values) => onFilterChange('gender', values)}
        />

        <AgeRangeFilter
          minAge={uniqueValues.ageRange.min}
          maxAge={uniqueValues.ageRange.max}
          selectedRange={filters.ageRange}
          onRangeChange={(range) => onFilterChange('ageRange', range)}
        />

        <FilterDropdown
          label="Product Category"
          options={uniqueValues.categories}
          selectedValues={filters.productCategory}
          onSelectionChange={(values) => onFilterChange('productCategory', values)}
        />

        <FilterDropdown
          label="Tags"
          options={uniqueValues.tags}
          selectedValues={filters.tags}
          onSelectionChange={(values) => onFilterChange('tags', values)}
        />

        <FilterDropdown
          label="Payment Method"
          options={uniqueValues.paymentMethods}
          selectedValues={filters.paymentMethod}
          onSelectionChange={(values) => onFilterChange('paymentMethod', values)}
        />

        <DateRangeFilter
          selectedRange={filters.dateRange}
          onRangeChange={(range) => onFilterChange('dateRange', range)}
        />

        {/* Spacer */}
        <div className="flex-1" />

        {/* Clear filters button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <X className="mr-1 h-3 w-3" />
            Clear all
          </Button>
        )}

        {/* Sort dropdown */}
        <SortDropdown
          currentSort={sortOption}
          options={sortOptions}
          onSortChange={onSortChange}
        />
      </div>
    </div>
  );
};
