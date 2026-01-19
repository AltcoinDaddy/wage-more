import { createFileRoute } from '@tanstack/react-router'
import { createPageMeta } from '~/seo'
import { AccountOverview } from '~/features/dashboard/account'

export const Route = createFileRoute('/(public)/dashboard/account/')({
  component: AccountPage,
  head: () => createPageMeta({
    title: 'Account Overview | Wage More',
    description: 'View and manage your creator account details, portfolio performance, and active markets.',
    keywords: "creator, account, overview, dashboard, portfolio, markets, Wagemore",
  })
})

function AccountPage() {
  return (
    <div className="container mx-auto py-6 px-4">
      <AccountOverview />
    </div>
  )
}
