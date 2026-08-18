import { ModuleGate } from "@/components/module-gate";
import { ProtocoloIntestinoContent } from "./protocolo-intestino-content";

export default function ProtocoloIntestinoPage() {
  return (
    <ModuleGate productKey="protocolo_intestino_livre">
      <ProtocoloIntestinoContent />
    </ModuleGate>
  );
}
