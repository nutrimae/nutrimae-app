import { ModuleGate } from "@/components/module-gate";
import { DevelopmentTimeline } from "./development-timeline";

export default function DesenvolvimentoPage() {
  return (
    <ModuleGate productKey="diario_bebe">
      <DevelopmentTimeline />
    </ModuleGate>
  );
}
