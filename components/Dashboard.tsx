import HomeSearch from '@/components/HomeSearch'
import CheckoutCalendar from '@/components/CheckoutCalendar'
import type { Checkout } from '@/types'

interface Props {
  checkouts: Checkout[]
}

export default function Dashboard({ checkouts }: Props) {
  const events = checkouts.map(c => ({
    id: c.id,
    title: `${(c.item as { name: string })?.name} — ${(c.sheller as { name: string })?.name}`,
    start: c.checkout_at,
    end: `${c.return_date}T${c.return_time}`,
    backgroundColor: c.status === 'returned' ? '#9ca3af' : '#ea580c',
    borderColor: c.status === 'returned' ? '#6b7280' : '#c2410c',
    extendedProps: {
      shellerName: (c.sheller as { name: string })?.name ?? '',
      itemName: (c.item as { name: string })?.name ?? '',
      returnDate: c.return_date,
      returnTime: c.return_time,
      status: c.status,
    },
  }))

  return (
    <div className="space-y-8">
      {/* Search */}
      <div className="space-y-3">
        <h2 className="text-2xl font-semibold text-gray-800">Find an Item</h2>
        <HomeSearch />
      </div>

      {/* Calendar */}
      <div className="space-y-3">
        <h2 className="text-2xl font-semibold text-gray-800">What&apos;s Checked Out</h2>
        <p className="text-sm text-gray-400">
          Orange = currently out · Gray = returned
        </p>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <CheckoutCalendar events={events} />
        </div>
      </div>
    </div>
  )
}
