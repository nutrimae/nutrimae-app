import { Document, Page, Text, View } from "@react-pdf/renderer";
import { pdfStyles } from "./theme";
import { PdfFooter } from "./PdfFooter";
import { ALLERGEN_CHECKLIST, ALLERGEN_LABEL } from "@/lib/allergen-checklist";

export function ChecklistAlergenicosPdf() {
  return (
    <Document title="Checklist de Alergênicos — NutriMäe">
      <Page size="A4" style={pdfStyles.page}>
        <Text style={pdfStyles.brand}>NutriMäe</Text>
        <Text style={pdfStyles.h1}>Checklist de Alergênicos</Text>
        <Text style={pdfStyles.subtitle}>
          Os 14 alérgenos de declaração obrigatória pela ANVISA (RDC 26/2015), para você marcar
          o que o pediatra pediu para observar ou evitar.
        </Text>

        {ALLERGEN_CHECKLIST.map((item) => (
          <View key={item.id} style={pdfStyles.card} wrap={false}>
            <View style={pdfStyles.row}>
              <Text style={{ fontSize: 12 }}>☐</Text>
              <View style={{ flex: 1 }}>
                <Text style={pdfStyles.h3}>{ALLERGEN_LABEL[item.id]}</Text>
                <Text style={pdfStyles.body}>{item.description}</Text>
              </View>
            </View>
          </View>
        ))}

        <PdfFooter />
      </Page>
    </Document>
  );
}
