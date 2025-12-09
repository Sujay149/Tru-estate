import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface AgeRangeFilterProps {
  minAge: number;
  maxAge: number;
  selectedRange: [number, number] | null;
  onRangeChange: (range: [number, number] | null) => void;
}

export const AgeRangeFilter = ({
  minAge,
  maxAge,
  selectedRange,
  onRangeChange,
}: AgeRangeFilterProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localRange, setLocalRange] = useState<[number, number]>([minAge, maxAge]);

  useEffect(() => {
    if (selectedRange) {
      setLocalRange(selectedRange);
    } else {
      setLocalRange([minAge, maxAge]);
    }
  }, [selectedRange, minAge, maxAge]);

  const handleSliderChange = (values: number[]) => {
    setLocalRange([values[0], values[1]]);
  };

  const applyFilter = () => {
    if (localRange[0] === minAge && localRange[1] === maxAge) {
      onRangeChange(null);
    } else {
      onRangeChange(localRange);
    }
    setIsOpen(false);
  };

  const clearFilter = () => {
    setLocalRange([minAge, maxAge]);
    onRangeChange(null);
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
          Age Range
          {hasSelection && (
            <span className="ml-1 text-[10px]">
              ({selectedRange[0]}-{selectedRange[1]})
            </span>
          )}
          <ChevronDown className="ml-2 h-3 w-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-4" align="start">
        <div className="space-y-4">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Min: {localRange[0]}</span>
            <span>Max: {localRange[1]}</span>
          </div>
          
          <Slider
            value={localRange}
            min={minAge}
            max={maxAge}
            step={1}
            onValueChange={handleSliderChange}
            className="w-full"
          />

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={clearFilter}
              className="flex-1 text-xs"
            >
              Clear
            </Button>
            <Button
              size="sm"
              onClick={applyFilter}
              className="flex-1 text-xs"
            >
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
