import { ModuleGate } from "@/components/module-gate";
import { CalculadoraFraldasContent } from "./calculadora-content";

export default function CalculadoraFraldasPage() {
  return (
    <ModuleGate productKey="calculadora_fraldas">
      <CalculadoraFraldasContent />
    </ModuleGate>
  );
}
