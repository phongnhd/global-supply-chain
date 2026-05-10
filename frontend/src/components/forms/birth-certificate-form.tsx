"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const MAX_LENGTH = 100;

export function BirthCertificateForm() {
  const router = useRouter();

  const [form, setForm] = useState({
    senderName: "",
    productName: "",
    sku: "",
    originCountry: "",
    transportMethod: "Air",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  function sanitize(value: string) {
    return value
      .replace(/[<>]/g, "")
      .replace(/script/gi, "")
      .replace(/[^\p{L}\p{N}\s\-_.,]/gu, "")
      .trimStart()
      .slice(0, MAX_LENGTH);
  }

  function validate(field: string, value: string) {
    if (!value.trim()) {
      return "This field is required";
    }

    if (value.length > MAX_LENGTH) {
      return "Input too long";
    }

    if (field === "senderName") {
      if (!/^[a-zA-Z\s.'-]+$/.test(value)) {
        return "Invalid sender name";
      }
    }

    if (field === "productName") {
      if (value.length < 3) {
        return "Minimum 3 characters";
      }
      if (!/^[a-zA-Z0-9\s\-()]+$/.test(value)) {
        return "Invalid product name"
      }
    }

    if (field === "sku") {
      if (!/^[A-Z0-9-_]+$/i.test(value)) {
        return "Invalid SKU format";
      }
    }

    if (field === "originCountry") {
      if (!/^[a-zA-Z\s]+$/.test(value)) {
        return "Invalid country name";
      }
    }

    return "";
  }

  function handleChange(field: string, value: string) {
    const clean = sanitize(value);

    setForm((prev) => ({
      ...prev,
      [field]: clean,
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: validate(field, clean),
    }));
  }

  const isValid =
    Object.values(errors).every((e) => !e) &&
    form.senderName &&
    form.productName &&
    form.sku &&
    form.originCountry;

  function handleNext() {
    const newErrors: Record<string, string> = {};

    Object.entries(form).forEach(([key, value]) => {
      if (key === "transportMethod") return;

      const err = validate(key, value);

      if (err) {
        newErrors[key] = err;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    sessionStorage.setItem(
      "draft_certificate",
      JSON.stringify({
        senderName: form.senderName,
        productName: form.productName,
        sku: form.sku,
        originCountry: form.originCountry,
      })
    );

    if (form.transportMethod === "Air") {
      router.push("/aviation");
    } else if (form.transportMethod === "Sea") {
      router.push("/maritime");
    } else {
      router.push("/railway");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Shipment Certificate</CardTitle>

        <CardDescription>
          Enter shipment details
        </CardDescription>
      </CardHeader>

      <CardContent className="grid gap-4">
        <div>
          <Input
            placeholder="Sender Name"
            value={form.senderName}
            maxLength={MAX_LENGTH}
            autoComplete="off"
            spellCheck={false}
            onChange={(e) =>
              handleChange("senderName", e.target.value)
            } />

          {errors.senderName && (
            <p className="text-xs text-red-500 mt-1">
              {errors.senderName}
            </p>
          )}
        </div>

        <div>
          <Input
            placeholder="Product Name"
            value={form.productName}
            maxLength={MAX_LENGTH}
            autoComplete="off"
            spellCheck={false}
            onChange={(e) =>
              handleChange("productName", e.target.value)
            } />

          {errors.productName && (
            <p className="text-xs text-red-500 mt-1">
              {errors.productName}
            </p>
          )}
        </div>

        <div>
          <Input
            placeholder="SKU"
            value={form.sku}
            maxLength={40}
            autoComplete="off"
            spellCheck={false}
            onChange={(e) =>
              handleChange("sku", e.target.value.toUpperCase())
            } />

          {errors.sku && (
            <p className="text-xs text-red-500 mt-1">
              {errors.sku}
            </p>
          )}
        </div>

        <div>
          <Input
            placeholder="Country of Origin"
            value={form.originCountry}
            maxLength={60}
            autoComplete="off"
            spellCheck={false}
            onChange={(e) =>
              handleChange("originCountry", e.target.value)
            } />

          {errors.originCountry && (
            <p className="text-xs text-red-500 mt-1">
              {errors.originCountry}
            </p>
          )}
        </div>

        <select
          value={form.transportMethod}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              transportMethod: e.target.value,
            }))
          }
          className="border rounded-md p-2" >
          <option value="Air">Air Freight</option>
          <option value="Sea">Ocean Freight</option>
          <option value="Rail">Rail Freight</option>
        </select>

        <Button
          onClick={handleNext}
          disabled={!isValid} >
          Continue
        </Button>
      </CardContent>
    </Card>
  );
}