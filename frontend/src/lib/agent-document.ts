export type AgentDocumentData = {
  [key: string]: unknown;
  transportMethod?: string | null;
  awbNumber?: string | null;
  flightNumber?: string | null;
  departureAirport?: string | null;
  arrivalAirport?: string | null;
  imoNumber?: string | null;
  blNumber?: string | null;
  vesselName?: string | null;
  voyageNumber?: string | null;
  shippingLine?: string | null;
  containerNumber?: string | null;
  portOfLoading?: string | null;
  portOfDischarge?: string | null;
  consignmentNumber?: string | null;
  trainNumber?: string | null;
  originStation?: string | null;
  destinationStation?: string | null;
};

const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export async function processAgentDocument(file: File): Promise<AgentDocumentData> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${apiBase}/api/agent/process-document`, {
    method: "POST",
    body: formData,
  });

  const payload = await res.json();

  if (!res.ok || payload?.success === false) {
    throw new Error(payload?.error || payload?.message || "Agent document processing failed");
  }

  return payload.response || payload.data || payload;
}

export function normalizeAgentText(value: unknown, maxLength = 80) {
  return String(value ?? "")
    .replace(/[<>]/g, "")
    .replace(/script/gi, "")
    .replace(/[^\p{L}\p{N}\s\-_/.,]/gu, "")
    .trim()
    .slice(0, maxLength);
}

export function mapTransportMethod(value: unknown): "Air" | "Sea" | "Road" {
  const method = String(value ?? "").toLowerCase();

  if (method.includes("sea") || method.includes("ocean") || method.includes("vessel")) {
    return "Sea";
  }

  if (method.includes("rail") || method.includes("train")) {
    return "Road";
  }

  return "Air";
}
