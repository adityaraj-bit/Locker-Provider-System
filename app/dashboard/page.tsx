"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function DashboardIndex() {
  const router = useRouter();
  const { role } = useAuth();

  useEffect(() => {
    if (!role) {
      const savedRole = localStorage.getItem("role");
      if (!savedRole) {
        router.push("/login");
        return;
      }
    }

    const currentRole = role || localStorage.getItem("role");

    if (currentRole === "STUDENT") {
      router.push("/dashboard/student");
    } else if (currentRole === "STORE_OWNER") {
      router.push("/dashboard/store");
    } else if (currentRole === "ADMIN") {
      router.push("/dashboard/admin");
    } else {
      router.push("/login");
    }
  }, [role, router]);

  return (
    <div className="min-h-screen bg-surface-lowest flex items-center justify-center">
      <div className="space-y-4 text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground animate-pulse">
           Initializing Session Workspace...
        </p>
      </div>
    </div>
  );
}
