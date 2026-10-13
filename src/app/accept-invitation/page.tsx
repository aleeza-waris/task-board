"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ListTodo } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { apiFetch } from "@/lib/api";
import { loginPathWithReturnTo } from "@/lib/authRedirect";

type AcceptInvitationResponse = {
  message?: string;
  data?: {
    workspaceId?: string;
  };
};

function AcceptInvitationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const requestStarted = useRef<string | null>(null);
  const [state, setState] = useState<
    "checking" | "unauthenticated" | "accepting" | "error"
  >(token ? "checking" : "error");
  const [errorMessage, setErrorMessage] = useState(
    token ? "" : "This invitation link is invalid because it has no token.",
  );

  useEffect(() => {
    if (!token || requestStarted.current === token) return;

    if (!localStorage.getItem("token")) {
      const returnTo = `${window.location.pathname}${window.location.search}`;
      router.replace(loginPathWithReturnTo(returnTo));
      return;
    }

    requestStarted.current = token;
    setState("accepting");

    const acceptInvitation = async () => {
      try {
        const response = await apiFetch("/workspaces/invitations/accept", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const result = (await response.json().catch(() => null)) as
          | AcceptInvitationResponse
          | null;

        if (!response.ok) {
          throw new Error(
            result?.message || "Unable to accept this invitation.",
          );
        }

        const workspaceId = result?.data?.workspaceId;
        if (!workspaceId) {
          throw new Error(
            "The invitation was accepted, but the workspace could not be opened.",
          );
        }

        router.replace(`/workspaces/${encodeURIComponent(workspaceId)}`);
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to accept this invitation. Please try again.",
        );
        setState("error");
      }
    };

    void acceptInvitation();
  }, [router, token]);

  const returnTo = token
    ? `/accept-invitation?token=${encodeURIComponent(token)}`
    : null;

  return (
    <main className="flex min-h-screen items-center justify-center bg-teal-800 p-4 sm:p-6">
      <Card className="w-full max-w-md border-0 bg-white shadow-2xl shadow-teal-950/25">
        <CardContent className="p-6 sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-lg bg-teal-700 text-white">
              <ListTodo className="size-5" strokeWidth={2.2} />
            </span>
            <span className="text-lg font-semibold tracking-tight text-zinc-950">
              Task Board
            </span>
          </div>

          {state === "checking" || state === "accepting" ? (
            <div role="status" className="py-6 text-center">
              <div className="mx-auto mb-4 size-8 animate-spin rounded-full border-2 border-teal-700/20 border-t-teal-700" />
              <h1 className="text-xl font-semibold text-zinc-950">
                Accepting invitation
              </h1>
              <p className="mt-2 text-sm text-zinc-600">
                Please wait while we add you to the workspace.
              </p>
            </div>
          ) : state === "unauthenticated" ? (
            <div className="text-center">
              <h1 className="text-xl font-semibold text-zinc-950">
                Sign in to join the workspace
              </h1>
              <p className="mt-2 text-sm text-zinc-600">
                Sign in or create an account with the email address that
                received this invitation. We’ll return you here to accept it.
              </p>
              <div className="mt-6 flex flex-col gap-3">
                <Button
                  nativeButton={false}
                  render={
                    <Link
                      href={loginPathWithReturnTo(returnTo)}
                      className="cursor-pointer bg-teal-700 text-white hover:bg-teal-800"
                    />
                  }
                >
                  Sign in
                </Button>
                <Button
                  variant="outline"
                  nativeButton={false}
                  render={
                    <Link
                      href={
                        returnTo
                          ? `/register?returnTo=${encodeURIComponent(returnTo)}`
                          : "/register"
                      }
                      className="cursor-pointer"
                    />
                  }
                >
                  Create an account
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <h1 className="text-xl font-semibold text-zinc-950">
                Invitation couldn’t be accepted
              </h1>
              <p role="alert" className="mt-3 text-sm text-destructive">
                {errorMessage}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}

export default function AcceptInvitationPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-teal-800 p-4">
          <Card className="w-full max-w-md border-0 bg-white shadow-2xl shadow-teal-950/25">
            <CardContent className="p-8 text-center text-sm text-zinc-600">
              Loading invitation...
            </CardContent>
          </Card>
        </main>
      }
    >
      <AcceptInvitationContent />
    </Suspense>
  );
}
