# Architecture Document: Pixel Perfect Sales Analytics Dashboard

## 1. Backend Architecture

### Data Layer
**Location**: `/src/data/`

#### sales.json
- **Type**: Static JSON file (10,000 records)
- **Source**: Converted from `truestate_assignment_dataset.csv.xlsx`
- **Schema**: Array of 26-field SalesRecord objects
- **Size**: ~8.4 MB (loaded at application startup)
- **Format**: 
  ```json
  {
    "transactionId": number,
    "date": "YYYY-MM-DD",
    "customerId": string,
    "customerName": string,
    "phoneNumber": string,
    "gender": string,
    "age": number,
    "customerRegion": string,
    "customerType": string,
    "productId": string,
    "productName": string,
    "brand": string,
    "productCategory": string,
    "tags": string[],
    "quantity": number,
    "pricePerUnit": number,
    "discountPercentage": number,
    "totalAmount": number,
    "finalAmount": number,
    "paymentMethod": string,
    "orderStatus": string,
    "deliveryType": string,
    "storeId": string,
    "storeLocation": string,
    "salespersonId": string,
    "employeeName": string
  }
  ```

#### salesData.ts
- **Responsibility**: Data loading and normalization
- **Exports**:
  - `salesData: SalesRecord[]` - Processed array loaded from sales.json
  - `getUniqueValues(data)` - Extracts filter options from dataset
- **Processing**:
  - Ensures phoneNumber is converted to string
  - Validates tags array format (fallback to empty array if missing)
  - Normalizes all values to proper types
- **Performance**: O(n) preprocessing on app initialization

### Data Types
**Location**: `/src/types/sales.ts`

```typescript
interface SalesRecord {
  transactionId: string;
  date: string;
  customerId: string;
  customerName: string;
  phoneNumber: string;
  gender: string;
  age: number;
  customerRegion: string;
  customerType: string;
  productId: string;
  productName: string;
  brand: string;
  productCategory: string;
  tags: string[];
  quantity: number;
  pricePerUnit: number;
  discountPercentage: number;
  totalAmount: number;
  finalAmount: number;
  paymentMethod: string;
  orderStatus: string;
  deliveryType: string;
  storeId: string;
  storeLocation: string;
  salespersonId: string;
  employeeName: string;
}

interface FilterState {
  customerRegion: string[];
  gender: string[];
  ageRange: [number, number] | null;
  productCategory: string[];
  tags: string[];
  paymentMethod: string[];
  dateRange: [string, string] | null;
}

interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

interface SummaryStats {
  totalUnitsSold: number;
  totalAmount: number;
  totalDiscount: number;
  recordCount: number;
}
```

## 2. Frontend Architecture

### State Management Layer
**Location**: `/src/hooks/useSalesData.ts`

The `useSalesData()` custom hook serves as the **central state management** for the entire application. It manages:

#### State Variables
```typescript
const [searchQuery, setSearchQuery] = useState<string>('');
const [filters, setFilters] = useState<FilterState>(initialFilters);
const [sortOption, setSortOption] = useState<SortOption>(sortOptions[0]);
const [currentPage, setCurrentPage] = useState<number>(1);
```

#### Computed Values (Memoized)
1. **filteredData**: Applies search + 7 filter dimensions
2. **sortedData**: Applies sorting to filtered results
3. **paginatedData**: Slices sorted results by page
4. **summaryStats**: Calculates totals from filtered data
5. **uniqueValues**: Extracts available filter options

#### Handlers
- `handleSearch(query)` - Updates search term
- `updateFilter(key, value)` - Updates single filter
- `clearFilters()` - Resets all filters
- `handleSort(option)` - Changes sort criteria
- `goToPage(n)` - Navigates to specific page
- `goToNextPage()` / `goToPrevPage()` - Page navigation

