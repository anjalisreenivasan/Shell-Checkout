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
    backgroundColor: '#d74034',
    borderColor: '#ac3931',
  }))

  const blockoutEvents = blockouts.map(b => ({
    id: `blockout-${b.id}`,
    title: b.title,
    start: b.start_at,
    end: b.end_at,
    backgroundColor: '#0f0c08',
    borderColor: '#0f0c08',
    textColor: '#fff',
  }))

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4 text-xs text-shell-black/40">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-shell-red" />
          Checked out
        </span>
        {blockouts.length > 0 && (
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-shell-black" />
            Blocked
          </span>
        )}
      </div>
      <div className="[&_.fc]:text-sm [&_.fc-toolbar-title]:text-base [&_.fc-toolbar-title]:font-semibold [&_.fc-button-primary]:bg-shell-red [&_.fc-button-primary]:border-shell-red [&_.fc-button-primary]:text-xs [&_.fc-button-primary]:shadow-none [&_.fc-button-primary:hover]:bg-shell-red-dark [&_.fc-button-primary:not(:disabled):active]:bg-shell-red-dark [&_.fc-button-primary:not(:disabled).fc-button-active]:bg-shell-red-dark [&_.fc-button-primary:focus]:!shadow-none [&_.fc-button-primary:focus]:!ring-0 [&_.fc-button:focus]:!shadow-none [&_.fc-button:focus]:!outline-none [&_.fc-button-primary:focus]:!border-shell-red [&_.fc-button-primary.fc-button-active:focus]:!border-shell-red-dark [&_.fc-day-today]:!bg-shell-red/5 [&_.fc-event]:rounded-md [&_.fc-event]:px-1.5">
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
