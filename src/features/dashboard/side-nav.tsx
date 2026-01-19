import { Link, useLocation } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { cn } from "~/lib/utils";
import { buttonVariants } from "~/components/ui/button";
import { sidebarNavItems } from "./config";

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  isMobile?: boolean;
}

export function SidebarNav({ className, isMobile = false, ...props }: SidebarNavProps) {
  const location = useLocation();
  const isCreatorPage = location.pathname === "/dashboard/account";

  if (isMobile) {
    // Mobile bottom navigation with icons
    return (
      <nav
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-t border-border",
          "flex items-center justify-between px-6 py-2 safe-area-inset-bottom h-16",
          className
        )}
        {...props}
      >
        <div className="flex items-center justify-around flex-1">
          {sidebarNavItems.slice(0, 2).map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                to={item.href}
                activeProps={{
                  className: "text-primary",
                }}
                inactiveProps={{
                  className: "text-muted-foreground hover:text-foreground",
                }}
                className="flex flex-col items-center justify-center w-12 h-12 transition-colors"
              >
                <Icon size={24} strokeWidth={2.5} />
                <span className="sr-only">{item.title}</span>
              </Link>
            );
          })}
        </div>

        {/* Create Market Button - Center */}
        {isCreatorPage ? (
          <div className="relative -top-6 mx-2">
            <Link
              to="/markets/create"
              className={cn(
                "flex h-14 w-14 items-center justify-center rounded-full",
                "bg-primary text-primary-foreground shadow-lg shadow-primary/40",
                "hover:shadow-xl hover:shadow-primary/50 hover:scale-105 active:scale-95 transition-all duration-300",
                "ring-4 ring-background" // Creates the cut-out effect
              )}
            >
              <Plus size={32} strokeWidth={3} />
            </Link>
          </div>
        ) : null}

        <div className="flex items-center justify-around flex-1">
          {sidebarNavItems.slice(2, 4).map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                to={item.href}
                activeProps={{
                  className: "text-primary",
                }}
                inactiveProps={{
                  className: "text-muted-foreground hover:text-foreground",
                }}
                className="flex flex-col items-center justify-center w-12 h-12 transition-colors"
              >
                <Icon size={24} strokeWidth={2.5} />
                <span className="sr-only">{item.title}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    );
  }

  // Desktop sidebar navigation with text
  return (
    <nav
      className={cn(
        "flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-2",
        className
      )}
      {...props}
    >
      {sidebarNavItems.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            to={item.href}
            activeProps={{
              className: cn(
                buttonVariants({ variant: "ghost" }),
                "bg-[#1e293b] text-white hover:bg-[#1e293b] hover:text-white justify-start"
              ),
            }}
            inactiveProps={{
              className: cn(
                buttonVariants({ variant: "ghost" }),
                "text-muted-foreground hover:bg-transparent hover:underline justify-start"
              ),
            }}
            className={cn(buttonVariants({ variant: "ghost" }), "justify-start gap-3")}
          >
            <Icon size={18} />
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
}
