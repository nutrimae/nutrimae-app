import { Document, Page, Text, View } from "@react-pdf/renderer";
import { pdfStyles } from "./theme";
import { PdfFooter } from "./PdfFooter";
import { getFirstWeekDays, getProgressionStages, getSafetyRules } from "@/lib/introduction-guide";
import type { Locale } from "@/lib/i18n/locale";

export function GuiaDefinitivoPdf({ locale = "es" }: { locale?: Locale }) {
  const es = locale === "es";
  const firstWeekDays = getFirstWeekDays(locale);
  const progressionStages = getProgressionStages(locale);
  const safetyRules = getSafetyRules(locale);

  return (
    <Document title={es ? "Guía Definitiva de la Introducción Alimentaria — NutriMama" : "Guia Definitivo da Introdução Alimentar — NutriMama"}>
      <Page size="A4" style={pdfStyles.page}>
        <Text style={pdfStyles.brand}>NutriMama</Text>
        <Text style={pdfStyles.h1}>{es ? "Guía Definitiva de la Introducción Alimentaria" : "Guia Definitivo da Introdução Alimentar"}</Text>
        <Text style={pdfStyles.subtitle}>
          {es ? "Todo lo que necesitas saber para empezar con seguridad y confianza." : "Tudo o que você precisa saber para começar com segurança e confiança."}
        </Text>

        <Text style={pdfStyles.h2}>{es ? "Paso a paso: los primeros 7 días" : "Passo a passo: os primeiros 7 dias"}</Text>
        {firstWeekDays.map((item) => (
          <View key={item.day} style={pdfStyles.card} wrap={false}>
            <Text style={pdfStyles.h3}>{es ? "Día" : "Dia"} {item.day} — {item.title}</Text>
            <Text style={pdfStyles.body}>{item.text}</Text>
          </View>
        ))}

        <Text style={pdfStyles.h2}>{es ? "Progresión de los 6 a los 24 meses" : "Progressão dos 6 aos 24 meses"}</Text>
        {progressionStages.map((stage) => (
          <View key={stage.label} style={pdfStyles.cardPrimary} wrap={false}>
            <Text style={pdfStyles.h3}>{stage.label}</Text>
            <Text style={pdfStyles.body}>{es ? "Textura" : "Textura"}: {stage.texture}</Text>
            <Text style={pdfStyles.body}>{es ? "Frecuencia" : "Frequência"}: {stage.frequency}</Text>
            <Text style={pdfStyles.body}>{es ? "Cantidad" : "Quantidade"}: {stage.quantity}</Text>
          </View>
        ))}

        <Text style={pdfStyles.h2}>{es ? "Seguridad alimentaria — qué evitar" : "Segurança alimentar — o que evitar"}</Text>
        {safetyRules.map((rule) => (
          <View
            key={rule.title}
            style={rule.severity === "proibido" ? pdfStyles.cardWarning : pdfStyles.card}
            wrap={false}
          >
            <Text style={pdfStyles.h3}>{rule.title}</Text>
            <Text style={pdfStyles.body}>{rule.text}</Text>
          </View>
        ))}

        <PdfFooter />
      </Page>
    </Document>
  );
}
