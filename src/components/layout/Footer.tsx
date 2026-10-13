"use client";

import Link from "next/link";
import { ListTodo } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white">
      <div className="mx-auto flex min-w-0 max-w-7xl flex-wrap items-center justify-between gap-x-4 gap-y-3 px-4 py-6 sm:gap-4 sm:px-8 sm:py-7">
        <Link
          href="/"
          className="flex cursor-pointer items-center gap-2 font-bold"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-700 text-white">
            <ListTodo className="h-4 w-4" />
          </span>
          Task Board
        </Link>

        <p className="min-w-0 wrap-break-words text-sm text-zinc-500">
          Plan together. Make progress together.
        </p>

        <p className="min-w-0 wrap-break-words text-sm text-zinc-500">
          © {new Date().getFullYear()} Task Board
        </p>
      </div>
    </footer>
  );
}
