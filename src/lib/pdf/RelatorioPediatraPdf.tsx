import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { COLORS } from "./theme";
import type { Reaction } from "@/lib/food-diary";
import type { Locale } from "@/lib/i18n/locale";

const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 56,
    paddingHorizontal: 40,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: COLORS.brown,
    backgroundColor: "#FFFFFF",
  },
  brand: {
    fontSize: 8,
    color: COLORS.brownLight,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 10,
  },
  h1: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: COLORS.brown,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#EDE6DD",
    paddingBottom: 10,
    marginBottom: 16,
  },
  metaLabel: {
    fontSize: 8,
    color: COLORS.brownLight,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: COLORS.brown,
  },
  h2: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: COLORS.brown,
    marginTop: 14,
    marginBottom: 6,
  },
  emptyNote: {
    fontSize: 9.5,
    color: COLORS.brownLight,
    fontStyle: "italic",
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#D9CFC2",
    paddingBottom: 4,
    marginBottom: 4,
  },
  tableHeaderCell: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: COLORS.brownLight,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 3,
    borderBottomWidth: 0.5,
    borderBottomColor: "#F1EBE2",
  },
  tableCell: {
    fontSize: 9.5,
    color: COLORS.brown,
  },
  colFood: { width: "40%" },
  colDate: { width: "25%" },
  colReaction: { width: "35%" },
  allergenBox: {
    borderWidth: 1,
    borderColor: "#E2D8C9",
    borderRadius: 6,
    padding: 10,
  },
  allergenItem: {
    fontSize: 9.5,
    color: COLORS.brown,
    marginBottom: 3,
  },
  summaryRow: {
    flexDirection: "row",
    gap: 16,
    marginTop: 2,
  },
  summaryStat: {
    fontSize: 9.5,
    color: COLORS.brown,
  },
  summaryNumber: {
    fontFamily: "Helvetica-Bold",
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 40,
    right: 40,
    fontSize: 7.5,
    color: COLORS.brownLight,
    textAlign: "center",
    borderTopWidth: 1,
    borderTopColor: "#EDE6DD",
    paddingTop: 8,
    lineHeight: 1.4,
  },
});

const REACTION_LABEL_PT: Record<Reaction, string> = {
  gostou: "Gostou",
  neutro: "Neutro",
  nao_gostou: "Não gostou",
};

const REACTION_LABEL_ES: Record<Reaction, string> = {
  gostou: "Le gustó",
  neutro: "Neutro",
  nao_gostou: "No le gustó",
};

const CLINICAL_DISCLAIMER_PT =
  "Este relatório resume os registros feitos pela família no app NutriMama e não constitui avaliação nutricional ou médica. Serve como apoio para a consulta com o profissional que acompanha o bebê.";

const CLINICAL_DISCLAIMER_ES =
  "Este informe resume los registros hechos por la familia en la app NutriMama y no constituye una evaluación nutricional o médica. Sirve como apoyo para la consulta con el profesional que atiende al bebé.";

export interface RelatorioPediatraFoodRow {
  name: string;
  triedAt: string;
  reaction: Reaction;
}

export interface RelatorioPediatraProps {
  locale?: Locale;
  babyName: string;
  ageLabel: string;
  periodLabel: string;
  foods: RelatorioPediatraFoodRow[];
  knownAllergens: string[];
  generatedAtLabel: string;
}

