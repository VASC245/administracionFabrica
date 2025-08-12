// src/utils/parseRepuestos.js
export function parseRepuestos(input) {
  if (!input) return []
  // separa por coma o punto y coma
  const chunks = String(input).split(/[,;]+/).map(s => s.trim()).filter(Boolean)
  const items = []
  for (const ch of chunks) {
    // posibles patrones de qty: "x2", "*2", ":2", " 2" al final
    const m = ch.match(/^(.*?)(?:\s*[x*:]\s*|\s+)(\d+)\s*$/i)
    if (m) {
      const key = m[1].trim()
      const qty = parseInt(m[2], 10)
      if (key) items.push({ key, qty: Math.max(1, qty) })
    } else {
      // sin cantidad -> 1
      items.push({ key: ch, qty: 1 })
    }
  }
  return items
}
