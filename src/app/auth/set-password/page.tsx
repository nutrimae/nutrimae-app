"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setError("Não deu para salvar a senha agora. Tente de novo em instantes.");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <main className="flex min-h-dvh flex-col justify-center bg-cream px-6 py-10">
      <div className="mx-auto w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-sage-100">
            <Heart className="h-8 w-8 text-sage-600" strokeWidth={1.75} />
          </div>
          <h1 className="font-heading text-2xl font-bold text-brown-800">
            Bem-vinda ao NutriMãe
          </h1>
          <p className="mt-2 text-brown-700">
            Sua conta já está pronta. Crie uma senha para continuar.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            label="Nova senha"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
          <Input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            label="Confirme a senha"
            placeholder="••••••••"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            minLength={6}
            required
          />

          {error && <p className="text-sm font-medium text-terracotta-600">{error}</p>}

          <Button type="submit" disabled={loading}>
            {loading ? "Salvando..." : "Salvar e continuar"}
          </Button>
        </form>
      </div>
    </main>
  );
}
