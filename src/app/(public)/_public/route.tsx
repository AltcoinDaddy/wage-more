import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Navbar } from "~/components/shared/navbar";

export const Route = createFileRoute("/(public)/_public")({
  component: AppLayout,
});

function AppLayout() {
  return (
    <>
      <Navbar />
      <div className="w-full max-w-[1600px] mx-auto px-4 md:px-5 py-4 flex-1">
        <Outlet />
      </div>
    </>
  );
}
