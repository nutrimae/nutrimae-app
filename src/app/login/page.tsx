"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Mail, Sparkles } from "lucide-react";
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
    <main className="flex min-h-dvh flex-col justify-center bg-cream px-6 py-10">
      <div className="mx-auto w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-sage-100">
            <Heart className="h-8 w-8 text-sage-600" strokeWidth={1.75} />
          </div>
          <h1 className="font-heading text-3xl font-bold text-brown-800">NutriMãe</h1>
          <p className="mt-2 text-brown-700">
            Um espaço calmo para a introdução alimentar do seu bebê.
          </p>
        </div>

        <div className="mb-6 flex rounded-2xl bg-sage-50 p-1">
          <button
            type="button"
            onClick={() => {
              setTab("senha");
              setError(null);
              setMessage(null);
            }}
            className={`min-h-12 flex-1 rounded-xl text-base font-semibold transition-colors ${
              tab === "senha" ? "bg-white text-sage-700 shadow-sm" : "text-brown-700/60"
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
            className={`min-h-12 flex-1 rounded-xl text-base font-semibold transition-colors ${
              tab === "magico" ? "bg-white text-sage-700 shadow-sm" : "text-brown-700/60"
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

            {error && <p className="text-sm font-medium text-terracotta-600">{error}</p>}
            {message && <p className="text-sm font-medium text-sage-600">{message}</p>}

            <Button type="submit" disabled={loading}>
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
              className="min-h-12 text-base font-semibold text-sage-600"
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

            {error && <p className="text-sm font-medium text-terracotta-600">{error}</p>}
            {message && <p className="text-sm font-medium text-sage-600">{message}</p>}

            <Button type="submit" disabled={loading} className="flex items-center justify-center gap-2">
              {loading ? (
                "Enviando..."
              ) : (
                <>
                  <Sparkles className="h-5 w-5" strokeWidth={1.75} />
                  Enviar link mágico
                </>
              )}
            </Button>
            <p className="flex items-center justify-center gap-2 text-center text-sm text-brown-700/70">
              <Mail className="h-4 w-4" strokeWidth={1.75} />
              Sem senha: você recebe um link por e-mail e entra direto.
            </p>
          </form>
        )}
      </div>
    </main>
  );
}
