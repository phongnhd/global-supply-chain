"use client";

import { useState } from "react";
import { SEA_PORTS } from "@global/shared/constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export function MaritimeForm() {
  const [imoNumber, setImoNumber] = useState("");
  const [containerNumber, setContainerNumber] = useState("");
  const [portOfLoading, setPortOfLoading] = useState<string>(SEA_PORTS[0]?.code ?? "");
  const [portOfDischarge, setPortOfDischarge] = useState<string>(SEA_PORTS[1]?.code ?? "");
  const [result, setResult] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResult(null);

    const res = await fetch(`${apiBase}/api/v1/maritime/declaration`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        imoNumber,
        containerNumber,
        portOfLoading,
        portOfDischarge,
      }),
    });

    const json = await res.json();
    setResult(JSON.stringify(json, null, 2));
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ocean Freight Declaration</CardTitle>
        <CardDescription>
          Provide vessel and container details for ocean shipment tracking
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form className="grid gap-4" onSubmit={onSubmit}>
          <Input
            placeholder="Vessel IMO Number (e.g. 9395044)"
            value={imoNumber}
            onChange={(e) => setImoNumber(e.target.value)}
            required
          />

          <Input
            placeholder="Container Number (e.g. MSCU1234567)"
            value={containerNumber}
            onChange={(e) => setContainerNumber(e.target.value)}
            required
          />

          <label className="text-sm text-foreground/70">
            Port of Loading
          </label>
          <select
            className="h-10 rounded-md border border-foreground/15 bg-transparent px-3 text-sm"
            value={portOfLoading}
            onChange={(e) => setPortOfLoading(e.target.value)} >
            {SEA_PORTS.map((p) => (
              <option key={p.code} value={p.code}>
                {p.code} — {p.name}
              </option>
            ))}
          </select>

          <label className="text-sm text-foreground/70">
            Port of Discharge
          </label>
          <select
            className="h-10 rounded-md border border-foreground/15 bg-transparent px-3 text-sm"
            value={portOfDischarge}
            onChange={(e) => setPortOfDischarge(e.target.value)} >
            {SEA_PORTS.map((p) => (
              <option key={`${p.code}-dis`} value={p.code}>
                {p.code} — {p.name}
              </option>
            ))}
          </select>

          <Button type="submit">
            Submit Declaration
          </Button>

        </form>

        {result && (
          <pre className="mt-4 overflow-auto rounded-md bg-foreground/5 p-3 text-xs">
            {result}
          </pre>
        )}
      </CardContent>
    </Card>
  );
}