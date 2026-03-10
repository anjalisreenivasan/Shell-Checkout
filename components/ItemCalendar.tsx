'use client'

import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import type { Checkout, Blockout } from '@/types'

interface Props {
  checkouts: Checkout[]
  blockouts?: Blockout[]
}

export default function ItemCalendar({ checkouts, blockouts = [] }: Props) {
  const checkoutEvents = checkouts.map(c => ({
    id: c.id,
    title: `${(c.sheller as { name: string })?.name ?? 'Someone'}`,
    start: c.checkout_at,
    end: `${c.return_date}T${c.return_time}`,
    backgroundColor: c.status === 'returned' ? '#d1d5db' : '#ea580c',
    borderColor: c.status === 'returned' ? '#9ca3af' : '#c2410c',
  }))

  const blockoutEvents = blockouts.map(b => ({
    id: `blockout-${b.id}`,
    title: b.title,
    start: b.start_at,
    end: b.end_at,
    backgroundColor: '#1e1e1e',
    borderColor: '#111',
    textColor: '#fff',
  }))

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4 text-xs text-gray-400">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-600" />
          Checked out
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-gray-300" />
          Returned
        </span>
        {blockouts.length > 0 && (
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-gray-900" />
            Blocked
          </span>
        )}
      </div>
      <div className="[&_.fc]:text-sm [&_.fc-toolbar-title]:text-base [&_.fc-toolbar-title]:font-semibold [&_.fc-button-primary]:bg-orange-600 [&_.fc-button-primary]:border-orange-600 [&_.fc-button-primary]:text-xs [&_.fc-button-primary]:shadow-none [&_.fc-button-primary:hover]:bg-orange-700 [&_.fc-button-primary:not(:disabled):active]:bg-orange-700 [&_.fc-button-primary:not(:disabled).fc-button-active]:bg-orange-700 [&_.fc-event]:rounded-md [&_.fc-event]:px-1.5">
        <FullCalendar
          plugins={[dayGridPlugin]}
          initialView="dayGridMonth"
          events={[...checkoutEvents, ...blockoutEvents]}
          height="auto"
          headerToolbar={{
            left: 'prev',
            center: 'title',
            right: 'next',
          }}
          dayMaxEvents={3}
        />
      </div>
    </div>
  )
}
