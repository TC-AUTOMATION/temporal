/**
 * Email templates for Temporal
 * All templates use Temporal branding with purple #44047C
 */

// Base email wrapper with Temporal branding
function emailWrapper(content: string): string {
  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Temporal</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #44047C 0%, #6B21A8 100%); padding: 40px 30px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: bold; letter-spacing: 2px;">TEMPORAL</h1>
                  <p style="color: rgba(255, 255, 255, 0.9); margin: 5px 0 0; font-size: 14px;">Streetwear Premium</p>
                </td>
              </tr>
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  ${content}
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px;">
                    <strong>Temporal</strong> - Streetwear Premium
                  </p>
                  <p style="color: #9ca3af; font-size: 12px; margin: 0 0 5px;">
                    📧 contact@temporal.shop | 📍 Bordeaux, France
                  </p>
                  <p style="color: #d1d5db; font-size: 11px; margin: 10px 0 0;">
                    © ${new Date().getFullYear()} Temporal. Tous droits réservés.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

/**
 * Verification code email template
 */
export function verificationCodeEmail(code: string): string {
  const content = `
    <div style="text-align: center;">
      <h2 style="color: #111827; margin: 0 0 20px; font-size: 24px;">Code de vérification</h2>
      <p style="color: #6b7280; font-size: 16px; line-height: 24px; margin: 0 0 30px;">
        Utilisez ce code pour vous connecter à votre compte Temporal :
      </p>
      <div style="background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%); border-radius: 12px; padding: 30px; margin: 0 0 30px; border: 2px solid #44047C;">
        <div style="font-size: 48px; font-weight: bold; letter-spacing: 12px; color: #44047C; font-family: 'Courier New', monospace;">
          ${code}
        </div>
      </div>
      <p style="color: #9ca3af; font-size: 14px; line-height: 20px; margin: 0;">
        ⏱️ Ce code expire dans <strong>10 minutes</strong>
      </p>
      <p style="color: #d1d5db; font-size: 12px; line-height: 18px; margin: 20px 0 0;">
        Si vous n'avez pas demandé ce code, ignorez cet email.
      </p>
    </div>
  `;
  return emailWrapper(content);
}

/**
 * Password reset code email template
 */
export function passwordResetEmail(code: string): string {
  const content = `
    <div style="text-align: center;">
      <div style="background-color: #3b82f6; width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
        <span style="font-size: 40px;">🔐</span>
      </div>
      <h2 style="color: #111827; margin: 0 0 20px; font-size: 24px;">Réinitialisation de mot de passe</h2>
      <p style="color: #6b7280; font-size: 16px; line-height: 24px; margin: 0 0 30px;">
        Vous avez demandé à réinitialiser votre mot de passe Temporal.<br>
        Utilisez ce code pour continuer :
      </p>
      <div style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border-radius: 12px; padding: 30px; margin: 0 0 30px; border: 2px solid #3b82f6;">
        <div style="font-size: 48px; font-weight: bold; letter-spacing: 12px; color: #1e40af; font-family: 'Courier New', monospace;">
          ${code}
        </div>
      </div>
      <p style="color: #9ca3af; font-size: 14px; line-height: 20px; margin: 0;">
        ⏱️ Ce code expire dans <strong>30 minutes</strong>
      </p>
      <p style="color: #d1d5db; font-size: 12px; line-height: 18px; margin: 20px 0 0;">
        Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.<br>
        Votre mot de passe ne sera pas modifié.
      </p>
      <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; border-radius: 6px; margin-top: 30px; text-align: left;">
        <p style="color: #991b1b; margin: 0; font-size: 13px; line-height: 20px;">
          <strong>⚠️ Sécurité :</strong> Ne partagez jamais ce code avec qui que ce soit. L'équipe Temporal ne vous demandera jamais votre code de réinitialisation.
        </p>
      </div>
    </div>
  `;
  return emailWrapper(content);
}

/**
 * Order confirmation email template
 */
export interface OrderDetails {
  orderNumber: string;
  customerFirstName: string;
  customerLastName: string;
  items: Array<{
    productName: string;
    variantName?: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  shippingCost: number;
  promoDiscount?: number;
  total: number;
  deliveryMethod: string;
  deliveryAddress?: {
    street: string;
    postalCode: string;
    city: string;
    country: string;
  };
  relayPointName?: string;
  relayPointAddress?: string;
}

export function orderConfirmationEmail(order: OrderDetails): string {
  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding: 15px 0; border-bottom: 1px solid #f3f4f6;">
        <div style="color: #111827; font-weight: 500; font-size: 15px; margin-bottom: 4px;">
          ${item.productName}
        </div>
        ${item.variantName ? `<div style="color: #9ca3af; font-size: 13px;">${item.variantName}</div>` : ''}
      </td>
      <td style="padding: 15px 0; border-bottom: 1px solid #f3f4f6; text-align: center; color: #6b7280;">
        × ${item.quantity}
      </td>
      <td style="padding: 15px 0; border-bottom: 1px solid #f3f4f6; text-align: right; color: #111827; font-weight: 500;">
        ${Number(item.price).toFixed(2)}€
      </td>
    </tr>
  `).join('');

  const deliveryInfo = order.deliveryMethod === 'HAND_DELIVERY'
    ? '<div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 6px; margin-top: 20px;"><p style="color: #92400e; margin: 0; font-size: 14px;"><strong>⚠️ Livraison en main propre</strong><br>Nous vous contactons bientôt pour organiser la remise.</p></div>'
    : order.deliveryMethod === 'RELAY_POINT' && order.relayPointName
    ? `<div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; border-radius: 6px; margin-top: 20px;"><p style="color: #065f46; margin: 0; font-size: 14px;"><strong>📦 Point relais</strong><br>${order.relayPointName}<br><span style="color: #059669;">${order.relayPointAddress || ''}</span></p></div>`
    : order.deliveryAddress
    ? `<div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; border-radius: 6px; margin-top: 20px;"><p style="color: #1e40af; margin: 0; font-size: 14px;"><strong>🚚 Livraison à domicile</strong><br>${order.deliveryAddress.street}<br>${order.deliveryAddress.postalCode} ${order.deliveryAddress.city}<br>${order.deliveryAddress.country}</p></div>`
    : '';

  const content = `
    <div>
      <h2 style="color: #111827; margin: 0 0 10px; font-size: 24px;">Commande confirmée ✓</h2>
      <p style="color: #6b7280; font-size: 16px; line-height: 24px; margin: 0 0 30px;">
        Bonjour ${order.customerFirstName},<br><br>
        Merci pour votre commande ! Nous avons bien reçu votre paiement et votre commande est en cours de préparation.
      </p>

      <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
        <p style="color: #6b7280; font-size: 13px; margin: 0 0 5px; text-transform: uppercase; letter-spacing: 1px;">Numéro de commande</p>
        <p style="color: #44047C; font-size: 24px; font-weight: bold; margin: 0; font-family: 'Courier New', monospace;">
          #${order.orderNumber}
        </p>
      </div>

      <h3 style="color: #111827; font-size: 18px; margin: 0 0 15px;">Détails de la commande</h3>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
        ${itemsHtml}
      </table>

      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Sous-total</td>
          <td style="padding: 8px 0; text-align: right; color: #111827; font-size: 14px;">${Number(order.subtotal).toFixed(2)}€</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Livraison</td>
          <td style="padding: 8px 0; text-align: right; color: #111827; font-size: 14px;">${Number(order.shippingCost).toFixed(2)}€</td>
        </tr>
        ${order.promoDiscount ? `
        <tr>
          <td style="padding: 8px 0; color: #10b981; font-size: 14px;">Réduction</td>
          <td style="padding: 8px 0; text-align: right; color: #10b981; font-size: 14px;">-${Number(order.promoDiscount).toFixed(2)}€</td>
        </tr>
        ` : ''}
        <tr style="border-top: 2px solid #e5e7eb;">
          <td style="padding: 15px 0 0; color: #111827; font-size: 18px; font-weight: bold;">Total</td>
          <td style="padding: 15px 0 0; text-align: right; color: #44047C; font-size: 24px; font-weight: bold;">${Number(order.total).toFixed(2)}€</td>
        </tr>
      </table>

      ${deliveryInfo}

      <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-top: 30px; text-align: center;">
        <p style="color: #6b7280; font-size: 14px; margin: 0;">
          Des questions sur votre commande ?<br>
          <a href="mailto:contact@temporal.shop" style="color: #44047C; text-decoration: none; font-weight: 500;">Contactez-nous</a>
        </p>
      </div>
    </div>
  `;
  return emailWrapper(content);
}

/**
 * Order shipped email template
 */
export function orderShippedEmail(
  order: { orderNumber: string; customerFirstName: string },
  trackingNumber?: string,
  trackingUrl?: string
): string {
  const trackingHtml = trackingNumber ? `
    <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-radius: 12px; padding: 25px; margin: 30px 0; text-align: center; border: 2px solid #10b981;">
      <p style="color: #065f46; margin: 0 0 10px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
        Numéro de suivi
      </p>
      <div style="font-size: 20px; font-weight: bold; color: #047857; font-family: 'Courier New', monospace; margin-bottom: 15px;">
        ${trackingNumber}
      </div>
      ${trackingUrl ? `
        <a href="${trackingUrl}" style="display: inline-block; background-color: #10b981; color: white; text-decoration: none; padding: 12px 30px; border-radius: 8px; font-weight: 500; font-size: 14px;">
          🔍 Suivre mon colis
        </a>
      ` : ''}
    </div>
  ` : '';

  const content = `
    <div>
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="background-color: #10b981; width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
          <span style="font-size: 40px;">📦</span>
        </div>
        <h2 style="color: #111827; margin: 0 0 10px; font-size: 28px;">Votre commande est expédiée !</h2>
        <p style="color: #6b7280; font-size: 16px; line-height: 24px; margin: 0;">
          Bonjour ${order.customerFirstName},<br><br>
          Bonne nouvelle ! Votre commande <strong>#${order.orderNumber}</strong> a été expédiée.
        </p>
      </div>

      ${trackingHtml}

      <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-top: 30px;">
        <p style="color: #6b7280; font-size: 14px; margin: 0; line-height: 22px;">
          💡 <strong>Conseil :</strong> Votre colis devrait arriver dans 2-5 jours ouvrés. Vous recevrez un email quand il sera livré.
        </p>
      </div>

      <div style="text-align: center; margin-top: 30px;">
        <p style="color: #6b7280; font-size: 14px; margin: 0;">
          Une question sur votre livraison ?<br>
          <a href="mailto:contact@temporal.shop" style="color: #44047C; text-decoration: none; font-weight: 500;">Contactez notre support</a>
        </p>
      </div>
    </div>
  `;
  return emailWrapper(content);
}

/**
 * Order refunded email template
 */
export function orderRefundedEmail(data: {
  orderNumber: string;
  customerFirstName: string;
  refundAmount: number;
  isPartial: boolean;
  reason?: string;
}): string {
  const content = `
    <div>
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="background-color: #3b82f6; width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
          <span style="font-size: 40px;">💸</span>
        </div>
        <h2 style="color: #111827; margin: 0 0 10px; font-size: 28px;">
          ${data.isPartial ? 'Remboursement partiel effectué' : 'Remboursement effectué'}
        </h2>
        <p style="color: #6b7280; font-size: 16px; line-height: 24px; margin: 0;">
          Bonjour ${data.customerFirstName},<br><br>
          ${data.isPartial
            ? `Un remboursement partiel a été effectué pour votre commande <strong>#${data.orderNumber}</strong>.`
            : `Votre commande <strong>#${data.orderNumber}</strong> a été remboursée intégralement.`
          }
        </p>
      </div>

      <div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border-radius: 12px; padding: 25px; margin: 30px 0; text-align: center; border: 2px solid #3b82f6;">
        <p style="color: #1e40af; margin: 0 0 10px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
          Montant remboursé
        </p>
        <div style="font-size: 36px; font-weight: bold; color: #1d4ed8;">
          ${Number(data.refundAmount).toFixed(2)}€
        </div>
      </div>

      ${data.reason ? `
      <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
        <p style="color: #6b7280; font-size: 13px; margin: 0 0 5px; text-transform: uppercase; letter-spacing: 1px;">Motif</p>
        <p style="color: #374151; font-size: 15px; margin: 0;">${data.reason}</p>
      </div>
      ` : ''}

      <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 20px; border-radius: 6px; margin-bottom: 30px;">
        <p style="color: #065f46; margin: 0; font-size: 14px; line-height: 22px;">
          <strong>Délai de traitement :</strong><br>
          Le remboursement sera crédité sur votre moyen de paiement original dans un délai de <strong>3 à 5 jours ouvrés</strong>, selon votre banque.
        </p>
      </div>

      <div style="text-align: center; margin-top: 30px;">
        <p style="color: #6b7280; font-size: 14px; margin: 0;">
          Des questions sur votre remboursement ?<br>
          <a href="mailto:contact@temporal.shop" style="color: #44047C; text-decoration: none; font-weight: 500;">Contactez-nous</a>
        </p>
      </div>
    </div>
  `;
  return emailWrapper(content);
}

/**
 * Payment failed email template
 */
export function paymentFailedEmail(data: {
  orderNumber: string;
  customerFirstName: string;
  errorMessage?: string;
}): string {
  const content = `
    <div>
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="background-color: #ef4444; width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
          <span style="font-size: 40px;">⚠️</span>
        </div>
        <h2 style="color: #111827; margin: 0 0 10px; font-size: 28px;">Échec du paiement</h2>
        <p style="color: #6b7280; font-size: 16px; line-height: 24px; margin: 0;">
          Bonjour ${data.customerFirstName},<br><br>
          Malheureusement, le paiement pour votre commande <strong>#${data.orderNumber}</strong> n'a pas pu être traité.
        </p>
      </div>

      ${data.errorMessage ? `
      <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; border-radius: 6px; margin-bottom: 30px;">
        <p style="color: #991b1b; margin: 0; font-size: 14px;">
          <strong>Raison :</strong> ${data.errorMessage}
        </p>
      </div>
      ` : ''}

      <div style="background-color: #f9fafb; border-radius: 8px; padding: 25px; margin-bottom: 30px;">
        <h3 style="color: #111827; margin: 0 0 15px; font-size: 16px;">Que faire maintenant ?</h3>
        <ul style="color: #6b7280; font-size: 14px; line-height: 24px; margin: 0; padding-left: 20px;">
          <li>Vérifiez les informations de votre carte bancaire</li>
          <li>Assurez-vous que votre carte n'a pas expiré</li>
          <li>Vérifiez que vous avez suffisamment de fonds disponibles</li>
          <li>Contactez votre banque si le problème persiste</li>
        </ul>
      </div>

      <div style="text-align: center; margin-top: 30px;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://temporal-clothes.com'}/checkout" style="display: inline-block; background: linear-gradient(135deg, #44047C 0%, #6B21A8 100%); color: white; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-weight: 600; font-size: 16px;">
          Réessayer le paiement
        </a>
      </div>

      <div style="text-align: center; margin-top: 30px;">
        <p style="color: #6b7280; font-size: 14px; margin: 0;">
          Besoin d'aide ?<br>
          <a href="mailto:contact@temporal.shop" style="color: #44047C; text-decoration: none; font-weight: 500;">Contactez notre support</a>
        </p>
      </div>
    </div>
  `;
  return emailWrapper(content);
}

/**
 * Admin notification email for hand delivery orders
 * Sent to admin when a customer chooses hand delivery
 */
export function adminHandDeliveryNotificationEmail(order: {
  orderNumber: string;
  customerFirstName: string;
  customerLastName: string;
  customerEmail: string;
  customerPhone?: string;
  total: number;
  items: Array<{
    productName: string;
    variantName?: string;
    quantity: number;
    price: number;
  }>;
}): string {
  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">
        ${item.productName}${item.variantName ? ` (${item.variantName})` : ''}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">
        × ${item.quantity}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">
        ${Number(item.price).toFixed(2)}€
      </td>
    </tr>
  `).join('');

  const content = `
    <div>
      <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); border-radius: 12px; padding: 25px; margin-bottom: 30px; text-align: center;">
        <span style="font-size: 48px;">🤝</span>
        <h2 style="color: white; margin: 15px 0 5px; font-size: 24px; font-weight: bold;">
          LIVRAISON MAIN PROPRE
        </h2>
        <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 14px;">
          Action requise - Validation manuelle nécessaire
        </p>
      </div>

      <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 6px; margin-bottom: 30px;">
        <p style="color: #92400e; margin: 0; font-size: 15px; line-height: 24px;">
          <strong>⚠️ Attention :</strong> Un client a choisi la livraison en main propre.
          Vous devez vérifier s'il fait partie des contacts autorisés et valider ou annuler la commande manuellement.
        </p>
      </div>

      <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
        <p style="color: #6b7280; font-size: 13px; margin: 0 0 5px; text-transform: uppercase; letter-spacing: 1px;">Commande</p>
        <p style="color: #44047C; font-size: 28px; font-weight: bold; margin: 0; font-family: 'Courier New', monospace;">
          #${order.orderNumber}
        </p>
      </div>

      <h3 style="color: #111827; font-size: 18px; margin: 0 0 15px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
        👤 Informations client
      </h3>

      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 25px;">
        <tr>
          <td style="padding: 8px 0; color: #6b7280; width: 120px;">Nom</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 500;">
            ${order.customerFirstName} ${order.customerLastName}
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">Email</td>
          <td style="padding: 8px 0;">
            <a href="mailto:${order.customerEmail}" style="color: #44047C; text-decoration: none;">
              ${order.customerEmail}
            </a>
          </td>
        </tr>
        ${order.customerPhone ? `
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">Téléphone</td>
          <td style="padding: 8px 0;">
            <a href="tel:${order.customerPhone}" style="color: #44047C; text-decoration: none;">
              ${order.customerPhone}
            </a>
          </td>
        </tr>
        ` : ''}
      </table>

      <h3 style="color: #111827; font-size: 18px; margin: 0 0 15px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
        📦 Articles commandés
      </h3>

      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 25px; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
        <thead>
          <tr style="background-color: #f9fafb;">
            <th style="padding: 12px; text-align: left; font-size: 13px; color: #6b7280; text-transform: uppercase;">Article</th>
            <th style="padding: 12px; text-align: center; font-size: 13px; color: #6b7280; text-transform: uppercase;">Qté</th>
            <th style="padding: 12px; text-align: right; font-size: 13px; color: #6b7280; text-transform: uppercase;">Prix</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
        <tfoot>
          <tr style="background-color: #f9fafb;">
            <td colspan="2" style="padding: 15px; font-weight: bold; color: #111827;">TOTAL</td>
            <td style="padding: 15px; text-align: right; font-weight: bold; color: #44047C; font-size: 20px;">
              ${Number(order.total).toFixed(2)}€
            </td>
          </tr>
        </tfoot>
      </table>

      <div style="text-align: center; margin-top: 30px;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://temporal-clothes.com'}/admin/orders?search=${order.orderNumber}" style="display: inline-block; background: linear-gradient(135deg, #44047C 0%, #6B21A8 100%); color: white; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-weight: 600; font-size: 16px;">
          Voir la commande dans l'admin
        </a>
      </div>

      <div style="background-color: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; border-radius: 6px; margin-top: 30px;">
        <p style="color: #991b1b; margin: 0; font-size: 13px;">
          <strong>Rappel :</strong> Si ce client n'est pas autorisé pour la main propre, annulez la commande et remboursez-le via le dashboard admin.
        </p>
      </div>
    </div>
  `;
  return emailWrapper(content);
}

