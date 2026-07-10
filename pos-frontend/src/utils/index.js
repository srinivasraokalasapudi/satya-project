export const getBgColor = () => {
  const bgarr = [
    "#b73e3e",
    "#5b45b0",
    "#7f167f",
    "#735f32",
    "#1d2569",
    "#285430",
    "#f6b100",
    "#025cca",
    "#be3e3f",
    "#02ca3a",
  ];
  const randomBg = Math.floor(Math.random() * bgarr.length);
  const color = bgarr[randomBg];
  return color;
};

export const getAvatarName = (name) => {
  if(!name) return "";

  return name.split(" ").map(word => word[0]).join("").toUpperCase();

}

export const formatDate = (date) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return `${months[date.getMonth()]} ${String(date.getDate()).padStart(2, '0')}, ${date.getFullYear()}`;
};

export const formatDateAndTime = (date) => {
  const dateAndTime = new Date(date).toLocaleString("en-US", {
    month: "long",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata"
  })

  return dateAndTime;
}

// =========================
// WhatsApp Receipt
// =========================

// Normalizes a raw phone number into the digits-only, country-code-prefixed
// format WhatsApp's click-to-chat link (wa.me) expects. Defaults to India's
// country code (91) since that's what this POS's ₹ pricing targets.
export const formatPhoneForWhatsApp = (phone) => {
  if (!phone) return null;

  const digits = String(phone).replace(/\D/g, "");

  if (!digits) return null;

  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return digits;
  if (digits.length === 11 && digits.startsWith("0")) return `91${digits.slice(1)}`;

  return digits;
};

// Builds a plain-text receipt message formatted for WhatsApp (WhatsApp
// renders *text* as bold, so we lean on that instead of HTML/markdown).
export const buildReceiptMessage = (order) => {
  if (!order) return "";

  const orderId = Math.floor(new Date(order.orderDate).getTime());

  const itemLines = (order.items || [])
    .map((item) => `- ${item.name} x${item.quantity} — ₹${item.price.toFixed(2)}`)
    .join("\n");

  return [
    "*VASU 5-Star Hotel*",
    "*Order Receipt*",
    "",
    `Order ID: ${orderId}`,
    `Name: ${order.customerDetails?.name || ""}`,
    `Guests: ${order.customerDetails?.guests ?? ""}`,
    "",
    "*Items*",
    itemLines,
    "",
    `Subtotal: ₹${order.bills?.total?.toFixed(2)}`,
    `Tax: ₹${order.bills?.tax?.toFixed(2)}`,
    `*Grand Total: ₹${order.bills?.totalWithTax?.toFixed(2)}*`,
    "",
    `Payment Method: ${order.paymentMethod}`,
    "",
    "Thank you for your order!",
  ].join("\n");
};

// Returns a wa.me click-to-chat URL pre-filled with the receipt, or null if
// the order has no usable phone number.
export const getWhatsAppReceiptUrl = (order) => {
  const phone = formatPhoneForWhatsApp(order?.customerDetails?.phone);
  if (!phone) return null;

  const message = buildReceiptMessage(order);
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
};

// =========================
// UPI Payment
// =========================

// Merchant VPA/name are configurable via env so each deployment can point
// at its own UPI ID without a code change. Defaults to the hotel's real
// UPI ID below; override with VITE_UPI_ID / VITE_UPI_PAYEE_NAME if that
// ever changes (e.g. moving to a dedicated business UPI handle).
const REAL_UPI_VPA = "9515193331@ptyes";
const DEMO_UPI_VPA = "VASU5starhotel@okhdfcbank";
const UPI_PAYEE_VPA = import.meta.env.VITE_UPI_ID || REAL_UPI_VPA;
const UPI_PAYEE_NAME = import.meta.env.VITE_UPI_PAYEE_NAME || "VASU 5-Star Hotel";

// True whenever VITE_UPI_ID hasn't been set to a real business UPI ID, so
// the UI can warn the waiter instead of handing out a QR that will never
// scan successfully.
export const isUpiDemoVpa = UPI_PAYEE_VPA === DEMO_UPI_VPA;

// Builds a standard UPI deep link (upi://pay) that any UPI app (GPay,
// PhonePe, Paytm, BHIM, etc.) can open directly to pre-fill the payment.
//
// IMPORTANT: this must be strict percent-encoding (spaces as %20), not
// URLSearchParams's form-encoding (spaces as "+"). UPI apps parse this as
// a URI, not a submitted form, and several of them reject a "+"-encoded
// query as malformed, surfacing as "Invalid QR code" on scan even though
// the payee VPA itself is valid.
export const buildUpiPaymentUrl = ({ amount, note, refId }) => {
  const params = [
    ["pa", UPI_PAYEE_VPA], // payee VPA
    ["pn", UPI_PAYEE_NAME], // payee name
    ["am", Number(amount).toFixed(2)], // amount
    ["cu", "INR"],
  ];

  if (note) params.push(["tn", note]);
  if (refId) params.push(["tr", String(refId)]);

  const query = params
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join("&");

  return `upi://pay?${query}`;
};

// Renders the UPI link as a scannable QR code image via a public QR
// generator, so customers without the deep-link handoff (e.g. scanning

// from a POS screen) can still pay.
export const getUpiQrCodeUrl = (upiUrl, size = 260) => {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(
    upiUrl
  )}`;
};