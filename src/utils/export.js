import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

export const exportToExcel = (data, filename) => {
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Reporte')
  XLSX.writeFile(wb, filename)
}

export const exportToPDF = (data, columns, filename) => {
  const doc = new jsPDF()
  doc.text('Reporte', 14, 16)
  doc.autoTable({ head: [columns.map(c => c.header)], body: data.map(row => columns.map(c => row[c.dataKey])) })
  doc.save(filename + '.pdf')
}
