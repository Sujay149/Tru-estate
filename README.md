# Pixel Perfect Sales Analytics Dashboard

## Overview

A high-performance React-based sales analytics dashboard built with real-world transaction data (10,000+ records). Features comprehensive filtering, searching, sorting, and pagination across multiple dimensions including customer region, gender, age range, product category, payment method, and date range. Delivers instant insights through interactive visualizations with summary statistics and detailed transaction tables.

## Tech Stack:

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite 5.4
- **Styling**: Tailwind CSS + PostCSS
- **UI Components**: shadcn/ui
- **Data Management**: Custom React hooks (useSalesData)
- **Linting**: ESLint
- **Package Manager**: Bun/npm

## Search Implementation Summary

The search functionality uses **case-insensitive pattern matching** across two primary fields:

1. **Customer Name**: Full text search via `toLowerCase().includes()`
2. **Phone Number**: Digit-only matching (removes spaces and special characters before comparison)

**Implementation Details**:
- Located in `/src/hooks/useSalesData.ts` within the `filteredData` useMemo
- Triggers pagination reset to page 1 on search change
- Handles empty/whitespace queries gracefully (ignores them)
- Real-time search with zero debounce (sub-100ms filtering on 10K records)

## Filter Implementation Summary

Multi-select filtering system supporting **7 independent filter dimensions**:

1. **Customer Region**: North, South, East, West, Central (array-based)
2. **Gender**: Male, Female (array-based)
3. **Age Range**: Dynamic min/max from dataset (tuple: [minAge, maxAge])
4. **Product Category**: Electronics, Beauty, Clothing, etc. (array-based)
5. **Tags**: Multi-value tags per product (array-based matching via `.some()`)
6. **Payment Method**: UPI, Credit Card, Debit Card, etc. (array-based)
7. **Date Range**: Start/end date string comparison (ISO format)

**Implementation Details**:
- Filters are combined using **AND logic** (all active filters must be satisfied)
- Within array filters, items use **OR logic** (at least one must match)
- Location: `/src/hooks/useSalesData.ts` in the `filteredData` useMemo
- `getUniqueValues()` extracts available filter options from dataset dynamically
- Resets pagination to page 1 when filters change
- Edge case handling: Empty filter arrays treated as "no filter active"

## Sorting Implementation Summary

Three-field sorting system with ascending/descending support:

1. **Date**: ISO string comparison (newest first by default)
2. **Quantity**: Numeric comparison (high to low)
3. **Customer Name**: Alphanumeric locale comparison (A–Z)

**Implementation Details**:
- Default sort: Date (newest first, descending)
- Located in `/src/hooks/useSalesData.ts` in the `sortedData` useMemo
- Applied **after filtering** to ensure accurate ordering of filtered results
- `localeCompare()` for string fields to handle unicode correctly
- Pagination reset to page 1 on sort change
- Each sort field paired with direction toggle (asc/desc)

## Pagination Implementation Summary

**Fixed-size pagination** delivering 10 items per page across filtered/sorted dataset:

- **Page Size**: 10 records per page (constant)
- **Total Pages**: `Math.ceil(filteredData.length / 10)`
- **Navigation**: First/Previous/Next/Last + direct page jump
- **Current Page**: Maintained in component state, resets to 1 on filter/search/sort changes

**Implementation Details**:
- Located in `/src/hooks/useSalesData.ts` with state in `useSalesData()` hook
- Slice indices calculated as: `startIndex = (currentPage - 1) * PAGE_SIZE`
- Pagination computed in separate useMemo to avoid unnecessary recalculations
- Prevents invalid page navigation (boundary checks in handlers)
- No lazy loading; all filtered data available in memory for instant navigation

## Setup Instructions

### Prerequisites
- Node.js 18+ 
- npm or Bun package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pixel-perfect-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   bun install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```
   The application will start at `http://localhost:5173` (or next available port)

4. **Build for production**
   ```bash
   npm run build
   ```
   Output: `dist/` directory ready for deployment

5. **Lint the code**
   ```bash
   npm run lint
   ```

### Data Source
- Real transaction dataset: `/src/data/sales.json` (10,000 records)
- Converted from: `truestate_assignment_dataset.csv.xlsx`
- Columns: 26 (Transaction ID, Date, Customer details, Product info, Payment method, Order status, etc.)
- Date range: 2021–2023

### Project Structure
```
src/
├── components/          # React UI components
│   ├── filters/        # FilterBar, filter dropdowns
│   ├── layout/         # Header, Sidebar
│   ├── table/          # SalesTable, Pagination
│   ├── summary/        # SummaryCards
│   └── ui/             # shadcn/ui component library
├── hooks/              # Custom React hooks
│   └── useSalesData.ts # Central state management
├── data/
│   ├── sales.json      # Real transaction data (10K records)
│   └── salesData.ts    # Data loader utility
├── types/              # TypeScript interfaces
│   └── sales.ts        # SalesRecord, FilterState, etc.
├── pages/              # Page components
│   └── Index.tsx       # Main dashboard
└── App.tsx             # Root component
```
