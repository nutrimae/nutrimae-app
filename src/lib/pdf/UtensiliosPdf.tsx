import { Document, Page, Text, View } from "@react-pdf/renderer";
import { pdfStyles } from "./theme";
import { PdfFooter } from "./PdfFooter";
import { getUtensilCategoryLabel, getUtensils, type UtensilCategory } from "@/lib/utensils";
import type { Locale } from "@/lib/i18n/locale";

const CATEGORIES: UtensilCategory[] = ["hora-de-comer", "preparo", "armazenamento", "seguranca"];

export function UtensiliosPdf({ locale = "es" }: { locale?: Locale }) {
  const es = locale === "es";
  const categoryLabel = getUtensilCategoryLabel(locale);
  const utensils = getUtensils(locale);

  return (
    <Document title={es ? "Utensilios Recomendados — NutriMama" : "Utensílios Recomendados — NutriMama"}>
      <Page size="A4" style={pdfStyles.page}>
        <Text style={pdfStyles.brand}>NutriMama</Text>
        <Text style={pdfStyles.h1}>{es ? "Utensilios Recomendados" : "Utensílios Recomendados"}</Text>
        <Text style={pdfStyles.subtitle}>
          {es
            ? "Qué ayuda en la rutina de la introducción alimentaria y qué buscar al comprar."
            : "O que ajuda na rotina da introdução alimentar e o que procurar na hora de comprar."}
        </Text>

        {CATEGORIES.map((cat) => (
          <View key={cat}>
            <Text style={pdfStyles.h2}>{categoryLabel[cat]}</Text>
            {utensils.filter((u) => u.category === cat).map((u) => (
              <View key={u.id} style={pdfStyles.card} wrap={false}>
                <Text style={pdfStyles.h3}>
                  {u.name} {u.essential ? (es ? "★ esencial" : "★ essencial") : ""}
                </Text>
                <Text style={pdfStyles.body}>{u.why}</Text>
                <Text style={pdfStyles.small}>{es ? "Qué buscar" : "O que procurar"}: {u.whatToLookFor}</Text>
              </View>
            ))}
          </View>
        ))}

        <PdfFooter />
      </Page>
    </Document>
  );
}
