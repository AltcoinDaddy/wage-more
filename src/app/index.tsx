// src/routes/index.tsx
import * as fs from "node:fs";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { Button } from "~/components/ui/button";
import { ThemeSwitcher, ThemeSwitcherDropdown } from "~/components/shared";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <div className="absolute top-4 right-4 flex gap-2">
        <ThemeSwitcher />
      </div>
      <h2>Welcome to Wagemore</h2>
      <Button>Welcome to Nodebase</Button>
    </div>
  );
}
