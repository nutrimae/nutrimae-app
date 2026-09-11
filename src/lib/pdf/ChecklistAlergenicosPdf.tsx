import { Document, Page, Text, View } from "@react-pdf/renderer";
import { pdfStyles } from "./theme";
import { PdfFooter } from "./PdfFooter";
import { getAllergenChecklistItems, getAllergenLabel } from "@/lib/allergen-checklist";
import type { Locale } from "@/lib/i18n/locale";

export function ChecklistAlergenicosPdf({ locale = "es" }: { locale?: Locale }) {
  const es = locale === "es";
  const items = getAllergenChecklistItems(locale);
  const labels = getAllergenLabel(locale);

  return (
    <Document title={es ? "Checklist de Alergénicos — NutriMama" : "Checklist de Alergênicos — NutriMama"}>
      <Page size="A4" style={pdfStyles.page}>
        <Text style={pdfStyles.brand}>NutriMama</Text>
        <Text style={pdfStyles.h1}>{es ? "Checklist de Alergénicos" : "Checklist de Alergênicos"}</Text>
        <Text style={pdfStyles.subtitle}>
          {es
            ? "Los 14 alérgenos de declaración obligatoria más comunes, para que marques lo que el pediatra pidió observar o evitar."
            : "Os 14 alérgenos de declaração obrigatória pela ANVISA (RDC 26/2015), para você marcar o que o pediatra pediu para observar ou evitar."}
        </Text>

        {items.map((item) => (
          <View key={item.id} style={pdfStyles.card} wrap={false}>
            <View style={pdfStyles.row}>
              <Text style={{ fontSize: 12 }}>☐</Text>
              <View style={{ flex: 1 }}>
                <Text style={pdfStyles.h3}>{labels[item.id]}</Text>
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
