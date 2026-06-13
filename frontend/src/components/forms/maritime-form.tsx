"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { 
  Ship, 
  Container, 
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

type Seaport = { code: string; name: string; country?: string };

const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

// Danh sách hãng tàu cố định
const shippingLines = [
  "MAERSK", "MSC", "CMA CGM", "COSCO", "Evergreen", "Hapag-Lloyd", "ONE", "Yang Ming"
];

// Danh sách loại container cố định
const containerTypes = [
  "20' DC", "40' DC", "40' HC", "20' RF (lạnh)", "40' RF (lạnh)", "LCL"
];

export function MaritimeForm() {
  const [ports, setPorts] = useState<Seaport[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [portsLoading, setPortsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiDone, setAiDone] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  // ─── Form States ────────────────────────────────────────────────────────────
  const [imoNumber, setImoNumber] = useState("");
  const [blNumber, setBlNumber] = useState("");               // Số vận đơn B/L *
  const [vesselName, setVesselName] = useState("");             // Tên tàu
  const [voyageNumber, setVoyageNumber] = useState("");         // Chuyến tàu (Voyage)
  const [shippingLine, setShippingLine] = useState("");         // Hãng tàu
  
  const [portOfLoading, setPortOfLoading] = useState("");       // POL
  const [portOfDischarge, setPortOfDischarge] = useState("");     // POD
  const [etdDate, setEtdDate] = useState("");                   // Ngày tàu đi
  const [etaDate, setEtaDate] = useState("");                   // Ngày tàu đến

  const [containerNumber, setContainerNumber] = useState("");   // Số container
  const [containerType, setContainerType] = useState("");       // Loại container
  const [sealNumber, setSealNumber] = useState("");             // Số seal
  const [customsPort, setCustomsPort] = useState("");           // Cảng HQ tiếp nhận
  const [warehouseLocation, setWarehouseLocation] = useState(""); // Địa điểm lưu kho

  const [errors, setErrors] = useState({ 
    blNumber: "",
    imoNumber: "", 
    containerNumber: "", 
    ports: "",
    etdDate: "",
    etaDate: ""
  });
  
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

  const sanitize = (value: string) => value.replace(/[<>]/g, "").replace(/script/gi, "").replace(/[^\w\s\-\/]/g, "").trim().slice(0, 40);
  const validateBL = (value: string) => !value ? "Số vận đơn B/L là bắt buộc" : "";
  const validateIMO = (value: string) => value && !/^\d{7}$/.test(value) ? "IMO phải gồm đúng 7 chữ số" : "";
  const validateContainer = (value: string) => !value ? "Số container là bắt buộc" : !/^[A-Z]{4}\d{7}$/i.test(value) ? "Định dạng container không hợp lệ (VD: MSCU1234567)" : "";
  const getPort = (code: string) => ports.find(p => p.code === code);
  const portCode = (code: string) => getPort(code)?.code ?? code;
  const portName = (code: string) => getPort(code)?.name ? `${getPort(code)?.name} Port` : "AI extracted value";

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoadingAI(true);
      setAiDone(false);
      const ai = await processAgentDocument(file);

      setBlNumber(normalizeAgentText(ai.blNumber));
      setImoNumber(normalizeAgentText(ai.imoNumber, 7));
      setVesselName(normalizeAgentText(ai.vesselName, 40));
      setVoyageNumber(normalizeAgentText(ai.voyageNumber, 40));
      setShippingLine(normalizeAgentText(ai.shippingLine, 40));
      setContainerNumber(normalizeAgentText(ai.containerNumber, 11).toUpperCase());

      const loadingPort = normalizeAgentText(ai.portOfLoading, 40).toUpperCase();
      const dischargePort = normalizeAgentText(ai.portOfDischarge, 40).toUpperCase();
      if (loadingPort) setPortOfLoading(loadingPort);
      if (dischargePort) setPortOfDischarge(dischargePort);

      setErrors({ blNumber: "", imoNumber: "", containerNumber: "", ports: "", etdDate: "", etaDate: "" });
      setAiDone(true);
    } catch (error) {
      console.error(error);
      setResult("AI chưa thể xử lý tài liệu này. Bạn vui lòng nhập thông tin thủ công nhé.");
    } finally {
      setLoadingAI(false);
      e.target.value = "";
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);
    
    const cleanBL = sanitize(blNumber);
    const cleanIMO = sanitize(imoNumber);
    const cleanContainer = sanitize(containerNumber.toUpperCase());
    
    const blError = validateBL(cleanBL);
    const imoError = validateIMO(cleanIMO);
    const containerError = validateContainer(cleanContainer);
    const portsError = portOfLoading === portOfDischarge ? "Cảng xếp hàng và cảng dỡ hàng không được giống nhau" : "";
    const etdError = !etdDate ? "Vui lòng chọn ngày tàu đi (ETD)" : "";
    const etaError = !etaDate ? "Vui lòng chọn ngày tàu đến (ETA)" : "";

    setErrors({ 
      blNumber: blError,
      imoNumber: imoError, 
      containerNumber: containerError, 
      ports: portsError,
      etdDate: etdError,
      etaDate: etaError
    });

    if (blError || imoError || containerError || portsError || etdError || etaError) return;

    try {
      setLoading(true);
      const res = await fetch(`${apiBase}/api/v1/maritime/declaration`, {
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          blNumber: cleanBL,
          imoNumber: cleanIMO, 
          vesselName: sanitize(vesselName),
          voyageNumber: sanitize(voyageNumber),
          shippingLine,
          portOfLoading, 
          portOfDischarge,
          etdDate,
          etaDate,
          containerNumber: cleanContainer,
          containerType,
          sealNumber: sanitize(sealNumber),
          customsPort: sanitize(customsPort),
          warehouseLocation: sanitize(warehouseLocation)
        })
      });
      if (!res.ok) throw new Error("Failed submit");
      setResult("Khai báo thông tin đường biển thành công!");
      
      setBlNumber("");
      setImoNumber("");
      setVesselName("");
      setVoyageNumber("");
      setContainerNumber("");
      setSealNumber("");
    } catch (error) {
      console.error(error);
      setResult("Không thể nộp tờ khai hải quan đường biển");
    } finally {
      setLoading(false);
    }
  };

  const renderPortOption = (port: Seaport, isSelected: boolean, onClick: () => void, key: string) => (
    <button key={key} type="button" onClick={onClick} className={`flex w-full items-center px-3 py-2 text-left text-sm transition-colors hover:bg-accent ${isSelected ? "bg-primary/10" : ""}`}>
      <div className="flex items-center gap-2 overflow-hidden w-full">
        <span className="shrink-0 font-mono text-xs font-bold">{port.code}</span>
        <span className="text-muted-foreground shrink-0">-</span>
        <span className="truncate flex-1">{port.name} Port</span>
        {port.country && <span className="shrink-0 text-xs text-muted-foreground ml-auto">{port.country}</span>}
      </div>
    </button>
  );

  const renderDropdown = (open: boolean, selectedPort: string, onSelect: (code: string) => void, type: string) => open && (
    <div onScroll={handleScroll} className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-input bg-background shadow-lg">
      {ports.map(port => renderPortOption(port, selectedPort === port.code, () => { onSelect(port.code); }, `${type}-${port.code}`))}
      {loadingMore && <div className="p-3 text-center text-xs text-muted-foreground animate-pulse">Đang tải thêm cảng...</div>}
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
              <Ship className="h-4 w-4 text-muted-foreground" /> Thông tin tàu & vận đơn
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground/70">Số vận đơn (B/L) <span className="text-red-500">*</span></label>
                <Input value={blNumber} onChange={e => setBlNumber(sanitize(e.target.value))} placeholder="VD: MAEU123456789" />
                {errors.blNumber && <p className="text-xs text-red-500 mt-1">{errors.blNumber}</p>}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-foreground/70">Số IMO Tàu</label>
                <Input value={imoNumber} onChange={e => setImoNumber(sanitize(e.target.value))} placeholder="VD: 9395044" maxLength={7} />
                {errors.imoNumber && <p className="text-xs text-red-500 mt-1">{errors.imoNumber}</p>}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-foreground/70">Tên tàu</label>
                <Input value={vesselName} onChange={e => setVesselName(sanitize(e.target.value))} placeholder="VD: ONE OLYMPUS" />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-foreground/70">Chuyến tàu (Voyage)</label>
                <Input value={voyageNumber} onChange={e => setVoyageNumber(sanitize(e.target.value))} placeholder="VD: 071E" />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-foreground/70">Hãng tàu</label>
                <div className="relative">
                  <select 
                    value={shippingLine} 
                    onChange={e => setShippingLine(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                  >
                    <option value="">-- Chọn hãng tàu --</option>
                    {shippingLines.map(line => (
                      <option key={line} value={line}>{line}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-3 h-4 w-4 opacity-50 pointer-events-none" />
                </div>
              </div>

              {/* Port of Loading (POL) */}
              <div className="relative" ref={loadingDropdownRef}>
                <label className="mb-1 block text-sm font-medium text-foreground/70">Cảng xếp hàng (POL) <span className="text-red-500">*</span></label>
                <button type="button" tabIndex={0} onKeyDown={e => handleTypeSearch(e.key, "loading")} onClick={() => setOpenLoadingDropdown(prev => !prev)} className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 text-sm">
                  {portOfLoading ? (
                    <div className="flex w-full items-center overflow-hidden">
                      <span className="shrink-0 font-mono text-xs font-bold">{portCode(portOfLoading)}</span>
                      <span className="mx-2 shrink-0 text-muted-foreground">-</span>
                      <span className="min-w-0 flex-1 truncate text-left">{portName(portOfLoading)}</span>
                    </div>
                  ) : <span>Chọn cảng xếp</span>}
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-60" />
                </button>
                {renderDropdown(openLoadingDropdown, portOfLoading, setPortOfLoading, "loading")}
              </div>

              {/* Port of Discharge (POD) */}
              <div className="relative" ref={dischargeDropdownRef}>
                <label className="mb-1 block text-sm font-medium text-foreground/70">Cảng dỡ hàng (POD) <span className="text-red-500">*</span></label>
                <button type="button" tabIndex={0} onKeyDown={e => handleTypeSearch(e.key, "discharge")} onClick={() => setOpenDischargeDropdown(prev => !prev)} className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 text-sm">
                  {portOfDischarge ? (
                    <div className="flex w-full items-center overflow-hidden">
                      <span className="shrink-0 font-mono text-xs font-bold">{portCode(portOfDischarge)}</span>
                      <span className="mx-2 shrink-0 text-muted-foreground">-</span>
                      <span className="min-w-0 flex-1 truncate text-left">{portName(portOfDischarge)}</span>
                    </div>
                  ) : <span>Chọn cảng dỡ</span>}
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-60" />
                </button>
                {renderDropdown(openDischargeDropdown, portOfDischarge, setPortOfDischarge, "discharge")}
                {errors.ports && <p className="mt-1 text-xs text-red-500">{errors.ports}</p>}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-foreground/70">ETD (Ngày tàu đi) <span className="text-red-500">*</span></label>
                <Input type="date" value={etdDate} onChange={e => setEtdDate(e.target.value)} />
                {errors.etdDate && <p className="text-xs text-red-500 mt-1">{errors.etdDate}</p>}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-foreground/70">ETA (Ngày tàu đến) <span className="text-red-500">*</span></label>
                <Input type="date" value={etaDate} onChange={e => setEtaDate(e.target.value)} />
                {errors.etaDate && <p className="text-xs text-red-500 mt-1">{errors.etaDate}</p>}
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3 flex items-center gap-2">
              <Container className="h-4 w-4 text-muted-foreground" /> Thông tin container & Địa điểm lưu kho
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground/70">Số container <span className="text-red-500">*</span></label>
                <Input value={containerNumber} onChange={e => setContainerNumber(sanitize(e.target.value.toUpperCase()))} placeholder="VD: MSCU1234567" maxLength={11} />
                {errors.containerNumber && <p className="text-xs text-red-500 mt-1">{errors.containerNumber}</p>}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-foreground/70">Loại container</label>
                <div className="relative">
                  <select 
                    value={containerType} 
                    onChange={e => setContainerType(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                  >
                    <option value="">-- Chọn loại container --</option>
                    {containerTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-3 h-4 w-4 opacity-50 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-foreground/70">Số seal</label>
                <Input value={sealNumber} onChange={e => setSealNumber(sanitize(e.target.value))} placeholder="VD: ML-VN12345" />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-foreground/70">Cảng HQ tiếp nhận</label>
                <Input value={customsPort} onChange={e => setCustomsPort(sanitize(e.target.value))} placeholder="VD: Chi cục HQ Cảng Cát Lái" />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-foreground/70">Địa điểm lưu kho</label>
                <Input value={warehouseLocation} onChange={e => setWarehouseLocation(sanitize(e.target.value))} placeholder="VD: Bãi cảng Tân Cảng Cát Lái, Kho CFS..." />
              </div>
            </div>
          </div>

          {/* Action Button duy nhất */}
          <Button type="submit" size="lg" className="w-full mt-2 gap-2" disabled={loading || portsLoading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Đang xử lý dữ liệu...
              </>
            ) : (
              "Nộp tờ khai đường biển"
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
