import { SalesRecord } from '@/types/sales';
import { ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SalesTableProps {
  data: SalesRecord[];
  isLoading?: boolean;
}

export const SalesTable = ({ data, isLoading = false }: SalesTableProps) => {
  if (data.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-foreground mb-1">No results found</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Try adjusting your search or filter criteria to find what you're looking for.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="data-table">
        <thead>
          <tr>
            <th>Transaction ID</th>
            <th>Date</th>
            <th>Customer ID</th>
            <th>Customer name</th>
            <th>Phone Number</th>
            <th>Gender</th>
            <th>Age</th>
            <th>Product Category</th>
            <th>Quantity</th>
          </tr>
        </thead>
        <tbody>
          {data.map((record, index) => (
            <tr
              key={record.transactionId + index}
              className={cn(
                'transition-colors animate-fade-in',
                'hover:bg-muted/30'
              )}
              style={{ animationDelay: `${index * 20}ms` }}
            >
              <td className="font-medium text-foreground">{record.transactionId}</td>
              <td className="text-muted-foreground">{record.date}</td>
              <td className="font-medium">{record.customerId}</td>
              <td>{record.customerName}</td>
              <td>
                <div className="flex items-center gap-1.5">
                  <span>{record.phoneNumber}</span>
                  <ExternalLink className="w-3 h-3 text-primary cursor-pointer hover:text-primary/80" />
                </div>
              </td>
              <td>{record.gender}</td>
              <td>{record.age}</td>
              <td>{record.productCategory}</td>
              <td className="font-medium">{record.quantity.toString().padStart(2, '0')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
