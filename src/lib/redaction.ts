import { DEFAULT_REDACTION_KEYS } from './constants';

const EMAIL_REGEX = /[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/gi;
const CREDIT_CARD_REGEX = /\b(?:\d{4}[ -]?){3}\d{4}\b/g;
const AUTH_HEADER_REGEX = /(Bearer\s+|Basic\s+|Token\s+)[A-Za-z0-9\-._~+/]+=*/gi;

/**
 * Recursively sanitize and redact sensitive keys and values from telemetry traces
 */
export function redactData(input: any, customKeys: string[] = []): any {
  if (input === null || input === undefined) {
    return input;
  }

  const keysToRedact = new Set(
    [...DEFAULT_REDACTION_KEYS, ...customKeys].map((k) => k.toLowerCase())
  );

  if (typeof input === 'string') {
    let sanitized = input;
    // Redact credit cards
    sanitized = sanitized.replace(CREDIT_CARD_REGEX, '[REDACTED_CREDIT_CARD]');
    // Redact bearer / auth tokens
    sanitized = sanitized.replace(AUTH_HEADER_REGEX, '$1[REDACTED_TOKEN]');
    // Redact emails if requested
    if (keysToRedact.has('email')) {
      sanitized = sanitized.replace(EMAIL_REGEX, '[REDACTED_EMAIL]');
    }
    return sanitized;
  }

  if (Array.isArray(input)) {
    return input.map((item) => redactData(item, customKeys));
  }

  if (typeof input === 'object') {
    const output: Record<string, any> = {};
    for (const [key, value] of Object.entries(input)) {
      const lowerKey = key.toLowerCase();
      const shouldRedactKey = Array.from(keysToRedact).some((k) =>
        lowerKey.includes(k)
      );

      if (shouldRedactKey) {
        output[key] = '[REDACTED]';
      } else {
        output[key] = redactData(value, customKeys);
      }
    }
    return output;
  }

  return input;
}
