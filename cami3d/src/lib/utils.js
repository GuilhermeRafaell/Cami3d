import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combina classes CSS com suporte ao Tailwind Merge.
 * Usa clsx para condicionais e twMerge para resolver conflitos de classes Tailwind.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
