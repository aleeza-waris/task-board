import { auth } from "../lib/auth";

import TaskBoard from "@/components/tasks/TaskBoard";
import CreateTaskDialog from "@/components/tasks/CreateTaskDialog";
import UserMenu from "@/components/auth/UserMenu";
import { ListTodo } from "lucide-react";

export default async function HomePage() {
  const session = await auth();

  return (
    <main className="min-h-screen bg-teal-50/50">
      <div className="mx-auto max-w-[1600px] px-4 py-5 sm:px-6 sm:py-8 lg:px-10">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between gap-2 border-b border-teal-900/10 pb-5 sm:mb-8 sm:gap-4 sm:pb-6">
          {/* Title */}
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-teal-700 shadow-sm ring-1 ring-teal-900/10">
                <ListTodo className="h-5 w-5" strokeWidth={2.2} />
              </div>
            <h1 className="text-xl font-semibold tracking-tight text-zinc-950 sm:text-3xl">
                Task Board
              </h1>
            </div>

            <p className="mt-1.5 hidden text-sm text-zinc-500 min-[420px]:block">
              Manage your tasks and track their progress.
            </p>
          </div>

          {/* Actions */}
          <div className="flex shrink-0 items-center justify-between gap-2 sm:justify-end sm:gap-3">
            <CreateTaskDialog />

            <UserMenu
              name={session?.user?.name}
              email={session?.user?.email}
            />
          </div>
        </div>

        {/* Task Board */}
        <TaskBoard />
      </div>
    </main>
  );
}
