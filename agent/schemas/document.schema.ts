import { z } from "zod";

const nullableText = z
  .preprocess((value) => {
    if (value === undefined || value === null) return null;
    return String(value);
  }, z.string().nullable())
  .optional();

export const documentSchema = z.object({
  declarationNumber: nullableText,
  declarationType: nullableText,
  registrationDate: nullableText,
  customsOffice: nullableText,
  importerTaxId: nullableText,
  taxId: nullableText,
  importerName: nullableText,
  exporterName: nullableText,
  exporterCountryCode: nullableText,
  countryCode: nullableText,
  senderName: nullableText,
  productName: nullableText,
  sku: nullableText,
  hsCode: nullableText,
  hsCodeRepresentative: nullableText,
  goodsDescription: nullableText,
  description: nullableText,
  quantity1: nullableText,
  quantity: nullableText,
  unit: nullableText,
  originCountry: nullableText,
  totalTax: nullableText,
  awbNumber: nullableText,
  flightNumber: nullableText,
  departureAirport: nullableText,
  arrivalAirport: nullableText,
  imoNumber: nullableText,
  blNumber: nullableText,
  vesselName: nullableText,
  voyageNumber: nullableText,
  shippingLine: nullableText,
  containerNumber: nullableText,
  portOfLoading: nullableText,
  portOfDischarge: nullableText,
  consignmentNumber: nullableText,
  trainNumber: nullableText,
  originStation: nullableText,
  destinationStation: nullableText,
  transportMethod: z
    .enum(["Air Freight", "Sea Freight", "Rail Freight"])
    .nullable()
    .optional(),
});

export type DocumentData = z.infer<typeof documentSchema>;
