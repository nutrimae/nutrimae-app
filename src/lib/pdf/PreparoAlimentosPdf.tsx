import { Document, Page, Text, View } from "@react-pdf/renderer";
import { pdfStyles } from "./theme";
import { PdfFooter } from "./PdfFooter";
import { FOOD_PREP_GUIDES, FOOD_PREP_GUIDES_ES } from "@/lib/food-prep";
import { getFoods } from "@/lib/foods";
import type { Locale } from "@/lib/i18n/locale";

export function PreparoAlimentosPdf({ locale = "es" }: { locale?: Locale }) {
  const es = locale === "es";
  const guides = es ? FOOD_PREP_GUIDES_ES : FOOD_PREP_GUIDES;
  const foods = getFoods(locale);

  return (
    <Document title={es ? "Modo de Preparación de los Alimentos — NutriMama" : "Modo de Preparo dos Alimentos — NutriMama"}>
      <Page size="A4" style={pdfStyles.page}>
        <Text style={pdfStyles.brand}>NutriMama</Text>
        <Text style={pdfStyles.h1}>{es ? "Modo de Preparación de los Alimentos" : "Modo de Preparo dos Alimentos"}</Text>
        <Text style={pdfStyles.subtitle}>
          {es
            ? "Paso a paso detallado, con la razón de seguridad de cada etapa, además de congelación y descongelación."
            : "Passo a passo detalhado, com a razão de segurança de cada etapa, além de congelamento e descongelamento."}
        </Text>

        {guides.map((guide) => {
          const food = foods.find((f) => f.id === guide.foodId);
          return (
            <View key={guide.foodId} style={pdfStyles.card} wrap={false}>
              <Text style={pdfStyles.h3}>
                {food?.emoji} {food?.name ?? guide.foodId}
              </Text>
              {guide.steps.map((step, i) => (
                <Text key={step.action} style={pdfStyles.body}>
                  {i + 1}. {step.action} ({step.why})
                </Text>
              ))}
              <Text style={pdfStyles.small}>{es ? "Congelación" : "Congelamento"}: {guide.freezing}</Text>
              <Text style={pdfStyles.small}>{es ? "Descongelación" : "Descongelamento"}: {guide.thawing}</Text>
            </View>
          );
        })}

        <PdfFooter />
      </Page>
    </Document>
  );
}
