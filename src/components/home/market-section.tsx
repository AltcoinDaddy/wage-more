import { LayoutGrid, ListFilter, Star, Loader2 } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MarketCard, type MarketType } from "~/components/shared/market-card";
import { getMarketsFn } from "~/server/market";

// --- Filter Tags ---
const FILTERS = [
  "All",
  "Wildfire",
  "Breaking News",
  "Canada",
  "Trump Inauguration",
  "Mentions",
  "Creators",
];

export const MarketsSection = () => {
  const [activeFilter, setActiveFilter] = useState("All");

  const { data: markets = [], isLoading } = useQuery({
    queryKey: ["markets"],
    queryFn: () => getMarketsFn(),
  });

  if (isLoading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      {/* --- Filter Bar --- */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        {/* Left: Animation Toggle & Tags */}
        <div className="flex items-center gap-4 w-full md:w-auto overflow-x-auto no-scrollbar">
          <button className="flex items-center gap-2 bg-slate-800 text-slate-300 px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-700 whitespace-nowrap dark:bg-background dark:text-foreground">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Animations
            <div className="w-8 h-4 bg-blue-500 rounded-full ml-2 relative">
              <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full shadow" />
            </div>
          </button>

          <div className="h-6 w-px bg-slate-700 mx-2" />

          <div className="flex gap-2">
            {FILTERS.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  activeFilter === filter
                    ? "bg-white text-black"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
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

      {/* --- The Grid --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {markets.length === 0 ? (
          <div className="col-span-full text-center py-20 text-muted-foreground">
            No markets found. Be the first to create one!
          </div>
        ) : (
          markets.map((market) => (
            <MarketCard
              key={market.id}
              title={market.title}
              imageSrc={market.imageSrc}
              type={market.type as MarketType}
              volume={market.volume}
              comments={market.comments}
              isNew={market.isNew}
              binaryData={market.binaryData}
              multiData={market.multiData}
            />
          ))
        )}
      </div>
    </div>
  );
};
