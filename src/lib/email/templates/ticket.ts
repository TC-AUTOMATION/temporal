/**
 * Ticket email templates for Temporal
 */

function emailWrapper(content: string): string {
  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Temporal Support</title>
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
                  <p style="color: rgba(255, 255, 255, 0.9); margin: 5px 0 0; font-size: 14px;">Support Client</p>
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
                    <strong>Temporal</strong> - Support Client
                  </p>
                  <p style="color: #9ca3af; font-size: 12px; margin: 0 0 5px;">
                    📧 contact@temporal-clothes.com
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
 * Email sent when admin replies to a ticket
 */
export function ticketReplyEmail(data: {
  ticketNumber: string;
  customerName: string;
  replyMessage: string;
  ticketSubject: string;
}): string {
  const content = `
    <div>
      <h2 style="color: #111827; margin: 0 0 20px; font-size: 24px;">Nouvelle réponse à votre ticket</h2>
      <p style="color: #6b7280; font-size: 16px; line-height: 24px; margin: 0 0 30px;">
        Bonjour ${data.customerName},<br><br>
        L'équipe Temporal a répondu à votre demande.
      </p>

      <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
        <p style="color: #6b7280; font-size: 13px; margin: 0 0 5px; text-transform: uppercase; letter-spacing: 1px;">Ticket</p>
        <p style="color: #44047C; font-size: 18px; font-weight: bold; margin: 0 0 10px; font-family: 'Courier New', monospace;">
          #${data.ticketNumber}
        </p>
        <p style="color: #6b7280; font-size: 14px; margin: 0;">
          ${data.ticketSubject}
        </p>
      </div>

      <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; border-radius: 6px; margin-bottom: 30px;">
        <p style="color: #6b7280; font-size: 12px; margin: 0 0 10px; text-transform: uppercase; letter-spacing: 1px;">Notre réponse</p>
        <p style="color: #374151; font-size: 15px; line-height: 24px; margin: 0; white-space: pre-wrap;">${data.replyMessage}</p>
      </div>

      <div style="text-align: center; margin-top: 30px;">
        <a href="https://temporal-clothes.com/profile" style="display: inline-block; background: linear-gradient(135deg, #44047C 0%, #6B21A8 100%); color: white; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-weight: 600; font-size: 16px;">
          Voir mon compte
        </a>
      </div>

      <p style="color: #9ca3af; font-size: 13px; line-height: 20px; margin: 30px 0 0; text-align: center;">
        Vous pouvez répondre à cet email pour continuer la conversation.
      </p>
    </div>
  `;
  return emailWrapper(content);
}

/**
 * Email sent when a new ticket is created (confirmation)
 */
export function ticketCreatedEmail(data: {
  ticketNumber: string;
  customerName: string;
  ticketSubject: string;
  ticketMessage: string;
}): string {
  const content = `
    <div>
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="background-color: #10b981; width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
          <span style="font-size: 40px;">✓</span>
        </div>
        <h2 style="color: #111827; margin: 0 0 10px; font-size: 24px;">Demande reçue</h2>
        <p style="color: #6b7280; font-size: 16px; line-height: 24px; margin: 0;">
          Bonjour ${data.customerName},<br>
          Nous avons bien reçu votre demande.
        </p>
      </div>

      <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
        <p style="color: #6b7280; font-size: 13px; margin: 0 0 5px; text-transform: uppercase; letter-spacing: 1px;">Numéro de ticket</p>
        <p style="color: #44047C; font-size: 24px; font-weight: bold; margin: 0; font-family: 'Courier New', monospace;">
          #${data.ticketNumber}
        </p>
      </div>

      <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
        <p style="color: #6b7280; font-size: 13px; margin: 0 0 10px; text-transform: uppercase; letter-spacing: 1px;">Sujet</p>
        <p style="color: #374151; font-size: 16px; font-weight: 500; margin: 0 0 20px;">
          ${data.ticketSubject}
        </p>
        <p style="color: #6b7280; font-size: 13px; margin: 0 0 10px; text-transform: uppercase; letter-spacing: 1px;">Message</p>
        <p style="color: #374151; font-size: 14px; line-height: 22px; margin: 0; white-space: pre-wrap;">${data.ticketMessage}</p>
      </div>

      <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 6px; margin-bottom: 30px;">
        <p style="color: #92400e; margin: 0; font-size: 14px; line-height: 22px;">
          <strong>⏱️ Délai de réponse :</strong> Nous nous engageons à vous répondre sous 24 à 48 heures ouvrées.
        </p>
      </div>

      <p style="color: #9ca3af; font-size: 13px; line-height: 20px; margin: 20px 0 0; text-align: center;">
        Conservez ce numéro de ticket pour le suivi de votre demande.
      </p>
    </div>
  `;
  return emailWrapper(content);
}

/**
 * Email sent when ticket is closed/resolved
 */
export function ticketClosedEmail(data: {
  ticketNumber: string;
  customerName: string;
  ticketSubject: string;
}): string {
  const content = `
    <div>
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="background-color: #10b981; width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
          <span style="font-size: 40px;">✅</span>
        </div>
        <h2 style="color: #111827; margin: 0 0 10px; font-size: 24px;">Ticket résolu</h2>
        <p style="color: #6b7280; font-size: 16px; line-height: 24px; margin: 0;">
          Bonjour ${data.customerName},<br>
          Votre ticket a été marqué comme résolu.
        </p>
      </div>

      <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
        <p style="color: #6b7280; font-size: 13px; margin: 0 0 5px; text-transform: uppercase; letter-spacing: 1px;">Ticket</p>
        <p style="color: #44047C; font-size: 18px; font-weight: bold; margin: 0 0 10px; font-family: 'Courier New', monospace;">
          #${data.ticketNumber}
        </p>
        <p style="color: #6b7280; font-size: 14px; margin: 0;">
          ${data.ticketSubject}
        </p>
      </div>

      <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; border-radius: 6px; margin-bottom: 30px;">
        <p style="color: #065f46; margin: 0; font-size: 14px; line-height: 22px;">
          Si vous avez d'autres questions ou si le problème n'est pas résolu, n'hésitez pas à nous recontacter.
        </p>
      </div>

      <div style="text-align: center; margin-top: 30px;">
        <p style="color: #6b7280; font-size: 14px; margin: 0;">
          Merci d'avoir contacté le support Temporal !<br>
          <a href="mailto:contact@temporal-clothes.com" style="color: #44047C; text-decoration: none; font-weight: 500;">contact@temporal-clothes.com</a>
        </p>
      </div>
    </div>
  `;
  return emailWrapper(content);
}
