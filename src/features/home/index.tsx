import React from "react";
import { Navbar } from "~/components/shared/navbar";
import BannerSection from "~/components/home/banner-section";
import { MarketsSection } from "~/components/home/market-section";
import { HomeSidebar } from "~/components/home/home-sidebar";

export function AppPage() {
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative">
        {/* --- LEFT COLUMN: Main Content (Banners + Markets) --- */}
        {/* Spans 12 columns on mobile, 9 columns on Large screens */}
        <div className="col-span-1 lg:col-span-9 flex flex-col gap-8">
          {/* Top Banners Section */}
          <section>
            <BannerSection />
          </section>

          {/* Markets Grid Section */}
          <section>
            <MarketsSection />
          </section>
        </div>

        {/* --- RIGHT COLUMN: Sidebar (Widgets) --- */}
        {/* Hidden on mobile/tablet, Visible on Large screens (lg:block) */}
        <aside className="hidden lg:block lg:col-span-3">
          <div className="sticky top-[88px] flex flex-col gap-6">
            {/* top-[88px] accounts for Navbar height + some breathing room.
                  This makes the sidebar float as you scroll down.
               */}
            <HomeSidebar />
          </div>
        </aside>
      </div>
    </>
  );
}
