
import { exportToPDF } from '@/utils/pdf/pdfExport'
import type { PDFExportOptions } from '@/types/contract'

/**
 * Export contract data to PDF file
 */
export function exportContractToPDF(options: PDFExportOptions): void {
  exportToPDF(options)
}
