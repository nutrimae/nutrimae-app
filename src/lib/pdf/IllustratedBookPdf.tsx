import { Document, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { BookPageScript } from "@/lib/illustrated-book";

const styles = StyleSheet.create({
  page: { backgroundColor: "#FFF7FA", padding: 38, fontFamily: "Helvetica" },
  frame: { borderRadius: 18, backgroundColor: "#FFFFFF", padding: 18, height: "100%" },
  image: { width: "100%", height: 520, objectFit: "cover", borderRadius: 14 },
  title: { marginTop: 20, fontSize: 24, color: "#7A3855", fontWeight: 700 },
  text: { marginTop: 10, fontSize: 14, lineHeight: 1.6, color: "#4B3940" },
  footer: { marginTop: "auto", paddingTop: 12, fontSize: 9, color: "#A7778B", textAlign: "center" },
});

export function IllustratedBookPdf({ babyName, pages }: { babyName: string; pages: Array<BookPageScript & { imageData: string }> }) {
  return (
    <Document title={`Livro da Introducao Alimentar de ${babyName}`} author="NutriMae">
      {pages.map((page) => (
        <Page key={page.page} size="A4" style={styles.page}>
          <View style={styles.frame}>
            <Image src={page.imageData} style={styles.image} />
            <Text style={styles.title}>{page.title}</Text>
            <Text style={styles.text}>{page.text}</Text>
            <Text style={styles.footer}>Uma lembranca criada no NutriMae com registros reais do Diario do Bebe.</Text>
          </View>
        </Page>
      ))}
    </Document>
  );
}
