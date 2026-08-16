import { Document, Page, Text, View } from "@react-pdf/renderer";
import { pdfStyles } from "./theme";
import { PdfFooter } from "./PdfFooter";
import {
  TEETHER_CATEGORY_LABEL,
  TEETHERS,
  TEETHING_NORMAL_SIGNS,
  TEETHING_WARNING_SIGNS,
} from "@/lib/teethers";

export function MordedoresPdf() {
  return (
    <Document title="Mordedores Naturais — NutriMäe">
      <Page size="A4" style={pdfStyles.page}>
        <Text style={pdfStyles.brand}>NutriMäe</Text>
        <Text style={pdfStyles.h1}>Mordedores Naturais</Text>
        <Text style={pdfStyles.subtitle}>
          15 opções naturais e seguras para aliviar o desconforto da erupção dos dentinhos.
        </Text>

        {TEETHERS.map((t) => (
          <View key={t.id} style={pdfStyles.card} wrap={false}>
            <Text style={pdfStyles.h3}>
              {t.name} — {TEETHER_CATEGORY_LABEL[t.category]} · a partir de {t.minAgeMonths}m
            </Text>
            <Text style={pdfStyles.body}>Temperatura: {t.temperature}</Text>
            <Text style={pdfStyles.body}>Preparo: {t.prep}</Text>
            <Text style={pdfStyles.body}>Duração máxima: {t.maxDurationMinutes} min por vez</Text>
            <Text style={pdfStyles.body}>Segurança: {t.safety}</Text>
          </View>
        ))}

        <View break>
          <Text style={pdfStyles.h2}>Sinais normais de teething</Text>
          {TEETHING_NORMAL_SIGNS.map((sign) => (
            <View key={sign} style={pdfStyles.bullet} wrap={false}>
              <Text style={pdfStyles.bulletDot}>•</Text>
              <Text style={pdfStyles.bulletText}>{sign}</Text>
            </View>
          ))}

          <Text style={pdfStyles.h2}>Quando NÃO é só teething</Text>
          {TEETHING_WARNING_SIGNS.map((sign) => (
            <View key={sign} style={pdfStyles.cardWarning} wrap={false}>
              <Text style={pdfStyles.body}>{sign}</Text>
            </View>
          ))}
        </View>

        <PdfFooter />
      </Page>
    </Document>
  );
}
