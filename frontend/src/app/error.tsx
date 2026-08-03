"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background p-8 text-foreground">
      <p className="text-lg font-semibold text-destructive">Error</p>
      <h1 className="text-3xl font-bold">Algo salió mal</h1>
      <p className="max-w-md text-center text-muted-foreground">
        Ocurrió un error inesperado al cargar la página. Intenta nuevamente.
      </p>
      <Button onClick={reset}>Reintentar</Button>
    </main>
  );
}
