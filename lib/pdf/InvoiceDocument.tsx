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
  /** Sum of line totals; defaults to sum(items × unit). */
  subtotalCents?: number;
  discountCents?: number;
  shippingFeeCents?: number;
  /** Grand total; defaults to subtotal − discount + shipping when breakdown fields are used. */
  totalCents?: number;
};

/** Mirrors Tailwind `brand` tokens + admin table chrome (`globals.css`, `tailwind.config.ts`). */
const ink = "#0b0b0f";
const pink = "#fcc4c8";
const pinkSoft = "rgba(252, 196, 200, 0.34)";
const paper = "#ffffff";
const muted = "rgba(11, 11, 15, 0.58)";
const line = "rgba(11, 11, 15, 0.1)";
/** Opaque neutrals — some PDF viewers tint semi-transparent borders pink/red. */
const tableBorder = "#e5e7eb";
const tableHeaderBg = "#f3f4f6";
const tableRowSep = "#eef0f2";

const styles = StyleSheet.create({
  page: {
    fontSize: 10,
    fontFamily: "Helvetica",
    color: ink,
    backgroundColor: paper,
    flexDirection: "column",
    flexGrow: 1,
  },
  pageInner: {
    flexGrow: 1,
    flexDirection: "column",
    paddingTop: 36,
    paddingBottom: 40,
    paddingHorizontal: 44,
  },
  /** Occupies remaining height above the footer so short invoices still pin the footer to the bottom. */
  pageMain: {
    flexGrow: 1,
  },
  accentRule: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: 5,
    backgroundColor: pink,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 22,
  },
  brandLockup: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingRight: 16,
  },
  stitchMark: {
    width: 38,
    height: 38,
    borderRadius: 11,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: pink,
    backgroundColor: "rgba(252, 196, 200, 0.14)",
    marginRight: 12,
  },
  brandName: {
    fontFamily: "Times-Bold",
    fontSize: 22,
    letterSpacing: -0.4,
    color: ink,
  },
  brandTagline: {
    marginTop: 3,
    fontSize: 9.5,
    color: muted,
    letterSpacing: 0.2,
  },
  invoicePill: {
    alignItems: "flex-end",
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: pink,
    borderRadius: 11,
    paddingVertical: 11,
    paddingHorizontal: 16,
    backgroundColor: pinkSoft,
  },
  invoicePillKicker: {
    fontSize: 8,
    letterSpacing: 1.6,
    color: muted,
    marginBottom: 4,
  },
  invoicePillNumber: {
    fontFamily: "Helvetica-Bold",
    fontSize: 13,
    letterSpacing: 0.3,
  },
  divider: {
    height: 1,
    backgroundColor: line,
    marginBottom: 18,
  },
  metaRow: {
    flexDirection: "row",
    marginBottom: 22,
  },
  metaCard: {
    flex: 1,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: pink,
    borderRadius: 11,
    padding: 14,
    backgroundColor: paper,
  },
  metaCardLeft: {
    marginRight: 14,
  },
  metaLabel: {
    fontSize: 8,
    letterSpacing: 1.4,
    color: muted,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  metaStrong: {
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
    marginBottom: 3,
  },
  metaLine: {
    fontSize: 10,
    color: muted,
    marginBottom: 2,
  },
  sectionLabel: {
    fontSize: 8,
    letterSpacing: 1.5,
    color: muted,
    marginBottom: 10,
    textTransform: "uppercase",
  },
  tableShell: {
    marginBottom: 8,
  },
  tableHeadRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: tableHeaderBg,
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderStyle: "solid",
    borderColor: tableBorder,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  tableHeadText: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    letterSpacing: 0.85,
    color: "#4b5563",
    textTransform: "uppercase",
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderLeftStyle: "solid",
    borderRightStyle: "solid",
    borderBottomStyle: "solid",
    borderLeftColor: tableBorder,
    borderRightColor: tableBorder,
    borderBottomColor: tableRowSep,
    backgroundColor: "#ffffff",
  },
  tableRowLast: {
    borderBottomColor: tableBorder,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  colItem: { width: "46%", paddingRight: 12 },
  colQty: { width: "11%", textAlign: "right" },
  colUnit: { width: "21%", textAlign: "right" },
  colTotal: { width: "21%", textAlign: "right" },
  cellMuted: { color: muted },
  totalsBlock: {
    marginTop: 16,
    alignSelf: "flex-end",
    width: "52%",
    minWidth: 220,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
  },
  grandTotalWrap: {
    marginTop: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: pinkSoft,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftStyle: "solid",
    borderLeftColor: pink,
  },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  grandTotalLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
    letterSpacing: 0.4,
  },
  grandTotalValue: {
    fontFamily: "Helvetica-Bold",
    fontSize: 14,
  },
  footer: {
    paddingTop: 22,
    borderTopWidth: 1,
    borderTopColor: line,
    alignItems: "center",
    flexShrink: 0,
  },
  footerNote: {
    fontSize: 9,
    color: muted,
    textAlign: "center",
    marginBottom: 4,
  },
  footerBrand: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.3,
  },
});

