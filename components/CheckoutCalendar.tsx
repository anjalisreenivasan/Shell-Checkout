'use client'

import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatTime } from '@/lib/timezone'
import { Calendar, Clock, User } from 'lucide-react'

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
      <div className="[&_.fc]:text-sm [&_.fc-toolbar-title]:text-base [&_.fc-toolbar-title]:font-semibold [&_.fc-button-primary]:bg-orange-600 [&_.fc-button-primary]:border-orange-600 [&_.fc-button-primary]:text-xs [&_.fc-button-primary]:shadow-none [&_.fc-button-primary:hover]:bg-orange-700 [&_.fc-button-primary:not(:disabled):active]:bg-orange-700 [&_.fc-button-primary:not(:disabled).fc-button-active]:bg-orange-700 [&_.fc-day-today]:bg-orange-50/50 [&_.fc-event]:rounded-md [&_.fc-event]:px-1.5 [&_.fc-event]:cursor-pointer">
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

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle className="text-lg text-gray-900">{selected?.itemName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <User className="w-3.5 h-3.5 text-gray-400" />
              {selected?.shellerName}
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              {selected ? formatDate(selected.returnDate) : ''}
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              {selected ? formatTime(selected.returnTime) : ''}
            </div>
            <Badge
              variant="outline"
              className={
                selected?.status === 'approved'
                  ? 'bg-orange-50 text-orange-700 border-orange-200'
                  : 'bg-gray-50 text-gray-600 border-gray-200'
              }
            >
              {selected?.status === 'approved' ? 'Checked Out' : 'Returned'}
            </Badge>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
