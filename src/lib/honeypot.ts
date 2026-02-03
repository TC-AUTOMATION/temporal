/**
 * 🔒 Honeypot Anti-Bot Protection
 * Détecte les bots qui remplissent automatiquement tous les champs de formulaire
 */

// Nom du champ honeypot (doit ressembler à un vrai champ)
export const HONEYPOT_FIELD_NAME = 'website_url';
export const HONEYPOT_TIMESTAMP_FIELD = '_form_timestamp';

// Temps minimum pour remplir un formulaire (en ms)
// Un humain met au moins 3 secondes, un bot remplit instantanément
const MIN_FORM_TIME_MS = 3000;

// Temps maximum (empêche les attaques par rejeu avec vieux timestamps)
const MAX_FORM_TIME_MS = 30 * 60 * 1000; // 30 minutes

export interface HoneypotValidation {
  isBot: boolean;
  reason?: string;
}

/**
 * Valide les champs honeypot côté serveur
 * @param formData - Les données du formulaire
 * @returns Résultat de validation
 */
export function validateHoneypot(formData: Record<string, unknown>): HoneypotValidation {
  // Vérifier le champ honeypot (doit être vide)
  const honeypotValue = formData[HONEYPOT_FIELD_NAME];
  if (honeypotValue && String(honeypotValue).trim() !== '') {
    console.warn('[HONEYPOT] Bot detected: honeypot field filled');
    return {
      isBot: true,
      reason: 'honeypot_filled',
    };
  }

  // Vérifier le timestamp (doit être dans la fenêtre acceptable)
  const timestamp = formData[HONEYPOT_TIMESTAMP_FIELD];
  if (timestamp) {
    const submittedAt = Number(timestamp);
    const now = Date.now();
    const timeTaken = now - submittedAt;

    // Trop rapide = bot
    if (timeTaken < MIN_FORM_TIME_MS) {
      console.warn(`[HONEYPOT] Bot detected: form filled too fast (${timeTaken}ms)`);
      return {
        isBot: true,
        reason: 'too_fast',
      };
    }

    // Trop vieux = attaque par rejeu
    if (timeTaken > MAX_FORM_TIME_MS) {
      console.warn(`[HONEYPOT] Bot detected: timestamp too old (${timeTaken}ms)`);
      return {
        isBot: true,
        reason: 'timestamp_expired',
      };
    }
  }

  return { isBot: false };
}

/**
 * Génère le timestamp pour le formulaire
 */
export function generateFormTimestamp(): number {
  return Date.now();
}

/**
 * Hook de validation pour les API routes
 * Retourne une Response 403 si bot détecté, null sinon
 */
export function checkHoneypot(formData: Record<string, unknown>): Response | null {
  const validation = validateHoneypot(formData);

  if (validation.isBot) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Request blocked',
      }),
      {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  return null;
}

/**
 * CSS pour cacher le champ honeypot (doit être invisible mais pas display:none)
 * display:none est détecté par les bots sophistiqués
 */
export const honeypotStyles = `
  .honeypot-field {
    position: absolute;
    left: -9999px;
    top: -9999px;
    width: 1px;
    height: 1px;
    opacity: 0;
    pointer-events: none;
    tab-index: -1;
  }
`;
