import { Document, Page, Text, View } from "@react-pdf/renderer";
import { pdfStyles } from "./theme";
import { PdfFooter } from "./PdfFooter";
import { UTENSIL_CATEGORY_LABEL, UTENSILS, type UtensilCategory } from "@/lib/utensils";

const CATEGORIES: UtensilCategory[] = ["hora-de-comer", "preparo", "armazenamento", "seguranca"];

export function UtensiliosPdf() {
  return (
    <Document title="Utensílios Recomendados — NutriMãe">
      <Page size="A4" style={pdfStyles.page}>
        <Text style={pdfStyles.brand}>NutriMãe</Text>
        <Text style={pdfStyles.h1}>Utensílios Recomendados</Text>
        <Text style={pdfStyles.subtitle}>
          O que ajuda na rotina da introdução alimentar e o que procurar na hora de comprar.
        </Text>

        {CATEGORIES.map((cat) => (
          <View key={cat}>
            <Text style={pdfStyles.h2}>{UTENSIL_CATEGORY_LABEL[cat]}</Text>
            {UTENSILS.filter((u) => u.category === cat).map((u) => (
              <View key={u.id} style={pdfStyles.card} wrap={false}>
                <Text style={pdfStyles.h3}>
                  {u.name} {u.essential ? "★ essencial" : ""}
                </Text>
                <Text style={pdfStyles.body}>{u.why}</Text>
                <Text style={pdfStyles.small}>O que procurar: {u.whatToLookFor}</Text>
              </View>
            ))}
          </View>
        ))}

        <PdfFooter />
      </Page>
    </Document>
  );
}
