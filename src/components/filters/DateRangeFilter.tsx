import { useState } from 'react';
import { ChevronDown, Calendar } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface DateRangeFilterProps {
  selectedRange: [string, string] | null;
  onRangeChange: (range: [string, string] | null) => void;
}

export const DateRangeFilter = ({
  selectedRange,
  onRangeChange,
}: DateRangeFilterProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({
    from: selectedRange ? new Date(selectedRange[0]) : undefined,
    to: selectedRange ? new Date(selectedRange[1]) : undefined,
  });

  const handleSelect = (range: { from?: Date; to?: Date } | undefined) => {
    if (range) {
      setDateRange(range);
      if (range.from && range.to) {
        onRangeChange([
          format(range.from, 'yyyy-MM-dd'),
          format(range.to, 'yyyy-MM-dd'),
        ]);
      }
    }
  };

  const clearFilter = () => {
    setDateRange({});
    onRangeChange(null);
    setIsOpen(false);
  };

  const hasSelection = selectedRange !== null;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'h-8 px-3 text-xs font-medium border-border bg-card hover:bg-muted',
            hasSelection && 'border-primary text-primary'
          )}
        >
          <Calendar className="mr-1.5 h-3 w-3" />
          Date
          {hasSelection && (
            <span className="ml-1 text-[10px]">
              ({selectedRange[0]} - {selectedRange[1]})
            </span>
          )}
          <ChevronDown className="ml-2 h-3 w-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3">
          <CalendarComponent
            mode="range"
            selected={{ from: dateRange.from, to: dateRange.to }}
            onSelect={handleSelect}
            numberOfMonths={2}
            defaultMonth={new Date('2023-01-01')}
          />
          <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-border">
            <Button
              size="sm"
              variant="outline"
              onClick={clearFilter}
              className="text-xs"
            >
              Clear
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
