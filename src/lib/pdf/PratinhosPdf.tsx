import { Document, Page, Text, View } from "@react-pdf/renderer";
import { pdfStyles } from "./theme";
import { PdfFooter } from "./PdfFooter";
import { PRATINHOS } from "@/lib/pratinhos";
import { AGE_BAND_LABEL, type AgeBand } from "@/lib/menu";

const BANDS: AgeBand[] = ["6-7", "8-9", "10-12", "13-24"];

export function PratinhosPdf() {
  return (
    <Document title="Pratinhos Divertidos — NutriMãe">
      <Page size="A4" style={pdfStyles.page}>
        <Text style={pdfStyles.brand}>NutriMãe</Text>
        <Text style={pdfStyles.h1}>Pratinhos Divertidos</Text>
        <Text style={pdfStyles.subtitle}>
          30 ideias de apresentação colorida para deixar a refeição mais convidativa.
        </Text>

        {BANDS.map((band, i) => (
          <View key={band} break={i > 0}>
            <Text style={pdfStyles.h2}>{AGE_BAND_LABEL[band]}</Text>
            {PRATINHOS.filter((p) => p.ageBand === band).map((p) => (
              <View key={p.id} style={pdfStyles.card} wrap={false}>
                <Text style={pdfStyles.h3}>
                  {p.title} · {p.colors.join(", ")} · {p.prepTimeMinutes} min
                </Text>
                <Text style={pdfStyles.body}>Ingredientes: {p.ingredients.join("; ")}</Text>
                <Text style={pdfStyles.body}>Preparo: {p.steps.join(" ")}</Text>
              </View>
            ))}
          </View>
        ))}

        <PdfFooter />
      </Page>
    </Document>
  );
}
