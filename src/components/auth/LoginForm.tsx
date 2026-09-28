"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
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

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const router = useRouter();

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

    const result = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    });

    if (result?.error) {
      setLoginError("Invalid email or password.");
      return;
    }

    router.push("/");
    router.refresh();
  };

  return (
    <main className="min-h-screen bg-teal-800 p-3 sm:p-6 lg:flex lg:items-center lg:justify-center lg:p-8">
      <div className="relative grid min-h-[calc(100vh-1.5rem)] w-full max-w-[1440px] overflow-hidden rounded-2xl bg-white shadow-2xl shadow-teal-950/25 sm:min-h-[calc(100vh-3rem)] lg:min-h-[calc(100vh-4rem)] lg:grid-cols-[1.1fr_0.9fr] lg:rounded-[28px]">
      {/* =====================================================
          LEFT — PRODUCT PREVIEW
      ====================================================== */}
      <section className="relative z-0 hidden min-h-screen overflow-hidden bg-teal-800 text-white lg:flex lg:min-h-0">
        {/* Subtle background details */}
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
                Your work,
                <br />
                <span className="text-teal-100">
                  organized simply.
                </span>
              </h1>

              <p className="mt-5 max-w-md text-sm leading-6 text-zinc-400 xl:text-base">
                Plan your work, move tasks forward, and keep your
                projects organized in one focused workspace.
              </p>
            </div>

            {/* Product preview */}
            <TaskBoardPreview />
          </div>

          {/* Bottom */}
          <div className="flex items-center justify-between border-t border-white/10 pt-5">
            <p className="text-xs text-zinc-500">
              Simple task management for focused work.
            </p>

            <div className="hidden items-center gap-2 text-xs text-zinc-500 xl:flex">
              <span>Organize</span>
              <span>·</span>
              <span>Track</span>
              <span>·</span>
              <span>Complete</span>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          RIGHT — LOGIN
      ====================================================== */}
      <section className="relative z-20 flex min-h-[calc(100vh-1.5rem)] items-center justify-center bg-white px-5 py-8 sm:min-h-[calc(100vh-3rem)] sm:px-10 sm:py-10 lg:min-h-0 lg:px-12 xl:px-16">
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
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 transition-colors hover:text-zinc-950"
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
          <p className="text-xs font-medium text-teal-100/75">WORKSPACE</p>
          <p className="mt-1 text-sm font-medium text-white">Product Development</p>
        </div>
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-teal-50">This week</span>
      </div>

      <div className="my-4 h-px bg-white/15" />

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "To do", count: "03" },
          { label: "In progress", count: "02" },
          { label: "Complete", count: "08" },
        ].map((item) => (
          <div key={item.label}>
            <p className="text-xl font-semibold tracking-tight text-white">{item.count}</p>
            <p className="mt-1 text-[11px] text-teal-50/70">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
