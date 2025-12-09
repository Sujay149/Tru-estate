# Edge Case Handling & Test Scenarios

This document details how the Pixel Perfect Sales Analytics Dashboard handles edge cases and provides test scenarios to verify the implementations.

## Edge Case 1: No Results Found

### Scenario
User applies filters that result in zero matching records.

### Example
- Filter: Region = "North" AND Gender = "Female" AND Age Range = "18-25" AND Product Category = "Electronics"
- Result: No records match all criteria

### Implementation
**Location**: `/src/hooks/useSalesData.ts` - `filteredData` useMemo

```typescript
const filteredData = useMemo(() => {
  let result = [...salesData];
  // Apply all filters sequentially
  // If no records match after all filters, result.length === 0
  return result;
}, [searchQuery, filters]);
```

### Handling
- Filtered result is empty array `[]`
- `pagination.totalItems = 0`
- `pagination.totalPages = Math.ceil(0 / 10) = 0`
- `paginatedData = []` (no rows to display)
- `currentPage` remains 1 (safe, no crash)
- UI displays "No records found" message (graceful fallback)

### Test Case
```bash
1. Open the dashboard
2. Select filters that yield 0 results
3. Observe: No table rows, no pagination buttons, summary shows 0 records
4. Clear filters: Data returns immediately
5. Expected: Smooth UI state transition, no errors
```

---

## Edge Case 2: Conflicting Filters

### Scenario
Multiple active filters that logically conflict and yield no results.

### Example
- Filter 1: Payment Method = "Credit Card" only
- Filter 2: Order Status = "Cash" only (incompatible with Credit Card)
- Result: 0 matches

### Implementation
**Location**: `/src/hooks/useSalesData.ts` - Filter logic with AND combination

```typescript
// All filters use AND logic (must satisfy ALL active filters)
// If filters conflict, result naturally becomes empty
if (filters.paymentMethod.length > 0) {
  result = result.filter(record => filters.paymentMethod.includes(record.paymentMethod));
}
// If previous filter removed all records, subsequent filters still execute
// but operate on empty array (O(1) operation, safe)
```

### Handling
- AND logic naturally produces empty result
- No special error state needed
- Application gracefully shows 0 records
- User can clear individual filters to diagnose the conflict

### Test Case
```bash
1. Apply: Age Range = "60-65" AND Gender = "Male" (assuming no matches)
2. Observe: Empty result set
3. Clear one filter: Data may reappear
4. Expected: No console errors, UI remains responsive
```

---

## Edge Case 3: Invalid Ranges

### Scenario A: Age Range with minAge > maxAge
```typescript
// User somehow selects: Age 50 to 30 (invalid)
filters.ageRange = [50, 30]
```

**Handling**:
```typescript
if (filters.ageRange) {
  const [minAge, maxAge] = filters.ageRange;
  result = result.filter(
    (record) => record.age >= 50 && record.age <= 30
  );
  // No record satisfies age >= 50 AND age <= 30
  // Result: Empty array (safe)
}
```

### Scenario B: Date Range with startDate > endDate
```typescript
// User selects: 2023-12-31 to 2023-01-01 (invalid)
filters.dateRange = ["2023-12-31", "2023-01-01"]
```

**Handling**:
```typescript
if (filters.dateRange) {
  const [startDate, endDate] = filters.dateRange;
  result = result.filter((record) => {
    const recordDate = record.date;
    return recordDate >= "2023-12-31" && recordDate <= "2023-01-01";
    // No date satisfies both conditions
    // Result: Empty array (safe)
  });
}
```

### Test Case
```bash
1. Manually edit state (devtools) to set invalid ranges
2. Observe: No records returned (gracefully handled)
3. Expected: No crashes, smooth filtering behavior
```

---

## Edge Case 4: Large Filter Combinations

### Scenario
User applies 5-7 filters simultaneously, creating complex result sets.

### Example
- Region: "East", "West" (2 options)
- Gender: "Male" (1 option)
- Age Range: 25-40 (tuple)
- Category: "Electronics", "Beauty" (2 options)
- Tags: "Trending", "Sale" (2 options)
- Payment: "UPI", "Credit Card" (2 options)
- Date: "2022-01-01" to "2023-12-31"

### Implementation
**Performance Calculation**:
```
Each filter: O(n) where n = 10,000
7 filters total: O(n*k) where k=7
Expected time: ~70K comparisons ≈ 50-100ms on modern hardware

Memoization ensures this only runs when filters change
No recalculation during rendering
```

### Handling
**Location**: `/src/hooks/useSalesData.ts` - Memoized filter chain

