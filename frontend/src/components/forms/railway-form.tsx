"use client";

import { useState } from "react";
import { RAIL_STATIONS } from "@global/shared/constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export function RailwayForm() {
  const [consignmentNumber, setConsignmentNumber] = useState("");
  const [trainNumber, setTrainNumber] = useState("");
  const [originStation, setOriginStation] = useState<string>(RAIL_STATIONS[0]?.code ?? "");
  const [destinationStation, setDestinationStation] = useState<string>(RAIL_STATIONS[1]?.code ?? "");
  const [result, setResult] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResult(null);

    const res = await fetch(`${apiBase}/api/v1/railway/declaration`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        consignmentNumber,
        trainNumber,
        originStation,
        destinationStation,
      }),
    });

    const json = await res.json();
    setResult(JSON.stringify(json, null, 2));
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rail Freight Declaration</CardTitle>
        <CardDescription>
          Provide rail consignment and route details for shipment tracking
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form className="grid gap-4" onSubmit={onSubmit}>
          <Input
            placeholder="Consignment Number (e.g. RCN123456)"
            value={consignmentNumber}
            onChange={(e) => setConsignmentNumber(e.target.value)}
            required
          />

          <Input
            placeholder="Train Number (e.g. SE3)"
            value={trainNumber}
            onChange={(e) => setTrainNumber(e.target.value)}
            required
          />

          <label className="text-sm text-foreground/70">
            Departure Station
          </label>
          <select
            className="h-10 rounded-md border border-foreground/15 bg-transparent px-3 text-sm"
            value={originStation}
            onChange={(e) => setOriginStation(e.target.value)} >
            {RAIL_STATIONS.map((s) => (
              <option key={s.code} value={s.code}>
                {s.code} — {s.name}
              </option>
            ))}
          </select>

          <label className="text-sm text-foreground/70">
            Arrival Station
          </label>
          <select
            className="h-10 rounded-md border border-foreground/15 bg-transparent px-3 text-sm"
            value={destinationStation}
            onChange={(e) => setDestinationStation(e.target.value)}>
            {RAIL_STATIONS.map((s) => (
              <option key={`${s.code}-dst`} value={s.code}>
                {s.code} — {s.name}
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