"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function BirthCertificateForm() {
  const router = useRouter();

  const [senderName, setSenderName] = useState("");
  const [productName, setProductName] = useState("");
  const [sku, setSku] = useState("");
  const [originCountry, setOriginCountry] = useState("");
  const [transportMethod, setTransportMethod] = useState("Air");

  const [errors, setErrors] = useState({
    senderName: "",
    productName: "",
    sku: "",
    originCountry: "",
  });

  function validate(name: string, value: string) {
    let msg = "";

    if (name === "senderName") {
      if (!value) msg = "Sender name is required";
      else if (value.trim().length < 3) msg = "Minimum 3 characters";
    }

    if (name === "productName") {
      if (!value) msg = "Product name is required";
      else if (value.trim().length < 3) msg = "Minimum 3 characters";
    }

    if (name === "sku") {
      if (!value) msg = "SKU is required";
      else if (!/^[A-Za-z0-9-_]+$/.test(value)) msg = "Invalid SKU format";
    }

    if (name === "originCountry") {
      if (!value) msg = "Country of origin is required";
    }

    return msg;
  }

  function handleChange(
    field: "senderName" | "productName" | "sku" | "originCountry",
    value: string
  ) {
    if (field === "senderName") setSenderName(value);
    if (field === "productName") setProductName(value);
    if (field === "sku") setSku(value);
    if (field === "originCountry") setOriginCountry(value);

    setErrors((prev) => ({
      ...prev,
      [field]: validate(field, value),
    }));
  }

  const isValid =
    senderName.trim().length >= 3 &&
    productName.trim().length >= 3 &&
    /^[A-Za-z0-9-_]+$/.test(sku) &&
    originCountry.trim().length > 0;

  function handleNext() {
    if (!isValid) return;

    sessionStorage.setItem(
      "draft_certificate",
      JSON.stringify({
        senderName,
        productName,
        sku,
        originCountry,
      })
    );

    if (transportMethod === "Air") router.push("/aviation");
    else if (transportMethod === "Sea") router.push("/maritime");
    else router.push("/railway");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Shipment Certificate</CardTitle>
        <CardDescription>
          Enter shipment details and select transport method
        </CardDescription>
      </CardHeader>

      <CardContent className="grid gap-4">
        <div>
          <Input
            placeholder="Sender Name"
            value={senderName}
            onChange={(e) => handleChange("senderName", e.target.value)}
          />
          {errors.senderName && (
            <p className="text-xs text-red-500 mt-1">
              {errors.senderName}
            </p>
          )}
        </div>

        <div>
          <Input
            placeholder="Product Name"
            value={productName}
            onChange={(e) => handleChange("productName", e.target.value)}
          />
          {errors.productName && (
            <p className="text-xs text-red-500 mt-1">
              {errors.productName}
            </p>
          )}
        </div>

        <div>
          <Input
            placeholder="SKU / Product Code"
            value={sku}
            onChange={(e) => handleChange("sku", e.target.value)}/>
          {errors.sku && (
            <p className="text-xs text-red-500 mt-1">
              {errors.sku}
            </p>
          )}
        </div>

        <div>
          <Input
            placeholder="Country of Origin"
            value={originCountry}
            onChange={(e) => handleChange("originCountry", e.target.value)}
          />
          {errors.originCountry && (
            <p className="text-xs text-red-500 mt-1">
              {errors.originCountry}
            </p>
          )}
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium">
            Transport Method
          </label>

          <select
            value={transportMethod}
            onChange={(e) => setTransportMethod(e.target.value)}
            className="border rounded-md p-2 text-sm"
          >
            <option value="Air">Air Freight</option>
            <option value="Sea">Ocean Freight</option>
            <option value="Rail">Rail Freight</option>
          </select>
        </div>

        <Button onClick={handleNext} disabled={!isValid}>
          Continue
        </Button>

      </CardContent>
    </Card>
  );
}