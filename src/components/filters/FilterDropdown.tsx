import { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FilterDropdownProps {
  label: string;
  options: string[];
  selectedValues: string[];
  onSelectionChange: (values: string[]) => void;
}

export const FilterDropdown = ({
  label,
  options,
  selectedValues,
  onSelectionChange,
}: FilterDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOption = (option: string) => {
    if (selectedValues.includes(option)) {
      onSelectionChange(selectedValues.filter((v) => v !== option));
    } else {
      onSelectionChange([...selectedValues, option]);
    }
  };

  const hasSelection = selectedValues.length > 0;

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
          {label}
          {hasSelection && (
            <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-primary text-primary-foreground rounded">
              {selectedValues.length}
            </span>
          )}
          <ChevronDown className="ml-2 h-3 w-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-2" align="start">
        <div className="space-y-1 max-h-60 overflow-y-auto">
          {options.map((option) => {
            const isSelected = selectedValues.includes(option);
            return (
              <button
                key={option}
                onClick={() => toggleOption(option)}
                className={cn(
                  'w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md transition-colors',
                  isSelected
                    ? 'bg-primary/10 text-primary'
                    : 'hover:bg-muted text-foreground'
                )}
              >
                <div
                  className={cn(
                    'w-4 h-4 border rounded flex items-center justify-center',
                    isSelected
                      ? 'bg-primary border-primary'
                      : 'border-border'
                  )}
                >
                  {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                </div>
                <span>{option}</span>
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
};
