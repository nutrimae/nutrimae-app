"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { HeartHandshake, Mail, ShieldCheck, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocale } from "@/lib/use-locale";

type Tab = "senha" | "magico";

export default function LoginPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const { locale } = useLocale();
  const es = locale === "es";
  const [tab, setTab] = useState<Tab>("senha");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [expiredLink, setExpiredLink] = useState(false);
  const [resendEmail, setResendEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  useEffect(() => {
    // Link de convite/recuperação expirado (comum quando o Gmail/Outlook
    // escaneia o link antes da pessoa clicar de verdade, consumindo o
    // token de uso único) — Supabase manda pra cá com o erro no #hash.
    if (window.location.hash.includes("error_code=otp_expired") || window.location.hash.includes("access_denied")) {
      setExpiredLink(true);
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  async function handleResendInvite(event: React.FormEvent) {
    event.preventDefault();
    setResendLoading(true);
    setResendMessage(null);
    const res = await fetch("/api/account/resend-invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: resendEmail }),
    });
    const data = await res.json().catch(() => null);
    setResendLoading(false);
    setResendMessage(
      data?.message ?? (es ? "Si ese correo tiene una cuenta, un nuevo link llegará en instantes." : "Se esse e-mail tiver uma conta, um novo link chega em instantes."),
    );
  }

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
      setError(
        es
          ? "No fue posible iniciar sesión. Revisa tus datos o espera la liberación de la compra."
          : "Não foi possível entrar. Confira seus dados ou aguarde a liberação da compra.",
      );
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
      setError(
        es
          ? "No fue posible enviar el link. El acceso se libera solo después de la compra."
          : "Não foi possível enviar o link. O acesso é liberado somente após a compra.",
      );
      return;
    }
    setMessage(es ? "Si ese correo ya tiene acceso, el link llegará en instantes." : "Se esse e-mail já possui acesso, o link chegará em instantes.");
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
            alt="NutriMama"
            width={200}
            height={200}
            priority
            className="h-32 w-32 animate-scale-in object-contain drop-shadow-[0_12px_32px_rgba(255,107,157,0.25)]"
          />
          <p className="mt-1 animate-fade-in-up text-base text-brown-700">{es ? "Alimentación segura, con cariño." : "Alimentação segura, com carinho."}</p>
        </header>

        {expiredLink && (
          <div className="mb-4 animate-scale-in rounded-2xl bg-amber-50 p-4">
            <p className="text-sm font-medium text-brown-800">
              {es
                ? "Ese link venció antes de que lo abrieras (pasa cuando el correo escanea el link antes de que lo abras). Escribe tu correo y te enviamos uno nuevo:"
                : "Esse link expirou antes de você clicar (acontece quando o e-mail escaneia o link antes de você abrir). Digite seu e-mail que a gente manda um novo:"}
            </p>
            <form onSubmit={handleResendInvite} className="mt-3 flex flex-col gap-2">
              <Input
                id="resend-email"
                type="email"
                autoComplete="email"
                placeholder="tu@ejemplo.com"
                value={resendEmail}
                onChange={(event) => setResendEmail(event.target.value)}
                required
              />
              <Button type="submit" loading={resendLoading} variant="brand">
                {es ? "Reenviar link" : "Reenviar link"}
              </Button>
              {resendMessage && <p className="text-sm font-medium text-sage-700">{resendMessage}</p>}
            </form>
          </div>
        )}

        <section className="glass-card animate-fade-in-up rounded-3xl p-6" style={{ animationDelay: "0.1s" }}>
          <div className="mb-5 flex rounded-2xl bg-cream-deep/60 p-1">
            <button type="button" onClick={() => changeTab("senha")} className={`min-h-11 flex-1 rounded-xl text-sm font-semibold transition-all ${tab === "senha" ? "bg-white text-brown-800 shadow-sm" : "text-brown-700/50"}`}>{es ? "Contraseña" : "Senha"}</button>
            <button type="button" onClick={() => changeTab("magico")} className={`min-h-11 flex-1 rounded-xl text-sm font-semibold transition-all ${tab === "magico" ? "bg-white text-brown-800 shadow-sm" : "text-brown-700/50"}`}>{es ? "Link mágico" : "Link mágico"}</button>
          </div>

          {tab === "senha" ? (
            <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
              <Input id="email" type="email" autoComplete="email" label={es ? "Tu correo" : "Seu e-mail"} placeholder="tu@ejemplo.com" value={email} onChange={(event) => setEmail(event.target.value)} required />
              <Input id="password" type="password" autoComplete="current-password" label={es ? "Tu contraseña" : "Sua senha"} placeholder="••••••••" value={password} onChange={(event) => setPassword(event.target.value)} minLength={6} required />
              {error && <div className="animate-scale-in rounded-xl bg-red-50 px-4 py-3"><p className="text-sm font-medium text-red-700">{error}</p></div>}
              <Button type="submit" loading={loading} variant="brand">{es ? "Entrar" : "Entrar"}</Button>
              <p className="text-center text-xs leading-relaxed text-brown-700/55">{es ? "La cuenta se crea automáticamente después de confirmar la compra." : "A conta é criada automaticamente depois da confirmação da compra."}</p>
            </form>
          ) : (
            <form onSubmit={handleMagicLinkSubmit} className="flex flex-col gap-4">
              <Input id="email-magic" type="email" autoComplete="email" label={es ? "Tu correo" : "Seu e-mail"} placeholder="tu@ejemplo.com" value={email} onChange={(event) => setEmail(event.target.value)} required />
              {error && <div className="animate-scale-in rounded-xl bg-red-50 px-4 py-3"><p className="text-sm font-medium text-red-700">{error}</p></div>}
              {message && <div className="animate-scale-in rounded-xl bg-sage-50 px-4 py-3"><p className="text-sm font-medium text-sage-700">{message}</p></div>}
              <Button type="submit" loading={loading} variant="brand" className="flex items-center justify-center gap-2"><Sparkles className="h-5 w-5" />{es ? "Enviar link mágico" : "Enviar link mágico"}</Button>
              <p className="flex items-center justify-center gap-2 text-center text-xs text-brown-700/60"><Mail className="h-4 w-4" />{es ? "Sin contraseña: clientas con acceso reciben un link por correo." : "Sem senha: clientes com acesso recebem um link por e-mail."}</p>
            </form>
          )}
        </section>

        <Link href="/sos" className="mt-5 flex min-h-14 items-center gap-3 rounded-2xl border border-red-100 bg-white/75 px-4 text-left shadow-sm">
          <HeartHandshake className="h-5 w-5 shrink-0 text-red-500" aria-hidden="true" />
          <span><strong className="block text-sm text-brown-800">{es ? "Manual S.O.S. gratuito" : "Manual S.O.S. gratuito"}</strong><span className="text-xs text-brown-700/55">{es ? "Accede sin iniciar sesión en situaciones de urgencia." : "Acesse sem login em situações de urgência."}</span></span>
        </Link>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-brown-700/50"><ShieldCheck className="h-4 w-4" />{es ? "Acceso protegido y vinculado a la compra" : "Acesso protegido e vinculado à compra"}</div>
      </div>
    </main>
  );
}
