import { useState } from 'react';
import { ChevronDown, ArrowUpDown } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SortOption } from '@/types/sales';

interface SortDropdownProps {
  currentSort: SortOption;
  options: SortOption[];
  onSortChange: (option: SortOption) => void;
}

export const SortDropdown = ({
  currentSort,
  options,
  onSortChange,
}: SortDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (option: SortOption) => {
    onSortChange(option);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 px-3 text-xs font-medium border-border bg-card hover:bg-muted"
        >
          <ArrowUpDown className="mr-1.5 h-3 w-3" />
          Sort by: {currentSort.label}
          <ChevronDown className="ml-2 h-3 w-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2" align="end">
        <div className="space-y-1">
          {options.map((option) => {
            const isSelected =
              option.field === currentSort.field &&
              option.direction === currentSort.direction;
            return (
              <button
                key={`${option.field}-${option.direction}`}
                onClick={() => handleSelect(option)}
                className={cn(
                  'w-full px-3 py-2 text-sm rounded-md text-left transition-colors',
                  isSelected
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted text-foreground'
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
};
