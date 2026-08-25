import Image from "next/image";

const SIZE_PX = { sm: 40, md: 44, lg: 56, xl: 96 } as const;

interface IconAvatar3DProps {
  /** Caminho em /public/images/illustrations/*.webp — sempre um render 3D próprio, nunca ícone de biblioteca. */
  src: string;
  size?: keyof typeof SIZE_PX;
  className?: string;
}

/**
 * Ícone autoral em render 3D fosco-brilhante (coração/folha/estrela/gota) —
 * ver DESIGN.md "Ícones Autorais 3D (Signature Component)". Nunca usar
 * abaixo de 40px: a textura do render vira ruído em tamanhos menores —
 * prefira um ícone de linha (lucide) nesse caso.
 */
export function IconAvatar3D({ src, size = "md", className = "" }: IconAvatar3DProps) {
  const px = SIZE_PX[size];
  return (
    <Image
      src={src}
      alt=""
      width={px}
      height={px}
      className={`shrink-0 rounded-full object-cover ${className}`}
      style={{ width: px, height: px }}
    />
  );
}
