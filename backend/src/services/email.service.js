import nodemailer from 'nodemailer';
import config from '../config/env.js';

// Gmail SMTP transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: config.email.user,
    pass: config.email.pass,
  },
});

// Verify connection on startup
transporter.verify().then(() => {
  console.log('📧 Service email Gmail connecté ✅');
}).catch((err) => {
  console.error('❌ Erreur connexion email:', err.message);
  console.log('💡 Vérifiez GMAIL_USER et GMAIL_APP_PASSWORD dans .env');
});

/**
 * Send verification code email
 */
export async function sendVerificationEmail(to, code, userName) {
  const html = `
  <!DOCTYPE html>
  <html>
  <head><meta charset="utf-8"></head>
  <body style="font-family: 'Segoe UI', Arial, sans-serif; background: #f8fafb; margin: 0; padding: 40px 20px;">
    <div style="max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #059669, #10B981); padding: 32px 24px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">🛒 Gabi-Store</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 14px;">Marketplace • Antsiranana</p>
      </div>
      
      <!-- Body -->
      <div style="padding: 32px 24px;">
        <h2 style="color: #111827; margin: 0 0 8px; font-size: 20px;">Bonjour ${userName} 👋</h2>
        <p style="color: #6b7280; margin: 0 0 24px; font-size: 14px; line-height: 1.6;">
          Merci de vous être inscrit sur Gabi-Store ! Voici votre code de vérification :
        </p>
        
        <!-- Code -->
        <div style="background: #f0fdf4; border: 2px solid #10B981; border-radius: 12px; padding: 20px; text-align: center; margin: 0 0 24px;">
          <p style="color: #059669; margin: 0 0 4px; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">Code de vérification</p>
          <p style="color: #059669; margin: 0; font-size: 36px; font-weight: bold; letter-spacing: 8px; font-family: monospace;">${code}</p>
        </div>
        
        <p style="color: #9ca3af; font-size: 12px; margin: 0 0 8px;">⏰ Ce code expire dans 24 heures</p>
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">Si vous n'avez pas créé de compte, ignorez cet email.</p>
      </div>
      
      <!-- Footer -->
      <div style="background: #f9fafb; padding: 16px 24px; text-align: center; border-top: 1px solid #f3f4f6;">
        <p style="color: #9ca3af; margin: 0; font-size: 11px;">
          © ${new Date().getFullYear()} Gabi-Store — Antsiranana, Madagascar
        </p>
      </div>
    </div>
  </body>
  </html>`;

  try {
    await transporter.sendMail({
      from: `"Gabi-Store" <${config.email.user}>`,
      to,
      subject: `${code} — Votre code de vérification Gabi-Store`,
      html,
    });
    console.log(`📧 Email envoyé à ${to}`);
    return true;
  } catch (err) {
    console.error(`❌ Erreur envoi email à ${to}:`, err.message);
    return false;
  }
}

/**
 * Send order confirmation email
 */
export async function sendOrderConfirmationEmail(to, order, userName) {
  const itemsHtml = order.items?.map(i => `
    <tr>
      <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; font-size: 13px;">${i.name}${i.weight_label ? ` (${i.weight_label})` : ''}</td>
      <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; text-align: center; font-size: 13px;">×${i.quantity}</td>
      <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; text-align: right; font-size: 13px; font-weight: 600;">${Number(i.total_price || i.price * i.quantity).toLocaleString('fr-FR')} MGA</td>
    </tr>
  `).join('') || '';

  const html = `
  <!DOCTYPE html>
  <html>
  <head><meta charset="utf-8"></head>
  <body style="font-family: 'Segoe UI', Arial, sans-serif; background: #f8fafb; margin: 0; padding: 40px 20px;">
    <div style="max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
      <div style="background: linear-gradient(135deg, #059669, #10B981); padding: 24px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 20px;">✅ Commande confirmée !</h1>
      </div>
      <div style="padding: 24px;">
        <p style="color: #6b7280; font-size: 14px;">Bonjour ${userName},</p>
        <p style="color: #6b7280; font-size: 14px;">Votre commande <strong>${order.order_number}</strong> a été reçue.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <thead><tr><th style="text-align:left;padding:8px 0;border-bottom:2px solid #e5e7eb;font-size:12px;color:#9ca3af;">Produit</th><th style="padding:8px 0;border-bottom:2px solid #e5e7eb;font-size:12px;color:#9ca3af;">Qté</th><th style="text-align:right;padding:8px 0;border-bottom:2px solid #e5e7eb;font-size:12px;color:#9ca3af;">Prix</th></tr></thead>
          <tbody>${itemsHtml}</tbody>
        </table>
        <div style="background:#f9fafb;border-radius:8px;padding:12px;margin-top:12px;">
          <div style="display:flex;justify-content:space-between;font-size:13px;color:#6b7280;margin-bottom:4px;"><span>Sous-total</span><span>${Number(order.subtotal).toLocaleString('fr-FR')} MGA</span></div>
          <div style="display:flex;justify-content:space-between;font-size:13px;color:#6b7280;margin-bottom:8px;"><span>🚚 Livraison</span><span>${Number(order.delivery_fee).toLocaleString('fr-FR')} MGA</span></div>
          <div style="display:flex;justify-content:space-between;font-size:16px;font-weight:bold;color:#059669;border-top:2px solid #e5e7eb;padding-top:8px;"><span>Total</span><span>${Number(order.total).toLocaleString('fr-FR')} MGA</span></div>
        </div>
      </div>
      <div style="background: #f9fafb; padding: 16px 24px; text-align: center; border-top: 1px solid #f3f4f6;">
        <p style="color: #9ca3af; margin: 0; font-size: 11px;">© ${new Date().getFullYear()} Gabi-Store — Antsiranana</p>
      </div>
    </div>
  </body>
  </html>`;

  try {
    await transporter.sendMail({
      from: `"Gabi-Store" <${config.email.user}>`,
      to,
      subject: `Commande ${order.order_number} confirmée — Gabi-Store`,
      html,
    });
    return true;
  } catch (err) {
    console.error('❌ Erreur envoi email commande:', err.message);
    return false;
  }
}
