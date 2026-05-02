"use client";

import { useState, FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">
            SetToClose
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Sign in to your dashboard
          </p>
        </div>

        {/* Card */}
        <div
          className={cn(
            "rounded-xl border p-6",
            "border-neutral-200 dark:border-neutral-800",
            "bg-white dark:bg-neutral-900"
          )}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Email
              </label>
              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={cn(
                  "w-full px-3 py-2 text-sm rounded-md border transition-colors",
                  "border-neutral-200 dark:border-neutral-700",
                  "bg-neutral-50 dark:bg-neutral-800",
                  "text-neutral-900 dark:text-white",
                  "placeholder:text-neutral-400 dark:placeholder:text-neutral-600",
                  "focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-600"
                )}
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={cn(
                    "w-full px-3 py-2 pr-10 text-sm rounded-md border transition-colors",
                    "border-neutral-200 dark:border-neutral-700",
                    "bg-neutral-50 dark:bg-neutral-800",
                    "text-neutral-900 dark:text-white",
                    "focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-600"
                  )}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className={cn(
                "w-full py-2 text-sm font-medium rounded-md transition-opacity",
                "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900",
                "hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