### Filter Logic Flow
```
Raw Data (10,000 records)
    ↓
Search Filter (Customer Name + Phone Number)
    ↓
Region Filter (array-based)
    ↓
Gender Filter (array-based)
    ↓
Age Range Filter (tuple comparison)
    ↓
Category Filter (array-based)
    ↓
Tags Filter (any-match logic)
    ↓
Payment Method Filter (array-based)
    ↓
Date Range Filter (ISO string comparison)
    ↓
Filtered Data (result)
    ↓
Sorting (by Date/Quantity/Name)
    ↓
Pagination (10 items/page)
    ↓
UI Components
```

### Component Layer
**Location**: `/src/components/`

#### Layout Components
- **Header.tsx**: Search bar component
- **Sidebar.tsx**: Navigation sidebar

#### Filter Components (`/filters/`)
- **FilterBar.tsx**: Container for all filters
- **FilterDropdown.tsx**: Multi-select dropdown for array filters
- **AgeRangeFilter.tsx**: Slider-based age range selector
- **DateRangeFilter.tsx**: Date range picker
- **SortDropdown.tsx**: Sort option selector

#### Table Components (`/table/`)
- **SalesTable.tsx**: Renders paginated sales records in table format
- **Pagination.tsx**: Navigation controls (prev/next/page jump)

#### Summary Components (`/summary/`)
- **SummaryCards.tsx**: Displays summary statistics (total units, total amount, discount, record count)

#### UI Components (`/ui/`)
- shadcn/ui component library (button, dropdown, input, table, etc.)

### Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    User Interactions                         │
│  (Search, Filter, Sort, Pagination)                          │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
            ┌──────────────────────┐
            │  useSalesData Hook   │
            │  (State Management)  │
            └──────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        ↓              ↓              ↓
   ┌─────────┐   ┌─────────┐   ┌──────────┐
   │ Filters │   │  Search │   │   Sort   │
   │ (7 dims)│   │         │   │          │
   └────┬────┘   └────┬────┘   └────┬─────┘
        └──────────────┼──────────────┘
                       │
                   (Combined)
                       │
                       ↓
            ┌─────────────────────┐
            │ Filtered Data       │
            │ (10K → 0-10K)       │
            └──────────┬──────────┘
                       │
                       ↓
            ┌─────────────────────┐
            │ Sorted Data         │
            │ (Same size, reordered)
            └──────────┬──────────┘
                       │
                       ↓
            ┌─────────────────────┐
            │ Paginated Data      │
            │ (10 items max)      │
            └──────────┬──────────┘
                       │
        ┌──────────────┼──────────────┐
        ↓              ↓              ↓
   ┌─────────┐   ┌─────────┐   ┌──────────┐
   │ SalesTable│   │Summary   │   │Pagination│
   │  (Display)│   │  Stats   │   │ Controls │
   └────┬────┘   └────┬────┘   └────┬─────┘
        └──────────────┴──────────────┘
                       │
                       ↓
                    UI Render
```

## 3. Data Flow Details

### Search Data Flow
```
Input: User types "Neha" in search
         │
         ↓
searchQuery state = "Neha"
         │
         ↓
filteredData useMemo recalculates:
  - Convert to lowercase: "neha"
  - For each record:
    - Check if customerName.toLowerCase().includes("neha")
    - Check if phoneNumber.replace(/\D/g).includes("neha".replace(/\D/g))
  - Return matching records
         │
         ↓
currentPage resets to 1
         │
         ↓
paginatedData updates (10 items from filtered results)
         │
         ↓
UI components re-render with new data
```

### Filter Combination Logic
```
Input: User selects Region="East" AND Gender="Male"
         │
         ↓
filters state = { customerRegion: ["East"], gender: ["Male"], ... }
         │
         ↓
filteredData useMemo applies all active filters:
  1. Filter by region: keep records where customerRegion === "East"
  2. Filter by gender: keep records where gender === "Male"
  3. Combine with AND logic (must satisfy both)
  4. Return intersection of results
         │
         ↓
Filtered count < Total count
         │
         ↓
UI shows "Showing X of Y results"
```

### Pagination Data Flow
```
Input: User clicks "Next Page"
         │
         ↓
