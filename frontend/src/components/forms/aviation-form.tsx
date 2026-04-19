"use client";

import { useState } from "react";
import { AIRPORTS } from "@global/shared/constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export function AviationForm() {
  const [awbNumber, setAwbNumber] = useState("");
  const [flightNumber, setFlightNumber] = useState("");
  const [departureAirport, setDepartureAirport] = useState<string>(AIRPORTS[0]?.iata ?? "");
  const [arrivalAirport, setArrivalAirport] = useState<string>(AIRPORTS[1]?.iata ?? "");
  const [result, setResult] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResult(null);

    const res = await fetch(`${apiBase}/api/v1/aviation/declaration`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        awbNumber,
        flightNumber,
        departureAirport,
        arrivalAirport,
      }),
    });

    const json = await res.json();
    setResult(JSON.stringify(json, null, 2));
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Air Freight Declaration</CardTitle>
        <CardDescription>
          Link airway bill and flight details to the on-chain shipment record
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form className="grid gap-4" onSubmit={onSubmit}>
          <Input
            placeholder="AWB Number (e.g. 123-45678901)"
            value={awbNumber}
            onChange={(e) => setAwbNumber(e.target.value)}
            required
          />

          <Input
            placeholder="Flight Number (e.g. VN123)"
            value={flightNumber}
            onChange={(e) => setFlightNumber(e.target.value)}
            required
          />

          <label className="text-sm text-foreground/70">
            Airport of Departure
          </label>
          <select
            className="h-10 rounded-md border border-foreground/15 bg-transparent px-3 text-sm"
            value={departureAirport}
            onChange={(e) => setDepartureAirport(e.target.value)}>
            {AIRPORTS.map((a) => (
              <option key={a.iata} value={a.iata}>
                {a.iata} — {a.name}
              </option>
            ))}
          </select>

          <label className="text-sm text-foreground/70">
            Airport of Arrival
          </label>
          <select
            className="h-10 rounded-md border border-foreground/15 bg-transparent px-3 text-sm"
            value={arrivalAirport}
            onChange={(e) => setArrivalAirport(e.target.value)} >
            {AIRPORTS.map((a) => (
              <option key={`${a.iata}-arr`} value={a.iata}>
                {a.iata} — {a.name}
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