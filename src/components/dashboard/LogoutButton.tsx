"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/Button";

async function logoutRequest(): Promise<void> {
  const response = await fetch("/api/auth/logout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Não foi possível encerrar a sessão.");
  }
}

export function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogout = async () => {
    setError(null);
    setIsLoading(true);

    try {
      await logoutRequest();
      router.replace("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível encerrar a sessão.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-2 text-xs text-red-200/80">
      <Button variant="ghost" onClick={handleLogout} disabled={isLoading}>
        {isLoading ? "Saindo..." : "Sair"}
      </Button>
      {error ? <span className="text-[11px] text-red-300/80">{error}</span> : null}
    </div>
  );
}
