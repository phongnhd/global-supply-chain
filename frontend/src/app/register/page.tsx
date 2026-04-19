"use client";

import { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState("");
  const [country, setCountry] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isValid =
    fullName.trim().length >= 3 &&
    company.trim().length >= 2 &&
    country.trim().length >= 2 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
    password.length >= 6;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setIsLoading(true);

    // TODO: call API
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-6 bg-gradient-to-br from-white to-teal-50">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900">
            Create Account
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Register to manage your global shipments
          </p>
        </div>
        <div className="rounded-2xl border border-teal-100 bg-white/80 backdrop-blur-xl p-8 shadow-[0_10px_40px_rgba(0,0,0,0.08)]">

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none"
              />
            </div>

            <div>
              <input
                type="text"
                placeholder="Company Name"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none"
              />
            </div>

            <div>
              <input
                type="text"
                placeholder="Country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none"
              />
            </div>

            <div>
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none"
              />
            </div>

            <div>
              <input
                type="password"
                placeholder="Password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={!isValid || isLoading}
              className="w-full rounded-lg bg-[#298dff] py-3 text-sm font-semibold text-white transition hover:shadow-[0_0_14px_rgba(41,141,255,0.6)] disabled:bg-gray-400"
            >
              {isLoading ? "Creating..." : "Create Account"}
            </button>

          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-teal-600 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
        <div className="mt-6 rounded-xl border border-teal-200 bg-teal-50 p-4 text-sm text-gray-700">
          Your account will be linked with blockchain identity to ensure
          transparency and data integrity across the supply chain.
        </div>

      </div>
    </main>
  );
}