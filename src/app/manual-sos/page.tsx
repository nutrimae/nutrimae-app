import { redirect } from "next/navigation";

/**
 * "/manual-sos" era um placeholder sem conteúdo — o Manual S.O.S. de
 * verdade sempre existiu em "/sos". Mantido como redirect (não removido)
 * porque a landing estática e materiais já publicados podem ter esse link
 * salvo/indexado.
 */
export default function ManualSosPage() {
  redirect("/sos");
}
