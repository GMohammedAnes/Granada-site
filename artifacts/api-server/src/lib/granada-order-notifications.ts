import { ReplitConnectors } from "@replit/connectors-sdk";

type OrderNotification = {
  orderId: string;
  name: string;
  phone: string;
  wilaya: string;
  royaleQuantity: number;
  blancheQuantity: number;
  subtotalDzd: number;
  discountDzd: number;
  totalDzd: number;
};

type NotificationResult =
  | { sent: true }
  | { sent: false; missing: "sender" };

const formatDzd = (amount: number) =>
  new Intl.NumberFormat("fr-DZ", { maximumFractionDigits: 0 }).format(amount);

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character] ?? character;
  });

function buildOrderEmail(order: OrderNotification) {
  const phoneDigits = order.phone.replace(/^0/, "");
  const internationalPhone = `+213${phoneDigits}`;
  const whatsappUrl = `https://wa.me/213${phoneDigits}`;
  const items = [
    ...(order.royaleQuantity > 0
      ? [`${order.royaleQuantity} × 50 ml Édition Royale`]
      : []),
    ...(order.blancheQuantity > 0
      ? [`${order.blancheQuantity} × 30 ml Édition Blanche`]
      : []),
  ];
  const itemList = items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  const customerName = escapeHtml(order.name);
  const phone = escapeHtml(order.phone);
  const wilaya = escapeHtml(order.wilaya);
  const formattedSubtotal = formatDzd(order.subtotalDzd);
  const formattedDiscount = formatDzd(order.discountDzd);
  const formattedTotal = formatDzd(order.totalDzd);
  const discountText =
    order.discountDzd > 0
      ? `Bundle savings: -${formattedDiscount} DZD\n`
      : "";

  return {
    subject: `New Granada pre-order · ${order.orderId}`,
    text: [
      "GRANADA PARFUMS — NEW PRE-ORDER",
      `Order: ${order.orderId}`,
      `Customer: ${order.name}`,
      `Phone: ${order.phone}`,
      `Call: tel:${internationalPhone}`,
      `WhatsApp: ${whatsappUrl}`,
      `Items: ${items.join(", ")}`,
      `Wilaya: ${order.wilaya}`,
      `Subtotal: ${formattedSubtotal} DZD`,
      discountText.trimEnd(),
      `Total: ${formattedTotal} DZD`,
    ]
      .filter(Boolean)
      .join("\n"),
    html: `
      <div style="margin:0;background:#f5f0e7;padding:32px 16px;font-family:Arial,sans-serif;color:#301923">
        <div style="max-width:620px;margin:0 auto;border:1px solid #d7cbbb;background:#faf7f1">
          <div style="background:#4b1827;padding:24px 28px;color:#f5f0e7">
            <p style="margin:0;color:#ddc795;font-size:11px;letter-spacing:3px">GRANADA PARFUMS · ALGÉRIE</p>
            <h1 style="margin:12px 0 0;font-family:Georgia,serif;font-size:25px;font-weight:400">Nouvelle précommande</h1>
            <p style="margin:8px 0 0;color:#e6d7c7;font-size:12px">Commande ${escapeHtml(order.orderId)}</p>
          </div>
          <div style="padding:24px 28px">
            <p style="margin:0 0 5px;color:#8b7251;font-size:11px;letter-spacing:1px">CLIENT</p>
            <p style="margin:0 0 18px;font-size:17px;font-weight:600">${customerName}</p>
            <p style="margin:0 0 7px;color:#8b7251;font-size:11px;letter-spacing:1px">CONTACT RAPIDE</p>
            <p style="margin:0 0 8px;font-size:14px"><a href="tel:${internationalPhone}" style="color:#4b1827">${phone}</a></p>
            <p style="margin:0 0 22px">
              <a href="${whatsappUrl}" style="display:inline-block;background:#4b1827;padding:10px 14px;color:#f5f0e7;text-decoration:none;font-size:12px">Ouvrir WhatsApp</a>
              <a href="tel:${internationalPhone}" style="display:inline-block;margin-left:8px;border:1px solid #8b6d42;padding:9px 13px;color:#4b1827;text-decoration:none;font-size:12px">Appeler</a>
            </p>
            <p style="margin:0 0 7px;color:#8b7251;font-size:11px;letter-spacing:1px">FORMATS · WILAYA ${wilaya}</p>
            <ul style="margin:0 0 22px;padding-left:20px;font-size:14px;line-height:1.8">${itemList}</ul>
            <table style="width:100%;border-top:1px solid #e4dbce;padding-top:12px;font-size:13px">
              <tr><td style="padding:5px 0;color:#71655d">Sous-total</td><td style="padding:5px 0;text-align:right">${formattedSubtotal} DZD</td></tr>
              ${order.discountDzd > 0 ? `<tr><td style="padding:5px 0;color:#765143">Remise duo · 10%</td><td style="padding:5px 0;text-align:right;color:#765143">−${formattedDiscount} DZD</td></tr>` : ""}
              <tr><td style="border-top:1px solid #e4dbce;padding:12px 0 0;font-weight:700">Total</td><td style="border-top:1px solid #e4dbce;padding:12px 0 0;text-align:right;font-weight:700;color:#4b1827">${formattedTotal} DZD</td></tr>
            </table>
            <p dir="rtl" style="margin:22px 0 0;color:#765143;font-size:13px">طلب جديد من متجر غرناطة · ولاية ${wilaya}</p>
          </div>
        </div>
      </div>
    `,
  };
}

export async function sendGranadaOrderNotification(
  order: OrderNotification,
): Promise<NotificationResult> {
  const recipient =
    process.env.GRANADA_STAFF_EMAIL?.trim() || "granadateamdz@gmail.com";
  const senderEmail = process.env.GRANADA_ORDER_NOTIFICATION_FROM?.trim();
  if (!senderEmail || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(senderEmail)) {
    return { sent: false, missing: "sender" };
  }

  const connectors = new ReplitConnectors();
  const email = buildOrderEmail(order);
  const response = await connectors.proxy("resend", "/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Idempotency-Key": `granada-preorder-${order.orderId}`,
    },
    body: JSON.stringify({
      from: `Granada Parfums <${senderEmail}>`,
      to: [recipient],
      subject: email.subject,
      text: email.text,
      html: email.html,
    }),
  });

  if (!response.ok) {
    throw new Error(`Resend request failed with status ${response.status}.`);
  }

  return { sent: true };
}
