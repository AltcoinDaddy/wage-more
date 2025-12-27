// src/routes/index.tsx
import { createFileRoute } from "@tanstack/react-router";
import { AppPage } from "~/features/home";
import { getCurrentUser } from "~/server/user";

export const Route = createFileRoute("/(public)/_public/")({
  component: AppPage,
});