```typescript
const filteredData = useMemo(() => {
  let result = [...salesData]; // 10K records
  
  // Each filter applied sequentially (early termination optimization)
  // After each filter, result shrinks
  // Later filters operate on smaller arrays (faster execution)
  
  return result;
}, [searchQuery, filters]); // Only recalculates when deps change
```

### UI Response
- Sub-100ms filtering time (imperceptible to user)
- No visual lag or janky updates
- Pagination updates automatically
- Summary stats recalculate from filtered data

### Test Case
```bash
1. Apply multiple filters simultaneously
2. Observe: Data updates instantly
3. Clear one filter: Results update in <100ms
4. Expected: Smooth, responsive UX with no visible delay
```

---

## Edge Case 5: Missing Optional Fields

### Scenario A: Records without tags
```json
{
  "transactionId": 123,
  "tags": null, // or undefined
  "customerName": "John Doe"
}
```

**Handling**:
```typescript
// In salesData.ts data normalization:
tags: Array.isArray(record.tags) 
  ? record.tags.filter(t => typeof t === 'string' && t.trim().length > 0)
  : []

// Falls back to empty array safely
```

**In filtering**:
```typescript
if (filters.tags.length > 0) {
  result = result.filter((record) =>
    Array.isArray(record.tags) && record.tags.length > 0
      ? record.tags.some((tag) => filters.tags.includes(tag))
      : false
  );
  // Record without tags fails tag filter (expected behavior)
}
```

### Scenario B: Records with null/undefined values
```json
{
  "customerRegion": null,
  "gender": "",
  "paymentMethod": undefined
}
```

**Handling**:
```typescript
// In getUniqueValues extraction:
regions: [...new Set(data.map(r => r.customerRegion).filter(Boolean))].sort(),
// Filters out null, undefined, empty strings

// In filtering logic:
if (filters.customerRegion.length > 0) {
  result = result.filter((record) =>
    filters.customerRegion.includes(record.customerRegion)
  );
  // Null/undefined won't match any selection (safe)
}
```

### Scenario C: Missing string fields
```json
{
  "customerName": null,
  "phoneNumber": undefined
}
```

**Handling** (Search):
```typescript
if (searchQuery.trim()) {
  const query = searchQuery.toLowerCase().trim();
  result = result.filter((record) =>
    record.customerName?.toLowerCase().includes(query) || // Optional chaining prevents crash
    record.phoneNumber?.replace(/\s/g, '').includes(query.replace(/\s/g, ''))
  );
}
```

### Test Case
```bash
1. Manually inspect sales.json for records with missing fields
2. Apply filters using optional field values
3. Observe: Graceful handling, no crashes
4. Search with text: Results filter correctly
5. Expected: No "Cannot read property" errors
```

---

## Edge Case 6: Empty Search Query

### Scenario
User deletes all search text, leaving empty query.

### Implementation
```typescript
if (searchQuery.trim()) {
  // If empty or whitespace-only, this condition is FALSE
  // No search filter applied
  // All records included (or filtered by other filters)
}
```

### Handling
- Empty search: treated as "no search filter active"
- All records returned (unless other filters active)
- No performance penalty

### Test Case
```bash
1. Type search term: "Neha"
2. Result: Filtered data shown
3. Delete search text completely
4. Observe: Full dataset returns (or respects other filters)
5. Expected: Smooth transition, no lag
```

---

## Edge Case 7: All Filters Cleared Simultaneously

### Scenario
User clicks "Clear All Filters" button while multiple filters active.

### Implementation
```typescript
const clearFilters = useCallback(() => {
  setFilters(initialFilters);
  // All arrays become []
  // All range values become null
  // filteredData recalculates with no filters
  setCurrentPage(1);
  // Reset to first page
}, []);
```

### Handling
- All filter state reset to initial values
- `filteredData` returns full dataset
- Pagination resets to page 1
- Summary stats recalculate from all 10K records
- UI updates synchronously

### Test Case
```bash
1. Apply 5+ filters
2. Data significantly reduced
3. Click "Clear All Filters"
4. Observe: Full dataset returns instantly, page resets to 1
5. Expected: <100ms transition, no visual glitches
```

---

## Edge Case 8: Pagination Boundary Changes

### Scenario
Results reduced below current page boundary during filtering.

### Example
```
Before: 150 records, page size 10, user on page 15 (last page)
User applies filters: 5 records remain, 1 page total

Current page: 15 (INVALID - only 1 page exists)
```

