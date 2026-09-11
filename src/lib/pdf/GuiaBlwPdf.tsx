import { Document, Page, Text, View } from "@react-pdf/renderer";
import { pdfStyles } from "./theme";
import { PdfFooter } from "./PdfFooter";
import { getBlwCategoryLabel, getBlwFoods, getBlwForbiddenFoods, getBlwGoldenRules, type BlwCategory } from "@/lib/blw";
import type { Locale } from "@/lib/i18n/locale";

const CATEGORIES: BlwCategory[] = ["frutas", "vegetais", "proteina", "graos", "laticinios"];

export function GuiaBlwPdf({ locale = "es" }: { locale?: Locale }) {
  const es = locale === "es";
  const categoryLabel = getBlwCategoryLabel(locale);
  const foods = getBlwFoods(locale);
  const forbiddenFoods = getBlwForbiddenFoods(locale);
  const goldenRules = getBlwGoldenRules(locale);

  return (
    <Document title={es ? "Guía de Cortes BLW — NutriMama" : "Guia de Cortes BLW — NutriMama"}>
      <Page size="A4" style={pdfStyles.page}>
        <Text style={pdfStyles.brand}>NutriMama</Text>
        <Text style={pdfStyles.h1}>{es ? "Guía de Cortes BLW" : "Guia de Cortes BLW"}</Text>
        <Text style={pdfStyles.subtitle}>
          {es
            ? "Baby-Led Weaning: tamaño, preparación y seguridad para 30 alimentos."
            : "Baby-Led Weaning: tamanho, preparo e segurança para 30 alimentos."}
        </Text>

        <Text style={pdfStyles.h2}>{es ? "Reglas de oro" : "Regras de ouro"}</Text>
        {goldenRules.map((rule) => (
          <View key={rule.title} style={pdfStyles.bullet} wrap={false}>
            <Text style={pdfStyles.bulletDot}>•</Text>
            <Text style={pdfStyles.bulletText}>
              <Text style={{ fontFamily: "Helvetica-Bold" }}>{rule.title}: </Text>
              {rule.text}
            </Text>
          </View>
        ))}

        {CATEGORIES.map((cat) => (
          <View key={cat} break={cat === "proteina"}>
            <Text style={pdfStyles.h2}>{categoryLabel[cat]}</Text>
            {foods.filter((f) => f.category === cat).map((food) => (
              <View key={food.id} style={pdfStyles.card} wrap={false}>
                <Text style={pdfStyles.h3}>
                  {food.name} — {es ? "desde" : "a partir de"} {food.minAgeMonths}m
                </Text>
                <Text style={pdfStyles.body}>{es ? "Tamaño" : "Tamanho"}: {food.sizeGuide}</Text>
                <Text style={pdfStyles.body}>{es ? "Preparación" : "Preparo"}: {food.prep}</Text>
              </View>
            ))}
          </View>
        ))}

        <View break>
          <Text style={pdfStyles.h2}>{es ? "Alimentos prohibidos en BLW" : "Alimentos proibidos em BLW"}</Text>
          {forbiddenFoods.map((item) => (
            <View key={item} style={pdfStyles.cardWarning} wrap={false}>
              <Text style={pdfStyles.body}>{item}</Text>
            </View>
          ))}
        </View>

        <PdfFooter />
      </Page>
    </Document>
  );
}
