export function toCampaignContract(payload: any) {
  const steps: Array<Record<string, unknown>> = Array.isArray(payload.steps)
    ? payload.steps
    : [];

  return {
    ...payload,
    loanPurpose: payload.loanPurpose ?? "PURCHASE",
    steps: steps.map((step, index) => ({
      id: String(step.id ?? `step-${index + 1}`),
      channel: toCampaignChannel(step.channel),
      delayMinutes: Number(
        step.delayMinutes ?? step.offsetMinutes ?? Number(step.day ?? 0) * 1440
      ),
      templateId: String(step.templateId ?? `template-${index + 1}`),
      requiresApproval:
        step.requiresApproval === true ||
        step.channel === "voice" ||
        step.channel === "missed_call_ping",
    })),
  };
}

function toCampaignChannel(channel: unknown) {
  switch (channel) {
    case "EMAIL":
    case "email":
      return "EMAIL";
    case "CALL":
    case "voice":
      return "CALL";
    case "VOICEMAIL":
      return "VOICEMAIL";
    case "SMS":
    case "sms":
    case "missed_call_ping":
    default:
      return "SMS";
  }
}
