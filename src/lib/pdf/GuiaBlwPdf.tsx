import { Document, Page, Text, View } from "@react-pdf/renderer";
import { pdfStyles } from "./theme";
import { PdfFooter } from "./PdfFooter";
import { BLW_CATEGORY_LABEL, BLW_FOODS, BLW_FORBIDDEN_FOODS, BLW_GOLDEN_RULES, type BlwCategory } from "@/lib/blw";

const CATEGORIES: BlwCategory[] = ["frutas", "vegetais", "proteina", "graos", "laticinios"];

export function GuiaBlwPdf() {
  return (
    <Document title="Guia de Cortes BLW — NutriMãe">
      <Page size="A4" style={pdfStyles.page}>
        <Text style={pdfStyles.brand}>NutriMãe</Text>
        <Text style={pdfStyles.h1}>Guia de Cortes BLW</Text>
        <Text style={pdfStyles.subtitle}>
          Baby-Led Weaning: tamanho, preparo e segurança para 30 alimentos.
        </Text>

        <Text style={pdfStyles.h2}>Regras de ouro</Text>
        {BLW_GOLDEN_RULES.map((rule) => (
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
            <Text style={pdfStyles.h2}>{BLW_CATEGORY_LABEL[cat]}</Text>
            {BLW_FOODS.filter((f) => f.category === cat).map((food) => (
              <View key={food.id} style={pdfStyles.card} wrap={false}>
                <Text style={pdfStyles.h3}>
                  {food.name} — a partir de {food.minAgeMonths}m
                </Text>
                <Text style={pdfStyles.body}>Tamanho: {food.sizeGuide}</Text>
                <Text style={pdfStyles.body}>Preparo: {food.prep}</Text>
              </View>
            ))}
          </View>
        ))}

        <View break>
          <Text style={pdfStyles.h2}>Alimentos proibidos em BLW</Text>
          {BLW_FORBIDDEN_FOODS.map((item) => (
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
