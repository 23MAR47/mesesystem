const trFormatter = new Intl.NumberFormat('tr-TR', {
  style: 'currency',
  currency: 'TRY',
  maximumFractionDigits: 0,
})

export function formatCurrencyTL(value: number): string {
  return trFormatter.format(value).replace('₺', 'TL').trim()
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('tr-TR').format(value)
}
