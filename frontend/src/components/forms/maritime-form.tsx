"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Seaport = { code: string; name: string; country?: string };

const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export function MaritimeForm() {
  const [ports, setPorts] = useState<Seaport[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [portsLoading, setPortsLoading] = useState(false);
  const [imoNumber, setImoNumber] = useState("");
  const [containerNumber, setContainerNumber] = useState("");
  const [portOfLoading, setPortOfLoading] = useState("");
  const [portOfDischarge, setPortOfDischarge] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [errors, setErrors] = useState({ imoNumber: "", containerNumber: "", ports: "" });
  const [openLoadingDropdown, setOpenLoadingDropdown] = useState(false);
  const [openDischargeDropdown, setOpenDischargeDropdown] = useState(false);

  const isFetchingRef = useRef(false);
  const loadingDropdownRef = useRef<HTMLDivElement>(null);
  const dischargeDropdownRef = useRef<HTMLDivElement>(null);
  const typedKeysRef = useRef("");
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchPorts = useCallback(async (reset = false) => {
    if (isFetchingRef.current) return;
    try {
      isFetchingRef.current = true;
      reset ? setPortsLoading(true) : setLoadingMore(true);
      const nextPage = reset ? 1 : page;
      const res = await fetch(`${apiBase}/api/seaports?page=${nextPage}&limit=20`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch seaports");
      const json = await res.json();
      const data: Seaport[] = json.data ?? [];

      if (reset) {
        setPorts(data);
        setPage(2);
        if (data.length >= 2) {
          setPortOfLoading(data[0].code);
          setPortOfDischarge(data[1].code);
        }
      } else {
        setPorts(prev => {
          const existing = new Set(prev.map(p => p.code));
          return [...prev, ...data.filter(p => !existing.has(p.code))];
        });
        setPage(prev => prev + 1);
      }
      setHasMore(json.hasMore);
    } catch (error) {
      console.error(error);
    } finally {
      isFetchingRef.current = false;
      setPortsLoading(false);
      setLoadingMore(false);
    }
  }, [page]);

  useEffect(() => { fetchPorts(true); }, []);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (loadingDropdownRef.current && !loadingDropdownRef.current.contains(event.target as Node)) setOpenLoadingDropdown(false);
      if (dischargeDropdownRef.current && !dischargeDropdownRef.current.contains(event.target as Node)) setOpenDischargeDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleTypeSearch = (key: string, type: "loading" | "discharge") => {
    if (key.length !== 1) return;
    typedKeysRef.current += key.toLowerCase();
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => { typedKeysRef.current = ""; }, 500);
    const found = ports.find(port => port.name.toLowerCase().startsWith(typedKeysRef.current));
    if (!found) return;
    type === "loading" ? setPortOfLoading(found.code) : setPortOfDischarge(found.code);
  };

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    if (loadingMore || portsLoading || !hasMore) return;
    const target = e.currentTarget;
    if (target.scrollHeight - target.scrollTop - target.clientHeight < 100) fetchPorts(false);
  }, [loadingMore, portsLoading, hasMore, fetchPorts]);

  const sanitize = (value: string) => value.replace(/[<>]/g, "").replace(/script/gi, "").replace(/[^\w\s\-]/g, "").trim().slice(0, 30);
  const validateIMO = (value: string) => !value ? "IMO number is required" : !/^\d{7}$/.test(value) ? "IMO must contain 7 digits" : "";
  const validateContainer = (value: string) => !value ? "Container number is required" : !/^[A-Z]{4}\d{7}$/i.test(value) ? "Invalid container format" : "";
  const getPort = (code: string) => ports.find(p => p.code === code);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);
    const cleanIMO = sanitize(imoNumber);
    const cleanContainer = sanitize(containerNumber.toUpperCase());
    const imoError = validateIMO(cleanIMO);
    const containerError = validateContainer(cleanContainer);
    const portsError = portOfLoading === portOfDischarge ? "Ports must be different" : "";
    setErrors({ imoNumber: imoError, containerNumber: containerError, ports: portsError });
    if (imoError || containerError || portsError) return;

    try {
      setLoading(true);
      const res = await fetch(`${apiBase}/api/v1/maritime/declaration`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imoNumber: cleanIMO, containerNumber: cleanContainer, portOfLoading, portOfDischarge })
      });
      if (!res.ok) throw new Error("Failed submit");
      setResult("Declaration submitted successfully");
      setImoNumber("");
      setContainerNumber("");
    } catch (error) {
      console.error(error);
      setResult("Unable to submit declaration");
    } finally {
      setLoading(false);
    }
  };

  const renderPortOption = (port: Seaport, isSelected: boolean, onClick: () => void, key: string) => (
    <button key={key} type="button" onClick={onClick} className={`flex w-full items-center px-3 py-2 text-left text-sm hover:bg-accent ${isSelected ? "bg-primary/10" : ""}`}>
      <div className="flex items-center gap-2 overflow-hidden">
        <span className="shrink-0 font-mono text-xs font-medium">{port.code}</span>
        <span className="text-muted-foreground">-</span>
   <span className="truncate">{port.name} Port</span>
        {port.country && <span className="shrink-0 text-xs text-muted-foreground">{port.country}</span>}
      </div>
    </button>
  );

  const renderDropdown = (open: boolean, selectedPort: string, onSelect: (code: string) => void, type: string) => open && (
    <div onScroll={handleScroll} className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-input bg-background shadow-lg">
      {ports.map(port => renderPortOption(port, selectedPort === port.code, () => { onSelect(port.code); }, `${type}-${port.code}`))}
      {loadingMore && <div className="p-3 text-center text-sm">Loading more...</div>}
    </div>
  );

  return (
    <Card>
      <CardContent>
        <form className="grid gap-4" onSubmit={onSubmit}>
          <div>
            <label className="mb-1 block text-sm text-foreground/70">IMO Number</label>
            <Input value={imoNumber} onChange={e => setImoNumber(sanitize(e.target.value))} placeholder="9395044" maxLength={7} />
            {errors.imoNumber && <p className="text-xs text-red-500">{errors.imoNumber}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm text-foreground/70">Container Number</label>
            <Input value={containerNumber} onChange={e => setContainerNumber(sanitize(e.target.value.toUpperCase()))} placeholder="MSCU1234567" maxLength={11} />
            {errors.containerNumber && <p className="text-xs text-red-500">{errors.containerNumber}</p>}
          </div>

          {/* Port of Loading */}
          <div className="relative" ref={loadingDropdownRef}>
            <label className="mb-1 block text-sm text-foreground/70">Port of Loading</label>
            <button type="button" tabIndex={0} onKeyDown={e => handleTypeSearch(e.key, "loading")} onClick={() => setOpenLoadingDropdown(prev => !prev)} className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 text-sm">
              {portOfLoading ? (
                <div className="flex w-full items-center overflow-hidden">
                  <span className="shrink-0 font-mono text-xs">{getPort(portOfLoading)?.code}</span>
                  <span className="mx-1 shrink-0 text-muted-foreground">-</span>
                 <span className="min-w-0 flex-1 truncate text-left"> {getPort(portOfLoading)?.name} Port</span>
                  <span className="ml-4 shrink-0 text-xs text-muted-foreground">{getPort(portOfLoading)?.country}</span>
                </div>
              ) : <span>Select port</span>}
              <svg className="ml-2 h-4 w-4 shrink-0 opacity-60" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {renderDropdown(openLoadingDropdown, portOfLoading, setPortOfLoading, "loading")}
          </div>

          {/* Port of Discharge */}
          <div className="relative" ref={dischargeDropdownRef}>
            <label className="mb-1 block text-sm text-foreground/70">Port of Discharge</label>
            <button type="button" tabIndex={0} onKeyDown={e => handleTypeSearch(e.key, "discharge")} onClick={() => setOpenDischargeDropdown(prev => !prev)} className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 text-sm">
              {portOfDischarge ? (
                <div className="flex w-full items-center overflow-hidden">
                  <span className="shrink-0 font-mono text-xs">{getPort(portOfDischarge)?.code}</span>
                  <span className="mx-1 shrink-0 text-muted-foreground">-</span>
                  <span className="min-w-0 flex-1 truncate text-left">{getPort(portOfDischarge)?.name}</span>
                  <span className="ml-4 shrink-0 text-xs text-muted-foreground">{getPort(portOfDischarge)?.country}</span>
                </div>
              ) : <span>Select port</span>}
              <svg className="ml-2 h-4 w-4 shrink-0 opacity-60" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {renderDropdown(openDischargeDropdown, portOfDischarge, setPortOfDischarge, "discharge")}
            {errors.ports && <p className="mt-1 text-xs text-red-500">{errors.ports}</p>}
          </div>

          <Button type="submit" disabled={loading || portsLoading}>{loading ? "Submitting..." : "Submit Declaration"}</Button>
        </form>
        {result && <div className="mt-4 rounded-md bg-foreground/5 p-3 text-sm">{result}</div>}
      </CardContent>
    </Card>
  );
}