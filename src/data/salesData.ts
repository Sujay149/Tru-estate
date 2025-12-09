import { SalesRecord } from '@/types/sales';
import rawSalesData from './sales.json';

// Load real sales data from JSON file
// Normalizes data types and handles missing/invalid fields gracefully
export const salesData: SalesRecord[] = rawSalesData.map(record => ({
  ...record,
  // Ensure phoneNumber is a string (handles numeric phone numbers from JSON)
  phoneNumber: String(record.phoneNumber),
  // Ensure tags is an array (handles missing tags field)
  tags: Array.isArray(record.tags) ? record.tags.filter(t => typeof t === 'string' && t.trim().length > 0) : [],
})) as SalesRecord[];

// Extract unique values for filters
// Returns sorted lists of unique values per dimension, dynamically computed from dataset
// Edge case handling: Empty data returns empty arrays with proper min/max for age range
export const getUniqueValues = (data: SalesRecord[]) => {
  const validAges = data.map(r => r.age).filter(age => typeof age === 'number' && age > 0);
  
  return {
    regions: [...new Set(data.map(r => r.customerRegion).filter(Boolean))].sort(),
    genders: [...new Set(data.map(r => r.gender).filter(Boolean))].sort(),
    categories: [...new Set(data.map(r => r.productCategory).filter(Boolean))].sort(),
    tags: [...new Set(data.flatMap(r => r.tags).filter(Boolean))].sort(),
    paymentMethods: [...new Set(data.map(r => r.paymentMethod).filter(Boolean))].sort(),
    ageRange: {
      min: validAges.length > 0 ? Math.min(...validAges) : 18,
      max: validAges.length > 0 ? Math.max(...validAges) : 65
    }
  };
};
