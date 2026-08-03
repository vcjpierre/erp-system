"use client";

import { useEffect } from "react";

export default function GlobalError({
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
    <html lang="es">
      <body>
        <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background p-8 text-foreground">
          <p className="text-lg font-semibold text-destructive">Error</p>
          <h1 className="text-3xl font-bold">Algo salió mal</h1>
          <p className="max-w-md text-center text-muted-foreground">
            Ocurrió un error inesperado. Intenta nuevamente.
          </p>
          <button
            onClick={reset}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Reintentar
          </button>
        </main>
      </body>
    </html>
  );
}
