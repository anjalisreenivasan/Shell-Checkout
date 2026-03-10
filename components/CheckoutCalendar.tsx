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
      <div className="[&_.fc]:text-sm [&_.fc-toolbar-title]:text-base [&_.fc-toolbar-title]:font-semibold [&_.fc-button-primary]:bg-shell-red [&_.fc-button-primary]:border-shell-red [&_.fc-button-primary]:text-xs [&_.fc-button-primary]:shadow-none [&_.fc-button-primary:hover]:bg-shell-red-dark [&_.fc-button-primary:not(:disabled):active]:bg-shell-red-dark [&_.fc-button-primary:not(:disabled).fc-button-active]:bg-shell-red-dark [&_.fc-button-primary:focus]:!shadow-none [&_.fc-button-primary:focus]:!ring-0 [&_.fc-button:focus]:!shadow-none [&_.fc-button:focus]:!outline-none [&_.fc-button-primary:focus]:!border-shell-red [&_.fc-button-primary.fc-button-active:focus]:!border-shell-red-dark [&_.fc-day-today]:!bg-shell-red/5 [&_.fc-event]:rounded-md [&_.fc-event]:px-1.5 [&_.fc-event]:cursor-pointer">
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
            <DialogTitle className="text-lg text-shell-black">{selected?.itemName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2 text-shell-black/60">
              <User className="w-3.5 h-3.5 text-shell-black/30" />
              {selected?.shellerName}
            </div>
            <div className="flex items-center gap-2 text-shell-black/60">
              <Calendar className="w-3.5 h-3.5 text-shell-black/30" />
              {selected ? formatDate(selected.returnDate) : ''}
            </div>
            <div className="flex items-center gap-2 text-shell-black/60">
              <Clock className="w-3.5 h-3.5 text-shell-black/30" />
              {selected ? formatTime(selected.returnTime) : ''}
            </div>
            <Badge
              variant="outline"
              className={
                selected?.status === 'approved'
                  ? 'bg-shell-red/10 text-shell-red border-shell-red/20'
                  : 'bg-shell-black/5 text-shell-black/60 border-shell-black/10'
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
