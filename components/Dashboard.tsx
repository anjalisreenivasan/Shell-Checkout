import HomeSearch from '@/components/HomeSearch'
import CheckoutCalendar from '@/components/CheckoutCalendar'
import type { Checkout, Blockout } from '@/types'

interface Props {
  checkouts: Checkout[]
  blockouts: Blockout[]
}

export default function Dashboard({ checkouts, blockouts }: Props) {
  const events = checkouts.map(c => ({
    id: c.id,
    title: `${(c.item as { name: string })?.name} — ${(c.sheller as { name: string })?.name}`,
    start: c.checkout_at,
    end: `${c.return_date}T${c.return_time}`,
    backgroundColor: c.status === 'returned' ? '#d1d5db' : '#d74034',
    borderColor: c.status === 'returned' ? '#9ca3af' : '#ac3931',
    extendedProps: {
      shellerName: (c.sheller as { name: string })?.name ?? '',
      itemName: (c.item as { name: string })?.name ?? '',
      returnDate: c.return_date,
      returnTime: c.return_time,
      status: c.status,
    },
  }))

  const blockoutEvents = blockouts.map(b => ({
    id: `blockout-${b.id}`,
    title: `Blocked: ${(b.item as { name: string })?.name} — ${b.title}`,
    start: b.start_at,
    end: b.end_at,
    backgroundColor: '#0f0c08',
    borderColor: '#0f0c08',
    extendedProps: {
      shellerName: '',
      itemName: `${(b.item as { name: string })?.name} (Blocked)`,
      returnDate: '',
      returnTime: '',
      status: 'blocked',
    },
  }))

  const allEvents = [...events, ...blockoutEvents]

  return (
    <div className="space-y-10">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-shell-black">Resource Checkout System</h1>
        <p className="text-sm text-shell-black/40">Search for a resource or see what&apos;s currently checked out.</p>
      </div>

      <div className="flex justify-center">
        <HomeSearch />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-shell-black">Checkout Calendar</h2>
          <div className="flex items-center gap-4 text-xs text-shell-black/40">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-shell-red" />
              Checked out
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-gray-300" />
              Returned
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-shell-black" />
              Blocked
            </span>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-shell-black/10 p-5 shadow-sm">
          <CheckoutCalendar events={allEvents} />
        </div>
      </div>
    </div>
  )
}
