import { StyleSheet } from "@react-pdf/renderer";

export const COLORS = {
  primary: "#FF6B9D",
  primaryLight: "#FFE3ED",
  sage: "#7A9B76",
  sageLight: "#E8F0E6",
  brown: "#4A3B32",
  brownLight: "#8A7A6E",
  cream: "#FDF9F3",
  red: "#D9534F",
  redLight: "#FBE9E8",
};

export const pdfStyles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 50,
    paddingHorizontal: 40,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: COLORS.brown,
    backgroundColor: "#FFFFFF",
  },
  brand: {
    fontSize: 9,
    color: COLORS.primary,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  h1: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: COLORS.brown,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 11,
    color: COLORS.brownLight,
    marginBottom: 18,
  },
  h2: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: COLORS.brown,
    marginTop: 16,
    marginBottom: 8,
  },
  h3: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: COLORS.brown,
    marginBottom: 2,
  },
  body: {
    fontSize: 10,
    lineHeight: 1.5,
    color: COLORS.brown,
  },
  small: {
    fontSize: 8.5,
    color: COLORS.brownLight,
    lineHeight: 1.4,
  },
  card: {
    backgroundColor: COLORS.sageLight,
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  cardPrimary: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  cardWarning: {
    backgroundColor: COLORS.redLight,
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    gap: 8,
  },
  bullet: {
    flexDirection: "row",
    marginBottom: 3,
  },
  bulletDot: {
    width: 10,
    fontSize: 10,
    color: COLORS.sage,
  },
  bulletText: {
    flex: 1,
    fontSize: 10,
    lineHeight: 1.4,
    color: COLORS.brown,
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
  },
  pageNumber: {
    position: "absolute",
    bottom: 24,
    right: 40,
    fontSize: 8,
    color: COLORS.brownLight,
  },
});

export const DISCLAIMER =
  "Este material é um apoio ao dia a dia e não substitui orientação médica ou nutricional profissional. Gerado pelo NutriMãe para uso pessoal e familiar — não redistribua.";