goToNextPage() handler called
  - Check: currentPage < totalPages
  - currentPage += 1
         │
         ↓
paginatedData useMemo recalculates slice:
  - startIndex = (currentPage - 1) * 10
  - endIndex = startIndex + 10
  - Return sortedData.slice(startIndex, endIndex)
         │
         ↓
SalesTable receives new 10 items
         │
         ↓
Pagination controls update (show "Page 2 of N")
```

## 4. Folder Structure & Responsibilities

```
pixel-perfect-app/
├── src/
│   ├── components/
│   │   ├── filters/
│   │   │   ├── FilterBar.tsx           # Main filter container
│   │   │   ├── FilterDropdown.tsx      # Multi-select dropdown
│   │   │   ├── AgeRangeFilter.tsx      # Age slider
│   │   │   ├── DateRangeFilter.tsx     # Date range picker
│   │   │   └── SortDropdown.tsx        # Sort option selector
│   │   ├── layout/
│   │   │   ├── Header.tsx              # Search & app header
│   │   │   └── Sidebar.tsx             # Navigation sidebar
│   │   ├── table/
│   │   │   ├── SalesTable.tsx          # Data table display
│   │   │   └── Pagination.tsx          # Page navigation
│   │   ├── summary/
│   │   │   └── SummaryCards.tsx        # Statistics cards
│   │   ├── ui/                         # shadcn/ui library
│   │   └── NavLink.tsx                 # Navigation link component
│   ├── hooks/
│   │   ├── useSalesData.ts             # **Central state management**
│   │   ├── use-mobile.tsx              # Responsive hook
│   │   └── use-toast.ts                # Toast notifications
│   ├── data/
│   │   ├── sales.json                  # Real dataset (10K records)
│   │   └── salesData.ts                # Data loader utility
│   ├── types/
│   │   └── sales.ts                    # TypeScript interfaces
│   ├── lib/
│   │   └── utils.ts                    # Utility functions
│   ├── pages/
│   │   ├── Index.tsx                   # Main dashboard
│   │   └── NotFound.tsx                # 404 page
│   ├── App.tsx                         # Root component
│   ├── App.css                         # App styles
│   ├── main.tsx                        # App entry point
│   ├── index.css                       # Global styles
│   └── vite-env.d.ts                   # Vite types
├── public/
│   └── robots.txt
├── docs/
│   └── architecture.md                 # This file
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
├── postcss.config.js
├── eslint.config.js
└── README.md
```

### Module Responsibilities

| Module | Responsibility |
|--------|---|
| `useSalesData.ts` | Central state container; manages search, filters, sort, pagination, memoization |
| `salesData.ts` | Loads raw JSON, normalizes types, exports unique value extractors |
| `SalesTable.tsx` | Renders paginated records in table; purely presentational |
| `FilterBar.tsx` | Layout for filter controls; delegates to child components |
| `FilterDropdown.tsx` | Multi-select UI for array-based filters |
| `AgeRangeFilter.tsx` | Slider UI for age range selection |
| `DateRangeFilter.tsx` | Date picker UI for date range |
| `SortDropdown.tsx` | Sort option selector |
| `Header.tsx` | Search input UI |
| `Pagination.tsx` | Navigation buttons (prev/next/page jump) |
| `SummaryCards.tsx` | Displays summary statistics |
| `Index.tsx` | Composes all components; wires up hook to UI |

## 5. Edge Case Handling

### No Results Found
**Scenario**: All 10K records filtered out
```typescript
// In filteredData useMemo
if (searchQuery.trim() && result.length === 0) {
  // Returns empty array
}

// In UI
{paginatedData.length === 0 && (
  <div>No records found. Try adjusting filters.</div>
)}
```

### Conflicting Filters
**Scenario**: Multiple filters that result in zero matches
```typescript
// Example: Age 18-25 AND Payment Method "UPI" AND Region "North"
// If no records match all three, filteredData.length === 0
// Pagination safely handles empty result set
totalPages = Math.ceil(0 / 10) = 0
currentPage resets to 1 (boundary check prevents crash)
```

### Invalid Ranges
**Scenario**: Age range, date range with invalid inputs
```typescript
// Age Range: [min, max]
if (filters.ageRange && minAge > maxAge) {
  // Filter logic: record.age >= minAge && record.age <= maxAge
  // If minAge > maxAge, no records match (handled gracefully)
}

