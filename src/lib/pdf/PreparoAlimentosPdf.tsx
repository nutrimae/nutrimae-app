import { Document, Page, Text, View } from "@react-pdf/renderer";
import { pdfStyles } from "./theme";
import { PdfFooter } from "./PdfFooter";
import { FOOD_PREP_GUIDES } from "@/lib/food-prep";
import { FOODS } from "@/lib/foods";

export function PreparoAlimentosPdf() {
  return (
    <Document title="Modo de Preparo dos Alimentos — NutriMäe">
      <Page size="A4" style={pdfStyles.page}>
        <Text style={pdfStyles.brand}>NutriMäe</Text>
        <Text style={pdfStyles.h1}>Modo de Preparo dos Alimentos</Text>
        <Text style={pdfStyles.subtitle}>
          Passo a passo detalhado, com a razão de segurança de cada etapa, além de
          congelamento e descongelamento.
        </Text>

        {FOOD_PREP_GUIDES.map((guide) => {
          const food = FOODS.find((f) => f.id === guide.foodId);
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
              <Text style={pdfStyles.small}>Congelamento: {guide.freezing}</Text>
              <Text style={pdfStyles.small}>Descongelamento: {guide.thawing}</Text>
            </View>
          );
        })}

        <PdfFooter />
      </Page>
    </Document>
  );
}
