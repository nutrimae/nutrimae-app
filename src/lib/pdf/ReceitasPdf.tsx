import { Document, Page, Text, View } from "@react-pdf/renderer";
import { pdfStyles } from "./theme";
import { PdfFooter } from "./PdfFooter";
import { RECIPES, RECIPE_MEAL_TYPE_LABEL } from "@/lib/recipes";
import { AGE_BAND_LABEL, type AgeBand } from "@/lib/menu";

const BANDS: AgeBand[] = ["6-7", "8-9", "10-12", "13-24"];

export function ReceitasPdf() {
  return (
    <Document title="Receitas Completas — NutriMäe">
      <Page size="A4" style={pdfStyles.page}>
        <Text style={pdfStyles.brand}>NutriMäe</Text>
        <Text style={pdfStyles.h1}>Receitas Completas</Text>
        <Text style={pdfStyles.subtitle}>
          {RECIPES.length} receitas para os 6 aos 24 meses, com ingredientes e modo de preparo.
        </Text>

        {BANDS.map((band, i) => (
          <View key={band} break={i > 0}>
            <Text style={pdfStyles.h2}>{AGE_BAND_LABEL[band]}</Text>
            {RECIPES.filter((r) => r.ageBand === band).map((r) => (
              <View key={r.id} style={pdfStyles.card} wrap={false}>
                <Text style={pdfStyles.h3}>
                  {r.title} · {RECIPE_MEAL_TYPE_LABEL[r.mealType]} · {r.prepTimeMinutes} min
                </Text>
                <Text style={pdfStyles.body}>Ingredientes: {r.ingredients.join("; ")}</Text>
                <Text style={pdfStyles.body}>Preparo: {r.steps.join(" ")}</Text>
              </View>
            ))}
          </View>
        ))}

        <PdfFooter />
      </Page>
    </Document>
  );
}
