// src/routes/index.tsx
import * as fs from "node:fs";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { Button } from "~/components/ui/button";
import { ThemeSwitcher, ThemeSwitcherDropdown } from "~/components/shared";

const filePath = "count.txt";

async function readCount() {
  return parseInt(
    await fs.promises.readFile(filePath, "utf-8").catch(() => "0"),
  );
}

const getCount = createServerFn({
  method: "GET",
}).handler(() => {
  return readCount();
});

const updateCount = createServerFn({ method: "POST" })
  .inputValidator((d: number) => d)
  .handler(async ({ data }) => {
    const count = await readCount();
    await fs.promises.writeFile(filePath, `${count + data}`);
  });

export const Route = createFileRoute("/")({
  component: Home,
  loader: async () => await getCount(),
});

function Home() {
  const router = useRouter();
  const state = Route.useLoaderData();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <div className="absolute top-4 right-4 flex gap-2">
        <ThemeSwitcher />
      </div>
      <h2>Welcome to Wagemore</h2>
      <Button>Welcome to Nodebase</Button>

      <div className="mt-8 flex flex-col items-center gap-4">
        <p className="text-sm text-muted-foreground">Theme Switcher Options:</p>
        <div className="flex gap-4 items-center">
          <span className="text-sm">Toggle:</span>
          <ThemeSwitcher />
          <span className="text-sm">Dropdown:</span>
          <ThemeSwitcherDropdown />
        </div>
      </div>
    </div>
  );
}
