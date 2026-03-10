import { supabaseAdmin } from '@/lib/supabase'
import { formatNY, formatDate, formatTime } from '@/lib/timezone'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { Checkout } from '@/types'

async function getAllCheckouts(): Promise<Checkout[]> {
  const { data } = await supabaseAdmin
    .from('checkouts')
    .select('*, sheller:sheller_id(id, name, email), item:items(id, name)')
    .order('created_at', { ascending: false })
  return data ?? []
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  approved: 'bg-green-100 text-green-800 border-green-200',
  denied: 'bg-red-100 text-red-800 border-red-200',
  returned: 'bg-blue-100 text-blue-800 border-blue-200',
  return_confirmed: 'bg-shell-black/5 text-shell-black/60 border-shell-black/10',
}

export default async function BoardHistoryPage() {
  const checkouts = await getAllCheckouts()

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold text-shell-black">Full Checkout History</h2>
      {checkouts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-shell-black/30">
            No checkout history yet.
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-shell-black/10 bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Sheller</TableHead>
                <TableHead>Checked Out</TableHead>
                <TableHead>Due Back</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {checkouts.map(c => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">
                    {(c.item as { name: string })?.name ?? '—'}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium text-shell-black">
                        {(c.sheller as { name: string })?.name ?? '—'}
                      </div>
                      <div className="text-shell-black/40 text-xs">
                        {(c.sheller as { email: string })?.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-shell-black/60">
                    {formatNY(c.checkout_at)}
                  </TableCell>
                  <TableCell className="text-sm text-shell-black/60">
                    {formatDate(c.return_date)} at {formatTime(c.return_time)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-xs ${STATUS_COLORS[c.status]}`}>
                      {c.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
