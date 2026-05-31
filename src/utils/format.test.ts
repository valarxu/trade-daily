import { describe, expect, it } from 'vitest'
import { formatDateTime, formatPercent, formatPrice } from './format'

describe('format utils', () => {
  it('formats prices with decimals', () => {
    expect(formatPrice(12.3456)).toBe('12.3456')
  })

  it('formats percentages with explicit sign', () => {
    expect(formatPercent(2.345)).toBe('+2.35%')
    expect(formatPercent(-1.234)).toBe('-1.23%')
  })

  it('formats datetime fallback', () => {
    expect(formatDateTime(null)).toBe('尚未复盘')
  })
})
