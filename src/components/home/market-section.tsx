import { LayoutGrid, ListFilter, Star, Loader2 } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MarketCard, type MarketType } from "~/components/shared/market-card";
import { getMarketsFn } from "~/server/market";
import { cn } from "~/lib/utils";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "~/components/ui/hover-card";

// --- Types ---
interface Market {
  id: string | number;
  title: string;
  imageSrc: string;
  type: string;
  volume: string;
  comments: number;
  isNew: boolean;
  binaryData?: any;
  multiData?: any;
}

// --- Constants ---
const FILTERS = [
  "All",
  "Wildfire",
  "Breaking News",
  "Canada",
  "Trump Inauguration",
  "Mentions",
  "Creators",
];

// --- Sub-Components ---

const MarketFilters = ({
  activeFilter,
  setActiveFilter,
  isAnimationsEnabled,
  setIsAnimationsEnabled,
}: {
  activeFilter: string;
  setActiveFilter: (f: string) => void;
  isAnimationsEnabled: boolean;
  setIsAnimationsEnabled: (b: boolean) => void;
}) => (
  <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
    {/* Left: Animation Toggle & Tags */}
    <div className="flex items-center gap-4 w-full md:w-auto overflow-x-auto no-scrollbar">
      <button
        onClick={() => setIsAnimationsEnabled(!isAnimationsEnabled)}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border whitespace-nowrap transition-colors",
          isAnimationsEnabled
            ? "bg-blue-500/10 text-blue-400 border-blue-500/50"
            : "bg-slate-800 text-slate-300 border-slate-700 dark:bg-background dark:text-foreground",
        )}
      >
        <span className="relative flex h-2 w-2">
          {isAnimationsEnabled && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
          )}
          <span
            className={cn(
              "relative inline-flex rounded-full h-2 w-2",
              isAnimationsEnabled ? "bg-blue-500" : "bg-slate-500",
            )}
          ></span>
        </span>
        Animations
        <div
          className={cn(
            "w-8 h-4 rounded-full ml-2 relative transition-colors",
            isAnimationsEnabled ? "bg-blue-500" : "bg-slate-600",
          )}
        >
          <div
            className={cn(
              "absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-all",
              isAnimationsEnabled ? "right-0.5" : "left-0.5",
            )}
          />
        </div>
      </button>

      <div className="h-6 w-px bg-slate-700 mx-2" />

      <div className="flex gap-2">
        {FILTERS.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={cn(
              "px-4 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
              activeFilter === filter
                ? "bg-white text-black"
                : "text-slate-400 hover:text-white hover:bg-slate-800",
            )}
          >
            {filter}
          </button>
        ))}
      </div>
    </div>

    {/* Right: Sort & Layout */}
    <div className="flex items-center gap-2 shrink-0">
      <button className="flex items-center gap-2 bg-slate-800 text-white px-3 py-1.5 rounded-lg text-sm border border-slate-700 hover:bg-slate-700">
        <Star className="w-4 h-4 fill-white" />
        Newest
      </button>
      <div className="flex bg-slate-800 rounded-lg border border-slate-700 p-0.5">
        <button className="p-1.5 rounded bg-slate-700 text-white">
          <LayoutGrid size={16} />
        </button>
        <button className="p-1.5 rounded text-slate-400 hover:text-white">
          <ListFilter size={16} />
        </button>
      </div>
    </div>
  </div>
);

const EmptyState = () => (
  <div className="col-span-full py-20 text-center">
    <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-muted">
      <ListFilter className="h-10 w-10 text-muted-foreground" />
    </div>
    <h3 className="mt-4 text-lg font-semibold">No markets found</h3>
    <p className="mb-4 text-muted-foreground">
      Be the first to create a market and start prediction!
    </p>
  </div>
);

const MarketCardWrapper = ({
  market,
  isAnimationsEnabled,
}: {
  market: Market;
  isAnimationsEnabled: boolean;
}) => {
  const Card = (
    <MarketCard
      title={market.title}
      imageSrc={market.imageSrc}
      type={market.type as MarketType}
      volume={market.volume}
      comments={market.comments}
      isNew={market.isNew}
      binaryData={market.binaryData}
      multiData={market.multiData}
    />
  );

  if (!isAnimationsEnabled) return Card;

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <div className="cursor-pointer">{Card}</div>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="flex justify-between space-x-4">
          <div className="space-y-1">
            <h4 className="text-sm font-semibold">{market.title}</h4>
            <p className="text-sm text-muted-foreground line-clamp-3">
              This market tracks the outcome of "{market.title}". Prediction
              involves estimated volume of {market.volume}.
            </p>
            <div className="flex items-center pt-2">
              <span className="text-xs text-muted-foreground">
                Joined by {market.comments} active traders
              </span>
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

const MarketGrid = ({
  markets,
  isAnimationsEnabled,
}: {
  markets: Market[];
  isAnimationsEnabled: boolean;
}) => {
  if (markets.length === 0) return <EmptyState />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {markets.map((market) => (
        <MarketCardWrapper
          key={market.id}
          market={market}
          isAnimationsEnabled={isAnimationsEnabled}
        />
      ))}
    </div>
  );
};

const MarketLoading = () => (
  <div className="w-full h-64 flex items-center justify-center">
    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
  </div>
);

// --- Main Component ---

export const MarketsSection = () => {
  const [activeFilter, setActiveFilter] = useState("All");
  const [isAnimationsEnabled, setIsAnimationsEnabled] = useState(false); // Default off

  const { data: markets = [], isLoading } = useQuery({
    queryKey: ["markets"],
    queryFn: () => getMarketsFn(),
  });

  if (isLoading) return <MarketLoading />;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      <MarketFilters
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        isAnimationsEnabled={isAnimationsEnabled}
        setIsAnimationsEnabled={setIsAnimationsEnabled}
      />
      <MarketGrid
        markets={markets as Market[]}
        isAnimationsEnabled={isAnimationsEnabled}
      />
    </div>
  );
};
