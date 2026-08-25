import type { SupabaseClient } from "@supabase/supabase-js";
import { createEvolutionClient } from "@/lib/nutribot/evolutionClient";
import { sanitizePhoneNumber } from "@/lib/utils";
import type { AdminMetrics } from "./metrics";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AdminClient = SupabaseClient<any>;

interface Threshold {
  metric_key: string;
  label: string;
  comparison: "above" | "below";
  threshold_value: number;
  enabled: boolean;
}

/** Extrai o valor atual de cada métrica configurável — única lista que
 * precisa crescer quando um novo limite de alerta for adicionado. */
function currentValueFor(metricKey: string, metrics: AdminMetrics): number | null {
  switch (metricKey) {
    case "refund_rate_percent":
      return metrics.refundRatePercent;
    case "bump_adoption_rate":
      return metrics.bumpAdoptionRatePercent;
    case "oto1_adoption_rate":
      return metrics.oto1AdoptionRatePercent;
    case "oto2_adoption_rate":
      return metrics.oto2AdoptionRatePercent;
    case "cancellations":
      return metrics.cancellations.today;
    case "pending_payments_count":
      return metrics.pendingPayments.count;
    default:
      return null;
  }
}

function isCrossed(threshold: Threshold, value: number): boolean {
  return threshold.comparison === "above" ? value > threshold.threshold_value : value < threshold.threshold_value;
}

/**
 * Confere os limites configurados contra as métricas recém-calculadas e
 * dispara aviso por WhatsApp (mesmo canal/instância do NutriBot) pros
 * números marcados como admin em "profiles". No máximo um aviso por
 * métrica por dia (ver unique em admin_alert_log) — cruzar o limite de
 * manhã não spamma de novo a cada refresh do resto do dia.
 */
export async function checkThresholdsAndAlert(admin: AdminClient, metrics: AdminMetrics): Promise<{ alerted: string[] }> {
  const { data: thresholds } = await admin.from("admin_alert_thresholds").select("*").eq("enabled", true);
  const alerted: string[] = [];
  if (!thresholds?.length) return { alerted };

  const crossed: { metricKey: string; message: string }[] = [];
  for (const threshold of thresholds as Threshold[]) {
    const value = currentValueFor(threshold.metric_key, metrics);
    if (value === null || !isCrossed(threshold, value)) continue;
    const direction = threshold.comparison === "above" ? "acima de" : "abaixo de";
    crossed.push({
      metricKey: threshold.metric_key,
      message: `⚠️ NutriMãe admin: "${threshold.label}" está em ${value} — ${direction} o limite configurado (${threshold.threshold_value}).`,
    });
  }
  if (crossed.length === 0) return { alerted };

  const today = new Date().toISOString().slice(0, 10);
  const evolutionApiUrl = process.env.EVOLUTION_API_URL;
  const evolutionApiKey = process.env.EVOLUTION_API_KEY;
  const evolutionInstanceName = process.env.EVOLUTION_INSTANCE_NAME;
  const canSendWhatsApp = Boolean(evolutionApiUrl && evolutionApiKey && evolutionInstanceName);

  const { data: admins } = await admin.from("profiles").select("phone_number").eq("is_admin", true);
  const adminPhones = (admins ?? [])
    .map((p: { phone_number: string | null }) => sanitizePhoneNumber(p.phone_number ?? undefined))
    .filter((p): p is string => Boolean(p));

  const evolution = canSendWhatsApp
    ? createEvolutionClient({ baseUrl: evolutionApiUrl!, instanceName: evolutionInstanceName!, apiKey: evolutionApiKey! })
    : null;

  for (const alert of crossed) {
    // Reivindica o alerta do dia ANTES de enviar — se já existe, outro
    // refresh já avisou hoje, não manda de novo.
    const { error: claimError } = await admin
      .from("admin_alert_log")
      .insert({ metric_key: alert.metricKey, alert_date: today, message: alert.message });
    if (claimError) continue; // unique (metric_key, alert_date) já violado — já avisado hoje

    if (evolution && adminPhones.length > 0) {
      for (const phone of adminPhones) {
        try {
          await evolution.sendText({ to: phone, message: alert.message });
        } catch (err) {
          console.error("[admin-alerts] falha ao enviar WhatsApp", alert.metricKey, err);
        }
      }
    } else {
      console.warn("[admin-alerts] limite cruzado mas Evolution API/telefone de admin não configurado:", alert.message);
    }
    alerted.push(alert.metricKey);
  }

  return { alerted };
}
