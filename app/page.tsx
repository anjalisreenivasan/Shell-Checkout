import { supabaseAdmin } from '@/lib/supabase'
import { formatDate, formatTime, formatNY } from '@/lib/timezone'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import HomeSearch from '@/components/HomeSearch'
import type { Checkout } from '@/types'

async function getActiveCheckouts(): Promise<Checkout[]> {
  const { data } = await supabaseAdmin
    .from('checkouts')
    .select('*, sheller:shellers(id, name), item:items(id, name, description)')
    .in('status', ['approved', 'returned'])
    .order('checkout_at', { ascending: false })

  return data ?? []
}

export default async function HomePage() {
  const checkouts = await getActiveCheckouts()

  return (
    <div className="space-y-10">
      {/* Hero */}
      <div className="text-center space-y-4 py-8">
        <h1 className="text-4xl font-bold text-gray-900">
          Startup Shell <span className="text-orange-600">Resource Checkout</span>
        </h1>
        <p className="text-gray-500 text-lg max-w-xl mx-auto">
          Browse available resources and submit a checkout request. Sign in with your startupshell.org email to get started.
        </p>
        <HomeSearch />
      </div>

      {/* Currently Checked Out */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">Currently Checked Out</h2>
        {checkouts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-gray-400">
              No items are currently checked out.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {checkouts.map((checkout) => (
              <Card key={checkout.id} className="border border-gray-200">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base text-gray-900">
                      {(checkout.item as { name: string })?.name ?? 'Unknown Item'}
                    </CardTitle>
                    <Badge
                      variant={checkout.status === 'returned' ? 'secondary' : 'default'}
                      className={checkout.status === 'approved' ? 'bg-green-100 text-green-800 border-green-200' : ''}
                    >
                      {checkout.status === 'approved' ? 'Checked Out' : 'Pending Return'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-1 text-sm text-gray-600">
                  <p>
                    <span className="font-medium text-gray-700">Borrower: </span>
                    {(checkout.sheller as { name: string })?.name ?? 'Unknown'}
                  </p>
                  <p>
                    <span className="font-medium text-gray-700">Checked out: </span>
                    {formatNY(checkout.checkout_at)}
                  </p>
                  <p>
                    <span className="font-medium text-gray-700">Due back: </span>
                    {formatDate(checkout.return_date)} at {formatTime(checkout.return_time)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
