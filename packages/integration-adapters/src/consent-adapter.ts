import type { ConsentStatus } from "@nyra/domain-models";

/**
 * Maps CRM boolean consent fields to the domain ConsentStatus enum.
 * Twenty CRM stores consent as booleans; the domain model uses a typed enum.
 */
export function booleanToConsentStatus(
  value: boolean | null | undefined
): ConsentStatus {
  if (value === true) return "OPTED_IN";
  if (value === false) return "OPTED_OUT";
  return "UNKNOWN";
}

/**
 * Maps a ConsentStatus enum value back to a CRM boolean.
 */
export function consentStatusToBoolean(
  status: ConsentStatus | undefined
): boolean | null {
  if (status === "OPTED_IN") return true;
  if (status === "OPTED_OUT" || status === "DO_NOT_CONTACT") return false;
  return null;
}

export interface CrmConsentFields {
  consentEmail?: boolean | null;
  consentSms?: boolean | null;
  consentVoice?: boolean | null;
}

/**
 * Transforms CRM boolean consent fields into domain ConsentStatus values.
 * Use this when reading lead data from Twenty CRM before passing to compliance checks.
 */
export function mapCrmConsent(crmFields: CrmConsentFields): {
  consentEmail?: ConsentStatus;
  consentSms?: ConsentStatus;
  consentVoice?: ConsentStatus;
} {
  return {
    consentEmail:
      crmFields.consentEmail != null
        ? booleanToConsentStatus(crmFields.consentEmail)
        : undefined,
    consentSms:
      crmFields.consentSms != null
        ? booleanToConsentStatus(crmFields.consentSms)
        : undefined,
    consentVoice:
      crmFields.consentVoice != null
        ? booleanToConsentStatus(crmFields.consentVoice)
        : undefined,
  };
}
