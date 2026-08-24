"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Heart } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SetPasswordPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [linkExpired, setLinkExpired] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    // O e-mail chega com o link certo, mas Gmail/Outlook costumam escanear
    // (abrir) o link sozinhos antes da pessoa clicar de verdade, consumindo
    // o token de uso único — a Supabase manda pra cá com o erro no #hash
    // em vez de um access_token válido. Detecta isso ANTES de deixar
    // preencher senha à toa (só falharia no fim, sem explicar o motivo).
    const hash = window.location.hash;
    if (hash.includes("error_code=otp_expired") || hash.includes("access_denied")) {
      setLinkExpired(true);
      return;
    }

    // @supabase/ssr (createBrowserClient) NÃO lê o #access_token sozinho
    // como o client "puro" do supabase-js faz (detectSessionInUrl não se
    // aplica aqui) — confirmado contra o sandbox: sem isto, nenhum cookie
    // de sessão era gravado mesmo com o token válido na URL, e
    // updateUser() sempre falhava com "sessão ausente". Extrai o token do
    // hash manualmente e cria a sessão explicitamente.
    const params = new URLSearchParams(hash.replace(/^#/, ""));
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");

    if (!accessToken || !refreshToken) {
      setLinkExpired(true);
      return;
    }

    supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken }).then(({ error }) => {
      if (error) {
        setLinkExpired(true);
        return;
      }
      window.history.replaceState(null, "", window.location.pathname);
      setSessionReady(true);
    });
  }, [supabase]);

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
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        // updateUser() pode rejeitar a promise (ex.: AuthSessionMissingError,
        // quando a sessão do convite/recuperação ainda não foi capturada do
        // #hash) em vez de só devolver { error } — sem o try/finally aqui,
        // o botão ficava travado em "loading" pra sempre nesse caso.
        setError("Não deu para salvar a senha agora. Tente de novo em instantes.");
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      setError("Sua sessão de convite expirou. Volte pro e-mail e peça um novo link.");
    } finally {
      setLoading(false);
    }
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
            {linkExpired
              ? "Esse link expirou antes de você abrir (acontece quando o e-mail escaneia o link primeiro)."
              : "Sua conta já está pronta. Crie uma senha para continuar."}
          </p>
        </div>

        {linkExpired ? (
          <Link
            href="/login"
            className="flex min-h-14 items-center justify-center rounded-2xl bg-sage-500 px-6 font-heading text-base font-bold text-white"
          >
            Pedir um novo link
          </Link>
        ) : !sessionReady ? (
          <p className="text-center text-brown-700">Confirmando seu acesso...</p>
        ) : (
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
        )}
      </div>
    </main>
  );
}
