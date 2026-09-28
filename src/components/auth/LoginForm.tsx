"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  MoreHorizontal,
  Plus,
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
    <main className="min-h-screen bg-white lg:grid lg:grid-cols-[1.1fr_0.9fr]">
      {/* =====================================================
          LEFT — PRODUCT PREVIEW
      ====================================================== */}
      <section className="relative hidden min-h-screen overflow-hidden bg-zinc-950 text-white lg:flex">
        {/* Subtle background details */}
        <div className="absolute inset-0">
          <div className="absolute left-45 top-45 h-125 w-125 rounded-full bg-white/2.5 blur-3xl" />

          <div className="absolute -bottom-55 -right-37.5 h-125 w-125 rounded-full bg-white/2.5 blur-3xl" />

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
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-zinc-950">
              <CheckCircle2 className="h-5 w-5" />
            </div>

            <span className="text-lg font-semibold tracking-tight">
              Task Board
            </span>
          </div>

          {/* Main content */}
          <div className="my-auto py-16">
            <div className="mb-10 max-w-xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/4 px-3 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-white" />

                <span className="text-xs font-medium text-zinc-300">
                  Your workspace
                </span>
              </div>

              <h1 className="text-4xl font-semibold tracking-tight text-white xl:text-5xl">
                Your work,
                <br />
                <span className="text-zinc-500">
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
      <section className="flex min-h-screen items-center justify-center bg-white px-6 py-10 sm:px-10">
        <div className="w-full max-w-100">
          {/* Mobile logo */}
          <div className="mb-14 flex items-center gap-3 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-950 text-white">
              <CheckCircle2 className="h-5 w-5" />
            </div>

            <span className="text-lg font-semibold tracking-tight">
              Task Board
            </span>
          </div>

          {/* Heading */}
          <div className="mb-9">
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
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  className="h-11 rounded-lg border-zinc-200 bg-white pl-10 text-sm shadow-none placeholder:text-zinc-400 focus-visible:border-zinc-950 focus-visible:ring-zinc-950"
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
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="h-11 rounded-lg border-zinc-200 bg-white pl-10 pr-10 text-sm shadow-none placeholder:text-zinc-400 focus-visible:border-zinc-950 focus-visible:ring-zinc-950"
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
              className="h-11 w-full rounded-lg bg-zinc-950 text-sm font-medium text-white shadow-none transition-colors hover:bg-zinc-800"
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-8 border-t border-zinc-100 pt-6">
            <p className="text-center text-xs leading-5 text-zinc-400">
              By continuing, you agree to use Task Board for
              managing your workspace.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

/* ============================================================
   PRODUCT PREVIEW
============================================================ */

function TaskBoardPreview() {
  return (
    <div className="w-full max-w-190">
      {/* Browser/window frame */}
      <div className="overflow-hidden rounded-xl border border-white/10 bg-zinc-900 shadow-2xl shadow-black/40">
        {/* Window header */}
        <div className="flex h-10 items-center justify-between border-b border-white/10 px-4">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
            <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
            <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
          </div>

          <div className="hidden rounded-md border border-white/10 bg-white/3 px-20 py-1 sm:block">
            <span className="text-[9px] text-zinc-600">
              taskboard.app
            </span>
          </div>

          <MoreHorizontal className="h-4 w-4 text-zinc-600" />
        </div>

        {/* App */}
        <div className="p-4">
          {/* App top bar */}
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-zinc-500">
                Workspace
              </p>

              <p className="mt-0.5 text-sm font-medium text-white">
                Product Development
              </p>
            </div>

            <button className="flex items-center gap-1.5 rounded-md bg-white px-2.5 py-1.5 text-[9px] font-medium text-zinc-950">
              <Plus className="h-3 w-3" />
              Add task
            </button>
          </div>

          {/* Board */}
          <div className="grid grid-cols-3 gap-3">
            <PreviewColumn
              title="To Do"
              count="3"
              tasks={[
                {
                  title: "Design dashboard",
                  tag: "Design",
                },
                {
                  title: "Create task modal",
                  tag: "Frontend",
                },
              ]}
            />

            <PreviewColumn
              title="In Progress"
              count="2"
              tasks={[
                {
                  title: "Build task board",
                  tag: "Development",
                },
                {
                  title: "Add authentication",
                  tag: "Backend",
                },
              ]}
            />

            <PreviewColumn
              title="Done"
              count="4"
              tasks={[
                {
                  title: "Setup project",
                  tag: "Setup",
                  completed: true,
                },
                {
                  title: "Create layout",
                  tag: "Frontend",
                  completed: true,
                },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Small status row */}
      <div className="mt-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-1.5">
            <div className="flex h-5 w-5 items-center justify-center rounded-full border border-zinc-950 bg-zinc-700 text-[7px] text-white">
              A
            </div>

            <div className="flex h-5 w-5 items-center justify-center rounded-full border border-zinc-950 bg-zinc-500 text-[7px] text-white">
              M
            </div>

            <div className="flex h-5 w-5 items-center justify-center rounded-full border border-zinc-950 bg-zinc-300 text-[7px] text-zinc-900">
              S
            </div>
          </div>

          <span className="text-[9px] text-zinc-600">
            3 members working
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[9px] text-zinc-600">
          <ArrowUpRight className="h-3 w-3" />
          Stay on track
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   PREVIEW COLUMN
============================================================ */

function PreviewColumn({
  title,
  count,
  tasks,
}: {
  title: string;
  count: string;
  tasks: {
    title: string;
    tag: string;
    completed?: boolean;
  }[];
}) {
  return (
    <div className="min-w-0 rounded-lg border border-white/10 bg-zinc-950/70 p-2.5">
      {/* Column header */}
      <div className="mb-2.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] font-medium text-zinc-300">
            {title}
          </span>

          <span className="rounded bg-white/5 px-1.5 py-0.5 text-[8px] text-zinc-600">
            {count}
          </span>
        </div>

        <MoreHorizontal className="h-3 w-3 text-zinc-700" />
      </div>

      {/* Tasks */}
      <div className="space-y-2">
        {tasks.map((task) => (
          <div
            key={task.title}
            className="rounded-md border border-white/10 bg-zinc-900 p-2.5"
          >
            <div className="flex items-start gap-2">
              {task.completed ? (
                <div className="mt-0.5 flex h-3 w-3 shrink-0 items-center justify-center rounded border border-zinc-500 bg-zinc-200 text-zinc-950">
                  <Check className="h-2 w-2" />
                </div>
              ) : (
                <div className="mt-0.5 h-3 w-3 shrink-0 rounded border border-zinc-700" />
              )}

              <p
                className={`truncate text-[9px] font-medium ${
                  task.completed
                    ? "text-zinc-600 line-through"
                    : "text-zinc-300"
                }`}
              >
                {task.title}
              </p>
            </div>

            <div className="mt-2 flex items-center justify-between">
              <span className="rounded bg-white/5 px-1.5 py-0.5 text-[7px] text-zinc-500">
                {task.tag}
              </span>

              <div className="h-3 w-3 rounded-full bg-zinc-700" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}