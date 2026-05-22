// packages/twenty-custom-objects/src/Quote.ts

export const QuoteDefinition = {
  nameSingular: "quote",
  namePlural: "quotes",
  labelSingular: "Quote",
  labelPlural: "Quotes",
  description: "Loan quote with payment breakdown",
  icon: "IconReceipt",

  fields: [
    // Relation
    {
      name: "leadId",
      type: "RELATION",
      label: "Lead",
      target: "mortgageLead",
      required: true,
    },

    // Loan Parameters
    { name: "loanAmount", type: "CURRENCY", label: "Loan Amount" },
    { name: "propertyValue", type: "CURRENCY", label: "Property Value" },
    { name: "ltv", type: "NUMBER", label: "LTV %" },
    { name: "term", type: "NUMBER", label: "Term (Years)", default: 30 },

    // Rate Info
    {
      name: "interestRate",
      type: "NUMBER",
      label: "Interest Rate",
      format: "percentage",
    },
    { name: "apr", type: "NUMBER", label: "APR", format: "percentage" },
    {
      name: "rateType",
      type: "SELECT",
      label: "Rate Type",
      options: ["Fixed", "ARM", "5/1 ARM", "7/1 ARM", "10/1 ARM"],
    },
    { name: "rateSource", type: "TEXT", label: "Rate Source" },
    { name: "rateDate", type: "DATE_TIME", label: "Rate Date" },

    // Payment Breakdown
    { name: "monthlyPI", type: "CURRENCY", label: "Monthly P&I" },
    { name: "monthlyTax", type: "CURRENCY", label: "Monthly Tax" },
    { name: "monthlyInsurance", type: "CURRENCY", label: "Monthly Insurance" },
    { name: "monthlyPMI", type: "CURRENCY", label: "Monthly PMI" },
    { name: "monthlyHOA", type: "CURRENCY", label: "Monthly HOA" },
    { name: "monthlyPITI", type: "CURRENCY", label: "Monthly PITI" },
    { name: "monthlyPayment", type: "CURRENCY", label: "Monthly Payment" },

    // Costs
    { name: "closingCosts", type: "CURRENCY", label: "Closing Costs" },
    { name: "points", type: "NUMBER", label: "Points" },
    { name: "pointsCost", type: "CURRENCY", label: "Points Cost" },
    { name: "lenderCredits", type: "CURRENCY", label: "Lender Credits" },
    { name: "cashToClose", type: "CURRENCY", label: "Cash to Close" },

    // Loan Type
    {
      name: "loanType",
      type: "SELECT",
      label: "Loan Type",
      options: ["Conventional", "FHA", "VA", "USDA", "Jumbo", "NonQM"],
    },
    {
      name: "loanPurpose",
      type: "SELECT",
      label: "Loan Purpose",
      options: ["Purchase", "Refinance", "CashOut", "HELOC"],
    },

    // Quote Meta
    { name: "optionNumber", type: "NUMBER", label: "Option #" },
    { name: "optionLabel", type: "TEXT", label: "Option Label" },
    {
      name: "isRecommended",
      type: "BOOLEAN",
      label: "Recommended",
      default: false,
    },
    { name: "expiresAt", type: "DATE_TIME", label: "Expires At" },

    // Full calculation params
    { name: "paramsJson", type: "RAW_JSON", label: "Full Parameters" },

    // Delivery
    { name: "pngUrl", type: "TEXT", label: "Chart PNG URL" },
    { name: "pdfUrl", type: "TEXT", label: "Quote PDF URL" },
    {
      name: "sentToLead",
      type: "BOOLEAN",
      label: "Sent to Lead",
      default: false,
    },
    { name: "sentAt", type: "DATE_TIME", label: "Sent At" },
    {
      name: "sentVia",
      type: "SELECT",
      label: "Sent Via",
      options: ["Email", "SMS", "Both"],
    },

    // Approval (REQUIRED for rate advice)
    {
      name: "requiresApproval",
      type: "BOOLEAN",
      label: "Requires Approval",
      default: true,
    },
    {
      name: "approvalStatus",
      type: "SELECT",
      label: "Approval Status",
      options: ["Pending", "Approved", "Rejected"],
    },
    { name: "approvedBy", type: "TEXT", label: "Approved By" },
    { name: "approvedAt", type: "DATE_TIME", label: "Approved At" },
    { name: "approvalNotes", type: "TEXT", label: "Approval Notes" },
  ],
};
