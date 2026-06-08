export interface RateHunterLeadData {
  loanPurpose: string;
  propertyType: string;
  occupancy: string;
  propertyValue: number;
  downPayment: number;
  creditScore: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export function buildLeadIngestionPayload(
  data: RateHunterLeadData,
  consentTimestamp = new Date().toISOString()
) {
  const firstName = requiredText(data.firstName, "First name");
  const lastName = requiredText(data.lastName, "Last name");
  const email = requiredText(data.email, "Email");
  const phone = optionalText(data.phone);

  return {
    firstName,
    lastName,
    email,
    ...(phone ? { phone } : {}),
    loanPurpose: data.loanPurpose,
    loanAmount: data.propertyValue - data.downPayment,
    propertyValue: data.propertyValue,
    downPayment: data.downPayment,
    creditScore: data.creditScore,
    propertyType: data.propertyType,
    occupancy: data.occupancy,
    source: "RATEHUNTER_LANDING",
    consentEmail: true,
    consentSms: true,
    consentVoice: true,
    consentTimestamp,
    metadata: {
      consentTimestamp,
      loanPurpose: data.loanPurpose,
      loanAmount: data.propertyValue - data.downPayment,
      propertyValue: data.propertyValue,
      downPayment: data.downPayment,
      creditScore: data.creditScore,
      propertyType: data.propertyType,
      occupancy: data.occupancy,
    },
  };
}

function optionalText(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function requiredText(value: string, label: string) {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    throw new Error(`${label} is required for lead ingestion.`);
  }
  return trimmed;
}
