import { StatsCard } from "./stats-card";
import { PortfolioChart } from "./portfolio-chart";
import { ActivityFeed } from "./activity-feed";
import { ActiveMarkets } from "./active-markets";
import { TrendingMarkets } from "./trending-markets";

interface AccountOverviewProps {
    stats?: {
        totalBalance: number;
        balanceChange: number;
        recentPL: number;
        plPercentage: number;
        openPositions: number;
        totalAtRisk: number;
    };
}

export function AccountOverview({ stats }: AccountOverviewProps) {
    // Mock data - replace with real data from your API
    const defaultStats = {
        totalBalance: 18430.5,
        balanceChange: 250.75,
        recentPL: -120.3,
        plPercentage: -1.8,
        openPositions: 12,
        totalAtRisk: 1500,
    };

    const displayStats = stats || defaultStats;

    return (
        <div className="space-y-6 w-full">
            {/* Stats Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatsCard
                    title="Total Balance"
                    value={`$${displayStats.totalBalance.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    })}`}
                    trend={{
                        value: `+$${displayStats.balanceChange.toFixed(2)} today`,
                        isPositive: displayStats.balanceChange > 0,
                    }}
                />
                <StatsCard
                    title="Recent P/L (24h)"
                    value={`${displayStats.recentPL > 0 ? "+" : ""}$${Math.abs(
                        displayStats.recentPL
                    ).toFixed(2)}`}
                    trend={{
                        value: `${displayStats.plPercentage > 0 ? "+" : ""}${displayStats.plPercentage.toFixed(
                            1
                        )}% vs yesterday`,
                        isPositive: displayStats.recentPL > 0,
                    }}
                    className={
                        displayStats.recentPL < 0 ? "border-red-500/20" : "border-green-500/20"
                    }
                />
                <StatsCard
                    title="Open Positions"
                    value={displayStats.openPositions.toString()}
                    subtitle={`Total at risk: $${displayStats.totalAtRisk.toLocaleString()}`}
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Chart and Markets */}
                <div className="lg:col-span-2 space-y-6">
                    <PortfolioChart />
                    <ActiveMarkets />
                    <TrendingMarkets />
                </div>

                {/* Right Column - Activity Feed */}
                <div className="lg:col-span-1">
                    <ActivityFeed />
                </div>
            </div>
        </div>
    );
}
