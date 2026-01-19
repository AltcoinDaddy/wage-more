import { useState } from "react";
import { Card } from "~/components/ui/card";
import { cn } from "~/lib/utils";

type TimeRange = "1D" | "7D" | "1M" | "3M" | "1Y";

interface PortfolioChartProps {
  data?: Array<{ week: string; value: number }>;
}

export function PortfolioChart({ data }: PortfolioChartProps) {
  const [selectedRange, setSelectedRange] = useState<TimeRange>("1M");

  // Mock data for demonstration
  const chartData = data || [
    { week: "W1", value: 15500 },
    { week: "W2", value: 15800 },
    { week: "W3", value: 16200 },
    { week: "W4", value: 16000 },
    { week: "W5", value: 16800 },
    { week: "W6", value: 16500 },
    { week: "W7", value: 17200 },
    { week: "W8", value: 17000 },
    { week: "W9", value: 17500 },
    { week: "W10", value: 17800 },
    { week: "W11", value: 18000 },
    { week: "W12", value: 18430 },
  ];

  const timeRanges: TimeRange[] = ["1D", "7D", "1M", "3M", "1Y"];

  const maxValue = Math.max(...chartData.map((d) => d.value));
  const minValue = Math.min(...chartData.map((d) => d.value));
  const range = maxValue - minValue;

  return (
    <Card className="p-6 bg-card border-border">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">
            Portfolio Performance
          </h3>
          <div className="flex gap-2">
            {timeRanges.map((range) => (
              <button
                key={range}
                onClick={() => setSelectedRange(range)}
                className={cn(
                  "px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200",
                  selectedRange === range
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* Chart */}
        <div className="relative h-64 w-full">
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-muted-foreground pr-2">
            <span>${(maxValue / 1000).toFixed(1)}k</span>
            <span>${((maxValue + minValue) / 2000).toFixed(1)}k</span>
            <span>${(minValue / 1000).toFixed(1)}k</span>
          </div>

          {/* Chart area */}
          <div className="ml-12 h-full relative">
            {/* Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="w-full border-t border-border/30" />
              ))}
            </div>

            {/* Line chart */}
            <svg className="absolute inset-0 w-full h-full overflow-visible">
              <defs>
                <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity="0.3"
                  />
                  <stop
                    offset="100%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity="0"
                  />
                </linearGradient>
              </defs>

              {/* Area fill */}
              <path
                d={`
                  M 0 ${256 - (((chartData[0]?.value ?? minValue) - minValue) / range) * 256}
                  ${chartData
                    .map((d, i) => {
                      const x = (i / (chartData.length - 1)) * 100;
                      const y = 256 - ((d.value - minValue) / range) * 256;
                      return `L ${x}% ${y}`;
                    })
                    .join(" ")}
                  L 100% 256
                  L 0 256
                  Z
                `}
                fill="url(#chartGradient)"
              />

              {/* Line */}
              <path
                d={`
                  M 0 ${256 - (((chartData[0]?.value ?? minValue) - minValue) / range) * 256}
                  ${chartData
                    .map((d, i) => {
                      const x = (i / (chartData.length - 1)) * 100;
                      const y = 256 - ((d.value - minValue) / range) * 256;
                      return `L ${x}% ${y}`;
                    })
                    .join(" ")}
                `}
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="2.5"
                className="drop-shadow-lg"
              />

              {/* Data points */}
              {chartData.map((d, i) => {
                const x = (i / (chartData.length - 1)) * 100;
                const y = 256 - ((d.value - minValue) / range) * 256;
                return (
                  <circle
                    key={i}
                    cx={`${x}%`}
                    cy={y}
                    r="4"
                    fill="hsl(var(--primary))"
                    className="hover:r-6 transition-all cursor-pointer"
                  />
                );
              })}
            </svg>

            {/* X-axis labels */}
            <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-xs text-muted-foreground">
              {chartData
                .filter((_, i) => i % 2 === 0)
                .map((d, i) => (
                  <span key={i}>{d.week}</span>
                ))}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
