"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [isLoading, setIsLoading] =
    useState(false);

  const [errors, setErrors] =
    useState({
      email: "",
      password: "",
      general: "",
    });

  const router = useRouter();

  function sanitize(value: string) {
    return value
      .replace(/[<>]/g, "")
      .replace(/script/gi, "")
      .trim()
      .slice(0, 100);
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
      email: "",
      password: "",
      general: "",
    });

    setIsLoading(true);

    const cleanEmail =
      sanitize(email);

    const cleanPassword =
      sanitize(password);

    const emailError =
      validateEmail(cleanEmail);

    const passwordError =
      validatePassword(
        cleanPassword
      );

    setErrors({
      email: emailError,
      password: passwordError,
      general: "",
    });

    if (
      emailError ||
      passwordError
    ) {
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(
        "http://localhost:4000/api/v1/auth/login",
        {
          method: "POST",

          credentials: "include",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
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
            "Login failed",
        }));

        return;
      }

      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      router.push("/");
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
      <div className="mb-40 w-full max-w-md">
        <h1 className="mb-2 text-center text-4xl font-extrabold text-gray-900">
          Login
        </h1>

        <p className="my-2 text-center text-sm text-gray-500">
          Sign in to manage your
          global shipments
        </p>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-xl bg-white p-6 shadow"
        >
          <div>
            <label className="mb-1 block text-sm text-gray-600">
              Email
            </label>

            <input
              className="w-full rounded border border-gray-300 p-2 outline-none transition focus:border-blue-500"
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
              required
            />

            {errors.email && (
              <p className="mt-1 text-xs text-red-500">
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-600">
              Password
            </label>

            <input
              className="w-full rounded border border-gray-300 p-2 outline-none transition focus:border-blue-500"
              type="password"
              placeholder="password"
              autoComplete="current-password"
              maxLength={100}
              value={password}
              onChange={(e) =>
                setPassword(
                  sanitize(
                    e.target.value
                  )
                )
              }
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
          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-sm text-blue-500 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          {errors.general && (
            <div className="rounded border border-red-200 bg-red-50 p-2 text-sm text-red-600">
              {errors.general}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded bg-blue-500 p-2 text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading
              ? "Loading..."
              : "Login"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm">
          No account?{" "}
          <Link
            href="/register"
            className="text-blue-500 hover:underline"
          >
            Register
          </Link>
        </p>
      </div>
    </main>
  );
}