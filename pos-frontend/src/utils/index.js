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
    "*Satya 5-Star Hotel*",
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

// Note: UPI payments now go through the Razorpay checkout (see Bill.jsx)
// instead of a static upi://pay deep link straight to the merchant VPA, so
// a payment can be auto-detected and the order auto-placed. The old
// direct-VPA QR helpers were removed since a direct P2P/P2M UPI transfer
// never notifies the server - there was nothing for them to hook into.