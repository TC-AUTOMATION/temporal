import nodemailer from 'nodemailer';

// Lazy-initialized transporter (only created when needed)
let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null;
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '465'),
      secure: process.env.SMTP_SECURE !== 'false', // true for 465, false for 587
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  return transporter;
}

// Email configuration
const EMAIL_FROM = process.env.EMAIL_FROM || 'Temporal <noreply@temporal-clothes.com>';

export interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send an email using SMTP (OVH/Nodemailer)
 * Handles errors gracefully and logs all attempts
 */
export async function sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
  const startTime = Date.now();

  try {
    // Validate params
    if (!params.to || !params.subject || !params.html) {
      throw new Error('Missing required email parameters');
    }

    // Get transporter (checks if SMTP is configured)
    const smtp = getTransporter();
    if (!smtp) {
      console.warn('[EMAIL] SMTP not configured - email not sent');
      console.log('[EMAIL] Would send to:', params.to);
      console.log('[EMAIL] Subject:', params.subject);
      return {
        success: false,
        error: 'SMTP not configured (missing SMTP_HOST, SMTP_USER, or SMTP_PASS)',
      };
    }

    // Log attempt
    console.log(`[EMAIL] Sending email to: ${Array.isArray(params.to) ? params.to.join(', ') : params.to}`);
    console.log(`[EMAIL] Subject: ${params.subject}`);

    // Send email via SMTP
    const info = await smtp.sendMail({
      from: EMAIL_FROM,
      to: Array.isArray(params.to) ? params.to.join(', ') : params.to,
      subject: params.subject,
      html: params.html,
      replyTo: params.replyTo,
    });

    const duration = Date.now() - startTime;
    console.log(`[EMAIL] ✓ Email sent successfully in ${duration}ms - ID: ${info.messageId}`);

    return {
      success: true,
      messageId: info.messageId,
    };

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[EMAIL] ✗ Failed to send email after ${duration}ms:`, error);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send email with retry logic
 * Retries up to 2 times with exponential backoff
 */
export async function sendEmailWithRetry(
  params: SendEmailParams,
  maxRetries: number = 2
): Promise<SendEmailResult> {
  let lastError: string | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    if (attempt > 0) {
      // Exponential backoff: 1s, 2s, 4s...
      const delayMs = Math.pow(2, attempt - 1) * 1000;
      console.log(`[EMAIL] Retry attempt ${attempt} after ${delayMs}ms delay...`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }

    const result = await sendEmail(params);

    if (result.success) {
      if (attempt > 0) {
        console.log(`[EMAIL] ✓ Email sent successfully on retry attempt ${attempt}`);
      }
      return result;
    }

    lastError = result.error;
  }

  console.error(`[EMAIL] ✗ Failed to send email after ${maxRetries} retries`);
  return {
    success: false,
    error: lastError || 'Failed after all retries',
  };
}

/**
 * Send multiple emails in parallel
 * Returns array of results
 */
export async function sendBulkEmails(
  emails: SendEmailParams[]
): Promise<SendEmailResult[]> {
  console.log(`[EMAIL] Sending ${emails.length} emails in parallel...`);

  const results = await Promise.all(
    emails.map(email => sendEmail(email))
  );

  const successCount = results.filter(r => r.success).length;
  console.log(`[EMAIL] Bulk send complete: ${successCount}/${emails.length} successful`);

  return results;
}
