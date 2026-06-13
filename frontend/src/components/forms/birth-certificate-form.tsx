"use client";

import { useState } from "react";
import { 
  FileText, 
  Building2, 
  Truck, 
  Package, 
  Paperclip, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { mapTransportMethod, processAgentDocument } from "@/lib/agent-document";

const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const MAX_LENGTH = 200;

interface FormState {
  declarationNumber: string;
  declarationType: string;
  registrationDate: string;
  customsOffice: string;
  importerTaxId: string;
  senderName: string;
  exporterName: string;
  exporterCountryCode: string;
  transportMethod: "Air" | "Sea" | "Road"; // Ràng buộc kiểu dữ liệu vận chuyển
  productName: string;
  hsCode: string;
  goodsDescription: string;
  quantity1: string;
  unit: string;
  originCountry: string;
  totalTax: string;
}

const INITIAL_FORM: FormState = {
  declarationNumber: "", declarationType: "", registrationDate: "", customsOffice: "",
  importerTaxId: "", senderName: "", exporterName: "", exporterCountryCode: "",
  transportMethod: "Air", productName: "", hsCode: "", goodsDescription: "", 
  quantity1: "", unit: "", originCountry: "", totalTax: ""
};

function sanitize(value: string) {
  return value
    .replace(/[<>]/g, "")
    .replace(/script/gi, "")
    .replace(/[^\p{L}\p{N}\s\-_.,()@+/\\#%&*!?:;'"=[\]{}]/gu, "")
    .slice(0, MAX_LENGTH);
}

const REQUIRED_FIELDS: (keyof FormState)[] = [
  "declarationNumber", "declarationType", "importerTaxId", "senderName", 
  "exporterName", "exporterCountryCode", "transportMethod", 
  "productName", "hsCode", "quantity1", "unit", "originCountry"
];

function validateField(field: keyof FormState, value: string): string {
  const isRequired = REQUIRED_FIELDS.includes(field);
  if (isRequired && !value.trim()) return "Trường này là bắt buộc";
  if (value.length > MAX_LENGTH) return "Quá số ký tự cho phép";
  if (field === "importerTaxId" && value && !/^\d{10,13}$/.test(value.replace(/-/g, "")))
    return "Mã số thuế không hợp lệ (yêu cầu 10–13 số)";
  if (field === "hsCode" && value && !/^\d{4,10}$/.test(value.replace(/\./g, "")))
    return "Mã HS phải gồm từ 4–10 chữ số";
  if (field === "totalTax" && value && isNaN(Number(value.replace(/,/g, "")))) 
    return "Giá trị nhập phải là số hợp lệ";
  if (field === "productName" && value && value.trim().length < 3)
    return "Tên hàng hóa phải chứa tối thiểu 3 ký tự";
  return "";
}

const selectCls =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring " +
  "disabled:cursor-not-allowed disabled:opacity-50 appearance-none";

const textareaCls =
  "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm " +
  "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 " +
  "focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

function FieldGroup({
  label, error, required, children, className = "",
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`space-y-1 ${className}`}>
      <label className="text-sm font-medium text-foreground/70 block">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

function SectionHeading({ icon: Icon, title }: { icon: React.ComponentType<{ className?: string }>; title: string }) {
  return (
    <div className="flex items-center gap-2 pt-4">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
        {title}
      </p>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

export function BirthCertificateForm() {
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiDone, setAiDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  function handleChange(field: keyof FormState, rawValue: string) {
    const value = sanitize(rawValue);
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: validateField(field, value) }));
  }

  function handleSelect(field: keyof FormState, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: "" }));
  }

  // Hàm map text hiển thị trên nút bấm tương ứng theo phương tiện chọn
  function getSubmitButtonText() {
    if (loading) return "Đang gửi tờ khai lên hệ thống...";
    switch (form.transportMethod) {
      case "Air":
        return "Nộp tờ khai Đường hàng không";
      case "Sea":
        return "Nộp tờ khai Đường biển";
      case "Road":
        return "Nộp tờ khai Đường sắt";
      default:
        return "Nộp tờ khai tổng hợp";
    }
  }
function normalizeCode(raw: string): string {
  if (!raw) return "";
  return raw.trim().split(/[\s\-\/]/)[0].toUpperCase();
}
  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setLoadingAI(true);
      setAiDone(false);
      const ai = await processAgentDocument(file);
      const s = (v: unknown) => sanitize(String(v ?? ""));
      setForm({
        declarationNumber: s(ai.declarationNumber),
        declarationType:    normalizeCode(s(ai.declarationType)),
        registrationDate:  s(ai.registrationDate),
        customsOffice:     s(ai.customsOffice),
        importerTaxId:     s(ai.importerTaxId ?? ai.taxId),
        senderName:        s(ai.senderName ?? ai.importerName),
        exporterName:      s(ai.exporterName),
        exporterCountryCode:normalizeCode(s(ai.exporterCountryCode ?? ai.countryCode)),
        transportMethod:   mapTransportMethod(ai.transportMethod),
        productName:       s(ai.productName),
        hsCode:            s(ai.hsCode ?? ai.hsCodeRepresentative),
        goodsDescription:  s(ai.goodsDescription ?? ai.description),
        quantity1:         s(ai.quantity1 ?? ai.quantity),
        unit:               normalizeCode(s(ai.unit)),
        originCountry:     normalizeCode(s(ai.originCountry)),
        totalTax:          s(ai.totalTax),
      });
      setErrors({});
      setAiDone(true);
    } catch {
      alert("AI không thể xử lý tài liệu. Vui lòng nhập tay.");
    } finally {
      setLoadingAI(false);
      e.target.value = "";
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResult(null);

    const newErrors: Partial<Record<keyof FormState, string>> = {};
    (Object.keys(form) as (keyof FormState)[]).forEach(key => {
      const err = validateField(key, form[key]);
      if (err) newErrors[key] = err;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const firstKey = Object.keys(newErrors)[0];
      document.getElementById(firstKey)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${apiBase}/api/v1/customs/declaration`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error("Submission failed");
      setResult(`Nộp tờ khai thành công theo phương thức phương tiện đã chọn!`);
      setForm(INITIAL_FORM);
    } catch (error) {
      console.error(error);
      setResult("Không thể nộp tờ khai. Vui lòng kiểm tra lại kết nối.");
    } finally {
      setLoading(false);
    }
  }

  const F = (field: keyof FormState) => ({
    id: field,
    value: form[field],
    disabled: loadingAI || loading,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      handleChange(field, e.target.value),
  });

  const Sel = (field: keyof FormState) => ({
    id: field,
    value: form[field],
    disabled: loadingAI || loading,
    className: selectCls,
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => handleSelect(field, e.target.value),
  });

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Tờ khai hải quan hàng hóa</CardTitle>
        <CardDescription>
          Tải tài liệu lên để AI điền tự động hoặc chỉnh sửa các thông tin cơ bản bên dưới.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="grid gap-5">
          {/* AI Upload */}
          <div className="rounded-lg border border-dashed p-4 space-y-2 bg-muted/30">
            <p className="text-sm font-medium flex items-center gap-2">
              <Paperclip className="h-4 w-4" /> Đính kèm chứng từ để AI trích xuất tự động
            </p>
            <Input type="file" accept="image/*,.pdf,.xlsx,.xls" onChange={handleFileUpload} disabled={loadingAI || loading} />
            {loadingAI && (
              <p className="text-sm text-muted-foreground animate-pulse flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> AI đang phân tích dữ liệu...
              </p>
            )}
            {aiDone && (
              <p className="text-sm text-green-600 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> AI đã cố gắng hết sức để cập nhật dữ liệu rồi. Giờ đến lượt bạn kiểm tra lại nè
              </p>
            )}
          </div>

          {/* 1. Thông tin tờ khai */}
          <SectionHeading icon={FileText} title="Thông tin chung" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FieldGroup label="Số tờ khai" required error={errors.declarationNumber}>
              <Input {...F("declarationNumber")} placeholder="VD: 108032095360" />
            </FieldGroup>
            <FieldGroup label="Mã loại hình" required error={errors.declarationType}>
              <div className="relative">
                <select {...Sel("declarationType")}>
                  <option value="">-- Chọn loại hình --</option>
                  <option value="A11">A11 – Nhập kinh doanh</option>
                  <option value="A12">A12 – Nhập tái xuất</option>
                  <option value="B11">B11 – Xuất kinh doanh</option>
                  <option value="B13">B13 – Xuất tái nhập</option>
                </select>
                <ChevronDown className="absolute right-3 top-3 h-4 w-4 opacity-50 pointer-events-none" />
              </div>
            </FieldGroup>
            <FieldGroup label="Ngày đăng ký" error={errors.registrationDate}>
              <Input {...F("registrationDate")} type="date" />
            </FieldGroup>
            <FieldGroup label="Cơ quan Hải quan tiếp nhận" error={errors.customsOffice}>
              <Input {...F("customsOffice")} placeholder="VD: Chi cục HQ Tân Sơn Nhất" />
            </FieldGroup>
          </div>

          {/* 2. Đối tác */}
          <SectionHeading icon={Building2} title="Thông tin đối tác" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FieldGroup label="MST Người nhập khẩu" required error={errors.importerTaxId}>
              <Input {...F("importerTaxId")} placeholder="VD: 0312720807" />
            </FieldGroup>
            <FieldGroup label="Tên doanh nghiệp mua" required error={errors.senderName}>
              <Input {...F("senderName")} placeholder="Tên công ty nhập khẩu" />
            </FieldGroup>
            <FieldGroup label="Tên đối tác xuất khẩu" required error={errors.exporterName}>
              <Input {...F("exporterName")} placeholder="Tên công ty nước ngoài" />
            </FieldGroup>
            <FieldGroup label="Quốc gia xuất khẩu" required error={errors.exporterCountryCode}>
              <div className="relative">
                <select {...Sel("exporterCountryCode")}>
                  <option value="">-- Chọn quốc gia --</option>
                  <option value="CN">Trung Quốc (CN)</option>
                  <option value="JP">Nhật Bản (JP)</option>
                  <option value="KR">Hàn Quốc (KR)</option>
                  <option value="US">Hoa Kỳ (US)</option>
                  <option value="DE">Đức (DE)</option>
                  <option value="SG">Singapore (SG)</option>
                </select>
                <ChevronDown className="absolute right-3 top-3 h-4 w-4 opacity-50 pointer-events-none" />
              </div>
            </FieldGroup>
          </div>

          {/* CHỈ GIỮ LẠI CHỌN PHƯƠNG TIỆN VẬN CHUYỂN */}
          <SectionHeading icon={Truck} title="Vận chuyển" />
          <div className="grid grid-cols-1 gap-4">
            <FieldGroup label="Phương thức vận chuyển" required error={errors.transportMethod}>
              <div className="relative">
                <select {...Sel("transportMethod")}>
                  <option value="Air">Đường hàng không (Air)</option>
                  <option value="Sea">Đường biển (Sea)</option>
                  <option value="Road">Đường sắt (Rail)</option>
                </select>
                <ChevronDown className="absolute right-3 top-3 h-4 w-4 opacity-50 pointer-events-none" />
              </div>
            </FieldGroup>
          </div>

          {/* 4. Hàng hóa & Thuế */}
          <SectionHeading icon={Package} title="Thông tin hàng hóa & Thuế" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FieldGroup label="Mã HS (8-10 số)" required error={errors.hsCode}>
              <Input {...F("hsCode")} placeholder="VD: 90261090" maxLength={10} />
            </FieldGroup>
            <FieldGroup label="Tên thương mại sản phẩm" required error={errors.productName}>
              <Input {...F("productName")} placeholder="Tên sản phẩm chính" />
            </FieldGroup>
            <FieldGroup label="Mô tả chi tiết hàng hóa" className="md:col-span-2">
              <textarea
                {...F("goodsDescription")}
                rows={2}
                className={textareaCls}
                placeholder="Mô tả quy cách, thông số kỹ thuật..."
              />
            </FieldGroup>
            <FieldGroup label="Số lượng" required error={errors.quantity1}>
              <Input {...F("quantity1")} type="number" step="any" placeholder="VD: 100" />
            </FieldGroup>
            <FieldGroup label="Đơn vị tính" required error={errors.unit}>
              <div className="relative">
                <select {...Sel("unit")}>
                  <option value="">-- Chọn ĐVT --</option>
                  <option value="PCE">PCE – Cái/Chiếc</option>
                  <option value="KGM">KGM – Kg</option>
                  <option value="SET">SET – Bộ</option>
                </select>
                <ChevronDown className="absolute right-3 top-3 h-4 w-4 opacity-50 pointer-events-none" />
              </div>
            </FieldGroup>
            <FieldGroup label="Xuất xứ (C/O)" required error={errors.originCountry}>
              <div className="relative">
                <select {...Sel("originCountry")}>
                  <option value="">-- Chọn xuất xứ --</option>
                  <option value="DE">Đức</option>
                  <option value="JP">Nhật Bản</option>
                  <option value="CN">Trung Quốc</option>
                  <option value="KR">Hàn Quốc</option>
                </select>
                <ChevronDown className="absolute right-3 top-3 h-4 w-4 opacity-50 pointer-events-none" />
              </div>
            </FieldGroup>
            <FieldGroup label="Tổng tiền thuế phải nộp (VND)">
              <Input {...F("totalTax")} type="number" placeholder="Tổng ước tính thuế NK + VAT" />
            </FieldGroup>
          </div>

          {/* NÚT THAY ĐỔI TEXT THEO PHƯƠNG TIỆN CHỌN */}
          <Button type="submit" size="lg" className="w-full mt-4" disabled={loadingAI || loading}>
            {loadingAI ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" /> AI Đang Xử Lý Dữ Liệu...
              </>
            ) : (
              getSubmitButtonText()
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
