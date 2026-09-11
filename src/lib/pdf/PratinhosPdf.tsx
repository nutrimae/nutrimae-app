import { Document, Page, Text, View } from "@react-pdf/renderer";
import { pdfStyles } from "./theme";
import { PdfFooter } from "./PdfFooter";
import { getPratinhos } from "@/lib/pratinhos";
import { getAgeBandLabel, type AgeBand } from "@/lib/menu";
import type { Locale } from "@/lib/i18n/locale";

const BANDS: AgeBand[] = ["6-7", "8-9", "10-12", "13-24"];

export function PratinhosPdf({ locale = "es" }: { locale?: Locale }) {
  const es = locale === "es";
  const pratinhos = getPratinhos(locale);
  const ageBandLabel = getAgeBandLabel(locale);

  return (
    <Document title={es ? "Platitos Divertidos — NutriMama" : "Pratinhos Divertidos — NutriMama"}>
      <Page size="A4" style={pdfStyles.page}>
        <Text style={pdfStyles.brand}>NutriMama</Text>
        <Text style={pdfStyles.h1}>{es ? "Platitos Divertidos" : "Pratinhos Divertidos"}</Text>
        <Text style={pdfStyles.subtitle}>
          {es
            ? "30 ideas de presentación colorida para hacer la comida más atractiva."
            : "30 ideias de apresentação colorida para deixar a refeição mais convidativa."}
        </Text>

        {BANDS.map((band, i) => (
          <View key={band} break={i > 0}>
            <Text style={pdfStyles.h2}>{ageBandLabel[band]}</Text>
            {pratinhos.filter((p) => p.ageBand === band).map((p) => (
              <View key={p.id} style={pdfStyles.card} wrap={false}>
                <Text style={pdfStyles.h3}>
                  {p.title} · {p.colors.join(", ")} · {p.prepTimeMinutes} min
                </Text>
                <Text style={pdfStyles.body}>{es ? "Ingredientes" : "Ingredientes"}: {p.ingredients.join("; ")}</Text>
                <Text style={pdfStyles.body}>{es ? "Preparación" : "Preparo"}: {p.steps.join(" ")}</Text>
              </View>
            ))}
          </View>
        ))}

        <PdfFooter />
      </Page>
    </Document>
  );
}
