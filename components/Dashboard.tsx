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
    backgroundColor: c.status === 'returned' ? '#d1d5db' : '#ea580c',
    borderColor: c.status === 'returned' ? '#9ca3af' : '#c2410c',
    extendedProps: {
      shellerName: (c.sheller as { name: string })?.name ?? '',
      itemName: (c.item as { name: string })?.name ?? '',
      returnDate: c.return_date,
      returnTime: c.return_time,
      status: c.status,
    },
  }))

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-400">Search for a resource or see what&apos;s currently checked out.</p>
      </div>

      <HomeSearch />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Checkout Calendar</h2>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-600" />
              Checked out
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-gray-300" />
              Returned
            </span>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <CheckoutCalendar events={events} />
        </div>
      </div>
    </div>
  )
}
