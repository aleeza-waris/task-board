"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getReturnToFromCurrentUrl,
  loginPathWithReturnTo,
} from "@/lib/authRedirect";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function GoogleLoginPage() {
  const router = useRouter();

  useEffect(() => {
    const getAccessToken = async () => {
      try {
        const response = await fetch(
          `${API_URL}/auth/refresh`,
          {
            method: "POST",
            credentials: "include",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Google login failed"
          );
        }

        localStorage.setItem("token", data.accessToken);
localStorage.setItem("user", JSON.stringify(data.user));

router.replace(getReturnToFromCurrentUrl() || "/");
      } catch (error) {
        console.error("Google login failed:", error);
        router.replace(
          loginPathWithReturnTo(getReturnToFromCurrentUrl()),
        );
      }
    };

    getAccessToken();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p>Signing you in...</p>
    </div>
  );
}
