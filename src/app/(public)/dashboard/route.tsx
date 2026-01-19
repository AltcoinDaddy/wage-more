import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import { Navbar } from "~/components/shared/navbar";
import { authMiddleware } from "~/middleware/auth-middleware";
import { SidebarNav } from "~/features/dashboard/side-nav";
import { routeHeaders, defaultHeader } from "~/features/dashboard/config";

export const Route = createFileRoute("/(public)/dashboard")({
  component: DashboardLayout,
  server: {
    middleware: [authMiddleware],
  },
});

function DashboardLayout() {
  const location = useLocation();
  const headerContent = routeHeaders[location.pathname] ?? defaultHeader;

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Navbar />
      <div className="container mx-auto flex flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10 px-4 md:px-8 overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden h-full w-full shrink-0 md:block py-6 pr-6 lg:py-8">
          <SidebarNav />
        </aside>

        {/* Main Content */}
        <main className="flex h-full w-full flex-col overflow-y-auto py-6 lg:py-8 pb-20 md:pb-8">
          {/* Conditionally render header */}
          {headerContent}

          {/* Only show divider if header exists */}
          {headerContent && <div className="my-6 border-t border-border" />}

          {/* Your page content renders here, and only this area will scroll */}
          <div className="px-1 pb-10">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden">
        <SidebarNav isMobile />
      </div>
    </div>
  );
}
