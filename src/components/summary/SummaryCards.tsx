import { Info } from 'lucide-react';
import { SummaryStats } from '@/types/sales';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface SummaryCardsProps {
  stats: SummaryStats;
}

const formatCurrency = (value: number): string => {
  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(1)} Cr`;
  } else if (value >= 100000) {
    return `₹${(value / 100000).toFixed(0)} L`;
  } else if (value >= 1000) {
    return `₹${(value / 1000).toFixed(0)}K`;
  }
  return `₹${value.toFixed(0)}`;
};

const formatNumber = (value: number): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
};

export const SummaryCards = ({ stats }: SummaryCardsProps) => {
  const cards = [
    {
      label: 'Total units sold',
      value: formatNumber(stats.totalUnitsSold),
      tooltip: `${stats.totalUnitsSold.toLocaleString()} units`,
    },
    {
      label: 'Total Amount',
      value: formatCurrency(stats.totalAmount),
      subValue: `(${stats.recordCount} SRs)`,
      tooltip: `₹${stats.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
    },
    {
      label: 'Total Discount',
      value: formatCurrency(stats.totalDiscount),
      subValue: `(${stats.recordCount} SRs)`,
      tooltip: `₹${stats.totalDiscount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
    },
  ];

  return (
    <div className="flex gap-4 px-6 py-4 bg-card border-b border-border">
      {cards.map((card, index) => (
        <Tooltip key={index}>
          <TooltipTrigger asChild>
            <div className="summary-card cursor-default min-w-[140px]">
              <div className="summary-card-label">
                {card.label}
                <Info className="w-3 h-3 text-muted-foreground/60" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="summary-card-value">{card.value}</span>
                {card.subValue && (
                  <span className="text-xs text-muted-foreground">{card.subValue}</span>
                )}
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">{card.tooltip}</p>
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
};
