import Joi from 'joi';

export const smsSchema = Joi.object({
  to: Joi.string()
    .pattern(/^\+?[1-9]\d{1,14}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid phone number format. Use E.164 format (e.g., +1234567890)',
    }),
  body: Joi.string().min(1).max(1600).required(),
  mediaUrl: Joi.array().items(Joi.string().uri()).max(10),
  statusCallback: Joi.string().uri(),
  from: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/),
});

export const voiceCallSchema = Joi.object({
  to: Joi.string()
    .pattern(/^\+?[1-9]\d{1,14}$/)
    .required(),
  url: Joi.string().uri().required(),
  method: Joi.string().valid('GET', 'POST').default('POST'),
  statusCallback: Joi.string().uri(),
  statusCallbackMethod: Joi.string().valid('GET', 'POST').default('POST'),
  timeout: Joi.number().min(1).max(600).default(60),
  record: Joi.boolean().default(false),
  recordingStatusCallback: Joi.string().uri(),
  from: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/),
});

export const ivrConfigSchema = Joi.object({
  welcomeMessage: Joi.string().required(),
  menuOptions: Joi.array()
    .items(
      Joi.object({
        digit: Joi.string()
          .pattern(/^[0-9#*]$/)
          .required(),
        action: Joi.string().valid('forward', 'voicemail', 'hangup', 'submenu', 'queue').required(),
        destination: Joi.string(),
        message: Joi.string(),
        submenu: Joi.object(),
      })
    )
    .required(),
  defaultRoute: Joi.string(),
  invalidInputMessage: Joi.string(),
  maxRetries: Joi.number().min(1).max(5).default(3),
});

export const phoneNumberSearchSchema = Joi.object({
  areaCode: Joi.string().pattern(/^\d{3}$/),
  contains: Joi.string(),
  country: Joi.string().length(2).default('US'),
  smsEnabled: Joi.boolean(),
  voiceEnabled: Joi.boolean(),
  limit: Joi.number().min(1).max(100).default(20),
});

export const analyticsQuerySchema = Joi.object({
  startDate: Joi.date().required(),
  endDate: Joi.date().min(Joi.ref('startDate')).required(),
  phoneNumber: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/),
  direction: Joi.string().valid('inbound', 'outbound'),
  status: Joi.string(),
});

export function validatePhoneNumber(phoneNumber: string): boolean {
  const e164Regex = /^\+?[1-9]\d{1,14}$/;
  return e164Regex.test(phoneNumber);
}

export function normalizePhoneNumber(phoneNumber: string): string {
  // Remove all non-digit characters except leading +
  let normalized = phoneNumber.replace(/[^\d+]/g, '');

  // Add + if not present
  if (!normalized.startsWith('+')) {
    // Assume US number if no country code
    if (normalized.length === 10) {
      normalized = '+1' + normalized;
    } else if (normalized.length === 11 && normalized.startsWith('1')) {
      normalized = '+' + normalized;
    } else {
      normalized = '+' + normalized;
    }
  }

  return normalized;
}

export function validateTwilioSignature(
  signature: string,
  url: string,
  params: Record<string, any>,
  authToken: string
): boolean {
  const crypto = require('crypto');

  // Sort params and concatenate
  const data = url + Object.keys(params)
    .sort()
    .reduce((acc, key) => acc + key + params[key], '');

  // Generate HMAC SHA1
  const expectedSignature = crypto
    .createHmac('sha1', authToken)
    .update(Buffer.from(data, 'utf-8'))
    .digest('base64');

  return signature === expectedSignature;
}
