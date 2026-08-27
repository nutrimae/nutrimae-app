import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { login } from "./actions";

export const dynamic = "force-dynamic";

const ERROR_MESSAGES: Record<string, string> = {
  "1": "Senha incorreta.",
  limite: "Muitas tentativas. Aguarde alguns minutos e tente de novo.",
  config: "Painel sem senha configurada no servidor (TRACKING_DASHBOARD_PASSWORD).",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  if (await isAuthenticated()) {
    redirect("/");
  }

  const sp = await searchParams;
  const erro = Array.isArray(sp.erro) ? sp.erro[0] : sp.erro;
  const errorMessage = erro ? (ERROR_MESSAGES[erro] ?? "Não foi possível entrar.") : null;

  return (
    <main className="login-wrap">
      <form className="login-card" action={login}>
        <h1>NutriMãe Track</h1>
        <p className="muted">Painel de tracking e atribuição — acesso restrito.</p>
        {errorMessage ? <p className="login-error">{errorMessage}</p> : null}
        <label htmlFor="password">Senha</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required autoFocus />
        <button type="submit">Entrar</button>
      </form>
    </main>
  );
}