export function RelatorioPediatraPdf({
  locale = "es",
  babyName,
  ageLabel,
  periodLabel,
  foods,
  knownAllergens,
  generatedAtLabel,
}: RelatorioPediatraProps) {
  const es = locale === "es";
  const reactionLabel = es ? REACTION_LABEL_ES : REACTION_LABEL_PT;
  const clinicalDisclaimer = es ? CLINICAL_DISCLAIMER_ES : CLINICAL_DISCLAIMER_PT;
  const total = foods.length;
  const counts = { gostou: 0, neutro: 0, nao_gostou: 0 } as Record<Reaction, number>;
  for (const f of foods) counts[f.reaction] += 1;

  return (
    <Document title={es ? "Informe para el pediatra — NutriMama" : "Relatório para o pediatra — NutriMama"}>
      <Page size="A4" style={styles.page}>
        <Text style={styles.brand}>NutriMama</Text>
        <Text style={styles.h1}>{es ? "Informe para el pediatra" : "Relatório para o pediatra"}</Text>

        <View style={styles.metaRow}>
          <View>
            <Text style={styles.metaLabel}>{es ? "Bebé" : "Bebê"}</Text>
            <Text style={styles.metaValue}>{babyName}</Text>
          </View>
          <View>
            <Text style={styles.metaLabel}>{es ? "Edad actual" : "Idade atual"}</Text>
            <Text style={styles.metaValue}>{ageLabel}</Text>
          </View>
          <View>
            <Text style={styles.metaLabel}>{es ? "Período cubierto" : "Período coberto"}</Text>
            <Text style={styles.metaValue}>{periodLabel}</Text>
          </View>
        </View>

        <Text style={styles.h2}>{es ? "Alimentos registrados en el período" : "Alimentos registrados no período"}</Text>
        {total === 0 ? (
          <Text style={styles.emptyNote}>{es ? "Ningún alimento nuevo registrado en el período seleccionado." : "Nenhum alimento novo registrado no período selecionado."}</Text>
        ) : (
          <View>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, styles.colFood]}>{es ? "Alimento" : "Alimento"}</Text>
              <Text style={[styles.tableHeaderCell, styles.colDate]}>{es ? "Fecha" : "Data"}</Text>
              <Text style={[styles.tableHeaderCell, styles.colReaction]}>{es ? "Reacción registrada" : "Reação registrada"}</Text>
            </View>
            {foods.map((f) => (
              <View key={f.name} style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.colFood]}>{f.name}</Text>
                <Text style={[styles.tableCell, styles.colDate]}>{f.triedAt}</Text>
                <Text style={[styles.tableCell, styles.colReaction]}>{reactionLabel[f.reaction]}</Text>
              </View>
            ))}
          </View>
        )}

        <Text style={styles.h2}>{es ? "Alérgenos con reacción conocida o restricción indicada" : "Alergênicos com reação conhecida ou restrição indicada"}</Text>
        {knownAllergens.length === 0 ? (
          <Text style={styles.emptyNote}>{es ? "Ningún alérgeno marcado con reacción conocida en la cuenta de la familia." : "Nenhum alergênico marcado com reação conhecida na conta da família."}</Text>
        ) : (
          <View style={styles.allergenBox}>
            {knownAllergens.map((a) => (
              <Text key={a} style={styles.allergenItem}>• {a}</Text>
            ))}
          </View>
        )}

        <Text style={styles.h2}>{es ? "Patrón observado en el período" : "Padrão observado no período"}</Text>
        {total === 0 ? (
          <Text style={styles.emptyNote}>{es ? "Sin alimentos registrados en el período para observar un patrón." : "Sem alimentos registrados no período para observar um padrão."}</Text>
        ) : (
          <View>
            <Text style={styles.summaryStat}>
              <Text style={styles.summaryNumber}>{total}</Text>{" "}
              {es
                ? `alimento${total === 1 ? "" : "s"} nuevo${total === 1 ? "" : "s"} registrado${total === 1 ? "" : "s"} en el período.`
                : `alimento${total === 1 ? "" : "s"} novo${total === 1 ? "" : "s"} registrado${total === 1 ? "" : "s"} no período.`}
            </Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryStat}><Text style={styles.summaryNumber}>{counts.gostou}</Text> {es ? "le gustó" : "gostou"}</Text>
              <Text style={styles.summaryStat}><Text style={styles.summaryNumber}>{counts.neutro}</Text> {es ? "neutro" : "neutro"}</Text>
              <Text style={styles.summaryStat}><Text style={styles.summaryNumber}>{counts.nao_gostou}</Text> {es ? "no le gustó" : "não gostou"}</Text>
            </View>
          </View>
        )}

        <Text style={styles.footer} fixed>
          {clinicalDisclaimer}{"\n"}{es ? "Informe generado el" : "Relatório gerado em"} {generatedAtLabel}.
        </Text>
      </Page>
    </Document>
  );
}
