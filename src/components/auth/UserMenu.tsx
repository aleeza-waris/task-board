"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Menu } from "@base-ui/react/menu";

export type CurrentUser = {
  username: string;
  email: string;
  avatar?: string;
};

function isValidUser(value: unknown): value is CurrentUser {
  return (
    typeof value === "object" &&
    value !== null &&
    "username" in value &&
    typeof value.username === "string" &&
    value.username.trim().length > 0 &&
    "email" in value &&
    typeof value.email === "string" &&
    value.email.trim().length > 0 &&
    (!("avatar" in value) || typeof value.avatar === "string")
  );
}

function subscribeToAuthChanges(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener("task-board-auth-change", onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener("task-board-auth-change", onStoreChange);
  };
}

function getAuthSnapshot() {
  if (typeof window === "undefined") {
    return "";
  }

  return JSON.stringify([
    localStorage.getItem("token"),
    localStorage.getItem("user"),
  ]);
}

function getUserFromSnapshot(snapshot: string): CurrentUser | null {
  try {
    const values: unknown = JSON.parse(snapshot);
    if (!Array.isArray(values)) {
      return null;
    }

    const [token, storedUser] = values;
    if (typeof token !== "string" || !token || typeof storedUser !== "string") {
      return null;
    }

    const user: unknown = JSON.parse(storedUser);
    return isValidUser(user) ? user : null;
  } catch {
    return null;
  }
}

export function useCurrentUser() {
  const authSnapshot = useSyncExternalStore(
    subscribeToAuthChanges,
    getAuthSnapshot,
    () => ""
  );

  return getUserFromSnapshot(authSnapshot);
}

export function UserAvatar({
  user,
  size = "default",
}: {
  user: CurrentUser;
  size?: "default" | "large" | "fill";
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const avatarUrl = user.avatar?.trim();
  const initial = (user.username || user.email).charAt(0).toUpperCase();
  const sizeClass =
    size === "large" ? "size-10" : size === "fill" ? "size-full" : "size-9";

  useEffect(() => {
    setImageFailed(false);
  }, [avatarUrl]);

  return (
    <span
      className={`relative flex ${sizeClass} shrink-0 items-center justify-center overflow-hidden rounded-full bg-black text-sm font-semibold text-white`}
    >
      {avatarUrl && !imageFailed ? (
        <img
          src={avatarUrl}
          alt=""
          referrerPolicy="no-referrer"
          onError={() => setImageFailed(true)}
          className="absolute inset-0 size-full object-cover"
        />
      ) : (
        initial
      )}
    </span>
  );
}

export default function UserMenu() {
  const router = useRouter();
  const user = useCurrentUser();

  if (!user) {
    return null;
  }

  const displayName = user.username;
  const email = user.email;

  return (
    <Menu.Root>
      {/* Avatar */}
      <Menu.Trigger
        aria-label="Open account menu"
        className="flex h-9 w-9 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-black p-0 transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2"
      >
        <UserAvatar user={user} size="fill" />
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
                <UserAvatar user={user} />

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
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                window.dispatchEvent(new Event("task-board-auth-change"));

                router.push("/login");
              }}
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