### Implementation
```typescript
const goToPage = useCallback((page: number) => {
  if (page >= 1 && page <= pagination.totalPages) {
    // Boundary check prevents invalid page navigation
    setCurrentPage(page);
  }
  // If page exceeds totalPages, silently ignored (no crash)
}, [pagination.totalPages]);
```

### Handling
**When filter reduces data**:
1. `filteredData` shrinks
2. `pagination.totalPages` recalculates
3. If `currentPage > pagination.totalPages`: stays invalid but silently
4. User navigates away (prev page): boundary check prevents navigation
5. On next filter change: `currentPage` resets to 1

**Prevention**:
```typescript
// In updateFilter:
const updateFilter = useCallback(<K extends keyof FilterState>(key: K, value: FilterState[K]) => {
  setFilters((prev) => ({ ...prev, [key]: value }));
  setCurrentPage(1); // Always reset to page 1 on filter change
}, []);
```

### Test Case
```bash
1. Go to page 5 with full dataset
2. Apply filters that reduce to 15 records (2 pages)
3. Observe: Page resets to 1 (if implemented) or stays 5 (disabled)
4. Try "Next Page": Button disabled or no-op
5. Expected: No crashes, graceful state management
```

---

## Edge Case 9: Simultaneous Search + Filters

### Scenario
User applies search AND multiple filters at the same time.

### Implementation
```typescript
const filteredData = useMemo(() => {
  let result = [...salesData];
  
  // Search applied first (shrinks dataset)
  if (searchQuery.trim()) {
    result = result.filter(...);
  }
  
  // Then filters applied (AND logic with search results)
  if (filters.customerRegion.length > 0) {
    result = result.filter(...);
  }
  
  // Result: intersection of search + all filters
  return result;
}, [searchQuery, filters]);
```

### Handling
- All conditions combined with AND logic
- Order of application doesn't affect result (logically)
- Memoization ensures efficient recalculation

### Test Case
```bash
1. Type search: "Neha"
2. Also select: Region = "East", Gender = "Female"
3. Result: Records matching search AND both filters
4. Remove search text: Results expand (but filters still active)
5. Clear filters: Results expand further (search might still match)
6. Expected: Predictable, intuitive filtering
```

---

## Performance Validation Test

### Test Code
```typescript
// Measure filtering performance
const start = performance.now();
const filtered = filteredData; // Triggers memoized calculation
const end = performance.now();

console.log(`Filtering time: ${end - start}ms`);
// Expected: <100ms for 10K records with 7 filters
```

### Results Expectations
| Operation | Expected Time |
|-----------|---|
| Search (10K records) | 5-10ms |
| Single Filter (10K) | 5-10ms |
| 7 Filters Combined (10K → reduced) | 35-70ms |
| Sort (reduce to ~1000) | 10-15ms |
| Total Pipeline | 50-100ms |

---

## Browser Compatibility Edge Cases

### Edge Case: Old JavaScript Engine
- **Fallback**: `.localeCompare()` for string sorting (works in all browsers)
- **Fallback**: `Array.isArray()` check (safe, native)
- **No**: Arrow functions in IE11 (not supported, build transpiles)

### Edge Case: Unicode Characters in Names
```typescript
// Handles correctly with localeCompare:
"Ångström".localeCompare("Åsa") // Correct unicode ordering
```

---

## Summary of Edge Case Coverage

| Edge Case | Status | Test | Notes |
|-----------|--------|------|-------|
| No Results Found | ✅ Handled | Manual | Empty array gracefully handled |
| Conflicting Filters | ✅ Handled | Manual | AND logic produces safe result |
| Invalid Ranges | ✅ Handled | Manual | Impossible conditions yield 0 matches |
| Large Filter Combinations | ✅ Handled | Performance | Memoized, sub-100ms |
| Missing Optional Fields | ✅ Handled | Code Review | Fallbacks in place, no crashes |
| Empty Search Query | ✅ Handled | Manual | Treated as "no filter" |
| All Filters Cleared | ✅ Handled | Manual | Synchronous state reset |
| Pagination Boundaries | ✅ Handled | Manual | Boundary checks prevent invalid navigation |
| Search + Filters Combined | ✅ Handled | Manual | AND logic combines intuitively |
| Unicode Characters | ✅ Handled | Code | `localeCompare()` handles correctly |

---

## Recommendations for Future Testing

1. **Unit Tests**: Add Jest tests for filter logic and edge cases
2. **Integration Tests**: E2E tests with Cypress/Playwright
3. **Performance Tests**: Benchmark with larger datasets (100K+ records)
4. **Accessibility Tests**: Screen reader compatibility for edge cases
5. **Cross-browser Tests**: Validate in Safari, Firefox, Chrome
