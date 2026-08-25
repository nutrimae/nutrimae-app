"use client";

import { Input } from "@/components/ui/input";

/**
 * Endereço de cobrança do cartão — a Pagar.me exige isso pra qualquer
 * cobrança com card_token, mesmo a doc pública listando os campos como
 * opcionais (confirmado contra o sandbox real, ver
 * src/lib/payments/pagarme.ts). Só aparece quando o método é cartão.
 */
export interface BillingAddressValue {
  line1: string;
  zipCode: string;
  city: string;
  state: string;
}

export function BillingAddressFields({
  value,
  onChange,
}: {
  value: BillingAddressValue;
  onChange: (value: BillingAddressValue) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <Input
        placeholder="CEP (só números)"
        value={value.zipCode}
        onChange={(e) => onChange({ ...value, zipCode: e.target.value })}
      />
      <Input
        placeholder="Endereço (rua e número)"
        value={value.line1}
        onChange={(e) => onChange({ ...value, line1: e.target.value })}
      />
      <div className="flex gap-2">
        <Input
          className="flex-1"
          placeholder="Cidade"
          value={value.city}
          onChange={(e) => onChange({ ...value, city: e.target.value })}
        />
        <Input
          className="w-20"
          placeholder="UF"
          maxLength={2}
          value={value.state}
          onChange={(e) => onChange({ ...value, state: e.target.value.toUpperCase() })}
        />
      </div>
      <p className="text-xs text-brown-700/70">Endereço de cobrança, exigido pela operadora do cartão.</p>
    </div>
  );
}
