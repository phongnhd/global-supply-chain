"use client";

import { useState } from "react";
import Link from "next/link";

const apiBase =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:4000";

export default function RegisterPage() {
  const [fullName, setFullName] =
    useState("");

  const [company, setCompany] =
    useState("");

  const [country, setCountry] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [isLoading, setIsLoading] =
    useState(false);

  const [errors, setErrors] =
    useState({
      fullName: "",
      company: "",
      country: "",
      email: "",
      password: "",
      general: "",
    });

  function sanitize(value: string) {
    return value
      .replace(/[<>]/g, "")
      .replace(/script/gi, "")
      .trim()
      .slice(0, 100);
  }

  function validateName(
    value: string
  ) {
    if (!value) {
      return "Full name is required";
    }

    if (value.length < 3) {
      return "Full name is too short";
    }

    return "";
  }

  function validateCompany(
    value: string
  ) {
    if (!value) {
      return "Company name is required";
    }

    if (value.length < 2) {
      return "Company name is too short";
    }

    return "";
  }

  function validateCountry(
    value: string
  ) {
    if (!value) {
      return "Country is required";
    }

    if (value.length < 2) {
      return "Invalid country";
    }

    return "";
  }

  function validateEmail(
    value: string
  ) {
    if (!value) {
      return "Email is required";
    }

    if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(
        value
      )
    ) {
      return "Invalid email address";
    }

    return "";
  }

  function validatePassword(
    value: string
  ) {
    if (!value) {
      return "Password is required";
    }

    if (value.length < 6) {
      return "Password must be at least 6 characters";
    }

    return "";
  }

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setErrors({
      fullName: "",
      company: "",
      country: "",
      email: "",
      password: "",
      general: "",
    });

    const cleanFullName =
      sanitize(fullName);

    const cleanCompany =
      sanitize(company);

    const cleanCountry =
      sanitize(country);

    const cleanEmail =
      sanitize(email);

    const cleanPassword =
      sanitize(password);

    const fullNameError =
      validateName(
        cleanFullName
      );

    const companyError =
      validateCompany(
        cleanCompany
      );

    const countryError =
      validateCountry(
        cleanCountry
      );

    const emailError =
      validateEmail(
        cleanEmail
      );

    const passwordError =
      validatePassword(
        cleanPassword
      );

    setErrors({
      fullName: fullNameError,
      company: companyError,
      country: countryError,
      email: emailError,
      password: passwordError,
      general: "",
    });

    if (
      fullNameError ||
      companyError ||
      countryError ||
      emailError ||
      passwordError
    ) {
      return;
    }

    try {
      setIsLoading(true);

      const res = await fetch(
        `${apiBase}/api/v1/auth/register`,
        {
          method: "POST",

          credentials: "include",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            fullName:
              cleanFullName,
            company:
              cleanCompany,
            country:
              cleanCountry,
            email: cleanEmail,
            password:
              cleanPassword,
          }),
        }
      );

      const data =
        await res.json();

      if (!res.ok) {
        setErrors((prev) => ({
          ...prev,
          general:
            data.message ||
            "Registration failed",
        }));

        return;
      }

      window.location.href =
        "/login";
    } catch (error) {
      console.error(error);

      setErrors((prev) => ({
        ...prev,
        general: "Server error",
      }));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-white to-teal-50 px-6">
      <div className="w-full max-w-md">
        <div className="my-4 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900">
            Create Account
          </h1>
        </div>

        <div className="rounded-2xl mb-20 border border-teal-100 bg-white/80 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.08)] backdrop-blur-xl">
          <form
            onSubmit={
              handleSubmit
            }
            className="space-y-3">
            <div>
              <label className="mb-1 block text-sm text-gray-600">
                Full Name
              </label>

              <input
                type="text"
                placeholder="John Doe"
                autoComplete="name"
                spellCheck={false}
                maxLength={100}
                value={fullName}
                onChange={(e) =>
                  setFullName(
                    sanitize(
                      e.target.value
                    )
                  )
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                required
              />

              {errors.fullName && (
                <p className="mt-1 text-xs text-red-500">
                  {
                    errors.fullName
                  }
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm text-gray-600">
                Company Name
              </label>

              <input
                type="text"
                placeholder="Company"
                autoComplete="organization"
                spellCheck={false}
                maxLength={100}
                value={company}
                onChange={(e) =>
                  setCompany(
                    sanitize(
                      e.target.value
                    )
                  )
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                required />

              {errors.company && (
                <p className="mt-1 text-xs text-red-500">
                  {
                    errors.company
                  }
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm text-gray-600">
                Country
              </label>

              <input
                type="text"
                placeholder="Vietnam"
                autoComplete="country-name"
                spellCheck={false}
                maxLength={100}
                value={country}
                onChange={(e) =>
                  setCountry(
                    sanitize(
                      e.target.value
                    )
                  )
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                required />

              {errors.country && (
                <p className="mt-1 text-xs text-red-500">
                  {
                    errors.country
                  }
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm text-gray-600">
                Email Address
              </label>

              <input
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                spellCheck={false}
                maxLength={100}
                value={email}
                onChange={(e) =>
                  setEmail(
                    sanitize(
                      e.target.value
                    )
                  )
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                required
              />

              {errors.email && (
                <p className="mt-1 text-xs text-red-500">
                  {
                    errors.email
                  }
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm text-gray-600">
                Password
              </label>

              <input
                type="password"
                placeholder="Minimum 6 characters"
                autoComplete="new-password"
                maxLength={100}
                value={password}
                onChange={(e) =>
                  setPassword(
                    sanitize(
                      e.target.value
                    )
                  )
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                required
              />

              {errors.password && (
                <p className="mt-1 text-xs text-red-500">
                  {
                    errors.password
                  }
                </p>
              )}
            </div>

            {errors.general && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                {errors.general}
              </div>
            )}

            <button
              type="submit"
              disabled={
                isLoading
              }
              className="w-full rounded-lg bg-[#298dff] py-3 text-sm font-semibold text-white transition hover:shadow-[0_0_14px_rgba(41,141,255,0.6)] disabled:cursor-not-allowed disabled:bg-gray-400">
              {isLoading
                ? "Creating..."
                : "Create Account"}
            </button>
          </form>

          <p className="mt-2 text-center text-sm text-gray-600">
            Already have an
            account?{" "}
            <Link
              href="/login"
              className="font-semibold text-teal-600 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}