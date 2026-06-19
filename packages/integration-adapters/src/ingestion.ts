import { LeadSchema, type Lead } from "@nyra/domain-models";

/**
 * Capitalizes the first letter of each word in a string, handling hyphens and spaces.
 */
function capitalizeName(name: string): string {
  return name
    .trim()
    .split(/(\s+|-)/) // Keep the separators (spaces and hyphens) so we can reconstruct the string
    .map((part) => {
      if (part.match(/^\s+$/) || part === "-") {
        return part;
      }
      if (part.length === 0) {
        return part;
      }
      return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
    })
    .join("");
}

/**
 * Normalizes phone numbers to standard E.164 format.
 * Currently assumes US/Canada format if 10 digits are provided.
 */
function normalizePhone(phone?: string): string | undefined {
  if (!phone) {
    return undefined;
  }

  const cleaned = phone.replace(/[^\d+]/g, "").trim();

  if (cleaned.length === 0) {
    return undefined;
  }

  // 10 digits -> assumed US (+1 prefix)
  if (cleaned.length === 10 && !cleaned.startsWith("+")) {
    return `+1${cleaned}`;
  }

  // 11 digits starting with 1 -> assumed US (+ prefix)
  if (
    cleaned.length === 11 &&
    cleaned.startsWith("1") &&
    !cleaned.startsWith("+")
  ) {
    return `+${cleaned}`;
  }

  // Already has +, keep it if it looks valid
  if (cleaned.startsWith("+") && cleaned.length >= 8) {
    return cleaned;
  }

  return cleaned;
}

/**
 * Normalizes raw lead data before ingestion.
 */
export function normalizeLeadData(raw: any): Lead {
  return {
    ...raw,
    firstName: raw.firstName ? capitalizeName(raw.firstName) : "",
    lastName: raw.lastName ? capitalizeName(raw.lastName) : "",
    email: raw.email ? raw.email.trim().toLowerCase() : "",
    phone: normalizePhone(raw.phone),
    source: raw.source ? raw.source.trim() : "Website",
    consentStatus: raw.consentStatus || "UNKNOWN",
  };
}

/**
 * Validates normalized lead data before ingestion, enforcing schema and compliance constraints.
 */
export function validateLeadIngestion(lead: Lead): {
  isValid: boolean;
  errors?: string[];
} {
  // 1. Compliance/Consent check
  if (
    lead.consentStatus === "OPTED_OUT" ||
    lead.consentStatus === "DO_NOT_CONTACT"
  ) {
    return {
      isValid: false,
      errors: [
        "Cannot ingest lead with OPTED_OUT or DO_NOT_CONTACT consent status",
      ],
    };
  }

  // 2. Zod Schema Validation
  const parseResult = LeadSchema.safeParse(lead);
  if (!parseResult.success) {
    const errors = parseResult.error.issues.map((err) => {
      if (err.path.length > 0) {
        return `${err.path.join(".")}: ${err.message}`;
      }
      return err.message;
    });
    return {
      isValid: false,
      errors,
    };
  }

  return { isValid: true };
}
