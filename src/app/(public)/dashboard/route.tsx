import {
  createFileRoute,
  Link,
  Outlet,
  useLocation,
} from "@tanstack/react-router";
import { Navbar } from "~/components/shared/navbar";
import { cn } from "~/lib/utils";
import { buttonVariants } from "~/components/ui/button";

// Route-based header configuration
const routeHeaders: Record<string, { title: string; description: string }> = {
  "/dashboard/home": {
    title: "Profile Settings",
    description: "Manage your account settings and set e-mail preferences.",
  },
  "/dashboard/account": {
    title: "Creator Overview",
    description: "View and manage your creator account details.",
  },
  "/dashboard/trading": {
    title: "Trading Dashboard",
    description: "Monitor your trades and trading performance.",
  },
  "/dashboard/notifications": {
    title: "Notifications",
    description: "Manage your notification preferences and alerts.",
  },
  "/dashboard/builder-codes": {
    title: "Builder Codes",
    description: "Access and manage your builder codes.",
  },
};

// 1. Define your sidebar navigation items
const sidebarNavItems = [
  { title: "Profile", href: "/dashboard/home" },
  { title: "Creator Overview", href: "/dashboard/account" },
  { title: "Trading", href: "/dashboard/trading" },
  { title: "Notifications", href: "/dashboard/notifications" },
  { title: "Builder Codes", href: "/dashboard/builder-codes" },
];

// 2. The Sidebar Navigation Component
function SidebarNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <nav
      className={cn(
        "flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-2",
        className,
      )}
      {...props}
    >
      {sidebarNavItems.map((item) => (
        <Link
          key={item.href}
          to={item.href}
          activeProps={{
            className: cn(
              buttonVariants({ variant: "ghost" }),
              "bg-[#1e293b] text-white hover:bg-[#1e293b] hover:text-white justify-start",
            ),
          }}
          inactiveProps={{
            className: cn(
              buttonVariants({ variant: "ghost" }),
              "text-muted-foreground hover:bg-transparent hover:underline justify-start",
            ),
          }}
          className={cn(buttonVariants({ variant: "ghost" }), "justify-start")}
        >
          {item.title}
        </Link>
      ))}
    </nav>
  );
}

// 3. The Main Route and Dashboard Layout
export const Route = createFileRoute("/(public)/dashboard")({
  component: DashboardLayout,
});

function DashboardLayout() {
  const location = useLocation();
  const currentRoute = location.pathname;

  // Get header info for current route, with fallback
  const headerInfo = routeHeaders[currentRoute] || {
    title: "Dashboard",
    description: "Welcome to your dashboard.",
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Navbar />
      <div className="container mx-auto flex flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10 px-4 md:px-8 overflow-hidden">
        <aside className="hidden h-full w-full shrink-0 md:block py-6 pr-6 lg:py-8">
          <SidebarNav />
        </aside>
        <main className="flex h-full w-full flex-col overflow-y-auto py-6 lg:py-8">
          {/* Page Header */}
          <div className="space-y-0.5 mb-6 px-1">
            <h2 className="text-2xl font-bold tracking-tight">
              {headerInfo.title}
            </h2>
            <p className="text-muted-foreground">{headerInfo.description}</p>
          </div>
          <div className="my-6 border-t border-border" />

          {/* Your page content renders here, and only this area will scroll */}
          <div className="px-1 pb-10">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
