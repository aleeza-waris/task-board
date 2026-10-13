
"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { LayoutDashboard, Users, X } from "lucide-react";
import { UserAvatar, useCurrentUser } from "@/components/auth/UserMenu";

type WorkspaceSidebarProps = {
  sidebarOpen: boolean;
  onClose: () => void;
  workspaceRole?: "admin" | "member";
};

export default function WorkspaceSidebar({
  sidebarOpen,
  onClose,
  workspaceRole,
}: WorkspaceSidebarProps) {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const pathname = usePathname();
  const user = useCurrentUser();

  const navigationItems = [
    {
      label: "Task Board",
      href: `/workspaces/${workspaceId}`,
      icon: LayoutDashboard,
    },
    {
      label: "Team",
      href: `/workspaces/${workspaceId}/team`,
      icon: Users,
    },
  ];

  return (
    <>
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          className="absolute inset-0 z-40 cursor-pointer bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`${
          sidebarOpen
            ? "absolute inset-y-0 left-0 z-50 flex"
            : "hidden"
        } min-h-0 w-64 shrink-0 flex-col border-r border-[#245451] bg-[#123B3A] p-4 text-[#F4FAF8] md:static md:z-auto md:flex md:min-h-[calc(100vh-4rem)]`}
      >
        <div className="mb-4 flex justify-end md:hidden">
          <button
            type="button"
            aria-label="Close sidebar"
            className="flex size-8 cursor-pointer items-center justify-center rounded-md text-[#B7D1CD] transition-colors hover:bg-[#1F5550] hover:text-[#F4FAF8]"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        <nav className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={onClose}
                className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[#0F766E] text-white"
                    : "text-[#B7D1CD] hover:bg-[#1F5550] hover:text-[#F4FAF8]"
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {user && (
          <div className="mt-auto min-w-0 border-t border-[#245451] pt-4">
            <div className="flex min-w-0 items-center gap-3">
              <UserAvatar user={user} size="large" />
              <div className="min-w-0 flex-1">
                <p
                  className="truncate text-sm font-semibold text-[#F4FAF8]"
                  title={user.username}
                >
                  {user.username}
                </p>
                <p
                  className="truncate text-xs text-[#B7D1CD]"
                  title={user.email}
                >
                  {user.email}
                </p>
              </div>
            </div>
            <span className="mt-3 inline-flex rounded-full bg-[#1F5550] px-2.5 py-1 text-xs font-medium capitalize text-[#D7E8E4]">
              {workspaceRole === "admin"
                ? "Admin"
                : workspaceRole === "member"
                  ? "Member"
                  : "Loading role..."}
            </span>
          </div>
        )}
      </aside>
    </>
  );
}
