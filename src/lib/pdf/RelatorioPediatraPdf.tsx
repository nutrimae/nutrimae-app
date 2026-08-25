import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { COLORS } from "./theme";
import type { Reaction } from "@/lib/food-diary";

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

const CLINICAL_DISCLAIMER =
  "Este relatório resume os registros feitos pela família no app NutriMãe e não constitui avaliação nutricional ou médica. Serve como apoio para a consulta com o profissional que acompanha o bebê.";

function formatDateBr(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("pt-BR");
}

export interface RelatorioPediatraFoodRow {
  name: string;
  triedAt: string;
  reaction: Reaction;
}

export interface RelatorioPediatraProps {
  babyName: string;
  ageLabel: string;
  periodLabel: string;
  foods: RelatorioPediatraFoodRow[];
  knownAllergens: string[];
  generatedAtLabel: string;
}

export function RelatorioPediatraPdf({
  babyName,
  ageLabel,
  periodLabel,
  foods,
  knownAllergens,
  generatedAtLabel,
}: RelatorioPediatraProps) {
  const total = foods.length;
  const counts = { gostou: 0, neutro: 0, nao_gostou: 0 } as Record<Reaction, number>;
  for (const f of foods) counts[f.reaction] += 1;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.brand}>NutriMãe</Text>
        <Text style={styles.h1}>Relatório para o pediatra</Text>

        <View style={styles.metaRow}>
          <View>
            <Text style={styles.metaLabel}>Bebê</Text>
            <Text style={styles.metaValue}>{babyName}</Text>
          </View>
          <View>
            <Text style={styles.metaLabel}>Idade atual</Text>
            <Text style={styles.metaValue}>{ageLabel}</Text>
          </View>
          <View>
            <Text style={styles.metaLabel}>Período coberto</Text>
            <Text style={styles.metaValue}>{periodLabel}</Text>
          </View>
        </View>

        <Text style={styles.h2}>Alimentos registrados no período</Text>
        {total === 0 ? (
          <Text style={styles.emptyNote}>Nenhum alimento novo registrado no período selecionado.</Text>
        ) : (
          <View>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, styles.colFood]}>Alimento</Text>
              <Text style={[styles.tableHeaderCell, styles.colDate]}>Data</Text>
              <Text style={[styles.tableHeaderCell, styles.colReaction]}>Reação registrada</Text>
            </View>
            {foods.map((f) => (
              <View key={f.name} style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.colFood]}>{f.name}</Text>
                <Text style={[styles.tableCell, styles.colDate]}>{formatDateBr(f.triedAt)}</Text>
                <Text style={[styles.tableCell, styles.colReaction]}>{REACTION_LABEL_PT[f.reaction]}</Text>
              </View>
            ))}
          </View>
        )}

        <Text style={styles.h2}>Alergênicos com reação conhecida ou restrição indicada</Text>
        {knownAllergens.length === 0 ? (
          <Text style={styles.emptyNote}>Nenhum alergênico marcado com reação conhecida na conta da família.</Text>
        ) : (
          <View style={styles.allergenBox}>
            {knownAllergens.map((a) => (
              <Text key={a} style={styles.allergenItem}>• {a}</Text>
            ))}
          </View>
        )}

        <Text style={styles.h2}>Padrão observado no período</Text>
        {total === 0 ? (
          <Text style={styles.emptyNote}>Sem alimentos registrados no período para observar um padrão.</Text>
        ) : (
          <View>
            <Text style={styles.summaryStat}>
              <Text style={styles.summaryNumber}>{total}</Text> alimento{total === 1 ? "" : "s"} novo{total === 1 ? "" : "s"} registrado{total === 1 ? "" : "s"} no período.
            </Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryStat}><Text style={styles.summaryNumber}>{counts.gostou}</Text> gostou</Text>
              <Text style={styles.summaryStat}><Text style={styles.summaryNumber}>{counts.neutro}</Text> neutro</Text>
              <Text style={styles.summaryStat}><Text style={styles.summaryNumber}>{counts.nao_gostou}</Text> não gostou</Text>
            </View>
          </View>
        )}

        <Text style={styles.footer} fixed>
          {CLINICAL_DISCLAIMER}{"\n"}Relatório gerado em {generatedAtLabel}.
        </Text>
      </Page>
    </Document>
  );
}
