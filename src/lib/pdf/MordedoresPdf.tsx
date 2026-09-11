import { Document, Page, Text, View } from "@react-pdf/renderer";
import { pdfStyles } from "./theme";
import { PdfFooter } from "./PdfFooter";
import {
  getTeetherCategoryLabel,
  getTeethers,
  getTeethingNormalSigns,
  getTeethingWarningSigns,
} from "@/lib/teethers";
import type { Locale } from "@/lib/i18n/locale";

export function MordedoresPdf({ locale = "es" }: { locale?: Locale }) {
  const es = locale === "es";
  const categoryLabel = getTeetherCategoryLabel(locale);
  const teethers = getTeethers(locale);
  const normalSigns = getTeethingNormalSigns(locale);
  const warningSigns = getTeethingWarningSigns(locale);

  return (
    <Document title={es ? "Mordedores Naturales — NutriMama" : "Mordedores Naturais — NutriMama"}>
      <Page size="A4" style={pdfStyles.page}>
        <Text style={pdfStyles.brand}>NutriMama</Text>
        <Text style={pdfStyles.h1}>{es ? "Mordedores Naturales" : "Mordedores Naturais"}</Text>
        <Text style={pdfStyles.subtitle}>
          {es
            ? "15 opciones naturales y seguras para aliviar la molestia de la erupción de los dientitos."
            : "15 opções naturais e seguras para aliviar o desconforto da erupção dos dentinhos."}
        </Text>

        {teethers.map((t) => (
          <View key={t.id} style={pdfStyles.card} wrap={false}>
            <Text style={pdfStyles.h3}>
              {t.name} — {categoryLabel[t.category]} · {es ? "desde" : "a partir de"} {t.minAgeMonths}m
            </Text>
            <Text style={pdfStyles.body}>{es ? "Temperatura" : "Temperatura"}: {t.temperature}</Text>
            <Text style={pdfStyles.body}>{es ? "Preparación" : "Preparo"}: {t.prep}</Text>
            <Text style={pdfStyles.body}>{es ? "Duración máxima" : "Duração máxima"}: {t.maxDurationMinutes} min {es ? "por vez" : "por vez"}</Text>
            <Text style={pdfStyles.body}>{es ? "Seguridad" : "Segurança"}: {t.safety}</Text>
          </View>
        ))}

        <View break>
          <Text style={pdfStyles.h2}>{es ? "Señales normales de la dentición" : "Sinais normais de teething"}</Text>
          {normalSigns.map((sign) => (
            <View key={sign} style={pdfStyles.bullet} wrap={false}>
              <Text style={pdfStyles.bulletDot}>•</Text>
              <Text style={pdfStyles.bulletText}>{sign}</Text>
            </View>
          ))}

          <Text style={pdfStyles.h2}>{es ? "Cuándo NO es solo dentición" : "Quando NÃO é só teething"}</Text>
          {warningSigns.map((sign) => (
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
