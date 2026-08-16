import { Text } from "@react-pdf/renderer";
import { pdfStyles, DISCLAIMER } from "./theme";

export function PdfFooter() {
  return (
    <>
      <Text style={pdfStyles.footer} fixed>
        {DISCLAIMER}
      </Text>
      <Text
        style={pdfStyles.pageNumber}
        render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
        fixed
      />
    </>
  );
}
