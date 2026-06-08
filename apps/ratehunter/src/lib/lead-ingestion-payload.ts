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
  return {
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    phone: data.phone,
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
