import Image from "next/image";

export function MedicalDisclaimerFooter() {
  return (
    <div className="mx-auto mt-4 flex max-w-sm flex-col items-center gap-2 px-4">
      <Image
        src="/nutrimae-logo.png"
        alt="NutriMãe"
        width={32}
        height={32}
        className="h-6 w-6 object-contain opacity-40"
      />
      <p className="text-center text-[11px] leading-relaxed text-brown-700/78">
        Este conteúdo é um apoio ao dia a dia e não substitui orientação médica ou
        nutricional profissional.
      </p>
    </div>
  );
}