function formatMoney(cents: number, currency: string) {
  const amount = (cents / 100).toFixed(2);
  if (currency === "BDT") return amount;
  return `${amount} ${currency}`;
}

export function InvoiceDocument({ invoice }: { invoice: InvoicePdfModel }) {
  const linesSum = invoice.items.reduce(
    (sum, it) => sum + it.quantity * it.unitCents,
    0
  );
  const subtotal = invoice.subtotalCents ?? linesSum;
  const discount = invoice.discountCents ?? 0;
  const shipping = invoice.shippingFeeCents ?? 0;
  const computedGrand = subtotal - discount + shipping;
  const grandTotal =
    invoice.totalCents !== undefined ? invoice.totalCents : computedGrand;
  const showAdjustments =
    invoice.subtotalCents !== undefined ||
    invoice.discountCents !== undefined ||
    invoice.shippingFeeCents !== undefined ||
    invoice.totalCents !== undefined;

  const issued = new Date(invoice.issuedAtIso);
  const issuedStr = issued.toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.accentRule} fixed />

        <View style={styles.pageInner}>
          <View style={styles.pageMain}>
          <View style={styles.headerRow}>
            <View style={styles.brandLockup}>
              <View style={styles.stitchMark} />
              <View style={{ flex: 1 }}>
                <Text style={styles.brandName}>An-Nisa</Text>
                <Text style={styles.brandTagline}>Premium Embroidery</Text>
              </View>
            </View>
            <View style={styles.invoicePill}>
              <Text style={styles.invoicePillKicker}>INVOICE</Text>
              <Text style={styles.invoicePillNumber}>{invoice.number}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.metaRow}>
            <View style={[styles.metaCard, styles.metaCardLeft]}>
              <Text style={styles.metaLabel}>Bill to</Text>
              <Text style={styles.metaStrong}>{invoice.customer.name}</Text>
              <Text style={styles.metaLine}>{invoice.customer.email}</Text>
            </View>
            <View style={styles.metaCard}>
              <Text style={styles.metaLabel}>Details</Text>
              <Text style={styles.metaStrong}>Issued {issuedStr}</Text>
              <Text style={[styles.metaLine, { marginTop: 6 }]}>
                Currency · {invoice.currency}
              </Text>
            </View>
          </View>

          <Text style={styles.sectionLabel}>Line items</Text>

          <View style={styles.tableShell}>
            <View style={styles.tableHeadRow}>
              <Text style={[styles.tableHeadText, styles.colItem]}>Item</Text>
              <Text style={[styles.tableHeadText, styles.colQty]}>Qty</Text>
              <Text style={[styles.tableHeadText, styles.colUnit]}>Unit</Text>
              <Text style={[styles.tableHeadText, styles.colTotal]}>Total</Text>
            </View>
            {invoice.items.map((it, idx) => (
              <View
                key={idx}
                style={[
                  styles.tableRow,
                  idx === invoice.items.length - 1 ? styles.tableRowLast : {},
                ]}
              >
                <Text style={[styles.colItem]}>{it.name}</Text>
                <Text style={[styles.colQty, styles.cellMuted]}>{it.quantity}</Text>
                <Text style={styles.colUnit}>{formatMoney(it.unitCents, invoice.currency)}</Text>
                <Text style={[styles.colTotal, { fontFamily: "Helvetica-Bold" }]}>
                  {formatMoney(it.unitCents * it.quantity, invoice.currency)}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.totalsBlock}>
            {showAdjustments ? (
              <>
                <View style={[styles.totalRow, { marginBottom: 4 }]}>
                  <Text style={{ color: muted }}>Subtotal</Text>
                  <Text>{formatMoney(subtotal, invoice.currency)}</Text>
                </View>
                {discount > 0 ? (
                  <View style={[styles.totalRow, { marginBottom: 4 }]}>
                    <Text style={{ color: muted }}>Discount</Text>
                    <Text>−{formatMoney(discount, invoice.currency)}</Text>
                  </View>
                ) : null}
                {shipping > 0 ? (
                  <View style={[styles.totalRow, { marginBottom: 4 }]}>
                    <Text style={{ color: muted }}>Shipping</Text>
                    <Text>{formatMoney(shipping, invoice.currency)}</Text>
                  </View>
                ) : null}
              </>
            ) : null}
            <View style={styles.grandTotalWrap}>
              <View style={styles.grandTotalRow}>
                <Text style={styles.grandTotalLabel}>Amount due</Text>
                <Text style={styles.grandTotalValue}>
                  {formatMoney(grandTotal, invoice.currency)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerNote}>
            Thank you — every piece is finished by hand with care.
          </Text>
          <Text style={styles.footerBrand}>An-Nisa · Premium Embroidery</Text>
        </View>
      </View>
      </Page>
    </Document>
  );
}
