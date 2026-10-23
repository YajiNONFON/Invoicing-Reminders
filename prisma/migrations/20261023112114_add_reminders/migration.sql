-- CreateTable
CREATE TABLE "Reminder" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "day" DATE NOT NULL,
    "subject" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reminder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Reminder_invoiceId_day_key" ON "Reminder"("invoiceId", "day");

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
