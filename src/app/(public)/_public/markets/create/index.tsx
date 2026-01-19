import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(public)/_public/markets/create/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(public)/_public/markets/create/"!</div>
}
