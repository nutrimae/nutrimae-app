export function ageInMonths(birthDate: string, today: Date = new Date()): number {
  const birth = new Date(birthDate);
  let months =
    (today.getFullYear() - birth.getFullYear()) * 12 +
    (today.getMonth() - birth.getMonth());
  if (today.getDate() < birth.getDate()) months -= 1;
  return Math.max(0, months);
}

export function formatAge(birthDate: string, locale: "pt-BR" | "es" = "pt-BR"): string {
  const months = ageInMonths(birthDate);
  if (locale === "es") {
    if (months < 1) return "recién nacido";
    if (months < 24) return `${months} ${months === 1 ? "mes" : "meses"}`;
    const years = Math.floor(months / 12);
    const remMonths = months % 12;
    if (remMonths === 0) return `${years} ${years === 1 ? "año" : "años"}`;
    return `${years}a ${remMonths}m`;
  }
  if (months < 1) return "recém-nascido";
  if (months < 24) return `${months} ${months === 1 ? "mês" : "meses"}`;
  const years = Math.floor(months / 12);
  const remMonths = months % 12;
  if (remMonths === 0) return `${years} ${years === 1 ? "ano" : "anos"}`;
  return `${years}a ${remMonths}m`;
}
