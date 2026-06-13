"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { 
  Train, 
  Box, 
  Calendar, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Paperclip,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { normalizeAgentText, processAgentDocument } from "@/lib/agent-document";

type LocationPoint = { code: string; name: string; country?: string };

const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

// Danh sách cửa khẩu đường sắt cố định tại Việt Nam
const railwayBorderGates = [
  "Đồng Đăng (Lạng Sơn)",
  "Lào Cai",
  "Hà Nội (Gia Lâm)"
];

export function RailwayForm() {
  const [stations, setStations] = useState<LocationPoint[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [stationsLoading, setStationsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiDone, setAiDone] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  // ─── Form States ────────────────────────────────────────────────────────────
  const [consignmentNumber, setConsignmentNumber] = useState(""); // Số vận đơn (CIM/SMGS) *
  const [trainNumber, setTrainNumber] = useState("");             // Số chuyến tàu
  const [originStation, setOriginStation] = useState("");         // Ga xuất phát
  const [destinationStation, setDestinationStation] = useState(""); // Ga đến (VN)
  const [departureDate, setDepartureDate] = useState("");         // Ngày khởi hành
  const [arrivalDate, setArrivalDate] = useState("");             // Ngày đến dự kiến
  const [wagonNumber, setWagonNumber] = useState("");             // Số toa / wagon
  const [borderGate, setBorderGate] = useState("");               // Cửa khẩu đường sắt VN

  const [errors, setErrors] = useState({ 
    consignmentNumber: "", 
    trainNumber: "", 
    stations: "",
    departureDate: "",
    arrivalDate: ""
  });
  
  const [openOriginDropdown, setOpenOriginDropdown] = useState(false);
  const [openDestinationDropdown, setOpenDestinationDropdown] = useState(false);
  
  const isFetchingRef = useRef(false);
  const originDropdownRef = useRef<HTMLDivElement>(null);
  const destinationDropdownRef = useRef<HTMLDivElement>(null);
  const typedKeysRef = useRef("");
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Gọi API lấy danh sách ga (tận dụng endpoint có sẵn hoặc cập nhật theo dự án của bạn)
  const fetchStations = useCallback(async (reset = false) => {
    if (isFetchingRef.current) return;
    try {
      isFetchingRef.current = true;
      reset ? setStationsLoading(true) : setLoadingMore(true);
      const nextPage = reset ? 1 : page;
      // Lưu ý: Endpoint này đang call tạm /api/seaports, bạn có thể đổi thành /api/stations khi có API riêng
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
        setStations(prev => {
          const existing = new Set(prev.map(s => s.code));
          return [...prev, ...data.filter(s => !existing.has(s.code))];
        });
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

  const sanitize = (value: string) => value.replace(/[<>]/g, "").replace(/script/gi, "").replace(/[^\w\s\-\/]/g, "").trim().slice(0, 40);
  const validateConsignment = (value: string) => !value ? "Số vận đơn đường sắt là bắt buộc" : "";
  const validateTrain = (value: string) => !value ? "Số chuyến tàu là bắt buộc" : "";
  const getStation = (code: string) => stations.find(s => s.code === code);
  const stationCode = (code: string) => getStation(code)?.code ?? code;
  const stationName = (code: string) => getStation(code)?.name ?? "AI extracted value";

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoadingAI(true);
      setAiDone(false);
      const ai = await processAgentDocument(file);

      setConsignmentNumber(normalizeAgentText(ai.consignmentNumber, 40).toUpperCase());
      setTrainNumber(normalizeAgentText(ai.trainNumber, 40).toUpperCase());

      const origin = normalizeAgentText(ai.originStation, 40).toUpperCase();
      const destination = normalizeAgentText(ai.destinationStation, 40).toUpperCase();
      if (origin) setOriginStation(origin);
      if (destination) setDestinationStation(destination);

      setErrors({ consignmentNumber: "", trainNumber: "", stations: "", departureDate: "", arrivalDate: "" });
      setAiDone(true);
    } catch (error) {
      console.error(error);
      setResult("AI không thể xử lý tài liệu. Vui lòng nhập tay.");
    } finally {
      setLoadingAI(false);
      e.target.value = "";
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);
    
    const cleanConsignment = sanitize(consignmentNumber.toUpperCase());
    const cleanTrain = sanitize(trainNumber.toUpperCase());
    
    const consignmentError = validateConsignment(cleanConsignment);
    const trainError = validateTrain(cleanTrain);
    const stationError = originStation === destinationStation ? "Ga xuất phát và ga đến không được trùng nhau" : "";
    const departureError = !departureDate ? "Vui lòng chọn ngày khởi hành" : "";
    const arrivalError = !arrivalDate ? "Vui lòng chọn ngày đến dự kiến" : "";

    setErrors({ 
      consignmentNumber: consignmentError, 
      trainNumber: trainError, 
      stations: stationError,
      departureDate: departureError,
      arrivalDate: arrivalError
    });

    if (consignmentError || trainError || stationError || departureError || arrivalError) return;
    
    try {
      setLoading(true);
      const res = await fetch(`${apiBase}/api/v1/railway/declaration`, {
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          consignmentNumber: cleanConsignment, 
          trainNumber: cleanTrain, 
          originStation, 
          destinationStation,
          departureDate,
          arrivalDate,
          wagonNumber: sanitize(wagonNumber),
          borderGate
        })
      });
      if (!res.ok) throw new Error("Failed submit");
      setResult("Khai báo thông tin đường sắt thành công!");
      
      setConsignmentNumber("");
      setTrainNumber("");
      setDepartureDate("");
      setArrivalDate("");
      setWagonNumber("");
    } catch (error) {
      console.error(error);
      setResult("Không thể nộp tờ khai hải quan đường sắt");
    } finally {
      setLoading(false);
    }
  };

  const renderStationOption = (station: LocationPoint, isSelected: boolean, onClick: () => void, key: string) => (
    <button key={key} type="button" onClick={onClick} className={`flex w-full items-center px-3 py-2 text-left text-sm transition-colors hover:bg-accent ${isSelected ? "bg-primary/10" : ""}`}>
      <div className="flex items-center gap-2 overflow-hidden w-full">
        <span className="shrink-0 font-mono text-xs font-bold">{station.code}</span>
        <span className="text-muted-foreground shrink-0">-</span>
        <span className="truncate flex-1">{station.name}</span>
        {station.country && <span className="shrink-0 text-xs text-muted-foreground ml-auto">{station.country}</span>}
      </div>
    </button>
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
              <Train className="h-4 w-4 text-muted-foreground" /> Thông tin tàu hỏa & vận đơn
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground/70">Số vận đơn đường sắt (CIM/SMGS) <span className="text-red-500">*</span></label>
                <Input value={consignmentNumber} onChange={e => setConsignmentNumber(sanitize(e.target.value.toUpperCase()))} placeholder="VD: CIM123456 hoặc SMGS789" />
                {errors.consignmentNumber && <p className="text-xs text-red-500 mt-1">{errors.consignmentNumber}</p>}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-foreground/70">Số chuyến tàu <span className="text-red-500">*</span></label>
                <Input value={trainNumber} onChange={e => setTrainNumber(sanitize(e.target.value.toUpperCase()))} placeholder="VD: SE3, MR1" />
                {errors.trainNumber && <p className="text-xs text-red-500 mt-1">{errors.trainNumber}</p>}
              </div>

              {/* Origin Station */}
              <div className="relative" ref={originDropdownRef}>
                <label className="mb-1 block text-sm font-medium text-foreground/70">Ga xuất phát <span className="text-red-500">*</span></label>
                <button type="button" tabIndex={0} onKeyDown={e => handleTypeSearch(e.key, "origin")} onClick={() => setOpenOriginDropdown(prev => !prev)} className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 text-sm">
                  {originStation ? (
                    <div className="flex w-full items-center overflow-hidden">
                      <span className="shrink-0 font-mono text-xs font-bold">{stationCode(originStation)}</span>
                      <span className="mx-2 shrink-0 text-muted-foreground">-</span>
                      <span className="min-w-0 flex-1 truncate text-left">{stationName(originStation)}</span>
                    </div>
                  ) : <span>Chọn ga xuất phát</span>}
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-60" />
                </button>
                {openOriginDropdown && (
                  <div onScroll={handleScroll} className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-input bg-background shadow-lg">
                    {stations.map((station, idx) => renderStationOption(station, originStation === station.code, () => { setOriginStation(station.code); setOpenOriginDropdown(false); }, `origin-${station.code}-${idx}`))}
                    {loadingMore && <div className="p-3 text-center text-xs text-muted-foreground animate-pulse">Đang tải thêm...</div>}
                  </div>
                )}
              </div>

              {/* Destination Station */}
              <div className="relative" ref={destinationDropdownRef}>
                <label className="mb-1 block text-sm font-medium text-foreground/70">Ga đến (VN) <span className="text-red-500">*</span></label>
                <button type="button" tabIndex={0} onKeyDown={e => handleTypeSearch(e.key, "destination")} onClick={() => setOpenDestinationDropdown(prev => !prev)} className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 text-sm">
                  {destinationStation ? (
                    <div className="flex w-full items-center overflow-hidden">
                      <span className="shrink-0 font-mono text-xs font-bold">{stationCode(destinationStation)}</span>
                      <span className="mx-2 shrink-0 text-muted-foreground">-</span>
                      <span className="min-w-0 flex-1 truncate text-left">{stationName(destinationStation)}</span>
                    </div>
                  ) : <span>Chọn ga đến</span>}
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-60" />
                </button>
                {openDestinationDropdown && (
                  <div onScroll={handleScroll} className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-input bg-background shadow-lg">
                    {stations.map((station, idx) => renderStationOption(station, destinationStation === station.code, () => { setDestinationStation(station.code); setOpenDestinationDropdown(false); }, `dest-${station.code}-${idx}`))}
                    {loadingMore && <div className="p-3 text-center text-xs text-muted-foreground animate-pulse">Đang tải thêm...</div>}
                  </div>
                )}
                {errors.stations && <p className="mt-1 text-xs text-red-500">{errors.stations}</p>}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-foreground/70">Ngày khởi hành <span className="text-red-500">*</span></label>
                <Input type="date" value={departureDate} onChange={e => setDepartureDate(e.target.value)} />
                {errors.departureDate && <p className="text-xs text-red-500 mt-1">{errors.departureDate}</p>}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-foreground/70">Ngày đến dự kiến <span className="text-red-500">*</span></label>
                <Input type="date" value={arrivalDate} onChange={e => setArrivalDate(e.target.value)} />
                {errors.arrivalDate && <p className="text-xs text-red-500 mt-1">{errors.arrivalDate}</p>}
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3 flex items-center gap-2">
              <Box className="h-4 w-4 text-muted-foreground" /> Thông tin toa xe & Cửa khẩu tiếp nhận
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground/70">Số toa / wagon</label>
                <Input value={wagonNumber} onChange={e => setWagonNumber(sanitize(e.target.value))} placeholder="VD: WAG123456" />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-foreground/70">Cửa khẩu đường sắt VN</label>
                <div className="relative">
                  <select 
                    value={borderGate} 
                    onChange={e => setBorderGate(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                  >
                    <option value="">-- Chọn cửa khẩu tiếp nhận --</option>
                    {railwayBorderGates.map(gate => (
                      <option key={gate} value={gate}>{gate}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-3 h-4 w-4 opacity-50 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Action Button duy nhất */}
          <Button type="submit" size="lg" className="w-full mt-2 gap-2" disabled={loading || stationsLoading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Đang xử lý dữ liệu...
              </>
            ) : (
              "Nộp tờ khai đường sắt"
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
