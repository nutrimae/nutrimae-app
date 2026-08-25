"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getEntitlementStatus } from "@/lib/entitlements";

export interface VipAccessState {
  /** null = ainda carregando. */
  loading: boolean;
  /** `has_vip_access`: true se a usuária comprou pelo menos um dos três módulos VIP. */
  hasAny: boolean;
  hasWeaning: boolean;
  hasIntestino: boolean;
  hasBatchCooking: boolean;
}

const LOADING_STATE: VipAccessState = { loading: true, hasAny: false, hasWeaning: false, hasIntestino: false, hasBatchCooking: false };

/**
 * `has_vip_access`: destrava o botão VIP na navegação principal. É `true`
 * assim que a usuária tem QUALQUER UM dos três módulos da Área VIP ativo
 * (SOS Desmame Noturno, Protocolo Intestino Livre e/ou Batch Cooking &
 * Congelamento) — cada sub-tela ainda faz seu próprio gate individual (ver
 * ModuleGate), então quem comprou só um dos três vê a Área VIP, mas o card
 * dos outros dois mostra o paywall deles.
 */
export function useVipAccess(): VipAccessState {
  const [state, setState] = useState<VipAccessState>(LOADING_STATE);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();

    async function check() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        if (!cancelled) setState({ loading: false, hasAny: false, hasWeaning: false, hasIntestino: false, hasBatchCooking: false });
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profile?.is_admin) {
        if (!cancelled) setState({ loading: false, hasAny: true, hasWeaning: true, hasIntestino: true, hasBatchCooking: true });
        return;
      }

      const [weaningStatus, intestinoStatus, batchCookingStatus] = await Promise.all([
        getEntitlementStatus(supabase, user.id, "sos_desmame_noturno"),
        getEntitlementStatus(supabase, user.id, "protocolo_intestino_livre"),
        getEntitlementStatus(supabase, user.id, "batch_cooking"),
      ]);

      const hasWeaning = weaningStatus === "active";
      const hasIntestino = intestinoStatus === "active";
      const hasBatchCooking = batchCookingStatus === "active";
      if (!cancelled) {
        setState({ loading: false, hasAny: hasWeaning || hasIntestino || hasBatchCooking, hasWeaning, hasIntestino, hasBatchCooking });
      }
    }

    check();
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
