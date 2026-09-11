import { Document, Page, Text, View } from "@react-pdf/renderer";
import { pdfStyles } from "./theme";
import { PdfFooter } from "./PdfFooter";
import { getRecipes, getRecipeMealTypeLabel } from "@/lib/recipes";
import { getAgeBandLabel, type AgeBand } from "@/lib/menu";
import type { Locale } from "@/lib/i18n/locale";

const BANDS: AgeBand[] = ["6-7", "8-9", "10-12", "13-24"];

export function ReceitasPdf({ locale = "es" }: { locale?: Locale }) {
  const es = locale === "es";
  const recipes = getRecipes(locale);
  const mealTypeLabel = getRecipeMealTypeLabel(locale);
  const ageBandLabel = getAgeBandLabel(locale);

  return (
    <Document title={es ? "Recetas Completas — NutriMama" : "Receitas Completas — NutriMama"}>
      <Page size="A4" style={pdfStyles.page}>
        <Text style={pdfStyles.brand}>NutriMama</Text>
        <Text style={pdfStyles.h1}>{es ? "Recetas Completas" : "Receitas Completas"}</Text>
        <Text style={pdfStyles.subtitle}>
          {es
            ? `${recipes.length} recetas de los 6 a los 24 meses, con ingredientes y modo de preparación.`
            : `${recipes.length} receitas para os 6 aos 24 meses, com ingredientes e modo de preparo.`}
        </Text>

        {BANDS.map((band, i) => (
          <View key={band} break={i > 0}>
            <Text style={pdfStyles.h2}>{ageBandLabel[band]}</Text>
            {recipes.filter((r) => r.ageBand === band).map((r) => (
              <View key={r.id} style={pdfStyles.card} wrap={false}>
                <Text style={pdfStyles.h3}>
                  {r.title} · {mealTypeLabel[r.mealType]} · {r.prepTimeMinutes} min
                </Text>
                <Text style={pdfStyles.body}>{es ? "Ingredientes" : "Ingredientes"}: {r.ingredients.join("; ")}</Text>
                <Text style={pdfStyles.body}>{es ? "Preparación" : "Preparo"}: {r.steps.join(" ")}</Text>
              </View>
            ))}
          </View>
        ))}

        <PdfFooter />
      </Page>
    </Document>
  );
}
