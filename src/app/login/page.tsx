"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { HeartHandshake, Mail, ShieldCheck, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Tab = "senha" | "magico";

export default function LoginPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [tab, setTab] = useState<Tab>("senha");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  function changeTab(next: Tab) {
    setTab(next);
    setError(null);
    setMessage(null);
  }

  async function handlePasswordSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (signInError) {
      setError("Não foi possível entrar. Confira seus dados ou aguarde a liberação da compra.");
      return;
    }

    router.replace("/app");
    router.refresh();
  }

  async function handleMagicLinkSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);
    if (otpError) {
      setError("Não foi possível enviar o link. O acesso é liberado somente após a compra.");
      return;
    }
    setMessage("Se esse e-mail já possui acesso, o link chegará em instantes.");
  }

  return (
    <main
      className="relative flex min-h-dvh flex-col justify-center overflow-hidden px-6 py-10"
      style={{ background: "linear-gradient(180deg, #fff5f7 0%, #fdf9f3 40%, #f2f5ee 100%)" }}
    >
      <div className="absolute inset-0 dot-pattern opacity-20" />
      <div className="relative mx-auto w-full max-w-sm">
        <header className="mb-8 flex flex-col items-center text-center">
          <Image
            src="/nutrimae-logo.png"
            alt="NutriMãe"
            width={200}
            height={200}
            priority
            className="h-32 w-32 animate-scale-in object-contain drop-shadow-[0_12px_32px_rgba(255,107,157,0.25)]"
          />
          <p className="mt-1 animate-fade-in-up text-base text-brown-700">Alimentação segura, com carinho.</p>
        </header>

        <section className="glass-card animate-fade-in-up rounded-3xl p-6" style={{ animationDelay: "0.1s" }}>
          <div className="mb-5 flex rounded-2xl bg-cream-deep/60 p-1">
            <button type="button" onClick={() => changeTab("senha")} className={`min-h-11 flex-1 rounded-xl text-sm font-semibold transition-all ${tab === "senha" ? "bg-white text-brown-800 shadow-sm" : "text-brown-700/50"}`}>Senha</button>
            <button type="button" onClick={() => changeTab("magico")} className={`min-h-11 flex-1 rounded-xl text-sm font-semibold transition-all ${tab === "magico" ? "bg-white text-brown-800 shadow-sm" : "text-brown-700/50"}`}>Link mágico</button>
          </div>

          {tab === "senha" ? (
            <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
              <Input id="email" type="email" autoComplete="email" label="Seu e-mail" placeholder="voce@exemplo.com" value={email} onChange={(event) => setEmail(event.target.value)} required />
              <Input id="password" type="password" autoComplete="current-password" label="Sua senha" placeholder="••••••••" value={password} onChange={(event) => setPassword(event.target.value)} minLength={6} required />
              {error && <div className="animate-scale-in rounded-xl bg-red-50 px-4 py-3"><p className="text-sm font-medium text-red-700">{error}</p></div>}
              <Button type="submit" loading={loading} variant="brand">Entrar</Button>
              <p className="text-center text-xs leading-relaxed text-brown-700/55">A conta é criada automaticamente depois da confirmação da compra.</p>
            </form>
          ) : (
            <form onSubmit={handleMagicLinkSubmit} className="flex flex-col gap-4">
              <Input id="email-magic" type="email" autoComplete="email" label="Seu e-mail" placeholder="voce@exemplo.com" value={email} onChange={(event) => setEmail(event.target.value)} required />
              {error && <div className="animate-scale-in rounded-xl bg-red-50 px-4 py-3"><p className="text-sm font-medium text-red-700">{error}</p></div>}
              {message && <div className="animate-scale-in rounded-xl bg-sage-50 px-4 py-3"><p className="text-sm font-medium text-sage-700">{message}</p></div>}
              <Button type="submit" loading={loading} variant="brand" className="flex items-center justify-center gap-2"><Sparkles className="h-5 w-5" />Enviar link mágico</Button>
              <p className="flex items-center justify-center gap-2 text-center text-xs text-brown-700/60"><Mail className="h-4 w-4" />Sem senha: clientes com acesso recebem um link por e-mail.</p>
            </form>
          )}
        </section>

        <Link href="/manual-sos" className="mt-5 flex min-h-14 items-center gap-3 rounded-2xl border border-red-100 bg-white/75 px-4 text-left shadow-sm">
          <HeartHandshake className="h-5 w-5 shrink-0 text-red-500" aria-hidden="true" />
          <span><strong className="block text-sm text-brown-800">Manual S.O.S. gratuito</strong><span className="text-xs text-brown-700/55">Acesse sem login em situações de urgência.</span></span>
        </Link>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-brown-700/50"><ShieldCheck className="h-4 w-4" />Acesso protegido e vinculado à compra</div>
      </div>
    </main>
  );
}