/**
 * Order status update email template
 */
export function orderStatusUpdateEmail(
  order: { orderNumber: string; customerFirstName: string },
  newStatus: string
): string {
  let statusInfo = {
    icon: '📋',
    color: '#6b7280',
    title: 'Statut de commande mis à jour',
    message: `Votre commande #${order.orderNumber} a été mise à jour.`,
  };

  switch (newStatus) {
    case 'DELIVERED':
      statusInfo = {
        icon: '✅',
        color: '#10b981',
        title: 'Commande livrée !',
        message: `Votre commande #${order.orderNumber} a été livrée avec succès. Nous espérons que vous apprécierez vos articles !`,
      };
      break;
    case 'CANCELLED':
      statusInfo = {
        icon: '❌',
        color: '#ef4444',
        title: 'Commande annulée',
        message: `Votre commande #${order.orderNumber} a été annulée. Si vous n'êtes pas à l'origine de cette annulation, contactez-nous immédiatement.`,
      };
      break;
    case 'CONFIRMED':
      statusInfo = {
        icon: '✓',
        color: '#3b82f6',
        title: 'Commande confirmée',
        message: `Votre commande #${order.orderNumber} a été confirmée et est en cours de préparation.`,
      };
      break;
  }

  const content = `
    <div>
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="background-color: ${statusInfo.color}; width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
          <span style="font-size: 40px;">${statusInfo.icon}</span>
        </div>
        <h2 style="color: #111827; margin: 0 0 10px; font-size: 28px;">${statusInfo.title}</h2>
        <p style="color: #6b7280; font-size: 16px; line-height: 24px; margin: 0;">
          Bonjour ${order.customerFirstName},<br><br>
          ${statusInfo.message}
        </p>
      </div>

      ${newStatus === 'DELIVERED' ? `
      <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px; padding: 25px; margin: 30px 0; text-align: center; border: 2px solid #f59e0b;">
        <p style="color: #92400e; margin: 0; font-size: 15px; line-height: 24px;">
          ⭐ <strong>Vous aimez vos articles ?</strong><br>
          Partagez vos photos avec #TemporalCrew sur Instagram !
        </p>
      </div>
      ` : ''}

      ${newStatus === 'CANCELLED' ? `
      <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; border-radius: 6px; margin-top: 30px;">
        <p style="color: #991b1b; margin: 0; font-size: 14px; line-height: 22px;">
          <strong>Remboursement :</strong><br>
          Si vous avez déjà payé, vous serez remboursé dans 3-5 jours ouvrés sur votre moyen de paiement original.
        </p>
      </div>
      ` : ''}

      <div style="text-align: center; margin-top: 30px;">
        <p style="color: #6b7280; font-size: 14px; margin: 0;">
          Des questions ?<br>
          <a href="mailto:contact@temporal.shop" style="color: #44047C; text-decoration: none; font-weight: 500;">Contactez-nous</a>
        </p>
      </div>
    </div>
  `;
  return emailWrapper(content);
}
