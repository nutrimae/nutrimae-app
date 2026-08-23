import { ModuleGate } from "@/components/module-gate";
import { BatchCookingContent } from "./batch-cooking-content";

export default function BatchCookingPage() {
  return (
    <ModuleGate productKey="batch_cooking">
      <BatchCookingContent />
    </ModuleGate>
  );
}
