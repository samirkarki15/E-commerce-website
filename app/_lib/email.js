// app/_lib/email.js
import nodemailer from "nodemailer";

const ADMIN_EMAIL = "samirkarki799@gmail.com";

// Create transporter lazily to avoid issues if env vars aren't set
function getTransporter() {
  if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
    return null;
  }
  
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });
}

function formatCurrency(amount) {
  return `रु ${Number(amount).toFixed(2)}`;
}

function formatDate(date) {
  return new Date(date).toLocaleString("en-NP", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Asia/Kathmandu",
  });
}

function buildOrderEmailHTML({
  orderNumber,
  customerName,
  phoneNumber,
  address,
  district,
  notes,
  paymentMethod,
  items,
  subtotal,
  shippingAmount,
  taxAmount,
  totalAmount,
  estimatedDelivery,
  customerEmail,
}) {
  const paymentLabel =
    paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment";

  const itemRows = items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; font-size: 14px; color: #374151;">
          ${item.product_name}
        </td>
        <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; font-size: 14px; color: #374151; text-align: center;">
          ${item.quantity}
        </td>
        <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; font-size: 14px; color: #374151; text-align: right;">
          ${formatCurrency(item.product_price)}
        </td>
        <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; font-size: 14px; color: #374151; text-align: right; font-weight: 600;">
          ${formatCurrency(item.total_price)}
        </td>
      </tr>`,
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 640px; margin: 0 auto; padding: 24px 16px;">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); border-radius: 12px 12px 0 0; padding: 32px 24px; text-align: center;">
      <h1 style="color: #ffffff; font-size: 24px; margin: 0 0 8px 0;">New Order Received!</h1>
      <p style="color: #bfdbfe; font-size: 14px; margin: 0;">Order ${orderNumber} &bull; ${formatDate(new Date())}</p>
    </div>

    <!-- Main Content -->
    <div style="background: #ffffff; padding: 32px 24px; border-radius: 0 0 12px 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      
      <!-- Customer Info -->
      <div style="margin-bottom: 28px;">
        <h2 style="font-size: 16px; color: #1f2937; margin: 0 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid #2563eb;">
          Customer Details
        </h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 6px 0; font-size: 14px; color: #6b7280; width: 140px;">Full Name</td>
            <td style="padding: 6px 0; font-size: 14px; color: #111827; font-weight: 600;">${customerName}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-size: 14px; color: #6b7280;">Phone Number</td>
            <td style="padding: 6px 0; font-size: 14px; color: #111827; font-weight: 600;">+977 ${phoneNumber}</td>
          </tr>
          ${
            customerEmail
              ? `<tr>
            <td style="padding: 6px 0; font-size: 14px; color: #6b7280;">Email</td>
            <td style="padding: 6px 0; font-size: 14px; color: #111827; font-weight: 600;">${customerEmail}</td>
          </tr>`
              : ""
          }
          <tr>
            <td style="padding: 6px 0; font-size: 14px; color: #6b7280; vertical-align: top;">Address</td>
            <td style="padding: 6px 0; font-size: 14px; color: #111827; font-weight: 600;">${address}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-size: 14px; color: #6b7280;">District</td>
            <td style="padding: 6px 0; font-size: 14px; color: #111827; font-weight: 600;">${district}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-size: 14px; color: #6b7280;">Country</td>
            <td style="padding: 6px 0; font-size: 14px; color: #111827; font-weight: 600;">Nepal</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-size: 14px; color: #6b7280;">Payment Method</td>
            <td style="padding: 6px 0; font-size: 14px; color: #111827; font-weight: 600;">
              <span style="display: inline-block; padding: 2px 10px; border-radius: 9999px; font-size: 12px; ${
                paymentMethod === "cod"
                  ? "background-color: #dcfce7; color: #166534;"
                  : "background-color: #dbeafe; color: #1e40af;"
              }">
                ${paymentLabel}
              </span>
            </td>
          </tr>
          ${
            notes
              ? `<tr>
            <td style="padding: 6px 0; font-size: 14px; color: #6b7280; vertical-align: top;">Delivery Notes</td>
            <td style="padding: 6px 0; font-size: 14px; color: #111827; font-style: italic;">${notes}</td>
          </tr>`
              : ""
          }
        </table>
      </div>

      <!-- Order Items -->
      <div style="margin-bottom: 28px;">
        <h2 style="font-size: 16px; color: #1f2937; margin: 0 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid #2563eb;">
          Order Items
        </h2>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f9fafb;">
              <th style="padding: 10px 16px; font-size: 12px; font-weight: 600; color: #6b7280; text-align: left; text-transform: uppercase; letter-spacing: 0.05em;">Product</th>
              <th style="padding: 10px 16px; font-size: 12px; font-weight: 600; color: #6b7280; text-align: center; text-transform: uppercase; letter-spacing: 0.05em;">Qty</th>
              <th style="padding: 10px 16px; font-size: 12px; font-weight: 600; color: #6b7280; text-align: right; text-transform: uppercase; letter-spacing: 0.05em;">Price</th>
              <th style="padding: 10px 16px; font-size: 12px; font-weight: 600; color: #6b7280; text-align: right; text-transform: uppercase; letter-spacing: 0.05em;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemRows}
          </tbody>
        </table>
      </div>

      <!-- Price Summary -->
      <div style="margin-bottom: 28px; background-color: #f9fafb; border-radius: 8px; padding: 20px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 4px 0; font-size: 14px; color: #6b7280;">Subtotal</td>
            <td style="padding: 4px 0; font-size: 14px; color: #374151; text-align: right;">${formatCurrency(subtotal)}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; font-size: 14px; color: #6b7280;">Shipping</td>
            <td style="padding: 4px 0; font-size: 14px; color: #374151; text-align: right;">${shippingAmount === 0 ? '<span style="color: #16a34a;">Free</span>' : formatCurrency(shippingAmount)}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; font-size: 14px; color: #6b7280;">Tax (13% VAT)</td>
            <td style="padding: 4px 0; font-size: 14px; color: #374151; text-align: right;">${formatCurrency(taxAmount)}</td>
          </tr>
          <tr>
            <td colspan="2" style="padding: 8px 0 0 0;"><hr style="border: none; border-top: 1px solid #d1d5db; margin: 0;"></td>
          </tr>
          <tr>
            <td style="padding: 8px 0 0 0; font-size: 18px; font-weight: 700; color: #1f2937;">Total Amount</td>
            <td style="padding: 8px 0 0 0; font-size: 18px; font-weight: 700; color: #2563eb; text-align: right;">${formatCurrency(totalAmount)}</td>
          </tr>
        </table>
      </div>

      <!-- Estimated Delivery -->
      <div style="text-align: center; padding: 16px; background-color: #eff6ff; border-radius: 8px; border: 1px solid #bfdbfe;">
        <p style="margin: 0; font-size: 14px; color: #1e40af;">
          <strong>Estimated Delivery:</strong> ${estimatedDelivery}
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align: center; padding: 24px 16px;">
      <p style="margin: 0; font-size: 12px; color: #9ca3af;">
        This is an automated notification. Order placed on your e-commerce store.
      </p>
    </div>
  </div>
</body>
</html>`;
}

export async function sendOrderNotificationEmail({
  orderNumber,
  customerName,
  phoneNumber,
  address,
  district,
  notes,
  paymentMethod,
  items,
  subtotal,
  shippingAmount,
  taxAmount,
  totalAmount,
  estimatedDelivery,
  customerEmail,
}) {
  try {
    const transporter = getTransporter();
    
    if (!transporter) {
      return { success: false, error: "Email not configured - SMTP credentials missing" };
    }

    const html = buildOrderEmailHTML({
      orderNumber,
      customerName,
      phoneNumber,
      address,
      district,
      notes,
      paymentMethod,
      items,
      subtotal,
      shippingAmount,
      taxAmount,
      totalAmount,
      estimatedDelivery,
      customerEmail,
    });

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    const mailOptions = {
      from: `"E-Commerce Store" <${process.env.SMTP_EMAIL}>`,
      to: ADMIN_EMAIL,
      subject: `New Order ${orderNumber} - ${customerName} (${totalItems} item${totalItems > 1 ? "s" : ""}) - ${formatCurrency(totalAmount)}`,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    return { 
      success: false, 
      error: error.message || "Failed to send email" 
    };
  }
}
