import { ModuleGate } from "@/components/module-gate";
import { RotinaSonoContent } from "./rotina-sono-content";

export default function RotinaSonoPage() {
  return (
    <ModuleGate productKey="rotina_sono">
      <RotinaSonoContent />
    </ModuleGate>
  );
}
