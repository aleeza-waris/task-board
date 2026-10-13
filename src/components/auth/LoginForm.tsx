
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  ListTodo,
} from "lucide-react";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getGoogleLoginUrl,
  getReturnToFromCurrentUrl,
} from "@/lib/authRedirect";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const router = useRouter();
  const returnTo = getReturnToFromCurrentUrl();
  const registerHref = returnTo
    ? `/register?returnTo=${encodeURIComponent(returnTo)}`
    : "/register";


  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginFormValues) => {
    setLoginError("");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setLoginError(data.message || "Invalid email or password.");
        return;
      }
      localStorage.setItem("token", data.accessToken);
      localStorage.setItem("user", JSON.stringify(data.user));

      router.push(getReturnToFromCurrentUrl() || "/");
    } catch (error) {
      console.error("Login error:", error);
      setLoginError("Something went wrong. Please try again.");
    }
  };

  return (
    <main className="min-h-screen bg-teal-800 p-2 sm:p-2 lg:flex lg:items-center lg:justify-center lg:p-2">
      <div className="relative grid min-h-[calc(100vh-1rem)] w-full max-w-360 overflow-hidden rounded-2xl bg-white shadow-2xl shadow-teal-950/25 sm:min-h-[calc(100vh-1rem)] lg:min-h-[calc(100vh-1rem)] lg:grid-cols-[1.1fr_0.9fr] lg:rounded-[28px]">

        {/* LEFT — PRODUCT PREVIEW */}
        <section className="relative z-0 hidden min-h-screen overflow-hidden bg-teal-800 text-white lg:flex lg:min-h-0">
          <div className="absolute inset-0">
            <div className="absolute left-45 top-45 h-125 w-125 rounded-full bg-teal-300/15 blur-3xl" />

            <div className="absolute -bottom-55 -right-37.5 h-125 w-125 rounded-full bg-emerald-300/10 blur-3xl" />

            <div
              className="absolute inset-0 opacity-[0.035]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />
          </div>

          <div className="relative z-10 flex w-full flex-col px-10 py-10 xl:px-16">

            {/* Brand */}
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-teal-700">
                <ListTodo className="h-5 w-5" strokeWidth={2.2} />
              </div>

              <span className="text-lg font-semibold tracking-tight">
                Task Board
              </span>
            </div>

            {/* Main content */}
            <div className="my-auto py-16">
              <div className="mb-10 max-w-xl">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-teal-200" />

                  <span className="text-xs font-medium text-zinc-300">
                    Your workspace
                  </span>
                </div>

                <h1 className="text-4xl font-semibold tracking-tight text-white xl:text-5xl">
                  Simple task management
                </h1>

                <p className="mt-5 max-w-md text-sm leading-6 text-zinc-400 xl:text-base">
                  Stay focused, complete tasks, and keep your work organized.
                </p>
              </div>

              {/* Product preview */}
              <TaskBoardPreview />
            </div>

          </div>
        </section>

        {/* RIGHT — LOGIN */}
        <section className="relative z-20 flex min-h-[calc(100vh-1.5rem)] items-center justify-center bg-white px-5 py-8 sm:min-h-[calc(100vh-3rem)] sm:px-10 sm:py-10 lg:min-h-0 lg:py-0 lg:px-12 xl:px-16">
          <div className="w-full max-w-100 lg:pl-5">

            {/* Mobile logo */}
            <div className="mb-12 flex items-center gap-3 lg:hidden">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-teal-700">
                <ListTodo className="h-5 w-5" strokeWidth={2.2} />
              </div>

              <span className="text-lg font-semibold tracking-tight">
                Task Board
              </span>
            </div>

            {/* Heading */}
            <div className="mb-10">
              <h2 className="text-3xl font-semibold tracking-tight text-zinc-950">
                Welcome back
              </h2>

              <p className="mt-2 text-sm leading-6 text-zinc-500">
                Sign in to continue to your workspace.
              </p>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-5"
            >
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-zinc-900"
                >
                  Email address
                </label>

                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@example.com"
                    className="h-12 rounded-lg border-zinc-200 bg-white px-3.5 text-sm shadow-none placeholder:text-zinc-400 focus-visible:border-teal-600 focus-visible:ring-teal-600/25"
                    {...register("email")}
                  />
                </div>

                {errors.email && (
                  <p className="mt-1.5 text-xs text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-zinc-900"
                  >
                    Password
                  </label>
                </div>

                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="h-12 rounded-lg border-zinc-200 bg-white px-3.5 pr-10 text-sm shadow-none placeholder:text-zinc-400 focus-visible:border-teal-600 focus-visible:ring-teal-600/25"
                    {...register("password")}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((current) => !current)
                    }
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer text-zinc-400 transition-colors hover:text-zinc-950"
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {errors.password && (
                  <p className="mt-1.5 text-xs text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Login error */}
              {loginError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {loginError}
                </div>
              )}

              {/* Submit */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-12 w-full rounded-lg bg-teal-700 text-sm font-medium text-white shadow-sm shadow-teal-950/10 transition-colors hover:bg-teal-800"
              >
                {isSubmitting ? "Signing in..." : "Sign in"}
              </Button>
            </form>

            {/* Google Login */}
            <div className="mt-5">
              <Button
                type="button"
                variant="outline"
                className="h-12 w-full rounded-lg"
                onClick={() => {
                  window.location.href = getGoogleLoginUrl(
                    process.env.NEXT_PUBLIC_API_URL,
                  );
                }}
              >
                <svg
                  className="mr-2 h-4 w-4"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fill="#4285F4"
                    d="M21.35 12.27c0-.79-.07-1.55-.2-2.27H12v4.3h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.42Z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 21.75c2.63 0 4.84-.87 6.45-2.36l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.53A9.74 9.74 0 0 0 12 21.75Z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M6.54 13.83A5.85 5.85 0 0 1 6.23 12c0-.64.11-1.26.31-1.83V7.64H3.3A9.75 9.75 0 0 0 2.25 12c0 1.57.38 3.05 1.05 4.36l3.24-2.53Z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 6.14c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.84 3.1 14.63 2.25 12 2.25A9.74 9.74 0 0 0 3.3 7.64l3.24 2.53C7.31 7.86 9.46 6.14 12 6.14Z"
                  />
                </svg>

                Continue with Google
              </Button>
            </div>

            <p className="mt-6 text-center text-sm text-zinc-500">
              Don&apos;t have an account?{" "}
              <Link
                href={registerHref}
                className="font-medium text-teal-700 hover:text-teal-800"
              >
                Register
              </Link>
            </p>
          </div>
        </section>

        <svg
          aria-hidden="true"
          viewBox="0 0 112 800"
          preserveAspectRatio="none"
          className="pointer-events-none absolute left-[calc(55%-112px)] top-0 z-10 hidden h-full w-28 lg:block"
        >
          <path
            d="M 72 0 C 42 72, 17 132, 34 207 C 50 276, 100 315, 108 389 C 117 474, 69 531, 52 600 C 35 669, 53 744, 79 800 L 112 800 L 112 0 Z"
            fill="white"
          />
        </svg>
      </div>
    </main>
  );
}

/* ============================================================
   PRODUCT PREVIEW
============================================================ */

function TaskBoardPreview() {
  return (
    <div className="w-full max-w-md rounded-2xl border border-white/15 bg-white/8 p-5 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-teal-100/75">
            WORKSPACE
          </p>
          <p className="mt-1 text-sm font-medium text-white">
            Product Development
          </p>
        </div>

        <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-teal-50">
          This week
        </span>
      </div>

      <div className="my-4 h-px bg-white/15" />

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "To do", count: "03" },
          { label: "In progress", count: "02" },
          { label: "Complete", count: "08" },
        ].map((item) => (
          <div key={item.label}>
            <p className="text-xl font-semibold tracking-tight text-white">
              {item.count}
            </p>

            <p className="mt-1 text-[11px] text-teal-50/70">
              {item.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
