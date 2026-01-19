import { Card } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";

interface Market {
    id: string;
    question: string;
    bet: "Yes" | "No";
    amount: number;
    currentPrice: number;
    expiresIn: string;
}

interface ActiveMarketsProps {
    markets?: Market[];
}

export function ActiveMarkets({ markets }: ActiveMarketsProps) {
    // Mock data
    const defaultMarkets: Market[] = [
        {
            id: "1",
            question: "Will TSLA stock reach $200 by EOW?",
            bet: "Yes",
            amount: 150,
            currentPrice: 185.5,
            expiresIn: "2d 4h",
        },
        {
            id: "2",
            question: "Will ETH break $4,000 in November?",
            bet: "No",
            amount: 200,
            currentPrice: 3850.12,
            expiresIn: "15d 11h",
        },
    ];

    const displayMarkets = markets || defaultMarkets;

    return (
        <Card className="p-6 bg-card border-border">
            <div className="space-y-6">
                <h3 className="text-lg font-semibold text-foreground">
                    Your Active Markets
                </h3>

                <div className="space-y-4">
                    {displayMarkets.map((market) => (
                        <div
                            key={market.id}
                            className="p-4 rounded-lg border border-border bg-muted/20 hover:bg-muted/40 hover:border-primary/50 transition-all duration-200 cursor-pointer group"
                        >
                            <div className="space-y-3">
                                {/* Question */}
                                <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                                    {market.question}
                                </p>

                                {/* Bet info */}
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground">
                                        Your Bet:
                                    </span>
                                    <Badge
                                        variant={market.bet === "Yes" ? "default" : "secondary"}
                                        className={cn(
                                            "font-semibold",
                                            market.bet === "Yes"
                                                ? "bg-green-500/20 text-green-600 dark:text-green-400 hover:bg-green-500/30"
                                                : "bg-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-500/30"
                                        )}
                                    >
                                        {market.bet}
                                    </Badge>
                                    <span className="text-sm font-semibold text-foreground">
                                        - ${market.amount}
                                    </span>
                                </div>

                                {/* Price and expiry */}
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="text-muted-foreground">
                                            Current Price:
                                        </span>
                                        <span className="font-semibold text-primary">
                                            ${market.currentPrice.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-muted-foreground">Expires in:</span>
                                        <span className="font-medium text-foreground">
                                            {market.expiresIn}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    );
}
