import type { Request, Response } from 'express';
import {
  createInvoiceSchema,
  invoiceIdParamSchema,
  toInvoiceDetailResponse,
  toInvoiceResponse,
} from './invoice.dto';
import { invoiceService } from './invoice.service';

export const invoiceController = {
  async create(req: Request, res: Response) {
    const input = createInvoiceSchema.parse(req.body);
    const invoice = await invoiceService.create(input);
    res.status(201).json(toInvoiceResponse(invoice));
  },

  async list(_req: Request, res: Response) {
    const invoices = await invoiceService.list();
    res.json(invoices.map(toInvoiceResponse));
  },

  async getById(req: Request, res: Response) {
    const { id } = invoiceIdParamSchema.parse(req.params);
    const invoice = await invoiceService.getById(id);
    res.json(toInvoiceDetailResponse(invoice));
  },

  async send(req: Request, res: Response) {
    const { id } = invoiceIdParamSchema.parse(req.params);
    const invoice = await invoiceService.send(id);
    res.json(toInvoiceResponse(invoice));
  },

  async pay(req: Request, res: Response) {
    const { id } = invoiceIdParamSchema.parse(req.params);
    const invoice = await invoiceService.pay(id);
    res.json(toInvoiceResponse(invoice));
  },

  async pdf(req: Request, res: Response) {
    const { id } = invoiceIdParamSchema.parse(req.params);
    const { filename, content } = await invoiceService.getPdf(id);
    res.type('application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    res.send(content);
  },
};
