import { VipGate } from "@/components/vip-gate";
import { VipContent } from "./vip-content";

export default function VipPage() {
  return (
    <VipGate>
      <VipContent />
    </VipGate>
  );
}
