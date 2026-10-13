
"use client";

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ListTodo,
  Users,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import UserMenu from "@/components/auth/UserMenu";
import Footer from "@/components/layout/Footer";

export default function HomePage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const syncAuthState = () => {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (!token || !storedUser) {
        setIsAuthenticated(false);
        return;
      }

      try {
        const user: unknown = JSON.parse(storedUser);
        const hasValidUser =
          typeof user === "object" &&
          user !== null &&
          "username" in user &&
          typeof user.username === "string" &&
          user.username.trim().length > 0 &&
          "email" in user &&
          typeof user.email === "string" &&
          user.email.trim().length > 0;

        setIsAuthenticated(hasValidUser);
      } catch {
        setIsAuthenticated(false);
      }
    };

    syncAuthState();
    window.addEventListener("storage", syncAuthState);
    window.addEventListener("task-board-auth-change", syncAuthState);

    return () => {
      window.removeEventListener("storage", syncAuthState);
      window.removeEventListener("task-board-auth-change", syncAuthState);
    };
  }, []);

  const handleWorkspaceClick = () => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (token && user) {
      router.push("/workspaces");
    } else {
      router.push("/login");
    }
  };

  return (
    <main className="min-h-screen bg-white text-zinc-950">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-zinc-200/80 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link href="/" className="flex cursor-pointer items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-700 text-white">
              <ListTodo className="h-5 w-5" strokeWidth={2.2} />
            </span>
            <span className="text-xl font-bold tracking-tight">
              Task Board
            </span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm text-zinc-600 md:flex">
            <a href="#features" className="cursor-pointer transition hover:text-teal-700">
              Features
            </a>
            <a
              href="#how-it-works"
              className="cursor-pointer transition hover:text-teal-700"
            >
              How it works
            </a>
          </nav>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <UserMenu />
            ) : (
              <Link
                href="/login"
                className="hidden cursor-pointer rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 sm:inline-flex"
              >
                Log in
              </Link>
            )}

            <button
              type="button"
              onClick={handleWorkspaceClick}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800"
            >
              Workspace
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="overflow-hidden bg-linear-to-b from-teal-50/80 to-white">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-2 lg:gap-16">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white px-3.5 py-1.5 text-sm font-medium text-teal-800 shadow-sm">
              <Zap className="h-4 w-4" />
              A clearer way to work together
            </div>

            <h1 className="max-w-xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Great work starts with a{" "}
              <span className="text-teal-700">clear plan.</span>
            </h1>

            <p className="mt-6 max-w-lg text-base leading-7 text-zinc-600 sm:text-lg">
              Organize your tasks, bring your team together, and keep every
              project moving forward in one shared workspace.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleWorkspaceClick}
                className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-teal-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800"
              >
                Get started
                <ArrowRight className="h-4 w-4" />
              </button>

              <a
                href="#features"
                className="inline-flex cursor-pointer items-center rounded-lg border border-zinc-200 bg-white px-5 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
              >
                Explore features
              </a>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm text-zinc-500">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-teal-700" />
                Organized projects
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-teal-700" />
                Team collaboration
              </span>
            </div>
          </div>

          {/* Static task board preview */}
          <div className="relative">
            <div className="absolute -inset-5 rounded-3xl bg-teal-100/60 blur-2xl" />

            <div className="relative rounded-2xl border border-zinc-200 bg-white p-4 shadow-xl shadow-zinc-200/60 sm:p-6">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                    <ListTodo className="h-5 w-5" strokeWidth={2.2} />
                  </div>
                  <div>
                    <p className="font-semibold">Website redesign</p>
                    <p className="text-xs text-zinc-500">Sample workspace</p>
                  </div>
                </div>

                <div className="flex -space-x-2">
                  {["A", "S", "M"].map((initial, index) => (
                    <div
                      key={initial}
                      className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-xs font-semibold ${
                        index === 0
                          ? "bg-teal-100 text-teal-800"
                          : index === 1
                            ? "bg-amber-100 text-amber-800"
                            : "bg-violet-100 text-violet-800"
                      }`}
                    >
                      {initial}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-zinc-50 p-3">
                  <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-zinc-600">
                    <span className="h-2 w-2 rounded-full bg-zinc-400" />
                    To Do
                  </div>
                  <div className="space-y-2">
                    <div className="rounded-lg border border-zinc-200 bg-white p-3">
                      <p className="text-xs font-medium">Plan homepage</p>
                      <p className="mt-2 text-[10px] text-zinc-400">Design</p>
                    </div>
                    <div className="rounded-lg border border-zinc-200 bg-white p-3">
                      <p className="text-xs font-medium">Write content</p>
                      <p className="mt-2 text-[10px] text-zinc-400">Content</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl bg-teal-50/70 p-3">
                  <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-zinc-600">
                    <span className="h-2 w-2 rounded-full bg-teal-600" />
                    In Progress
                  </div>
                  <div className="space-y-2">
                    <div className="rounded-lg border border-teal-100 bg-white p-3">
                      <p className="text-xs font-medium">Build components</p>
                      <p className="mt-2 text-[10px] text-zinc-400">
                        Development
                      </p>
                    </div>
                  </div>
                </div>

                <div className="hidden rounded-xl bg-emerald-50/70 p-3 sm:block">
                  <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-zinc-600">
                    <span className="h-2 w-2 rounded-full bg-emerald-600" />
                    Done
                  </div>
                  <div className="rounded-lg border border-emerald-100 bg-white p-3">
                    <p className="text-xs font-medium">Project kickoff</p>
                    <p className="mt-2 text-[10px] text-zinc-400">Planning</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between rounded-xl border border-zinc-100 px-3 py-3">
                <div className="flex items-center gap-2 text-sm text-zinc-600">
                  <Users className="h-4 w-4 text-teal-700" />
                  Everyone moving together
                </div>
                <CheckCircle2 className="h-5 w-5 text-teal-700" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-teal-700">
              Everything in one place
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Less confusion. More progress.
            </h2>
            <p className="mt-4 leading-7 text-zinc-600">
              Simple tools that help your team stay focused and organized.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {[
              {
                icon: ListTodo,
                title: "Organized task boards",
                description:
                  "See what needs to be done, what is in progress, and what is complete.",
              },
              {
                icon: Users,
                title: "Shared workspaces",
                description:
                  "Bring your projects and teammates together in a dedicated space.",
              },
              {
                icon: CheckCircle2,
                title: "Clear task progress",
                description:
                  "Track tasks, update their status, and keep important work moving.",
              },
            ].map((feature) => {
              const Icon = feature.icon;

              return (
                <article
                  key={feature.title}
                  className="rounded-2xl border border-zinc-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-zinc-200/50"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-600">
                    {feature.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="border-y border-zinc-200 bg-zinc-50 py-20 sm:py-24"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Get your team moving in three steps
            </h2>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              {
                number: "01",
                title: "Create a workspace",
                description:
                  "Set up a dedicated place for your project and its team.",
              },
              {
                number: "02",
                title: "Invite your team",
                description:
                  "Bring people together so everyone can see the work ahead.",
              },
              {
                number: "03",
                title: "Make progress",
                description:
                  "Organize tasks and move your project forward together.",
              },
            ].map((step) => (
              <div key={step.number} className="text-center">
                <p className="text-sm font-bold tracking-widest text-teal-700">
                  STEP {step.number}
                </p>
                <h3 className="mt-3 text-lg font-semibold">{step.title}</h3>
                <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-zinc-600">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="px-5 py-20 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-5xl rounded-3xl bg-teal-800 px-6 py-12 text-center text-white sm:px-12 sm:py-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to get organized?
          </h2>
          <p className="mx-auto mt-4 max-w-xl leading-7 text-teal-50/90">
            Create your workspace, bring your team together, and turn plans
            into progress.
          </p>

          <button
            type="button"
            onClick={handleWorkspaceClick}
            className="mt-7 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-teal-800 transition hover:bg-teal-50"
          >
            Go to Workspace
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      <Footer />
    </main>
  );
}
