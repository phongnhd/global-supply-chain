"use client";

import { useEffect, useRef, useState } from "react";
import { 
  Plane, 
  Building2, 
  Calendar, 
  FileText, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Paperclip
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { normalizeAgentText, processAgentDocument } from "@/lib/agent-document";

type Airport = { code: string; name: string; city?: string; country?: string };

const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export function AviationForm() {
  const [airports, setAirports] = useState<Airport[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiDone, setAiDone] = useState(false);
  const [airportsLoading, setAirportsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  // ─── Form States ────────────────────────────────────────────────────────────
  const [awbNumber, setAwbNumber] = useState("");
  const [flightNumber, setFlightNumber] = useState("");
  const [departureAirport, setDepartureAirport] = useState("");
  const [arrivalAirport, setArrivalAirport] = useState("");
  const [flightDate, setFlightDate] = useState("");
  const [arrivalDate, setArrivalDate] = useState("");
  const [warehouseCode, setWarehouseCode] = useState("");
  const [warehouseName, setWarehouseName] = useState("");
  const [customsPortName, setCustomsPortName] = useState("");
  const [processingUnitCode, setProcessingUnitCode] = useState("");

  const [errors, setErrors] = useState({ 
    awbNumber: "", 
    flightNumber: "", 
    airport: "",
    flightDate: "",
    arrivalDate: ""
  });
  
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

  const sanitize = (value: string) => value.replace(/[<>]/g, "").replace(/script/gi, "").replace(/[^\w\s\-\/]/g, "").trim().slice(0, 50);
  const validateAwb = (value: string) => !value ? "Số vận đơn là bắt buộc" : !/^[A-Za-z0-9]{3,4}[-\s]?[A-Za-z0-9]{7,11}$/.test(value) ? "Định dạng vận đơn không hợp lệ" : "";
  const validateFlight = (value: string) => !value ? "Số chuyến bay là bắt buộc" : !/^[A-Z0-9]{2,3}\d{1,4}$/i.test(value) ? "Số chuyến bay không đúng định dạng" : "";
  const getAirport = (code: string) => airports.find(a => a.code === code);
  const airportCode = (code: string) => getAirport(code)?.code ?? code;
  const airportName = (code: string) => getAirport(code)?.name ?? "AI extracted value";

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoadingAI(true);
      setAiDone(false);
      const ai = await processAgentDocument(file);

      setAwbNumber(normalizeAgentText(ai.awbNumber));
      setFlightNumber(normalizeAgentText(ai.flightNumber).toUpperCase());

      const departure = normalizeAgentText(ai.departureAirport, 8).toUpperCase();
      const arrival = normalizeAgentText(ai.arrivalAirport, 8).toUpperCase();
      if (departure) setDepartureAirport(departure);
      if (arrival) setArrivalAirport(arrival);

      setErrors({ awbNumber: "", flightNumber: "", airport: "", flightDate: "", arrivalDate: "" });
      setAiDone(true);
    } catch (error) {
      console.error(error);
      setResult("AI không thể xử lý tài liệu. Vui lòng nhập tay.");
    } finally {
      setLoadingAI(false);
      e.target.value = "";
    }
  };

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
    const airportError = departureAirport === arrivalAirport ? "Sân bay đi và sân bay đến không được trùng nhau" : "";
    const flightDateError = !flightDate ? "Ngày bay là bắt buộc" : "";
    const arrivalDateError = !arrivalDate ? "Ngày hàng đến là bắt buộc" : "";

    setErrors({ 
      awbNumber: awbError, 
      flightNumber: flightError, 
      airport: airportError,
      flightDate: flightDateError,
      arrivalDate: arrivalDateError
    });

    if (awbError || flightError || airportError || flightDateError || arrivalDateError) return;

    try {
      setLoading(true);
      const res = await fetch(`${apiBase}/api/v1/aviation/declaration`, {
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          awbNumber: cleanAwb, 
          flightNumber: cleanFlight, 
          departureAirport, 
          arrivalAirport,
          flightDate,
          arrivalDate,
          warehouseCode: sanitize(warehouseCode),
          warehouseName: sanitize(warehouseName),
          customsPortName: sanitize(customsPortName),
          processingUnitCode: sanitize(processingUnitCode)
        })
      });
      if (!res.ok) throw new Error("Failed submit");
      setResult("Khai báo thông tin hàng không thành công!");
      setAwbNumber("");
      setFlightNumber("");
      setFlightDate("");
      setArrivalDate("");
      setWarehouseCode("");
      setWarehouseName("");
      setCustomsPortName("");
      setProcessingUnitCode("");
    } catch (err) {
      console.error(err);
      setResult("Không thể gửi thông tin khai báo Hải quan");
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
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent>
        <form className="grid gap-6" onSubmit={onSubmit}>
          <div className="rounded-lg border border-dashed border-input bg-background p-4">
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground/80">
              <Paperclip className="h-4 w-4" /> Tải chứng từ để AI tự điền
            </label>
            <Input type="file" accept="image/*,.pdf" onChange={handleFileUpload} disabled={loadingAI || loading} />
            {loadingAI && (
              <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> AI đang phân tích dữ liệu...
              </p>
            )}
            {aiDone && (
              <p className="mt-2 flex items-center gap-2 text-sm text-green-600">
                <CheckCircle2 className="h-4 w-4" /> Đã tự điền dữ liệu tìm thấy.
              </p>
            )}
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3 flex items-center gap-2">
              <Plane className="h-4 w-4 text-muted-foreground" /> Thông tin chuyến bay & vận đơn
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground/70">Số vận đơn (MAWB/HAWB) <span className="text-red-500">*</span></label>
                <Input value={awbNumber} onChange={e => setAwbNumber(sanitize(e.target.value))} placeholder="VD: 123-45678901 hoặc HAWB123" />
                {errors.awbNumber && <p className="text-xs text-red-500 mt-1">{errors.awbNumber}</p>}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-foreground/70">Số chuyến bay <span className="text-red-500">*</span></label>
                <Input value={flightNumber} onChange={e => setFlightNumber(sanitize(e.target.value.toUpperCase()))} placeholder="VD: VN123, KE372" />
                {errors.flightNumber && <p className="text-xs text-red-500 mt-1">{errors.flightNumber}</p>}
              </div>

              {/* Departure Airport */}
              <div className="relative" ref={departureDropdownRef}>
                <label className="mb-1 block text-sm font-medium text-foreground/70">Sân bay đi (IATA) <span className="text-red-500">*</span></label>
                <button type="button" tabIndex={0} onKeyDown={e => handleTypeSearch(e.key, "departure")} onClick={() => setOpenDepartureDropdown(prev => !prev)} className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 text-sm">
                  {departureAirport ? (
                    <div className="flex w-full items-center overflow-hidden">
                      <span className="shrink-0 font-mono text-xs font-bold">{airportCode(departureAirport)}</span>
                      <span className="mx-2 shrink-0 text-muted-foreground">-</span>
                      <span className="min-w-0 flex-1 truncate text-left">{airportName(departureAirport)}</span>
                    </div>
                  ) : <span>Chọn sân bay đi</span>}
                </button>
                {renderDropdown(openDepartureDropdown, departureAirport, setDepartureAirport, "departure")}
              </div>

              {/* Arrival Airport */}
              <div className="relative" ref={arrivalDropdownRef}>
                <label className="mb-1 block text-sm font-medium text-foreground/70">Sân bay đến (IATA) <span className="text-red-500">*</span></label>
                <button type="button" tabIndex={0} onKeyDown={e => handleTypeSearch(e.key, "arrival")} onClick={() => setOpenArrivalDropdown(prev => !prev)} className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 text-sm">
                  {arrivalAirport ? (
                    <div className="flex w-full items-center overflow-hidden">
                      <span className="shrink-0 font-mono text-xs font-bold">{airportCode(arrivalAirport)}</span>
                      <span className="mx-2 shrink-0 text-muted-foreground">-</span>
                      <span className="min-w-0 flex-1 truncate text-left">{airportName(arrivalAirport)}</span>
                    </div>
                  ) : <span>Chọn sân bay đến</span>}
                </button>
                {renderDropdown(openArrivalDropdown, arrivalAirport, setArrivalAirport, "arrival")}
                {errors.airport && <p className="text-xs text-red-500 mt-1">{errors.airport}</p>}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-foreground/70">Ngày bay <span className="text-red-500">*</span></label>
                <Input type="date" value={flightDate} onChange={e => setFlightDate(e.target.value)} />
                {errors.flightDate && <p className="text-xs text-red-500 mt-1">{errors.flightDate}</p>}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-foreground/70">Ngày hàng đến <span className="text-red-500">*</span></label>
                <Input type="date" value={arrivalDate} onChange={e => setArrivalDate(e.target.value)} />
                {errors.arrivalDate && <p className="text-xs text-red-500 mt-1">{errors.arrivalDate}</p>}
              </div>
            </div>
          </div>

          {/* ─── PHẦN 2: KHO & ĐỊA ĐIỂM TIẾP NHẬN ───────────────────────────── */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" /> Kho & địa điểm xử lý Hải quan
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground/70">Mã kho lưu giữ</label>
                <Input value={warehouseCode} onChange={e => setWarehouseCode(sanitize(e.target.value))} placeholder="VD: 02B1A04 (Kho SCSC)" />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-foreground/70">Tên kho</label>
                <Input value={warehouseName} onChange={e => setWarehouseName(sanitize(e.target.value))} placeholder="VD: KHO SCSC, KHO TCS" />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-foreground/70">Tên cảng / cửa khẩu HQ</label>
                <Input value={customsPortName} onChange={e => setCustomsPortName(sanitize(e.target.value))} placeholder="VD: Cửa khẩu Cảng HKQT Tân Sơn Nhất" />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-foreground/70">Mã bộ phận xử lý tờ khai</label>
                <Input value={processingUnitCode} onChange={e => setProcessingUnitCode(sanitize(e.target.value.toUpperCase()))} placeholder="VD: 02B1, 01TE" />
              </div>
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full mt-2 gap-2" disabled={loading || airportsLoading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Đang xử lý dữ liệu...
              </>
            ) : (
              "Nộp tờ khai hàng không"
            )}
          </Button>
        </form>

        {result && (
          <div className={`mt-4 rounded-md p-3 text-sm flex items-center justify-center gap-2 font-medium ${
            result.includes("thành công") 
              ? "bg-green-50 text-green-700 border border-green-200" 
              : "bg-red-50 text-red-700 border border-red-200"
          }`}>
            {result.includes("thành công") ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            {result}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
