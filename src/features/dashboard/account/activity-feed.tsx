import { Card } from "~/components/ui/card";
import {
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  Trophy,
  XCircle,
} from "lucide-react";
import { cn } from "~/lib/utils";

interface Activity {
  id: string;
  type: "deposit" | "withdrawal" | "win" | "loss" | "prediction";
  title: string;
  description: string;
  timestamp: string;
  icon: "deposit" | "withdrawal" | "win" | "loss" | "prediction";
}

interface ActivityFeedProps {
  activities?: Activity[];
}

const iconMap = {
  deposit: ArrowDownLeft,
  withdrawal: ArrowUpRight,
  win: Trophy,
  loss: XCircle,
  prediction: TrendingUp,
};

const iconColorMap = {
  deposit: "text-blue-500 bg-blue-500/10",
  withdrawal: "text-orange-500 bg-orange-500/10",
  win: "text-green-500 bg-green-500/10",
  loss: "text-red-500 bg-red-500/10",
  prediction: "text-purple-500 bg-purple-500/10",
};

export function ActivityFeed({ activities }: ActivityFeedProps) {
  // Mock data
  const defaultActivities: Activity[] = [
    {
      id: "1",
      type: "deposit",
      title: "Deposit Completed",
      description: "You deposited $500.00 via Credit Card.",
      timestamp: "2h ago",
      icon: "deposit",
    },
    {
      id: "2",
      type: "prediction",
      title: "Prediction Placed",
      description: 'Bet "Yes" on "Will TSLA stock reach $200?".',
      timestamp: "5h ago",
      icon: "prediction",
    },
    {
      id: "3",
      type: "win",
      title: "Market Won",
      description: 'You won $75.50 on "BTC over $65k".',
      timestamp: "1d ago",
      icon: "win",
    },
    {
      id: "4",
      type: "withdrawal",
      title: "Withdrawal Pending",
      description: "Your withdrawal of $1,200 is being processed.",
      timestamp: "2d ago",
      icon: "withdrawal",
    },
    {
      id: "5",
      type: "loss",
      title: "Market Lost",
      description: 'You lost $50 on "Next movie to gross $1B".',
      timestamp: "3d ago",
      icon: "loss",
    },
  ];

  const displayActivities = activities || defaultActivities;

  return (
    <Card className="p-6 bg-card border-border">
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-foreground">
          Recent Activity
        </h3>

        <div className="space-y-4">
          {displayActivities.map((activity) => {
            const Icon = iconMap[activity.icon];
            const iconColor = iconColorMap[activity.icon];

            return (
              <div
                key={activity.id}
                className="flex items-start gap-4 group hover:bg-muted/50 -mx-2 px-2 py-2 rounded-lg transition-all duration-200"
              >
                {/* Icon */}
                <div
                  className={cn(
                    "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
                    iconColor
                  )}
                >
                  <Icon size={18} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {activity.title}
                  </p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {activity.description}
                  </p>
                </div>

                {/* Timestamp */}
                <span className="text-xs text-muted-foreground flex-shrink-0">
                  {activity.timestamp}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
