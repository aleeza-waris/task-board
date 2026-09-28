"use client";

import { signOut } from "next-auth/react";
import { LogOut, User } from "lucide-react";
import { Menu } from "@base-ui/react/menu";

type UserMenuProps = {
  name?: string | null;
  email?: string | null;
};

export default function UserMenu({
  name,
  email,
}: UserMenuProps) {
  const displayName = name || "Admin";

  const initial = displayName.charAt(0).toUpperCase();

  return (
    <Menu.Root>
      {/* Avatar */}
      <Menu.Trigger
        aria-label="Open account menu"
        className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-sm font-semibold text-white transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2"
      >
        {initial}
      </Menu.Trigger>

      <Menu.Portal>
        <Menu.Positioner
          side="bottom"
          align="end"
          sideOffset={8}
          className="z-50"
        >
          <Menu.Popup className="w-64 overflow-hidden rounded-xl border border-zinc-200 bg-white p-1 shadow-xl outline-none">
            {/* User information */}
            <div className="px-3 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black text-sm font-semibold text-white">
                  {initial}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-zinc-900">
                    {displayName}
                  </p>

                  <p className="truncate text-xs text-zinc-500">
                    {email}
                  </p>
                </div>
              </div>
            </div>

            <Menu.Separator className="my-1 h-px bg-zinc-100" />

            

            {/* Logout */}
            <Menu.Item
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-600 outline-none transition hover:bg-red-50 data-highlighted:bg-red-50"
            >
              <LogOut className="h-4 w-4" />

              <span>Log out</span>
            </Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}