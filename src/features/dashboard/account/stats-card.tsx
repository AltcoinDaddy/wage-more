import { Card } from "~/components/ui/card";
import { cn } from "~/lib/utils";

interface StatsCardProps {
    title: string;
    value: string;
    subtitle?: string;
    trend?: {
        value: string;
        isPositive: boolean;
    };
    className?: string;
}

export function StatsCard({
    title,
    value,
    subtitle,
    trend,
    className,
}: StatsCardProps) {
    return (
        <Card
            className={cn(
                "p-6 bg-card border-border hover:border-primary/50 transition-all duration-300",
                "hover:shadow-lg hover:shadow-primary/5",
                className
            )}
        >
            <div className="space-y-2">
                <p className="text-sm text-muted-foreground font-medium">{title}</p>
                <p className="text-3xl font-bold text-foreground">{value}</p>
                {subtitle && (
                    <p className="text-sm text-muted-foreground">{subtitle}</p>
                )}
                {trend && (
                    <p
                        className={cn(
                            "text-sm font-medium",
                            trend.isPositive ? "text-green-500" : "text-red-500"
                        )}
                    >
                        {trend.value}
                    </p>
                )}
            </div>
        </Card>
    );
}
