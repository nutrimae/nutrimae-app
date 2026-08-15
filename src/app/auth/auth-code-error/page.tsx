import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AuthCodeErrorPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-cream px-6 text-center">
      <h1 className="font-heading text-2xl font-bold text-brown-800">
        Ops, esse link não é mais válido
      </h1>
      <p className="max-w-xs text-brown-700">
        Ele pode ter expirado ou já ter sido usado. Sem problema, é só pedir um novo.
      </p>
      <Link href="/login" className="w-full max-w-xs">
        <Button>Voltar para o login</Button>
      </Link>
    </main>
  );
}
