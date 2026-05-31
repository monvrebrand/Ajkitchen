import nodemailer from 'nodemailer';

// Lazy-init SMTP transport — only created when first email is sent
let _transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!_transporter && process.env.SMTP_SERVER) {
    _transporter = nodemailer.createTransport({
      host: process.env.SMTP_SERVER,
      port: Number(process.env.SMTP_PORT) || 465,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }
  return _transporter;
}

const fromAddress = () => process.env.FROM_EMAIL || 'hello@ajkitchen.com';

type OrderItem = { name: string; qty: number; size: string; price?: number };

type OrderEmailData = {
  to: string;
  orderNum: string;
  customerName: string;
  items: OrderItem[];
  total: number;
  currency: string;
  address: string;
};

export async function sendOrderConfirmation(data: OrderEmailData) {
  const transport = getTransporter();
  if (!transport) {
    console.warn('[Email] SMTP not configured — skipping email');
    return;
  }

  const itemsHtml = data.items
    .map(i => `<tr>
      <td style="padding:8px 0;border-bottom:1px solid #fce7f3;font-size:12px;color:#4b5563">${i.name}</td>
      <td style="padding:8px 0;border-bottom:1px solid #fce7f3;font-size:12px;color:#4b5563;text-align:center">${i.size} × ${i.qty}</td>
    </tr>`)
    .join('');

  const html = `
  <!DOCTYPE html>
  <html>
  <body style="margin:0;padding:0;background:#ffffff;font-family:'Helvetica Neue',Arial,sans-serif">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;padding:40px 20px">
      <tr><td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#fff5f7;border:1px solid #fce7f3">
          <!-- Header -->
          <tr><td style="padding:32px 40px;border-bottom:1px solid #fce7f3">
            <p style="margin:0;font-size:18px;font-weight:900;letter-spacing:0.3em;text-transform:uppercase;color:#db2777">AJ Kitchen</p>
          </td></tr>

          <!-- Body -->
          <tr><td style="padding:32px 40px">
            <p style="margin:0 0 8px;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:#9ca3af">Hi ${data.customerName},</p>
            <h1 style="margin:0 0 24px;font-size:20px;font-weight:900;color:#111827;text-transform:uppercase;letter-spacing:0.05em">Order Received</h1>

            <!-- Order Number -->
            <div style="background:#ffffff;border:1px solid #fce7f3;padding:16px 20px;margin-bottom:24px">
              <p style="margin:0;font-size:9px;letter-spacing:0.3em;text-transform:uppercase;color:#9ca3af">Order Number</p>
              <p style="margin:6px 0 0;font-size:20px;font-weight:900;font-family:monospace;color:#db2777;letter-spacing:0.05em">${data.orderNum}</p>
            </div>

            <!-- Items -->
            <p style="margin:0 0 12px;font-size:9px;letter-spacing:0.3em;text-transform:uppercase;color:#9ca3af">Your Meals</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
              ${itemsHtml}
            </table>

            <!-- Total -->
            <div style="border-top:1px solid #fce7f3;padding-top:16px;display:flex;justify-content:space-between">
              <p style="margin:0;font-size:12px;color:#4b5563">Total Paid</p>
              <p style="margin:0;font-size:16px;font-weight:900;color:#111827">$ ${data.total.toFixed(2)}</p>
            </div>

            <!-- Delivery notice -->
            <div style="margin-top:20px;padding:16px 20px;background:#fff1f2;border:1px solid #fecdd3">
              <p style="margin:0 0 6px;font-size:9px;letter-spacing:0.3em;text-transform:uppercase;color:#e11d48;font-weight:700">🚚 Weekend Delivery</p>
              <p style="margin:0;font-size:11px;color:#4b5563;line-height:1.7">
                Thank you for your pre-order! We deliver every Saturday and Sunday in the Columbus area. You will receive an update once your meal is on its way.
                If you have any questions, please contact us at <a href="mailto:hello@ajkitchen.com" style="color:#db2777">hello@ajkitchen.com</a>.
              </p>
            </div>

            <!-- Address -->
            ${data.address.trim() ? `
            <div style="margin-top:24px;padding-top:20px;border-top:1px solid #fce7f3">
              <p style="margin:0 0 6px;font-size:9px;letter-spacing:0.3em;text-transform:uppercase;color:#9ca3af">Delivery To</p>
              <p style="margin:0;font-size:12px;color:#4b5563;line-height:1.6">${data.address}</p>
            </div>` : ''}
          </td></tr>

          <!-- Footer -->
          <tr><td style="padding:24px 40px;border-top:1px solid #fce7f3">
            <p style="margin:0;font-size:10px;color:#9ca3af;text-align:center">
              Questions? Reply to this email or visit <a href="https://ajkitchen.com/contact" style="color:#db2777">ajkitchen.com/contact</a>
            </p>
            <p style="margin:8px 0 0;font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:#f9a8d4;text-align:center">AJ Kitchen © 2025 • Columbus, OH</p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
  </html>`;

  try {
    await transport.sendMail({
      from: `AJ Kitchen <${fromAddress()}>`,
      to: data.to,
      subject: `Order Received — ${data.orderNum}`,
      html,
    });
  } catch (err) {
    console.error('[Email] Failed to send:', err);
  }
}

type StatusEmailData = {
  to: string;
  orderNum: string;
  customerName: string;
  status: string;
  trackingNumber?: string;
  shippingFee?: number;
};

export async function sendStatusUpdate(data: StatusEmailData) {
  const transport = getTransporter();
  if (!transport) return;

  const statusMessages: Record<string, string> = {
    Preparing:          'Your meal is now being prepared fresh in our kitchen! 🍳',
    'Out for Delivery': 'Great news! Your order has been picked up and is on its way.',
    'On the Way':       'Our driver is almost at your location — get ready! 🚗',
    Delivered:          'Your meal has been delivered. Enjoy every bite! 🍽️',
    Cancelled:          'Your order has been cancelled. Contact us if this was an error.',
  };

  const html = `
  <!DOCTYPE html>
  <html>
  <body style="margin:0;padding:0;background:#ffffff;font-family:'Helvetica Neue',Arial,sans-serif">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;padding:40px 20px">
      <tr><td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#fff5f7;border:1px solid #fce7f3">
          <tr><td style="padding:32px 40px;border-bottom:1px solid #fce7f3">
            <p style="margin:0;font-size:18px;font-weight:900;letter-spacing:0.3em;text-transform:uppercase;color:#db2777">AJ Kitchen</p>
          </td></tr>
          <tr><td style="padding:32px 40px">
            <p style="margin:0 0 8px;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:#9ca3af">Hi ${data.customerName},</p>
            <h1 style="margin:0 0 16px;font-size:20px;font-weight:900;color:#111827;text-transform:uppercase">Order Update — ${data.status}</h1>
            <p style="margin:0 0 24px;font-size:12px;color:#4b5563;line-height:1.6">${statusMessages[data.status] || 'Your order status has been updated.'}</p>
            <div style="background:#ffffff;border:1px solid #fce7f3;padding:16px 20px">
              <p style="margin:0;font-size:9px;letter-spacing:0.3em;text-transform:uppercase;color:#9ca3af">Order Number</p>
              <p style="margin:6px 0 0;font-size:20px;font-weight:900;font-family:monospace;color:#db2777">${data.orderNum}</p>
            </div>
            <p style="margin:24px 0 0;font-size:11px;color:#9ca3af">Track your order at <a href="https://ajkitchen.com/track-order" style="color:#db2777">ajkitchen.com/track-order</a></p>
          </td></tr>
          <tr><td style="padding:20px 40px;border-top:1px solid #fce7f3;text-align:center">
            <p style="margin:0;font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:#f9a8d4">AJ Kitchen © 2025</p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
  </html>`;

  try {
    await transport.sendMail({
      from: `AJ Kitchen <${fromAddress()}>`,
      to: data.to,
      subject: `Order Update — ${data.status}`,
      html,
    });
  } catch (err) {
    console.error('[Email] Status update failed:', err);
  }
}

/* ─── Admin New-Order Alert ─────────────────────────────────── */
type AdminAlertData = {
  orderNum: string;
  customerName: string;
  customerPhone: string;
  total: number;
  paymentMethod: string;
  address: string;
  items: { name: string; qty: number }[];
};

export async function sendAdminNewOrderAlert(data: AdminAlertData) {
  const transport = getTransporter();
  const adminEmail = process.env.TO_EMAIL;
  if (!transport || !adminEmail) return;

  const itemList = data.items
    .map(i => `<li style="font-size:12px;color:#4b5563;padding:4px 0">${i.name} × ${i.qty}</li>`)
    .join('');

  const html = `
  <!DOCTYPE html>
  <html>
  <body style="margin:0;padding:0;background:#ffffff;font-family:'Helvetica Neue',Arial,sans-serif">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;padding:40px 20px">
      <tr><td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#fff5f7;border:1px solid #fce7f3">
          <tr><td style="padding:24px 32px;border-bottom:1px solid #fce7f3;background:#db2777">
            <p style="margin:0;font-size:14px;font-weight:900;letter-spacing:0.3em;text-transform:uppercase;color:#ffffff">🔔 New Order — AJ Kitchen</p>
          </td></tr>
          <tr><td style="padding:28px 32px">
            <p style="margin:0 0 4px;font-size:10px;color:#9ca3af;letter-spacing:0.2em;text-transform:uppercase">Order Number</p>
            <p style="margin:0 0 20px;font-size:22px;font-weight:900;font-family:monospace;color:#db2777">${data.orderNum}</p>

            <p style="margin:0 0 4px;font-size:10px;color:#9ca3af;letter-spacing:0.2em;text-transform:uppercase">Customer</p>
            <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#111827">${data.customerName}</p>
            <p style="margin:0 0 20px;font-size:12px;color:#4b5563">${data.customerPhone || 'No phone provided'}</p>

            <p style="margin:0 0 4px;font-size:10px;color:#9ca3af;letter-spacing:0.2em;text-transform:uppercase">Delivery Address</p>
            <p style="margin:0 0 20px;font-size:12px;color:#4b5563">${data.address}</p>

            <p style="margin:0 0 4px;font-size:10px;color:#9ca3af;letter-spacing:0.2em;text-transform:uppercase">Items</p>
            <ul style="margin:0 0 20px;padding:0 0 0 16px">${itemList}</ul>

            <p style="margin:0 0 4px;font-size:10px;color:#9ca3af;letter-spacing:0.2em;text-transform:uppercase">Total</p>
            <p style="margin:0 0 12px;font-size:18px;font-weight:900;color:#111827">$ ${Number(data.total).toFixed(2)}</p>

            <p style="margin:0 0 4px;font-size:10px;color:#9ca3af;letter-spacing:0.2em;text-transform:uppercase">Payment Via</p>
            <p style="margin:0;font-size:13px;font-weight:700;color:#db2777;text-transform:capitalize">${data.paymentMethod}</p>
          </td></tr>
          <tr><td style="padding:16px 32px;border-top:1px solid #fce7f3;text-align:center">
            <p style="margin:0;font-size:10px;color:#9ca3af">Log in to the admin panel to verify the payment screenshot.</p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
  </html>`;

  try {
    await transport.sendMail({
      from:    `AJ Kitchen Orders <${fromAddress()}>`,
      to:      adminEmail,
      subject: `🔔 New Order ${data.orderNum} — ${data.customerName}`,
      html,
    });
  } catch (err) {
    console.error('[Email] Admin alert failed:', err);
  }
}
