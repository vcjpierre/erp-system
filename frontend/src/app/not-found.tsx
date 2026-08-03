import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background p-8 text-foreground">
      <p className="text-lg font-semibold text-primary">404</p>
      <h1 className="text-3xl font-bold">Página no encontrada</h1>
      <p className="max-w-md text-center text-muted-foreground">
        La página que buscas no existe o fue movida.
      </p>
      <Button asChild>
        <Link href="/">Volver al inicio</Link>
      </Button>
    </main>
  );
}
