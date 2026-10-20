import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// For the "Other" item, show what the sheller actually asked for.
export function checkoutItemName(
  c: { item?: { name: string } | null; requested_item_name?: string | null },
  fallback = 'Unknown Item',
) {
  if (c.requested_item_name) return `Other: ${c.requested_item_name}`
  return c.item?.name ?? fallback
}
