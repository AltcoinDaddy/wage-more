import { Bell, Building, Home, PenTool, TrendingUp, Search, PlusIcon } from "lucide-react";
import { Link } from "@tanstack/react-router";
import React from "react";
import { Button } from "~/components/ui/button";

// Dashboard navigation items with icons
export const sidebarNavItems = [
    {
        title: "Home",
        href: "/dashboard/home",
        icon: Home,
    },
    {
        title: "Creator Overview",
        href: "/dashboard/account",
        icon: PenTool,
    },
    {
        title: "Trading",
        href: "/dashboard/trading",
        icon: TrendingUp,
    },
    {
        title: "Notifications",
        href: "/dashboard/notifications",
        icon: Bell,
    },
    {
        title: "Builder Codes",
        href: "/dashboard/builder-codes",
        icon: Building,
    },
];

// Route-based header configuration - can return JSX or null
export const routeHeaders: Record<string, React.ReactNode> = {
    "/dashboard/home": (
        <div className="space-y-0.5 mb-6 px-1">
            <h2 className="text-2xl font-bold tracking-tight">Profile Settings</h2>
            <p className="text-muted-foreground">
                Manage your account settings and set e-mail preferences.
            </p>
        </div>
    ),
    "/dashboard/account": (
        <div className="flex items-center justify-between mb-6 px-1">
            <div className="space-y-0.5">
                <h2 className="text-2xl font-bold tracking-tight">Creator Overview</h2>
                <p className="text-muted-foreground">
                    Here's a quick overview of your creator account.
                </p>
            </div>
            <Button size="lg" asChild className="gap-2 hidden md:flex">
                <Link to="/markets/create">
                    <PlusIcon size={16} />
                    Create A Market
                </Link>
            </Button>
        </div>
    ),
    "/dashboard/trading": (
        <div className="space-y-0.5 mb-6 px-1">
            <h2 className="text-2xl font-bold tracking-tight">Trading Dashboard</h2>
            <p className="text-muted-foreground">
                Monitor your trades and trading performance.
            </p>
        </div>
    ),
    "/dashboard/notifications": (
        <div className="space-y-0.5 mb-6 px-1">
            <h2 className="text-2xl font-bold tracking-tight">Notifications</h2>
            <p className="text-muted-foreground">
                Manage your notification preferences and alerts.
            </p>
        </div>
    ),
    "/dashboard/builder-codes": (
        <div className="space-y-0.5 mb-6 px-1">
            <h2 className="text-2xl font-bold tracking-tight">Builder Codes</h2>
            <p className="text-muted-foreground">
                Access and manage your builder codes.
            </p>
        </div>
    ),
};

// Default fallback header
export const defaultHeader = (
    <div className="space-y-0.5 mb-6 px-1">
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Welcome to your dashboard.</p>
    </div>
);
