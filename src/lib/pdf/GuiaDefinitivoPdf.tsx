import { Document, Page, Text, View } from "@react-pdf/renderer";
import { pdfStyles } from "./theme";
import { PdfFooter } from "./PdfFooter";
import { FIRST_WEEK_DAYS, PROGRESSION_STAGES, SAFETY_RULES } from "@/lib/introduction-guide";

export function GuiaDefinitivoPdf() {
  return (
    <Document title="Guia Definitivo da Introdução Alimentar — NutriMäe">
      <Page size="A4" style={pdfStyles.page}>
        <Text style={pdfStyles.brand}>NutriMäe</Text>
        <Text style={pdfStyles.h1}>Guia Definitivo da Introdução Alimentar</Text>
        <Text style={pdfStyles.subtitle}>
          Tudo o que você precisa saber para começar com segurança e confiança.
        </Text>

        <Text style={pdfStyles.h2}>Passo a passo: os primeiros 7 dias</Text>
        {FIRST_WEEK_DAYS.map((item) => (
          <View key={item.day} style={pdfStyles.card} wrap={false}>
            <Text style={pdfStyles.h3}>Dia {item.day} — {item.title}</Text>
            <Text style={pdfStyles.body}>{item.text}</Text>
          </View>
        ))}

        <Text style={pdfStyles.h2}>Progressão dos 6 aos 24 meses</Text>
        {PROGRESSION_STAGES.map((stage) => (
          <View key={stage.label} style={pdfStyles.cardPrimary} wrap={false}>
            <Text style={pdfStyles.h3}>{stage.label}</Text>
            <Text style={pdfStyles.body}>Textura: {stage.texture}</Text>
            <Text style={pdfStyles.body}>Frequência: {stage.frequency}</Text>
            <Text style={pdfStyles.body}>Quantidade: {stage.quantity}</Text>
          </View>
        ))}

        <Text style={pdfStyles.h2}>Segurança alimentar — o que evitar</Text>
        {SAFETY_RULES.map((rule) => (
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
