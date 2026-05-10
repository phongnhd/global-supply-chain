"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type LocationPoint = { code: string; name: string; country?: string };

const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export function RailwayForm() {
  const [stations, setStations] = useState<LocationPoint[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [stationsLoading, setStationsLoading] = useState(false);
  const [consignmentNumber, setConsignmentNumber] = useState("");
  const [trainNumber, setTrainNumber] = useState("");
  const [originStation, setOriginStation] = useState("");
  const [destinationStation, setDestinationStation] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [errors, setErrors] = useState({ consignmentNumber: "", trainNumber: "", stations: "" });
  const [openOriginDropdown, setOpenOriginDropdown] = useState(false);
  const [openDestinationDropdown, setOpenDestinationDropdown] = useState(false);
  
  const isFetchingRef = useRef(false);
  const originDropdownRef = useRef<HTMLDivElement>(null);
  const destinationDropdownRef = useRef<HTMLDivElement>(null);
  const originScrollRef = useRef<HTMLDivElement>(null);
  const destinationScrollRef = useRef<HTMLDivElement>(null);
  const typedKeysRef = useRef("");
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchStations = useCallback(async (reset = false) => {
    if (isFetchingRef.current) return;
    try {
      isFetchingRef.current = true;
      reset ? setStationsLoading(true) : setLoadingMore(true);
      const nextPage = reset ? 1 : page;
      const res = await fetch(`${apiBase}/api/seaports?page=${nextPage}&limit=20`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch stations");
      const json = await res.json();
      const data: LocationPoint[] = json.data ?? [];
      
      if (reset) {
        setStations(data);
        setPage(2);
        if (data.length >= 2) {
          setOriginStation(data[0].code);
          setDestinationStation(data[1].code);
        }
      } else {
        setStations(prev => [...prev, ...data]);
        setPage(prev => prev + 1);
      }
      setHasMore(json.hasMore);
    } catch (error) {
      console.error(error);
    } finally {
      isFetchingRef.current = false;
      setStationsLoading(false);
      setLoadingMore(false);
    }
  }, [page]);

  useEffect(() => { fetchStations(true); }, []);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (originDropdownRef.current && !originDropdownRef.current.contains(event.target as Node)) setOpenOriginDropdown(false);
      if (destinationDropdownRef.current && !destinationDropdownRef.current.contains(event.target as Node)) setOpenDestinationDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    if (loadingMore || stationsLoading || !hasMore) return;
    const target = e.currentTarget;
    if (target.scrollHeight - target.scrollTop - target.clientHeight < 100) fetchStations(false);
  }, [loadingMore, stationsLoading, hasMore, fetchStations]);

  const handleTypeSearch = (key: string, type: "origin" | "destination") => {
    if (key.length !== 1) return;
    typedKeysRef.current += key.toLowerCase();
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => { typedKeysRef.current = ""; }, 500);
    const found = stations.find(s => s.name.toLowerCase().startsWith(typedKeysRef.current));
    if (!found) return;
    type === "origin" ? setOriginStation(found.code) : setDestinationStation(found.code);
  };

  const sanitize = (value: string) => value.replace(/[<>]/g, "").replace(/script/gi, "").replace(/[^\w\s\-]/g, "").trim().slice(0, 30);
  const validateConsignment = (value: string) => !value ? "Consignment number is required" : !/^[A-Z]{3}\d{6}$/i.test(value) ? "Format must be RCN123456" : "";
  const validateTrain = (value: string) => !value ? "Train number is required" : !/^[A-Z]{1,3}\d{1,4}$/i.test(value) ? "Invalid train number" : "";
  const getStation = (code: string) => stations.find(s => s.code === code);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);
    const cleanConsignment = sanitize(consignmentNumber.toUpperCase());
    const cleanTrain = sanitize(trainNumber.toUpperCase());
    const consignmentError = validateConsignment(cleanConsignment);
    const trainError = validateTrain(cleanTrain);
    const stationError = originStation === destinationStation ? "Stations must be different" : "";
    setErrors({ consignmentNumber: consignmentError, trainNumber: trainError, stations: stationError });
    if (consignmentError || trainError || stationError) return;
    
    try {
      setLoading(true);
      const res = await fetch(`${apiBase}/api/v1/railway/declaration`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ consignmentNumber: cleanConsignment, trainNumber: cleanTrain, originStation, destinationStation })
      });
      if (!res.ok) throw new Error("Failed submit");
      setResult("Declaration submitted successfully");
      setConsignmentNumber("");
      setTrainNumber("");
    } catch (error) {
      console.error(error);
      setResult("Unable to submit declaration");
    } finally {
      setLoading(false);
    }
  };

  const renderStation = (station: LocationPoint) => (
    <div className="flex items-center gap-2 overflow-hidden">
      <span className="shrink-0 font-mono text-xs font-medium">{station.code}</span>
      <span className="shrink-0 text-muted-foreground">-</span>
      <span className="truncate">{station.name}</span>
      {station.country && <span className="shrink-0 text-xs text-muted-foreground">{station.country}</span>}
    </div>
  );

  return (
    <Card>
      <CardContent>
        <form className="grid gap-4" onSubmit={onSubmit}>
          <div>
            <label className="mb-1 block text-sm text-foreground/70">Consignment Number</label>
            <Input value={consignmentNumber} onChange={e => setConsignmentNumber(sanitize(e.target.value.toUpperCase()))} placeholder="RCN123456" maxLength={9} />
            {errors.consignmentNumber && <p className="text-xs text-red-500">{errors.consignmentNumber}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm text-foreground/70">Train Number</label>
            <Input value={trainNumber} onChange={e => setTrainNumber(sanitize(e.target.value.toUpperCase()))} placeholder="SE3" maxLength={7} />
            {errors.trainNumber && <p className="text-xs text-red-500">{errors.trainNumber}</p>}
          </div>

          {/* Origin */}
          <div className="relative" ref={originDropdownRef}>
            <label className="mb-1 block text-sm text-foreground/70">Departure Station</label>
            <button type="button" tabIndex={0} onKeyDown={e => handleTypeSearch(e.key, "origin")} onClick={() => setOpenOriginDropdown(prev => !prev)} className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 text-sm">
              {originStation ? <div className="flex w-full items-center overflow-hidden">{renderStation(getStation(originStation) as LocationPoint)}</div> : <span>Select station</span>}
              <svg className="ml-2 h-4 w-4 shrink-0 opacity-60" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {openOriginDropdown && (
              <div ref={originScrollRef} onScroll={handleScroll} className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-input bg-background shadow-lg">
                {stations.map((station, idx) => (
                  <button key={`${station.code}-${idx}`} type="button" onClick={() => { setOriginStation(station.code); setOpenOriginDropdown(false); }} className={`flex w-full items-center px-3 py-2 text-left text-sm hover:bg-accent transition-colors ${originStation === station.code ? "bg-primary/10" : ""}`}>
                    {renderStation(station)}
                  </button>
                ))}
                {loadingMore && <div className="p-3 text-center text-sm">Loading more...</div>}
              </div>
            )}
          </div>

          {/* Destination */}
          <div className="relative" ref={destinationDropdownRef}>
            <label className="mb-1 block text-sm text-foreground/70">Arrival Station</label>
            <button type="button" tabIndex={0} onKeyDown={e => handleTypeSearch(e.key, "destination")} onClick={() => setOpenDestinationDropdown(prev => !prev)} className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 text-sm">
              {destinationStation ? <div className="flex w-full items-center overflow-hidden">{renderStation(getStation(destinationStation) as LocationPoint)}</div> : <span>Select station</span>}
              <svg className="ml-2 h-4 w-4 shrink-0 opacity-60" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {openDestinationDropdown && (
              <div ref={destinationScrollRef} onScroll={handleScroll} className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-input bg-background shadow-lg">
                {stations.map((station, idx) => (
                  <button key={`${station.code}-dst-${idx}`} type="button" onClick={() => { setDestinationStation(station.code); setOpenDestinationDropdown(false); }} className={`flex w-full items-center px-3 py-2 text-left text-sm hover:bg-accent transition-colors ${destinationStation === station.code ? "bg-primary/10" : ""}`}>
                    {renderStation(station)}
                  </button>
                ))}
                {loadingMore && <div className="p-3 text-center text-sm">Loading more...</div>}
                {!hasMore && stations.length > 0 && <div className="p-3 text-center text-xs text-muted-foreground">End of list</div>}
              </div>
            )}
            {errors.stations && <p className="mt-1 text-xs text-red-500">{errors.stations}</p>}
          </div>

          <Button type="submit" disabled={loading || stationsLoading}>{loading ? "Submitting..." : "Submit Declaration"}</Button>
        </form>
        {result && <div className="mt-4 rounded-md bg-foreground/5 p-3 text-sm">{result}</div>}
      </CardContent>
    </Card>
  );
}