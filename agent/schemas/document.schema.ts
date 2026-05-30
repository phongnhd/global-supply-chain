import { z } from "zod";

export const documentSchema = z.object({
  senderName: z.string().nullable().optional(),
  productName: z.string().nullable().optional(),
  sku: z.string().nullable().optional(),
  originCountry: z.string().nullable().optional(),
  awbNumber: z.string().nullable().optional(),
  flightNumber: z.string().nullable().optional(),
  departureAirport: z.string().nullable().optional(),
  arrivalAirport: z.string().nullable().optional(),
  imoNumber: z.string().nullable().optional(),
  containerNumber: z.string().nullable().optional(),
  portOfLoading: z.string().nullable().optional(),
  portOfDischarge: z.string().nullable().optional(),
  consignmentNumber: z.string().nullable().optional(),
  trainNumber: z.string().nullable().optional(),
  originStation: z.string().nullable().optional(),
  destinationStation: z.string().nullable().optional(),
  transportMethod: z
    .enum(["Air Freight", "Sea Freight", "Rail Freight"])
    .nullable()
    .optional(),
});

export type DocumentData = z.infer<typeof documentSchema>;
