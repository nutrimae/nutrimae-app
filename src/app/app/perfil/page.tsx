"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, ExternalLink, ShieldCheck, TrendingUp, Crown } from "lucide-react";
import { useActiveBaby } from "@/components/active-baby-context";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BackButton } from "@/components/back-button";
import { useVipAccess } from "@/lib/use-vip-access";
import type { BabyGender } from "@/lib/types";

export default function PerfilPage() {
  const router = useRouter();
  const { activeBaby, updateBaby } = useActiveBaby();
  const supabase = useMemo(() => createClient(), []);
  const vipAccess = useVipAccess();

  const [email, setEmail] = useState("");
  const [babyName, setBabyName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState<BabyGender>("female");
  const [savingBaby, setSavingBaby] = useState(false);
  const [babySaved, setBabySaved] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? "");
    });
  }, [supabase]);

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

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  const portalUrl = process.env.NEXT_PUBLIC_CARTPANDA_PORTAL_URL;

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
        <h2 className="mb-3 font-heading text-lg font-bold text-brown-800">Dados da conta</h2>
        <div className="flex flex-col gap-3 rounded-2xl bg-white/80 p-4 shadow-sm shadow-brown-900/5">
          <div>
            <p className="text-sm font-semibold text-brown-700">E-mail</p>
            <p className="text-brown-800">{email}</p>
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
        {portalUrl ? (
          <a href={portalUrl} target="_blank" rel="noreferrer">
            <Button variant="secondary" className="flex items-center justify-center gap-2">
              <ExternalLink className="h-5 w-5" strokeWidth={2} />
              Gerenciar assinatura
            </Button>
          </a>
        ) : (
          <p className="rounded-2xl bg-sage-50 p-4 text-sm text-brown-700">
            O portal de gerenciamento de assinatura ainda não foi configurado.
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
        className="flex items-center gap-2 text-sm font-semibold text-brown-700/70"
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
