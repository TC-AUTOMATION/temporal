/**
 * Newsletter email template wrapper
 * Wraps campaign content with Temporal branding
 */

export function newsletterEmailWrapper(content: string): string {
  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Temporal Newsletter</title>
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
                    📧 contact@temporal-clothes.com | 📍 Bordeaux, France
                  </p>
                  <p style="color: #d1d5db; font-size: 11px; margin: 10px 0 0;">
                    © ${new Date().getFullYear()} Temporal. Tous droits réservés.
                  </p>
                  <p style="color: #d1d5db; font-size: 11px; margin: 10px 0 0;">
                    <a href="https://temporal-clothes.com/newsletter/unsubscribe" style="color: #9ca3af; text-decoration: underline;">Se désabonner</a>
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
 * Newsletter welcome email template
 */
export function newsletterWelcomeEmail(): string {
  const content = `
    <div style="text-align: center;">
      <h2 style="color: #111827; margin: 0 0 20px; font-size: 24px;">Bienvenue dans la Temporal Crew ! 🔥</h2>
      <p style="color: #6b7280; font-size: 16px; line-height: 24px; margin: 0 0 30px;">
        Merci de t'être inscrit à notre newsletter.<br><br>
        Tu recevras en avant-première :
      </p>
      <div style="text-align: left; background-color: #f9fafb; border-radius: 12px; padding: 20px; margin-bottom: 30px;">
        <ul style="color: #374151; font-size: 15px; line-height: 26px; margin: 0; padding-left: 20px;">
          <li>🚀 Les nouveaux drops avant tout le monde</li>
          <li>🎁 Des codes promo exclusifs</li>
          <li>🏆 Des invitations à nos concours privés</li>
          <li>📦 Des offres spéciales réservées aux membres</li>
        </ul>
      </div>
      <a href="https://temporal-clothes.com/shop" style="display: inline-block; background: linear-gradient(135deg, #44047C 0%, #6B21A8 100%); color: white; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-weight: 600; font-size: 16px;">
        Découvrir la collection
      </a>
    </div>
  `;
  return newsletterEmailWrapper(content);
}
