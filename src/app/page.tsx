import { auth } from "../lib/auth";

import TaskBoard from "@/components/tasks/TaskBoard";
import CreateTaskDialog from "@/components/tasks/CreateTaskDialog";
import UserMenu from "@/components/auth/UserMenu";

export default async function HomePage() {
  const session = await auth();

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between gap-4">
          {/* Title */}
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Task Board
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              Manage your tasks and track their progress.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
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