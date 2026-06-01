import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private resend?: Resend;
  private fromEmail: string;
  private adminEmail: string;
  private readonly logger = new Logger(EmailService.name);

  constructor(private config: ConfigService) {
    const key = config.get<string>('RESEND_API_KEY');
    if (key) {
      this.resend = new Resend(key);
    } else {
      this.logger.warn('RESEND_API_KEY not set — email sending disabled');
    }
    this.fromEmail = config.get<string>('RESEND_FROM_EMAIL') || 'noreply@Royce Lighting.com';
    this.adminEmail = config.get<string>('ADMIN_EMAIL') || 'admin@Royce Lighting.com';
  }

  private baseTemplate(content: string, preheader = '') {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Royce Lighting</title>
</head>
<body style="margin:0;padding:0;background:#f9f9f7;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
    <!-- Header -->
    <div style="background:#1a1a1a;padding:28px 32px;">
      <h1 style="margin:0;color:#e8d5b7;font-size:24px;font-weight:600;letter-spacing:1px;">Royce Lighting</h1>
      <p style="margin:4px 0 0;color:#9ca3af;font-size:13px;">Handcrafted with love</p>
    </div>
    <!-- Body -->
    <div style="padding:32px;">
      ${content}
    </div>
    <!-- Footer -->
    <div style="background:#f3f4f6;padding:20px 32px;text-align:center;">
      <p style="margin:0;color:#9ca3af;font-size:12px;">© 2024 Royce Lighting. All rights reserved.</p>
      <p style="margin:4px 0 0;color:#9ca3af;font-size:12px;">This is an automated email, please do not reply.</p>
    </div>
  </div>
</body>
</html>`;
  }

  async sendOrderPlacedEmail(to: string, order: any) {
    const itemRows = order.items
      .map(
        (item: any) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;">${item.name}</td>
          <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;text-align:center;">${item.color || '—'}</td>
          <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;text-align:center;">${item.quantity}</td>
          <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;text-align:right;">₹${item.price * item.quantity}</td>
        </tr>`,
      )
      .join('');

    const content = `
      <h2 style="color:#1a1a1a;margin:0 0 8px;">Order Confirmed! 🎉</h2>
      <p style="color:#6b7280;margin:0 0 24px;">Thank you for your order. We're getting it ready for you.</p>

      <div style="background:#fafaf9;border:1px solid #e5e7eb;border-radius:6px;padding:16px;margin-bottom:24px;">
        <p style="margin:0 0 4px;font-size:13px;color:#9ca3af;">Order ID</p>
        <p style="margin:0;font-weight:600;color:#1a1a1a;">#${String(order._id).slice(-8).toUpperCase()}</p>
      </div>

      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr style="border-bottom:2px solid #e5e7eb;">
            <th style="text-align:left;padding:8px 0;color:#6b7280;font-size:13px;">Item</th>
            <th style="text-align:center;padding:8px 0;color:#6b7280;font-size:13px;">Color</th>
            <th style="text-align:center;padding:8px 0;color:#6b7280;font-size:13px;">Qty</th>
            <th style="text-align:right;padding:8px 0;color:#6b7280;font-size:13px;">Total</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>

      <div style="margin-top:16px;padding-top:16px;border-top:2px solid #e5e7eb;">
        <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
          <span style="color:#6b7280;">Delivery Fee</span>
          <span>₹${order.deliveryFees}</span>
        </div>
        <div style="display:flex;justify-content:space-between;font-weight:700;font-size:16px;">
          <span>Total Paid</span>
          <span style="color:#1a1a1a;">₹${order.amount}</span>
        </div>
      </div>

      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px;padding:16px;margin-top:24px;">
        <p style="margin:0;font-size:13px;color:#15803d;font-weight:600;">Delivery Address</p>
        <p style="margin:4px 0 0;font-size:13px;color:#374151;">
          ${order.address.addressLineOne}${order.address.addressLineTwo ? ', ' + order.address.addressLineTwo : ''}<br/>
          ${order.address.city}, ${order.address.state} - ${order.address.pinCode}<br/>
          Phone: ${order.address.phone}
        </p>
      </div>

      <p style="color:#6b7280;font-size:13px;margin-top:24px;">You'll receive another email once your order is shipped with tracking details.</p>`;

    if (!this.resend) {
      this.logger.warn(`Skipping order placed email to ${to}: Resend not configured`);
      return;
    }

    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to,
        subject: `Order Confirmed - #${String(order._id).slice(-8).toUpperCase()} | Royce Lighting`,
        html: this.baseTemplate(content),
      });
      this.logger.log(`Order placed email sent to ${to}`);
    } catch (err) {
      this.logger.error(`Failed to send order placed email: ${err.message}`);
    }
  }

  async sendOrderShippedEmail(to: string, order: any) {
    const content = `
      <h2 style="color:#1a1a1a;margin:0 0 8px;">Your order is on its way! 🚚</h2>
      <p style="color:#6b7280;margin:0 0 24px;">Great news! Your order has been shipped and is heading your way.</p>

      <div style="background:#fafaf9;border:1px solid #e5e7eb;border-radius:6px;padding:16px;margin-bottom:16px;">
        <p style="margin:0 0 4px;font-size:13px;color:#9ca3af;">Order ID</p>
        <p style="margin:0;font-weight:600;">#${String(order._id).slice(-8).toUpperCase()}</p>
      </div>

      ${
        order.delivery?.waybill
          ? `<div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:6px;padding:16px;margin-bottom:16px;">
          <p style="margin:0 0 4px;font-size:13px;color:#1d4ed8;font-weight:600;">Tracking Details</p>
          <p style="margin:0;font-size:13px;">Courier: Delhivery</p>
          <p style="margin:4px 0 0;font-size:13px;">AWB: <strong>${order.delivery.waybill}</strong></p>
          ${order.delivery.trackingUrl ? `<a href="${order.delivery.trackingUrl}" style="display:inline-block;margin-top:12px;background:#2563eb;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-size:13px;">Track My Order →</a>` : ''}
        </div>`
          : ''
      }

      <p style="color:#6b7280;font-size:13px;">Estimated delivery in 3-5 business days.</p>`;

    if (!this.resend) {
      this.logger.warn(`Skipping shipped email to ${to}: Resend not configured`);
      return;
    }

    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to,
        subject: `Your Order Has Shipped - #${String(order._id).slice(-8).toUpperCase()} | Royce Lighting`,
        html: this.baseTemplate(content),
      });
      this.logger.log(`Order shipped email sent to ${to}`);
    } catch (err) {
      this.logger.error(`Failed to send shipped email: ${err.message}`);
    }
  }

  async sendOrderDeliveredEmail(to: string, order: any) {
    const content = `
      <h2 style="color:#1a1a1a;margin:0 0 8px;">Order Delivered! 🎁</h2>
      <p style="color:#6b7280;margin:0 0 24px;">Your Royce Lighting order has been delivered. We hope you love it!</p>

      <div style="background:#fafaf9;border:1px solid #e5e7eb;border-radius:6px;padding:16px;margin-bottom:24px;">
        <p style="margin:0 0 4px;font-size:13px;color:#9ca3af;">Order ID</p>
        <p style="margin:0;font-weight:600;">#${String(order._id).slice(-8).toUpperCase()}</p>
      </div>

      <div style="text-align:center;padding:24px;background:#fefce8;border-radius:8px;">
        <p style="margin:0;font-size:16px;color:#713f12;">Loved your purchase? Share it with friends! ✨</p>
      </div>

      <p style="color:#6b7280;font-size:13px;margin-top:24px;">If you have any issues with your order, please contact us at support@Royce Lighting.com</p>`;

    if (!this.resend) {
      this.logger.warn(`Skipping delivered email to ${to}: Resend not configured`);
      return;
    }

    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to,
        subject: `Order Delivered - #${String(order._id).slice(-8).toUpperCase()} | Royce Lighting`,
        html: this.baseTemplate(content),
      });
      this.logger.log(`Order delivered email sent to ${to}`);
    } catch (err) {
      this.logger.error(`Failed to send delivered email: ${err.message}`);
    }
  }

  async sendAdminNewOrderEmail(order: any, customerName: string, customerEmail: string) {
    const content = `
      <h2 style="color:#1a1a1a;margin:0 0 8px;">New Order Received 🛍️</h2>
      <p style="color:#6b7280;margin:0 0 24px;">A new order has been placed on Royce Lighting.</p>

      <div style="display:grid;gap:12px;">
        <div style="background:#fafaf9;border:1px solid #e5e7eb;border-radius:6px;padding:16px;">
          <p style="margin:0 0 4px;font-size:13px;color:#9ca3af;">Order ID</p>
          <p style="margin:0;font-weight:600;">#${String(order._id).slice(-8).toUpperCase()}</p>
        </div>
        <div style="background:#fafaf9;border:1px solid #e5e7eb;border-radius:6px;padding:16px;">
          <p style="margin:0 0 4px;font-size:13px;color:#9ca3af;">Customer</p>
          <p style="margin:0;font-weight:600;">${customerName} (${customerEmail})</p>
        </div>
        <div style="background:#fafaf9;border:1px solid #e5e7eb;border-radius:6px;padding:16px;">
          <p style="margin:0 0 4px;font-size:13px;color:#9ca3af;">Amount</p>
          <p style="margin:0;font-weight:600;color:#16a34a;">₹${order.amount}</p>
        </div>
        <div style="background:#fafaf9;border:1px solid #e5e7eb;border-radius:6px;padding:16px;">
          <p style="margin:0 0 4px;font-size:13px;color:#9ca3af;">Items (${order.items.length})</p>
          <p style="margin:0;">${order.items.map((i: any) => `${i.name} x${i.quantity}`).join(', ')}</p>
        </div>
        <div style="background:#fafaf9;border:1px solid #e5e7eb;border-radius:6px;padding:16px;">
          <p style="margin:0 0 4px;font-size:13px;color:#9ca3af;">Delivery Address</p>
          <p style="margin:0;">${order.address.addressLineOne}, ${order.address.city}, ${order.address.state} - ${order.address.pinCode}</p>
        </div>
      </div>

      <a href="${process.env.NEXT_PUBLIC_ADMIN_URL}/orders" style="display:inline-block;margin-top:24px;background:#1a1a1a;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-size:14px;">View in Admin Panel →</a>`;

    if (!this.resend) {
      this.logger.warn('Skipping admin new order email: Resend not configured');
      return;
    }

    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to: this.adminEmail,
        subject: `New Order ₹${order.amount} - #${String(order._id).slice(-8).toUpperCase()}`,
        html: this.baseTemplate(content),
      });
    } catch (err) {
      this.logger.error(`Failed to send admin email: ${err.message}`);
    }
  }
}
