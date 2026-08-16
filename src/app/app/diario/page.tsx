import { ModuleGate } from "@/components/module-gate";
import { DiarioContent } from "./diario-content";

export default function DiarioPage() {
  return (
    <ModuleGate productKey="diario_bebe">
      <DiarioContent />
    </ModuleGate>
  );
}
