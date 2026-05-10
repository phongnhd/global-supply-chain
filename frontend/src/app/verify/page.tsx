"use client";

import { useState } from "react";
import { SuiClient, type SuiObjectResponse } from "@mysten/sui/client";
import { getSuiRpcUrl } from "@/lib/sui-config";

const isValidSuiId = (id: string) => /^0x[a-fA-F0-9]+$/.test(id);

export default function VerifyPage() {
  const [searchId, setSearchId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [payload, setPayload] = useState<SuiObjectResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentId, setCurrentId] = useState<string>("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidSuiId(searchId)) {
      setError("Invalid Object ID (must be hex and start with 0x)");
      return;
    }

    setIsLoading(true);
    setError(null);
    setPayload(null);
    setCurrentId(searchId);

    try {
      const client = new SuiClient({ url: getSuiRpcUrl() });

      const result = await client.getObject({
        id: searchId,
        options: {
          showContent: true,
          showType: true,
          showOwner: true,
        },
      });

      setPayload(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch object");
    } finally {
      setIsLoading(false);
    }
  };

  const data = payload?.data;
  const isValid = !!data;

  return (
    <main className="min-h-screen py-2 px-6 sm:px-12 lg:px-24">
      {/* HEADER */}
      <section className="mb-10  text-center">
        <h1 className="mb-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Verify & Authenticate
        </h1>
        <div className="mx-auto mb-4 h-1 w-20 bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.7)]"></div>
        <p className="text-gray-600">
          Check on-chain certificate by Object ID
        </p>
      </section>

      {/* SEARCH */}
      <section className="mx-auto mb-10 max-w-3xl">
        <form onSubmit={handleSearch} className="space-y-3">
          <input
            type="text"
            value={searchId}
            onChange={(e) => {
              const value = e.target.value.trim();
              if (value.length > 100) return;
              setSearchId(value);
            }}
            placeholder="Enter Object ID (e.g. 0x123...)"
            className="w-full rounded-lg border-2 border-gray-300 px-6 py-4 focus:border-teal-500 focus:outline-none" />

          {searchId && !isValidSuiId(searchId) && (
            <p className="text-sm text-red-500">
              Invalid Object ID format
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading || !isValidSuiId(searchId)}
            className="w-full rounded-lg bg-gray-900 px-8 py-4 text-white transition hover:bg-gray-800 disabled:bg-gray-400" >
            {isLoading ? "Searching..." : "Verify"}
          </button>
        </form>

        <p className="mt-3 text-xs text-gray-500">
          RPC: <span className="font-mono">{getSuiRpcUrl()}</span>
        </p>
      </section>

      {/* RESULT */}
      {currentId && (
        <section className="mx-auto max-w-5xl space-y-6">
          <div className="rounded-lg border bg-white p-4">
            <p className="text-sm text-gray-500">Object ID</p>
            <p className="break-all font-mono">{currentId}</p>
          </div>

          {!error && (
            <div
              className={`rounded-lg p-4 font-semibold ${isValid
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
                }`}>
              {isValid
                ? "✔ Verified on-chain"
                : "✖ Object not found"}
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-300 bg-red-50 p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {isValid && data && (
            <div className="rounded-lg border bg-white p-6 space-y-2 text-sm">
              <p>
                <strong>Type:</strong> {data.type}
              </p>

              <p>
                <strong>Owner:</strong>{" "}
                {typeof data.owner === "object"
                  ? JSON.stringify(data.owner)
                  : String(data.owner)}
              </p>
            </div>
          )}

          {payload && (
            <details className="text-xs">
              <summary className="cursor-pointer text-gray-600">
                Raw Blockchain Data
              </summary>
              <pre className="mt-2 overflow-auto rounded bg-gray-100 p-4">
                {JSON.stringify(payload, null, 2)}
              </pre>
            </details>
          )}
        </section>
      )}

      {/* EMPTY */}
      {!currentId && !isLoading && (
        <section className="mx-auto max-w-2xl text-center">
          <div className="rounded-lg border-2 border-dashed bg-white p-10">
            <p className="text-gray-500">
              Enter an Object ID to start verification
            </p>
          </div>
        </section>
      )}
    </main>
  );
}