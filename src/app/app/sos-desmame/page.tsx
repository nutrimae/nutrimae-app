import { ModuleGate } from "@/components/module-gate";
import { SosDesmameContent } from "./sos-desmame-content";

export default function SosDesmamePage() {
  return (
    <ModuleGate productKey="sos_desmame_noturno">
      <SosDesmameContent />
    </ModuleGate>
  );
}
