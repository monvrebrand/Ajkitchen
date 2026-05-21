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

const fromAddress = () => process.env.FROM_EMAIL || 'support@monvre.com';

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
      <td style="padding:8px 0;border-bottom:1px solid #1a1a1a;font-size:12px;color:#999">${i.name}</td>
      <td style="padding:8px 0;border-bottom:1px solid #1a1a1a;font-size:12px;color:#999;text-align:center">${i.size} × ${i.qty}</td>
    </tr>`)
    .join('');

  const html = `
  <!DOCTYPE html>
  <html>
  <body style="margin:0;padding:0;background:#050505;font-family:'Helvetica Neue',Arial,sans-serif">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#050505;padding:40px 20px">
      <tr><td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#090909;border:1px solid #1a1a1a">
          <!-- Header -->
          <tr><td style="padding:32px 40px;border-bottom:1px solid #1a1a1a">
            <p style="margin:0;font-size:18px;font-weight:900;letter-spacing:0.3em;text-transform:uppercase;color:#fff">MONVRE</p>
          </td></tr>

          <!-- Body -->
          <tr><td style="padding:32px 40px">
            <p style="margin:0 0 8px;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:#555">Hi ${data.customerName},</p>
            <h1 style="margin:0 0 24px;font-size:20px;font-weight:900;color:#e0e0e0;text-transform:uppercase;letter-spacing:0.05em">Order Confirmed</h1>

            <!-- Order Number -->
            <div style="background:#0f0f0f;border:1px solid #1a1a1a;padding:16px 20px;margin-bottom:24px">
              <p style="margin:0;font-size:9px;letter-spacing:0.3em;text-transform:uppercase;color:#555">Order Number</p>
              <p style="margin:6px 0 0;font-size:20px;font-weight:900;font-family:monospace;color:#fff;letter-spacing:0.05em">${data.orderNum}</p>
            </div>

            <!-- Items -->
            <p style="margin:0 0 12px;font-size:9px;letter-spacing:0.3em;text-transform:uppercase;color:#555">Items</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
              ${itemsHtml}
            </table>

            <!-- Total -->
            <div style="border-top:1px solid #1a1a1a;padding-top:16px;display:flex;justify-content:space-between">
              <p style="margin:0;font-size:12px;color:#666">Total Paid (excl. shipping)</p>
              <p style="margin:0;font-size:16px;font-weight:900;color:#fff">${data.currency} ${data.total.toFixed(2)}</p>
            </div>

            <!-- Shipping pending notice -->
            <div style="margin-top:20px;padding:16px 20px;background:#1a1400;border:1px solid #3a2e00">
              <p style="margin:0 0 6px;font-size:9px;letter-spacing:0.3em;text-transform:uppercase;color:#b8860b;font-weight:700">📦 Delivery Fee — To Be Confirmed</p>
              <p style="margin:0;font-size:11px;color:#888;line-height:1.7">
                Your payment has been received. We will send you a separate email confirming your delivery / shipping fee once your order is packaged and a courier is arranged. 
                If you have any questions about delivery, please contact us at <a href="mailto:support@monvre.com" style="color:#b8860b">support@monvre.com</a>.
              </p>
            </div>

            <!-- Address -->
            ${data.address.trim() ? `
            <div style="margin-top:24px;padding-top:20px;border-top:1px solid #1a1a1a">
              <p style="margin:0 0 6px;font-size:9px;letter-spacing:0.3em;text-transform:uppercase;color:#555">Shipping To</p>
              <p style="margin:0;font-size:12px;color:#666;line-height:1.6">${data.address}</p>
            </div>` : ''}
          </td></tr>

          <!-- Footer -->
          <tr><td style="padding:24px 40px;border-top:1px solid #1a1a1a">
            <p style="margin:0;font-size:10px;color:#333;text-align:center">
              Questions? Reply to this email or visit <a href="https://monvre.com/contact" style="color:#666">monvre.com/contact</a>
            </p>
            <p style="margin:8px 0 0;font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:#222;text-align:center">MONVRE © 2026</p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
  </html>`;

  try {
    await transport.sendMail({
      from: `MONVRE <${fromAddress()}>`,
      to: data.to,
      subject: `Order Confirmed — ${data.orderNum}`,
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
    Processing: 'Your order is being prepared.',
    Shipped:    'Great news! Your order is on its way.',
    'In Transit': 'Your package is in transit and will arrive soon.',
    Delivered:  'Your order has been delivered. Enjoy!',
    Cancelled:  'Your order has been cancelled. Contact us if this was an error.',
  };

  const html = `
  <!DOCTYPE html>
  <html>
  <body style="margin:0;padding:0;background:#050505;font-family:'Helvetica Neue',Arial,sans-serif">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#050505;padding:40px 20px">
      <tr><td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#090909;border:1px solid #1a1a1a">
          <tr><td style="padding:32px 40px;border-bottom:1px solid #1a1a1a">
            <p style="margin:0;font-size:18px;font-weight:900;letter-spacing:0.3em;text-transform:uppercase;color:#fff">MONVRE</p>
          </td></tr>
          <tr><td style="padding:32px 40px">
            <p style="margin:0 0 8px;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:#555">Hi ${data.customerName},</p>
            <h1 style="margin:0 0 16px;font-size:20px;font-weight:900;color:#e0e0e0;text-transform:uppercase">Order Update — ${data.status}</h1>
            <p style="margin:0 0 24px;font-size:12px;color:#666;line-height:1.6">${statusMessages[data.status] || 'Your order status has been updated.'}</p>
            <div style="background:#0f0f0f;border:1px solid #1a1a1a;padding:16px 20px">
              <p style="margin:0;font-size:9px;letter-spacing:0.3em;text-transform:uppercase;color:#555">Order Number</p>
              <p style="margin:6px 0 0;font-size:20px;font-weight:900;font-family:monospace;color:#fff">${data.orderNum}</p>
            </div>
            ${data.trackingNumber ? `
            <div style="margin-top:16px;padding:16px 20px;background:#001a1a;border:1px solid #004040">
              <p style="margin:0 0 6px;font-size:9px;letter-spacing:0.3em;text-transform:uppercase;color:#00b8b8;font-weight:700">📦 Tracking Number</p>
              <p style="margin:0;font-size:18px;font-weight:900;font-family:monospace;color:#00e5e5">${data.trackingNumber}</p>
              <p style="margin:8px 0 0;font-size:11px;color:#555">Use this number on your courier's website to track your shipment.</p>
            </div>` : ''}
            ${data.shippingFee !== undefined && data.shippingFee !== null ? `
            <div style="margin-top:16px;padding:16px 20px;background:#1a1400;border:1px solid #3a2e00">
              <p style="margin:0 0 6px;font-size:9px;letter-spacing:0.3em;text-transform:uppercase;color:#b8860b;font-weight:700">🚚 Shipping Fee Confirmed</p>
              <p style="margin:0;font-size:18px;font-weight:900;color:#fff">GHS ${data.shippingFee.toFixed(2)}</p>
              <p style="margin:8px 0 0;font-size:11px;color:#888;line-height:1.7">Please ensure you have this amount ready to pay the courier upon delivery.</p>
            </div>` : ''}
            <p style="margin:24px 0 0;font-size:11px;color:#444">Track your order at <a href="https://monvre.com/track-order" style="color:#666">monvre.com/track-order</a></p>
          </td></tr>
          <tr><td style="padding:20px 40px;border-top:1px solid #1a1a1a;text-align:center">
            <p style="margin:0;font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:#222">MONVRE © 2026</p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
  </html>`;

  try {
    await transport.sendMail({
      from: `MONVRE <${fromAddress()}>`,
      to: data.to,
      subject: `Your order ${data.orderNum} is now ${data.status}`,
      html,
    });
  } catch (err) {
    console.error('[Email] Status update failed:', err);
  }
}
