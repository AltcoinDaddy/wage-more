import { createFileRoute } from "@tanstack/react-router";
import { CreateMarketForm } from "~/features/market/components/create-market-form";

export const Route = createFileRoute("/(public)/_public/markets/create/")({
  component: CreateMarketPage,
});

function CreateMarketPage() {
  return <CreateMarketForm />;
}
