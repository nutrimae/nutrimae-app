"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Mail, Sparkles, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Tab = "senha" | "magico";
type PasswordMode = "entrar" | "criar";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [tab, setTab] = useState<Tab>("senha");
  const [passwordMode, setPasswordMode] = useState<PasswordMode>("entrar");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    if (passwordMode === "entrar") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) {
        setError("E-mail ou senha incorretos. Tente novamente.");
        return;
      }
      router.push("/");
      router.refresh();
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      setLoading(false);
      if (error) {
        setError(
          error.message.includes("already registered")
            ? "Esse e-mail já tem uma conta. Tente entrar."
            : "Não deu para criar a conta. Verifique os dados e tente de novo.",
        );
        return;
      }
      if (data.session) {
        router.push("/");
        router.refresh();
      } else {
        setMessage("Quase lá! Enviamos um e-mail de confirmação para você.");
      }
    }
  }

  async function handleMagicLinkSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);
    if (error) {
      setError("Não deu para enviar o link. Confira o e-mail e tente de novo.");
      return;
    }
    setMessage("Prontinho! Enviamos um link mágico para o seu e-mail.");
  }

  return (
    <main className="relative flex min-h-dvh flex-col justify-center overflow-hidden px-6 py-10"
      style={{ background: "linear-gradient(180deg, #fff5f7 0%, #fdf9f3 40%, #f2f5ee 100%)" }}
    >
      <div className="absolute inset-0 dot-pattern opacity-20" />

      <div className="relative mx-auto w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="animate-scale-in mb-2">
            <Image
              src="/nutrimae-logo.png"
              alt="NutriMãe"
              width={200}
              height={200}
              priority
              className="h-32 w-32 object-contain drop-shadow-[0_12px_32px_rgba(255,107,157,0.25)]"
            />
          </div>
          <p className="animate-fade-in-up mt-1 text-base text-brown-700">
            Alimentação segura, com carinho.
          </p>
        </div>

        <div className="animate-fade-in-up glass-card rounded-3xl p-6" style={{ animationDelay: "0.1s" }}>
          <div className="mb-5 flex rounded-2xl bg-cream-deep/60 p-1">
            <button
              type="button"
              onClick={() => {
                setTab("senha");
                setError(null);
                setMessage(null);
              }}
              className={`min-h-11 flex-1 rounded-xl text-sm font-semibold transition-all duration-200 ${
                tab === "senha"
                  ? "bg-white text-brown-800 shadow-sm"
                  : "text-brown-700/50 hover:text-brown-700/70"
              }`}
            >
              Senha
            </button>
            <button
              type="button"
              onClick={() => {
                setTab("magico");
                setError(null);
                setMessage(null);
              }}
              className={`min-h-11 flex-1 rounded-xl text-sm font-semibold transition-all duration-200 ${
                tab === "magico"
                  ? "bg-white text-brown-800 shadow-sm"
                  : "text-brown-700/50 hover:text-brown-700/70"
              }`}
            >
              Link mágico
            </button>
          </div>

          {tab === "senha" ? (
            <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
              <Input
                id="email"
                type="email"
                autoComplete="email"
                label="Seu e-mail"
                placeholder="voce@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                id="password"
                type="password"
                autoComplete={passwordMode === "entrar" ? "current-password" : "new-password"}
                label="Sua senha"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />

              {error && (
                <div className="animate-scale-in rounded-xl bg-red-50 px-4 py-3">
                  <p className="text-sm font-medium text-red-700">{error}</p>
                </div>
              )}
              {message && (
                <div className="animate-scale-in rounded-xl bg-sage-50 px-4 py-3">
                  <p className="text-sm font-medium text-sage-700">{message}</p>
                </div>
              )}

              <Button type="submit" disabled={loading} variant="brand">
                {loading
                  ? "Só um momento..."
                  : passwordMode === "entrar"
                    ? "Entrar"
                    : "Criar minha conta"}
              </Button>

              <button
                type="button"
                onClick={() => {
                  setPasswordMode(passwordMode === "entrar" ? "criar" : "entrar");
                  setError(null);
                  setMessage(null);
                }}
                className="min-h-11 text-sm font-semibold text-primary-600 transition-colors hover:text-primary-hover"
              >
                {passwordMode === "entrar" ? "Não tem conta? Criar conta" : "Já tem conta? Entrar"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleMagicLinkSubmit} className="flex flex-col gap-4">
              <Input
                id="email-magic"
                type="email"
                autoComplete="email"
                label="Seu e-mail"
                placeholder="voce@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              {error && (
                <div className="animate-scale-in rounded-xl bg-red-50 px-4 py-3">
                  <p className="text-sm font-medium text-red-700">{error}</p>
                </div>
              )}
              {message && (
                <div className="animate-scale-in rounded-xl bg-sage-50 px-4 py-3">
                  <p className="text-sm font-medium text-sage-700">{message}</p>
                </div>
              )}

              <Button type="submit" disabled={loading} variant="brand" className="flex items-center justify-center gap-2">
                {loading ? (
                  "Enviando..."
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" strokeWidth={1.75} />
                    Enviar link mágico
                  </>
                )}
              </Button>
              <p className="flex items-center justify-center gap-2 text-center text-xs text-brown-700/60">
                <Mail className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                Sem senha: você recebe um link por e-mail e entra direto.
              </p>
            </form>
          )}
        </div>

        <div className="animate-fade-in-up mt-6 flex items-center justify-center gap-2 text-xs text-brown-700/50" style={{ animationDelay: "0.2s" }}>
          <ShieldCheck className="h-4 w-4 shrink-0" strokeWidth={1.75} />
          Seus dados estão protegidos e seguros
        </div>
      </div>
    </main>
  );
}
