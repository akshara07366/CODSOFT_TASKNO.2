
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  
async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();
  setError("");

  try {
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error || "Invalid email or password.");
      return;
    }

    router.push("/admin");
    router.refresh();
  } catch {
    setError("Unable to connect. Please try again.");
  }
}

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f6f0] px-4 py-10">

      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">

        <div className="mb-8 text-center">

          <h1 className="text-3xl font-extrabold text-[#26372b]">
            Dine<span className="text-[#d77a39]">Desk.</span>
          </h1>

          <p className="mt-2 text-sm font-semibold uppercase tracking-widest text-[#d77a39]">
            Restaurant Admin
          </p>

          <h2 className="mt-6 text-2xl font-bold text-gray-800">
            Welcome Back!
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Sign in to manage your restaurant.
          </p>

        </div>

        <form onSubmit={handleLogin} className="space-y-5">

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Email Address
            </label>

            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter admin email"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#d77a39] focus:ring-2 focus:ring-orange-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Password
            </label>

            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#d77a39] focus:ring-2 focus:ring-orange-100"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full rounded-xl bg-[#26372b] py-3 font-bold text-white transition hover:bg-[#3b5140]"
          >
            Login to Admin Panel
          </button>

        </form>

        <div className="mt-6 rounded-xl bg-[#f7f6f0] p-4">

          <p className="text-sm font-bold text-gray-700">
            Demo Login Credentials
          </p>

          <p className="mt-2 text-sm text-gray-600">
            Email: admin@dinedesk.com
          </p>

          <p className="mt-1 text-sm text-gray-600">
            Password: DineDesk@123
          </p>

        </div>

        <a
          href="/"
          className="mt-6 block text-center text-sm font-semibold text-[#d77a39] hover:underline"
        >
          Back to Customer Website
        </a>

      </div>

    </main>
  );
}
