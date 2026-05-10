"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Airport = { code: string; name: string; city?: string; country?: string };

const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export function AviationForm() {
  const [airports, setAirports] = useState<Airport[]>([]);
  const [page, setPage] = useState(1);
  const [awbNumber, setAwbNumber] = useState("");
  const [flightNumber, setFlightNumber] = useState("");
  const [departureAirport, setDepartureAirport] = useState("");
  const [arrivalAirport, setArrivalAirport] = useState("");
  const [loading, setLoading] = useState(false);
  const [airportsLoading, setAirportsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [errors, setErrors] = useState({ awbNumber: "", flightNumber: "", airport: "" });
  const [openDepartureDropdown, setOpenDepartureDropdown] = useState(false);
  const [openArrivalDropdown, setOpenArrivalDropdown] = useState(false);

  const departureDropdownRef = useRef<HTMLDivElement>(null);
  const arrivalDropdownRef = useRef<HTMLDivElement>(null);
  const typedKeysRef = useRef("");
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchAirports = async (reset = false) => {
    try {
      setAirportsLoading(true);
      const nextPage = reset ? 1 : page;
      const res = await fetch(`${apiBase}/api/airports?page=${nextPage}&limit=50`);
      if (!res.ok) throw new Error("Failed to fetch airports");
      const json = await res.json();
      const data: Airport[] = json.data ?? [];

      if (reset) {
        setAirports(data);
        setPage(2);
        if (data.length >= 2) {
          setDepartureAirport(data[0].code);
          setArrivalAirport(data[1].code);
        }
      } else {
        setAirports(prev => [...prev, ...data]);
        setPage(prev => prev + 1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAirportsLoading(false);
    }
  };

  useEffect(() => { fetchAirports(true); }, []);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (departureDropdownRef.current && !departureDropdownRef.current.contains(event.target as Node)) setOpenDepartureDropdown(false);
      if (arrivalDropdownRef.current && !arrivalDropdownRef.current.contains(event.target as Node)) setOpenArrivalDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const sanitize = (value: string) => value.replace(/[<>]/g, "").replace(/script/gi, "").replace(/[^\w\s\-]/g, "").trim().slice(0, 50);
  const validateAwb = (value: string) => !value ? "AWB number is required" : !/^\d{3}-\d{8}$/.test(value) ? "Format must be 123-45678901" : "";
  const validateFlight = (value: string) => !value ? "Flight number is required" : !/^[A-Z]{2}\d{1,4}$/i.test(value) ? "Invalid flight number" : "";
  const getAirport = (code: string) => airports.find(a => a.code === code);

  const handleTypeSearch = (key: string, type: "departure" | "arrival") => {
    if (key.length !== 1) return;
    typedKeysRef.current += key.toLowerCase();
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => { typedKeysRef.current = ""; }, 500);
    const found = airports.find(airport => airport.name.toLowerCase().startsWith(typedKeysRef.current));
    if (!found) return;
    type === "departure" ? setDepartureAirport(found.code) : setArrivalAirport(found.code);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);
    const cleanAwb = sanitize(awbNumber);
    const cleanFlight = sanitize(flightNumber.toUpperCase());
    const awbError = validateAwb(cleanAwb);
    const flightError = validateFlight(cleanFlight);
    const airportError = departureAirport === arrivalAirport ? "Departure and arrival airports must differ" : "";
    setErrors({ awbNumber: awbError, flightNumber: flightError, airport: airportError });
    if (awbError || flightError || airportError) return;

    try {
      setLoading(true);
      const res = await fetch(`${apiBase}/api/v1/aviation/declaration`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ awbNumber: cleanAwb, flightNumber: cleanFlight, departureAirport, arrivalAirport })
      });
      if (!res.ok) throw new Error("Failed submit");
      setResult("Declaration submitted successfully");
      setAwbNumber("");
      setFlightNumber("");
    } catch (err) {
      console.error(err);
      setResult("Unable to submit declaration");
    } finally {
      setLoading(false);
    }
  };

  const renderAirportButton = (airport: Airport, isSelected: boolean, onClick: () => void, key: string) => (
    <button key={key} type="button" onClick={onClick} className={`flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors hover:bg-accent ${isSelected ? "bg-primary/10" : ""}`}>
      <div className="flex w-full items-center overflow-hidden">
        <span className="shrink-0 font-mono text-xs">{airport.code}</span>
        <span className="mx-2 shrink-0 text-muted-foreground">-</span>
        <span className="truncate"> {airport.name} {!airport.name.toLowerCase().includes("airport") && " Airport"}</span>
        <span className="ml-auto shrink-0 text-xs text-muted-foreground">{airport.country}</span>
      </div>
    </button>
  );

  const renderDropdown = (open: boolean, selectedAirport: string, onSelect: (code: string) => void, type: string) => open && (
    <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-input bg-background shadow-lg">
      {airports.map(airport => renderAirportButton(airport, selectedAirport === airport.code, () => { onSelect(airport.code); }, `${type}-${airport.code}`))}
    </div>
  );

  return (
    <Card>
      <CardContent>
        <form className="grid gap-4" onSubmit={onSubmit}>
          <div>
            <label className="mb-1 block text-sm text-foreground/70">AWB Number</label>
            <Input value={awbNumber} onChange={e => setAwbNumber(sanitize(e.target.value))} placeholder="123-45678901" />
            {errors.awbNumber && <p className="text-xs text-red-500">{errors.awbNumber}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm text-foreground/70">Flight Number</label>
            <Input value={flightNumber} onChange={e => setFlightNumber(sanitize(e.target.value.toUpperCase()))} placeholder="VN123" />
            {errors.flightNumber && <p className="text-xs text-red-500">{errors.flightNumber}</p>}
          </div>

          {/* Departure Airport */}
          <div className="relative" ref={departureDropdownRef}>
            <label className="mb-1 block text-sm text-foreground/70">Departure Airport</label>
            <button type="button" tabIndex={0} onKeyDown={e => handleTypeSearch(e.key, "departure")} onClick={() => setOpenDepartureDropdown(prev => !prev)} className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 text-sm">
              {departureAirport ? (
                <div className="flex w-full items-center overflow-hidden">
                  <span className="shrink-0 font-mono text-xs">{getAirport(departureAirport)?.code}</span>
                  <span className="mx-2 shrink-0 text-muted-foreground">-</span>
                  <span className="min-w-0 flex-1 truncate text-left">{getAirport(departureAirport)?.name}</span>
                  <span className="ml-4 shrink-0 text-xs text-muted-foreground">{getAirport(departureAirport)?.country}</span>
                </div>
              ) : <span>Select airport</span>}
            </button>
            {renderDropdown(openDepartureDropdown, departureAirport, setDepartureAirport, "departure")}
          </div>

          {/* Arrival Airport */}
          <div className="relative" ref={arrivalDropdownRef}>
            <label className="mb-1 block text-sm text-foreground/70">Arrival Airport</label>
            <button type="button" tabIndex={0} onKeyDown={e => handleTypeSearch(e.key, "arrival")} onClick={() => setOpenArrivalDropdown(prev => !prev)} className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 text-sm">
              {arrivalAirport ? (
                <div className="flex w-full items-center overflow-hidden">
                  <span className="shrink-0 font-mono text-xs">{getAirport(arrivalAirport)?.code}</span>
                  <span className="mx-2 shrink-0 text-muted-foreground">-</span>
                  <span className="min-w-0 flex-1 truncate text-left">
                    {getAirport(arrivalAirport)?.name}
                    {!getAirport(arrivalAirport)?.name
                      ?.toLowerCase()
                      .includes("airport") && " Airport"}
                  </span>
                  <span className="ml-4 shrink-0 text-xs text-muted-foreground">{getAirport(arrivalAirport)?.country}</span>
                </div>
              ) : <span>Select airport</span>}
            </button>
            {renderDropdown(openArrivalDropdown, arrivalAirport, setArrivalAirport, "arrival")}
            {errors.airport && <p className="text-xs text-red-500">{errors.airport}</p>}
          </div>

          <Button type="submit" disabled={loading || airportsLoading}>
            {loading ? "Submitting..." : "Submit Declaration"}
          </Button>
        </form>
        {result && <div className="mt-4 rounded-md bg-foreground/5 p-3 text-sm">{result}</div>}
      </CardContent>
    </Card>
  );
}