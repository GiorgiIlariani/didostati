export type OrderPdfData = {
  orderNumber: string;
  createdAt: string;
  customer: { name: string; phone: string; email?: string };
  shippingAddress: {
    city: string;
    street?: string;
    region?: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    subtotal: number;
  }>;
  deliveryFee: number;
  totalAmount: number;
  deliveryType?: string;
  paymentMethod?: string;
  notes?: string;
};

const deliveryLabels: Record<string, string> = {
  standard: "სტანდარტული",
  express: "ექსპრესი",
  pickup: "თვითგატანა",
};

const paymentLabels: Record<string, string> = {
  cash: "ნაღდი",
  card: "ბარათი",
  bank_transfer: "გადარიცხვა",
};

function escapeHtml(s: string) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Opens a printable order page — user can "Save as PDF" from the print dialog.
 * Full Georgian support (browser fonts).
 */
export function downloadOrderPdf(order: OrderPdfData) {
  const dateStr = new Date(order.createdAt).toLocaleString("ka-GE");
  const delivery =
    deliveryLabels[order.deliveryType || ""] || order.deliveryType || "—";
  const payment =
    paymentLabels[order.paymentMethod || ""] || order.paymentMethod || "—";

  const rows = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #ddd;">${escapeHtml(item.name)}</td>
        <td style="padding:8px;border-bottom:1px solid #ddd;text-align:center;">${item.quantity}</td>
        <td style="padding:8px;border-bottom:1px solid #ddd;text-align:right;">₾${item.price.toFixed(2)}</td>
        <td style="padding:8px;border-bottom:1px solid #ddd;text-align:right;">₾${item.subtotal.toFixed(2)}</td>
      </tr>`,
    )
    .join("");

  const emailLine =
    order.customer.email && !order.customer.email.includes("@phone.didostati")
      ? `<strong>ელფოსტა:</strong> ${escapeHtml(order.customer.email)}<br/>`
      : "";

  const html = `<!DOCTYPE html>
<html lang="ka">
<head>
  <meta charset="utf-8" />
  <title>შეკვეთა #${escapeHtml(order.orderNumber)}</title>
  <style>
    body { font-family: system-ui, -apple-system, "Segoe UI", sans-serif; color: #111; padding: 24px; max-width: 720px; margin: 0 auto; }
    h1 { font-size: 22px; margin: 0 0 4px; }
    .muted { color: #555; font-size: 13px; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px; }
    th { text-align: left; padding: 8px; border-bottom: 2px solid #333; }
    .totals { margin-top: 12px; font-size: 14px; }
    .totals div { display: flex; justify-content: space-between; padding: 4px 0; }
    .total { font-weight: 700; font-size: 16px; border-top: 2px solid #333; padding-top: 8px; margin-top: 8px; }
    .btn { margin-bottom:16px;padding:12px 18px;font-size:15px;cursor:pointer;background:#f97316;color:#fff;border:none;border-radius:8px; }
    @media print {
      body { padding: 0; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <button class="no-print btn" onclick="window.print()">ბეჭდვა / PDF-ად შენახვა</button>
  <h1>დიდოსტატი — შეკვეთა #${escapeHtml(order.orderNumber)}</h1>
  <p class="muted">${escapeHtml(dateStr)}</p>
  <p><strong>კლიენტი:</strong> ${escapeHtml(order.customer.name)}<br/>
  <strong>ტელეფონი:</strong> ${escapeHtml(order.customer.phone)}<br/>
  ${emailLine}
  <strong>მისამართი:</strong> ${escapeHtml([order.shippingAddress.street, order.shippingAddress.city, order.shippingAddress.region].filter(Boolean).join(", "))}<br/>
  <strong>მიწოდება:</strong> ${escapeHtml(delivery)} · <strong>გადახდა:</strong> ${escapeHtml(payment)}
  </p>
  <table>
    <thead>
      <tr>
        <th>პროდუქტი</th>
        <th style="text-align:center;">რაოდ.</th>
        <th style="text-align:right;">ფასი</th>
        <th style="text-align:right;">ჯამი</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="totals">
    <div><span>ქვეჯამი</span><span>₾${(order.totalAmount - order.deliveryFee).toFixed(2)}</span></div>
    <div><span>მიწოდება</span><span>₾${order.deliveryFee.toFixed(2)}</span></div>
    <div class="total"><span>სულ</span><span>₾${order.totalAmount.toFixed(2)}</span></div>
  </div>
  ${order.notes ? `<p style="margin-top:16px;"><strong>კომენტარი:</strong> ${escapeHtml(order.notes)}</p>` : ""}
  <script>window.onload=function(){setTimeout(function(){window.print();},250);};</script>
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const w = window.open(url, "_blank");
  if (!w) {
    const a = document.createElement("a");
    a.href = url;
    a.download = `order-${order.orderNumber}.html`;
    a.click();
  }
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
