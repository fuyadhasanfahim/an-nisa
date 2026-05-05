import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

export type InvoicePdfModel = {
  number: string;
  issuedAtIso: string;
  customer: { name: string; email: string };
  items: Array<{ name: string; quantity: number; unitCents: number }>;
  currency: string;
};

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 11, color: "#0b0b0f" },
  title: { fontSize: 18, marginBottom: 8 },
  muted: { color: "rgba(11,11,15,0.6)" },
  row: { flexDirection: "row", justifyContent: "space-between" },
  box: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#fcc4c8",
    borderRadius: 10,
    padding: 12,
    marginTop: 14,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(11,11,15,0.12)",
    paddingBottom: 6,
    marginBottom: 6,
  },
  cell: { flexGrow: 1 },
  right: { textAlign: "right" as const },
});

function formatMoney(cents: number, currency: string) {
  const amount = (cents / 100).toFixed(2);
  return currency === "BDT" ? `৳ ${amount}` : `${currency} ${amount}`;
}

export function InvoiceDocument({ invoice }: { invoice: InvoicePdfModel }) {
  const totalCents = invoice.items.reduce(
    (sum, it) => sum + it.quantity * it.unitCents,
    0
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Invoice</Text>
        <View style={styles.row}>
          <Text style={styles.muted}>An-Nisa • Premium Embroidery</Text>
          <Text style={styles.muted}>#{invoice.number}</Text>
        </View>

        <View style={styles.box}>
          <View style={styles.row}>
            <View>
              <Text>Bill to</Text>
              <Text style={styles.muted}>{invoice.customer.name}</Text>
              <Text style={styles.muted}>{invoice.customer.email}</Text>
            </View>
            <View>
              <Text style={styles.right}>Issued</Text>
              <Text style={[styles.muted, styles.right]}>
                {new Date(invoice.issuedAtIso).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.box}>
          <View style={styles.tableHeader}>
            <Text style={[styles.cell]}>Item</Text>
            <Text style={[styles.cell, styles.right]}>Qty</Text>
            <Text style={[styles.cell, styles.right]}>Unit</Text>
            <Text style={[styles.cell, styles.right]}>Total</Text>
          </View>
          {invoice.items.map((it, idx) => (
            <View key={idx} style={styles.row}>
              <Text style={styles.cell}>{it.name}</Text>
              <Text style={[styles.cell, styles.right]}>{it.quantity}</Text>
              <Text style={[styles.cell, styles.right]}>
                {formatMoney(it.unitCents, invoice.currency)}
              </Text>
              <Text style={[styles.cell, styles.right]}>
                {formatMoney(it.unitCents * it.quantity, invoice.currency)}
              </Text>
            </View>
          ))}
          <View style={{ marginTop: 10 }}>
            <View style={styles.row}>
              <Text style={styles.muted}>Total</Text>
              <Text>{formatMoney(totalCents, invoice.currency)}</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}

