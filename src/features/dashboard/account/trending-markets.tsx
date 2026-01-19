import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Search, Sparkles } from "lucide-react";
import { MarketCard, type MarketType } from "~/components/shared/market-card";

interface TrendingMarket {
    id: string;
    title: string;
    imageSrc: string;
    type: MarketType;
    volume: string;
    comments: number;
    isNew?: boolean;
    binaryData?: {
        yes: { label: string; value: number; change?: number };
        no: { label: string; value: number; change?: number };
    };
    multiData?: Array<{
        label: string;
        yes: number;
        no: number;
    }>;
}

interface TrendingMarketsProps {
    markets?: TrendingMarket[];
}

export function TrendingMarkets({ markets }: TrendingMarketsProps) {
    // Mock data using MarketCard format
    const defaultMarkets: TrendingMarket[] = [
        {
            id: "1",
            title: "Will Bitcoin reach $100k by end of 2024?",
            imageSrc: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=100&h=100&fit=crop",
            type: "binary",
            volume: "$125k",
            comments: 234,
            isNew: true,
            binaryData: {
                yes: { label: "Yes", value: 67, change: 5 },
                no: { label: "No", value: 33 },
            },
        },
        {
            id: "2",
            title: "Will Apple announce AR glasses in 2024?",
            imageSrc: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=100&h=100&fit=crop",
            type: "binary",
            volume: "$89k",
            comments: 156,
            binaryData: {
                yes: { label: "Yes", value: 54, change: 3 },
                no: { label: "No", value: 46 },
            },
        },
        {
            id: "3",
            title: "Which AI company will reach $1T valuation first?",
            imageSrc: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=100&h=100&fit=crop",
            type: "multiple",
            volume: "$67k",
            comments: 189,
            multiData: [
                { label: "OpenAI", yes: 45, no: 55 },
                { label: "Anthropic", yes: 32, no: 68 },
                { label: "Google DeepMind", yes: 38, no: 62 },
            ],
        },
        {
            id: "4",
            title: "Will Tesla stock reach $300 by Q2 2024?",
            imageSrc: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=100&h=100&fit=crop",
            type: "binary",
            volume: "$52k",
            comments: 98,
            binaryData: {
                yes: { label: "Yes", value: 41 },
                no: { label: "No", value: 59, change: 2 },
            },
        },
    ];

    const displayMarkets = markets || defaultMarkets;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold text-foreground">
                        Trending Markets
                    </h3>
                </div>
                <Button variant="ghost" size="sm" className="gap-2">
                    <Search size={16} />
                    View All
                </Button>
            </div>

            {/* Markets grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayMarkets.map((market) => (
                    <MarketCard
                        key={market.id}
                        title={market.title}
                        imageSrc={market.imageSrc}
                        type={market.type}
                        volume={market.volume}
                        comments={market.comments}
                        isNew={market.isNew}
                        binaryData={market.binaryData}
                        multiData={market.multiData}
                    />
                ))}
            </div>
        </div>
    );
}
