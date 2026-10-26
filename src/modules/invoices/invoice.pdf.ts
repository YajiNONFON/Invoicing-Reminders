import PDFDocument from 'pdfkit';
import { formatUsd } from './invoice.money';
import type { InvoiceRecord } from './invoice.dto';
import { formatDate } from '../../shared/dates';

const MARGIN = 50;
const PAGE_BOTTOM = 780;
// Column x positions of the lines table
const COL = { description: MARGIN, quantity: 330, unitPrice: 390, total: 470 } as const;
const RIGHT_EDGE = 545;

/** Renders an invoice as a PDF document in memory. */
export function renderInvoicePdf(invoice: InvoiceRecord): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: MARGIN, info: { Title: invoice.number } });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Header
    doc.font('Helvetica-Bold').fontSize(24).text('INVOICE', MARGIN, MARGIN);
    doc.font('Helvetica').fontSize(11).fillColor('#444444');
    doc.text(`Number: ${invoice.number}`, MARGIN, MARGIN + 6, { align: 'right' });
    doc.text(`Status: ${invoice.status}`, { align: 'right' });
    doc.text(`Issue date: ${formatDate(invoice.issueDate)}`, { align: 'right' });
    doc.text(`Due date: ${formatDate(invoice.dueDate)}`, { align: 'right' });

    // Client
    doc.fillColor('#000000').font('Helvetica-Bold').fontSize(11).text('Bill to', MARGIN, 150);
    doc.font('Helvetica').text(invoice.client.name);
    doc.fillColor('#444444').text(invoice.client.email);

    // Table header
    let y = 220;
    const drawTableHeader = () => {
      doc.fillColor('#000000').font('Helvetica-Bold').fontSize(10);
      doc.text('Description', COL.description, y);
      doc.text('Qty', COL.quantity, y, { width: 50, align: 'right' });
      doc.text('Unit price', COL.unitPrice, y, { width: 70, align: 'right' });
      doc.text('Total', COL.total, y, { width: 75, align: 'right' });
      doc
        .moveTo(MARGIN, y + 16)
        .lineTo(RIGHT_EDGE, y + 16)
        .strokeColor('#999999')
        .stroke();
      y += 26;
    };
    drawTableHeader();

    // Lines
    doc.font('Helvetica').fontSize(10);
    for (const line of invoice.lines) {
      const descriptionHeight = doc.heightOfString(line.description, { width: 260 });
      if (y + descriptionHeight > PAGE_BOTTOM) {
        doc.addPage();
        y = MARGIN;
        drawTableHeader();
        doc.font('Helvetica').fontSize(10);
      }
      doc.fillColor('#000000');
      doc.text(line.description, COL.description, y, { width: 260 });
      doc.text(String(line.quantity), COL.quantity, y, { width: 50, align: 'right' });
      doc.text(formatUsd(line.unitPriceCents), COL.unitPrice, y, { width: 70, align: 'right' });
      doc.text(formatUsd(line.quantity * line.unitPriceCents), COL.total, y, {
        width: 75,
        align: 'right',
      });
      y += Math.max(descriptionHeight, 12) + 8;
    }

    // Total
    if (y + 40 > PAGE_BOTTOM) {
      doc.addPage();
      y = MARGIN;
    }
    doc
      .moveTo(COL.unitPrice - 20, y)
      .lineTo(RIGHT_EDGE, y)
      .strokeColor('#999999')
      .stroke();
    doc.font('Helvetica-Bold').fontSize(12).fillColor('#000000');
    doc.text('Total', COL.unitPrice - 20, y + 10, { width: 80 });
    doc.text(formatUsd(invoice.totalCents), COL.total, y + 10, { width: 75, align: 'right' });

    doc.end();
  });
}
