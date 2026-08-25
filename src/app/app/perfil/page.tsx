"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, ShieldCheck, TrendingUp, Crown, MapPin } from "lucide-react";
import { useActiveBaby } from "@/components/active-baby-context";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BackButton } from "@/components/back-button";
import { useVipAccess } from "@/lib/use-vip-access";
import type { BabyGender } from "@/lib/types";
import { REGIONS, type Region } from "@/lib/regions";
import { useRegion } from "@/lib/use-region";

export default function PerfilPage() {
  const router = useRouter();
  const { activeBaby, updateBaby } = useActiveBaby();
  const supabase = useMemo(() => createClient(), []);
  const vipAccess = useVipAccess();
  const { region, setRegion } = useRegion();

  const [email, setEmail] = useState("");
  const [creditoExpansaoCentavos, setCreditoExpansaoCentavos] = useState(0);
  const [subscription, setSubscription] = useState<{
    id: string;
    status: string;
    nextBillingAt: string | null;
    offerName: string;
  } | null>(null);
  const [cancelingSubscription, setCancelingSubscription] = useState(false);
  const [cancelRequested, setCancelRequested] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [savingPhone, setSavingPhone] = useState(false);
  const [phoneSaved, setPhoneSaved] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [babyName, setBabyName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState<BabyGender>("female");
  const [savingBaby, setSavingBaby] = useState(false);
  const [babySaved, setBabySaved] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      setEmail(data.user?.email ?? "");
      if (!data.user) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("credito_expansao_centavos, phone_number")
        .eq("user_id", data.user.id)
        .maybeSingle();
      setCreditoExpansaoCentavos(profile?.credito_expansao_centavos ?? 0);
      setPhoneNumber(profile?.phone_number ?? "");

      const { data: sub } = await supabase
        .from("subscriptions")
        .select("id, status, next_billing_at, offers(name)")
        .in("status", ["active", "past_due"])
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (sub) {
        const offerName = (sub.offers as unknown as { name?: string } | null)?.name ?? "Assinatura";
        setSubscription({ id: sub.id, status: sub.status, nextBillingAt: sub.next_billing_at, offerName });
      }
    });
  }, [supabase]);

  async function handleCancelSubscription() {
    if (!subscription) return;
    setCancelingSubscription(true);
    setCancelError(null);
    const res = await fetch("/api/account/subscription/cancel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscriptionId: subscription.id }),
    });
    setCancelingSubscription(false);
    if (!res.ok) {
      setCancelError("Não conseguimos cancelar agora. Tente de novo em instantes ou fale com o suporte.");
      return;
    }
    setConfirmingCancel(false);
    setCancelRequested(true);
  }

  useEffect(() => {
    if (activeBaby) {
      setBabyName(activeBaby.name);
      setBirthDate(activeBaby.birth_date);
      setGender(activeBaby.gender ?? "female");
    }
  }, [activeBaby]);

  async function handleSaveBaby() {
    if (!activeBaby || !babyName.trim() || !birthDate) return;
    setSavingBaby(true);
    const { error } = await supabase
      .from("babies")
      .update({ name: babyName.trim(), birth_date: birthDate, gender })
      .eq("id", activeBaby.id);
    setSavingBaby(false);
    if (!error) {
      updateBaby(activeBaby.id, { name: babyName.trim(), birth_date: birthDate, gender });
      setBabySaved(true);
      setTimeout(() => setBabySaved(false), 2500);
    }
  }

  async function handleSavePassword() {
    if (newPassword.length < 6) return;
    setSavingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSavingPassword(false);
    if (!error) {
      setNewPassword("");
      setPasswordSaved(true);
      setTimeout(() => setPasswordSaved(false), 2500);
    }
  }

  async function handleSavePhone() {
    setSavingPhone(true);
    setPhoneError(null);
    const res = await fetch("/api/profile/phone", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone_number: phoneNumber.trim() }),
    });
    const data = await res.json().catch(() => ({}));
    setSavingPhone(false);
    if (!res.ok) {
      setPhoneError(data.message ?? "Não foi possível salvar o telefone.");
      return;
    }
    setPhoneNumber(data.phone_number ?? "");
    setPhoneSaved(true);
    setTimeout(() => setPhoneSaved(false), 2500);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <main className="mx-auto flex w-full max-w-sm flex-col gap-6 px-4 py-6">
      <BackButton />

      <h1 className="font-heading text-2xl font-bold text-brown-800">Perfil e configurações</h1>

      {activeBaby && (
        <Link
          href="/app/desenvolvimento"
          className="flex items-center gap-2 rounded-2xl bg-primary-100 p-4 text-primary-600"
        >
          <TrendingUp className="h-5 w-5 shrink-0" strokeWidth={2} />
          <span className="font-semibold">Ver marcos do desenvolvimento</span>
        </Link>
      )}

      {activeBaby && (
        <div>
          <h2 className="mb-3 font-heading text-lg font-bold text-brown-800">Dados do bebê</h2>
          <div className="flex flex-col gap-3 rounded-2xl bg-white/80 p-4 shadow-sm shadow-brown-900/5">
            <Input
              id="baby-name-edit"
              label="Nome"
              value={babyName}
              onChange={(e) => setBabyName(e.target.value)}
            />
            <Input
              id="baby-birthdate-edit"
              type="date"
              label="Data de nascimento"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
            />
            <div>
              <p className="mb-2 text-base font-semibold text-brown-700">Menino ou menina?</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setGender("female")}
                  className={`min-h-12 flex-1 rounded-2xl text-sm font-semibold transition-colors ${
                    gender === "female" ? "bg-pink-400 text-white" : "bg-pink-50 text-brown-700"
                  }`}
                >
                  👧 Menina
                </button>
                <button
                  type="button"
                  onClick={() => setGender("male")}
                  className={`min-h-12 flex-1 rounded-2xl text-sm font-semibold transition-colors ${
                    gender === "male" ? "bg-sky-400 text-white" : "bg-sky-50 text-brown-700"
                  }`}
                >
                  👦 Menino
                </button>
              </div>
            </div>
            <Button onClick={handleSaveBaby} disabled={savingBaby}>
              {savingBaby ? "Salvando..." : babySaved ? "Salvo!" : "Salvar dados do bebê"}
            </Button>
          </div>
        </div>
      )}

      <div>
        <h2 className="mb-3 font-heading text-lg font-bold text-brown-800">Sua região</h2>
        <div className="flex flex-col gap-2 rounded-2xl bg-white/80 p-4 shadow-sm shadow-brown-900/5">
          <p className="text-sm text-brown-700/90">
            Usamos para priorizar alimentos e receitas da sua região no cardápio.
          </p>
          <div className="mt-1 flex flex-wrap gap-2">
            {REGIONS.map((r) => (
              <button
                key={r.key}
                type="button"
                onClick={() => setRegion(region === r.key ? null : r.key)}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
                  region === r.key
                    ? "bg-primary-500 text-white"
                    : "bg-sage-50 text-brown-700"
                }`}
              >
                <span>{r.emoji}</span> {r.label}
              </button>
            ))}
          </div>
          {region && (
            <button
              type="button"
              onClick={() => setRegion(null)}
              className="mt-1 text-left text-sm font-medium text-brown-700/82"
            >
              Limpar seleção
            </button>
          )}
        </div>
      </div>

      <div>
        <h2 className="mb-3 font-heading text-lg font-bold text-brown-800">Dados da conta</h2>
        <div className="flex flex-col gap-3 rounded-2xl bg-white/80 p-4 shadow-sm shadow-brown-900/5">
          <div>
            <p className="text-sm font-semibold text-brown-700">E-mail</p>
            <p className="text-brown-800">{email}</p>
          </div>
          <div>
            <Input
              id="phone-number"
              type="tel"
              label="WhatsApp"
              placeholder="DDD + número, ex.: 11987654321"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
            <p className="mt-1 text-xs text-brown-700/86">
              Usado pro NutriBot e, se sua conta for admin, pra receber os alertas do painel do negócio.
            </p>
            {phoneError && <p className="mt-1 text-xs font-semibold text-red-600">{phoneError}</p>}
            <Button onClick={handleSavePhone} disabled={savingPhone} className="mt-2 w-full">
              {savingPhone ? "Salvando..." : phoneSaved ? "Salvo!" : "Salvar WhatsApp"}
            </Button>
          </div>
          <Input
            id="new-password"
            type="password"
            label="Nova senha"
            placeholder="Deixe em branco para não alterar"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            minLength={6}
          />
          <Button onClick={handleSavePassword} disabled={savingPassword || newPassword.length < 6}>
            {savingPassword ? "Salvando..." : passwordSaved ? "Senha atualizada!" : "Atualizar senha"}
          </Button>
        </div>
      </div>

      <div>
        <h2 className="mb-3 font-heading text-lg font-bold text-brown-800">Assinatura</h2>
        {subscription ? (
          <div className="flex flex-col gap-3 rounded-2xl bg-sage-50 p-4 text-sm text-brown-700">
            {cancelRequested ? (
              <p>
                Cancelamento enviado! Seu acesso continua ativo até o fim do ciclo já pago
                {subscription.nextBillingAt
                  ? ` (${new Date(subscription.nextBillingAt).toLocaleDateString("pt-BR")})`
                  : ""}
                , e não haverá nova cobrança depois disso.
              </p>
            ) : (
              <>
                <p>
                  Seu plano atual é o <strong className="text-brown-800">{subscription.offerName}</strong>, com
                  cobrança recorrente.
                  {subscription.nextBillingAt && (
                    <> Próxima cobrança em {new Date(subscription.nextBillingAt).toLocaleDateString("pt-BR")}.</>
                  )}
                </p>
                {confirmingCancel ? (
                  <div className="flex flex-col gap-2">
                    <p className="font-semibold text-brown-800">
                      Cancelar mesmo? Seu acesso continua até o fim do ciclo já pago, sem multa.
                    </p>
                    {cancelError && <p className="text-red-600">{cancelError}</p>}
                    <div className="flex gap-2">
                      <Button variant="ghost" onClick={() => setConfirmingCancel(false)} className="flex-1">
                        Voltar
                      </Button>
                      <Button onClick={handleCancelSubscription} disabled={cancelingSubscription} className="flex-1">
                        {cancelingSubscription ? "Cancelando..." : "Confirmar cancelamento"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button variant="ghost" onClick={() => setConfirmingCancel(true)}>
                    Cancelar assinatura
                  </Button>
                )}
              </>
            )}
          </div>
        ) : (
          <p className="rounded-2xl bg-sage-50 p-4 text-sm text-brown-700">
            Seu plano atual é pagamento único — sem cobrança recorrente pra gerenciar. Dúvidas? Fale com o suporte.
          </p>
        )}
        {creditoExpansaoCentavos > 0 && (
          <p className="mt-2 rounded-2xl bg-amber-50 p-4 text-sm text-brown-700">
            Você tem{" "}
            <strong className="text-brown-800">
              {(creditoExpansaoCentavos / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </strong>{" "}
            em créditos de expansões compradas — guardados pra quando lançarmos novidades de upgrade.
          </p>
        )}
      </div>

      {!vipAccess.loading && !vipAccess.hasAny && (
        <Link
          href="/app/vip"
          className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-[#1a1025] to-[#241633] p-4 transition-transform active:scale-[0.98]"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-400/20">
            <Crown className="h-4 w-4 text-amber-300" strokeWidth={1.75} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white">Área VIP</p>
            <p className="text-xs text-white/50">SOS Desmame Noturno e Protocolo Intestino Livre</p>
          </div>
        </Link>
      )}

      <Link
        href="/politica-privacidade"
        className="flex items-center gap-2 text-sm font-semibold text-brown-700/90"
      >
        <ShieldCheck className="h-4 w-4" strokeWidth={2} />
        Política de Privacidade
      </Link>

      <Button variant="ghost" onClick={handleSignOut} className="flex items-center justify-center gap-2">
        <LogOut className="h-5 w-5" strokeWidth={2} />
        Sair
      </Button>
    </main>
  );
}
