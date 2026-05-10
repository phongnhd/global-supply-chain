export type TransportMode = "rail" | "sea" | "air";

export interface BirthCertificatePayload {
  productName: string;
  sku: string;
  originCountry: string;
  metadataCid?: string;
  contentHash: string;
}

export interface AviationDeclaration {
  awbNumber: string;
  flightNumber: string;
  departureAirport: string;
  arrivalAirport: string;
  objectId?: string;
}

export interface MaritimeDeclaration {
  imoNumber: string;
  containerId: string;
  portOfLoading: string;
  portOfDischarge: string;
  objectId?: string;
}

export interface RailwayDeclaration {
  wagonId: string;
  originStation: string;
  destinationStation: string;
  objectId?: string;
}
