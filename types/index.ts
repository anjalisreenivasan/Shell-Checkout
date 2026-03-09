export type CheckoutStatus =
  | 'pending'
  | 'approved'
  | 'denied'
  | 'returned'
  | 'return_confirmed'

export interface Sheller {
  id: string
  clerk_user_id: string
  email: string
  name: string
  is_board_member: boolean
  created_at: string
}

export interface Item {
  id: string
  name: string
  description: string | null
  quantity: number
  is_available: boolean
  added_by: string | null
  created_at: string
  deleted_at: string | null
}

export interface Checkout {
  id: string
  sheller_id: string
  item_id: string
  checkout_at: string
  return_date: string
  return_time: string
  status: CheckoutStatus
  approved_by: string | null
  created_at: string
  updated_at: string
  sheller?: Sheller
  item?: Item
}

export interface Return {
  id: string
  request_id: string
  sheller_id: string
  item_id: string
  returned_at: string
  confirmed_by: string | null
  confirmed_at: string | null
  created_at: string
  sheller?: Sheller
  item?: Item
}
