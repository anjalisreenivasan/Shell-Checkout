'use client'

import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import type { Checkout } from '@/types'

interface Props {
  checkouts: Checkout[]
}

export default function ItemCalendar({ checkouts }: Props) {
  const events = checkouts.map(c => ({
    id: c.id,
    title: `Checked out by ${(c.sheller as { name: string })?.name ?? 'Someone'}`,
    start: c.checkout_at,
    end: `${c.return_date}T${c.return_time}`,
    backgroundColor: c.status === 'returned' ? '#9ca3af' : '#ea580c',
    borderColor: c.status === 'returned' ? '#6b7280' : '#c2410c',
  }))

  return (
    <div className="[&_.fc-toolbar-title]:text-base [&_.fc-toolbar-title]:font-semibold [&_.fc-button]:bg-orange-600 [&_.fc-button]:border-orange-600 [&_.fc-button:hover]:bg-orange-700">
      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        events={events}
        height="auto"
        headerToolbar={{
          left: 'prev',
          center: 'title',
          right: 'next',
        }}
      />
    </div>
  )
}