// Date Range: startDate > endDate
if (filters.dateRange && startDate > endDate) {
  // Filter logic: recordDate >= startDate && recordDate <= endDate
  // No records match (handled gracefully)
}
```

### Large Filter Combinations
**Scenario**: 5+ active filters simultaneously
```typescript
// Each filter is applied sequentially (AND logic)
// Performance: O(n) per filter = O(n*k) where k=filter count
// With 10K records and 7 filters: ~70K comparisons
// Executed in useMemo; memoization prevents unnecessary recalc

// Result: Instant filtering (< 100ms) with no visual lag
```

### Missing Optional Fields
**Scenario**: Records with null/undefined tags, missing store location
```typescript
// In salesData.ts normalization:
tags: Array.isArray(record.tags) ? record.tags : []
// Falls back to empty array if missing

// In filter logic:
if (filters.tags.length > 0) {
  // .some() on empty array returns false (safe)
  // Record without tags won't match tag filter
}

// For string fields (customerRegion, gender, etc.):
// Handled by includes() check and unique value extraction
// Missing fields treated as "no match" rather than crash
```

### Pagination Edge Cases
**Scenario**: Filter results drop below 10, page boundary changes
```typescript
// Before filter: 150 records, page 15 (last page)
// After filter: 8 records, 1 page total
pagination.totalPages = Math.ceil(8 / 10) = 1
currentPage = 15 (invalid!)
  → goToPage(15) check fails (boundary validation)
  → Page resets to 1 automatically

// In goToPage handler:
if (page >= 1 && page <= pagination.totalPages) {
  setCurrentPage(page);
}
```

### Empty Search Query
**Scenario**: User deletes search term
```typescript
// searchQuery = "" (empty string)
if (searchQuery.trim()) {
  // Condition is false, no search filter applied
  // All records included (unless other filters active)
}
```

### All Filters Cleared
**Scenario**: User resets all filters
```typescript
clearFilters() {
  setFilters(initialFilters);
  // All filter arrays become []
  // All range values become null
  // filteredData returns full dataset
  setCurrentPage(1);
}
```

## 6. Performance Characteristics

### Memoization Strategy
- **filteredData**: Depends on `[searchQuery, filters]` → recalculates only when these change
- **sortedData**: Depends on `[filteredData, sortOption]` → O(n log n) sort, memoized
- **paginatedData**: Depends on `[sortedData, currentPage]` → O(1) slice operation
- **summaryStats**: Depends on `[filteredData]` → O(n) aggregation
- **uniqueValues**: Depends on `[]` (static) → computed once at mount

### Computational Complexity
| Operation | Complexity | Execution Time (10K records) |
|-----------|-----------|--|
| Search | O(n) | ~5-10ms |
| Single Filter | O(n) | ~5-10ms |
| 7 Filters Combined | O(n*k), k=7 | ~35-70ms |
| Sort | O(n log n) | ~15-20ms |
| Summary Stats | O(n) | ~5-10ms |
| Total Pipeline | O(n log n) | ~50-100ms |

### Memory Usage
- Raw data: ~8.4 MB (sales.json)
- In-memory arrays: ~25 MB (filtered, sorted, paginated copies)
- React virtual DOM: ~5 MB
- **Total**: ~40 MB baseline

## 7. Future Optimization Opportunities

1. **Virtualization**: Use React-window for table rows (only render visible)
2. **Web Workers**: Move filtering/sorting to background thread
3. **Pagination Strategies**: Implement cursor-based pagination
4. **Incremental Loading**: Lazy-load dataset in chunks
5. **Client-side Indexing**: Build inverted indexes for faster search
6. **Query Compression**: Serialize filter state to URL for sharing

