'use client'

import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatTime } from '@/lib/timezone'

interface CalendarEvent {
  id: string
  title: string
  start: string
  end: string
  backgroundColor: string
  borderColor: string
  extendedProps: {
    shellerName: string
    itemName: string
    returnDate: string
    returnTime: string
    status: string
  }
}

interface Props {
  events: CalendarEvent[]
}

export default function CheckoutCalendar({ events }: Props) {
  const [selected, setSelected] = useState<CalendarEvent['extendedProps'] | null>(null)

  return (
    <>
      <div className="[&_.fc-button-primary]:bg-orange-600 [&_.fc-button-primary]:border-orange-600 [&_.fc-button-primary:hover]:bg-orange-700 [&_.fc-button-primary:not(:disabled):active]:bg-orange-700 [&_.fc-button-primary:not(:disabled).fc-button-active]:bg-orange-700">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin]}
          initialView="dayGridMonth"
          events={events}
          height="auto"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek',
          }}
          eventClick={(info) => {
            setSelected(info.event.extendedProps as CalendarEvent['extendedProps'])
          }}
          eventDisplay="block"
          dayMaxEvents={3}
        />
      </div>

      {/* Event detail popup */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-orange-600">{selected?.itemName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 text-sm text-gray-600">
            <p>
              <span className="font-medium text-gray-700">Borrowed by: </span>
              {selected?.shellerName}
            </p>
            <p>
              <span className="font-medium text-gray-700">Due back: </span>
              {selected ? `${formatDate(selected.returnDate)} at ${formatTime(selected.returnTime)}` : ''}
            </p>
            <p>
              <span className="font-medium text-gray-700">Status: </span>
              <Badge
                variant="outline"
                className={
                  selected?.status === 'approved'
                    ? 'bg-green-100 text-green-800 border-green-200'
                    : 'bg-gray-100 text-gray-700 border-gray-200'
                }
              >
                {selected?.status === 'approved' ? 'Checked Out' : 'Returned'}
              </Badge>
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
