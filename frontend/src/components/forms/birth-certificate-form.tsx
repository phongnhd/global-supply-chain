"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const MAX_LENGTH = 100;

export function BirthCertificateForm() {
  const router = useRouter();
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiDone, setAiDone] = useState(false);
  const [form, setForm] = useState({
    senderName: "",
    productName: "",
    sku: "",
    originCountry: "",
    transportMethod: "Air",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Sanitize input
  function sanitize(value: string) {
    return value
      .replace(/[<>]/g, "")
      .replace(/script/gi, "")
      .replace(/[^\p{L}\p{N}\s\-_.,()]/gu, "")
      .trim()
      .slice(0, MAX_LENGTH);
  }

  // Validate fields
  function validate(field: string, value: string) {
    if (!value.trim()) return "This field is required";
    if (value.length > MAX_LENGTH) return "Input too long";
    if (field === "senderName" && !/^[a-zA-Z\s.'-]+$/.test(value)) return "Invalid sender name";
    if (field === "productName") {
      if (value.length < 3) return "Minimum 3 characters";
      if (!/^[a-zA-Z0-9\s\-()]+$/.test(value)) return "Invalid product name";
    }
    if (field === "sku" && !/^[A-Z0-9-_]+$/i.test(value)) return "Invalid SKU format";
    if (field === "originCountry" && !/^[a-zA-Z\s]+$/.test(value)) return "Invalid country name";
    return "";
  }

  // Handle input change
  function handleChange(field: string, value: string) {
    const clean = sanitize(value);
    setForm(prev => ({ ...prev, [field]: clean }));
    setErrors(prev => ({ ...prev, [field]: validate(field, clean) }));
  }

  // Map transport method from AI
  function mapTransportMethod(method?: string) {
    if (!method) return "Air";
    const normalized = method.toLowerCase();
    if (normalized.includes("air") || normalized.includes("flight")) return "Air";
    if (normalized.includes("sea") || normalized.includes("ocean")) return "Sea";
    if (normalized.includes("rail") || normalized.includes("train")) return "Rail";
    return "Air";
  }

  // Upload and process document via AI
  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setLoadingAI(true);
      setAiDone(false);
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${apiBase}/api/agent/process-document`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Failed to process document");
      const data = await res.json();
      const aiData = data.response || data.data || data;
      setForm({
        senderName: sanitize(aiData.senderName || ""),
        productName: sanitize(aiData.productName || ""),
        sku: sanitize(aiData.sku || "").toUpperCase(),
        originCountry: sanitize(aiData.originCountry || ""),
        transportMethod: mapTransportMethod(aiData.transportMethod),
      });
      setErrors({});
      setAiDone(true);
    } catch (err) {
      console.error("AI error:", err);
      alert("AI failed to process document");
    } finally {
      setLoadingAI(false);
    }
  }

  // Check if form is valid
  const isValid =
    form.senderName.trim() !== "" &&
    form.productName.trim() !== "" &&
    form.sku.trim() !== "" &&
    form.originCountry.trim() !== "" &&
    Object.values(errors).every(e => !e);

  // Handle next step navigation
  function handleNext() {
    const newErrors: Record<string, string> = {};
    Object.entries(form).forEach(([key, value]) => {
      if (key === "transportMethod") return;
      const err = validate(key, value);
      if (err) newErrors[key] = err;
    });
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    sessionStorage.setItem("draft_certificate", JSON.stringify(form));
    if (form.transportMethod === "Air") router.push("/aviation");
    else if (form.transportMethod === "Sea") router.push("/maritime");
    else router.push("/railway");
  }

  // UI
  return (
    <Card>
      <CardHeader>
        <CardTitle>Shipment Certificate</CardTitle>
        <CardDescription>Upload shipment document or enter details manually</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {/* File upload */}
        <div className="space-y-2">
          <Input type="file" accept="image/*,.pdf" onChange={handleFileUpload} />
          {loadingAI && <p className="text-sm text-muted-foreground">AI is processing document...</p>}
          {aiDone && <p className="text-sm text-green-600">AI completed ✓</p>}
        </div>

        {/* Sender name */}
        <div className="space-y-1">
          <Input placeholder="Sender Name" value={form.senderName} disabled={loadingAI} onChange={e => handleChange("senderName", e.target.value)} />
          {errors.senderName && <p className="text-xs text-red-500">{errors.senderName}</p>}
        </div>

        {/* Product name */}
        <div className="space-y-1">
          <Input placeholder="Product Name" value={form.productName} disabled={loadingAI} onChange={e => handleChange("productName", e.target.value)} />
          {errors.productName && <p className="text-xs text-red-500">{errors.productName}</p>}
        </div>

        {/* SKU */}
        <div className="space-y-1">
          <Input placeholder="SKU" value={form.sku} disabled={loadingAI} onChange={e => handleChange("sku", e.target.value.toUpperCase())} />
          {errors.sku && <p className="text-xs text-red-500">{errors.sku}</p>}
        </div>

        {/* Country of origin */}
        <div className="space-y-1">
          <Input placeholder="Country of Origin" value={form.originCountry} disabled={loadingAI} onChange={e => handleChange("originCountry", e.target.value)} />
          {errors.originCountry && <p className="text-xs text-red-500">{errors.originCountry}</p>}
        </div>

        {/* Transport method select */}
        <select value={form.transportMethod} disabled={loadingAI} onChange={e => setForm(prev => ({ ...prev, transportMethod: e.target.value }))} className="border rounded-md p-2">
          <option value="Air">Air Freight</option>
          <option value="Sea">Ocean Freight</option>
          <option value="Rail">Rail Freight</option>
        </select>

        {/* Continue button */}
        <Button onClick={handleNext} disabled={!isValid || loadingAI}>
          {loadingAI ? "Processing AI..." : "Continue"}
        </Button>
      </CardContent>
    </Card>
  );
}