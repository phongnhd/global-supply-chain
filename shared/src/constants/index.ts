/** Sample global catalogs — extend as needed */

export const SEA_PORTS = [
  { code: "SGSIN", name: "Singapore" },
  { code: "CNSHA", name: "Shanghai" },
  { code: "NLRTM", name: "Rotterdam" },
  { code: "USLAX", name: "Los Angeles" },
] as const;

export const AIRPORTS = [
  { iata: "HAN", name: "Noi Bai International" },
  { iata: "SGN", name: "Tan Son Nhat International" },
  { iata: "NRT", name: "Narita International" },
  { iata: "DXB", name: "Dubai International" },
] as const;

export const RAIL_STATIONS = [
  { code: "VN-SGN", name: "Saigon Central" },
  { code: "VN-HAN", name: "Hanoi Central" },
  { code: "CN-GZ", name: "Guangzhou South" },
  { code: "DE-FRA", name: "Frankfurt (Main) Hbf" },
] as const;
