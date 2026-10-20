import type { Request, Response } from 'express';
import { createInvoiceSchema, toInvoiceResponse } from './invoice.dto';
import { invoiceService } from './invoice.service';

export const invoiceController = {
  async create(req: Request, res: Response) {
    const input = createInvoiceSchema.parse(req.body);
    const invoice = await invoiceService.create(input);
    res.status(201).json(toInvoiceResponse(invoice));
  },
};
