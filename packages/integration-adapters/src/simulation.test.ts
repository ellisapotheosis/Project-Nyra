import { describe, it, expect } from 'vitest';
import {
  MockTwentyClient,
  MockLettaClient,
  ClassificationService,
  CampaignManager,
  AuditLogger,
  MockActivepiecesClient,
  RoutingService,
  ApprovalService,
  PaperclipGovernor,
  MockVoicemodClient
} from './index';

/**
 * Portable Ingestion logic for simulation
 */
class SimulationIngestion {
  constructor(private crm: any, private orchestrator: any) {}
  async ingest(payload: any) {
    const lead = await this.crm.upsertLead({
      firstName: payload.first_name,
      lastName: payload.last_name,
      email: payload.email,
      source: payload.source
    });
    await this.orchestrator.syncContext(lead.id, { interest: 'MORTGAGE' });
    return lead;
  }
}

describe('Foundation Simulation', () => {
  it('should execute the end-to-end mortgage lead flow with governance and voice', async () => {
    console.log("🎬 Starting Project Nyra Foundation Simulation...\n");

    // 1. Initialize logic components
    const crm = new MockTwentyClient();
    const orchestrator = new MockLettaClient();
    const audit = new AuditLogger(crm);
    const ingestion = new SimulationIngestion(crm, orchestrator);

    // Use the Mock Activepieces client to ensure test stability
    const workflowClient = new MockActivepiecesClient();
    const campaignManager = new CampaignManager(workflowClient);

    // 2. Simulation Step: Raw Lead Ingestion
    const rawLead = {
      first_name: "Simulation",
      last_name: "Lead",
      email: "sim@example.com",
      phone: "5550001111",
      source: "WEB_INQUIRY",
      message: "I need a quote for a 30-year fixed mortgage at 400k."
    };

    console.log("Step 1: Ingesting Raw Lead...");
    const savedLead = await ingestion.ingest(rawLead);
    expect(savedLead.id).toBeDefined();
    console.log(`✅ Lead Ingested: ${savedLead.firstName} ${savedLead.lastName} (ID: ${savedLead.id})`);

    // 3. Simulation Step: Classification
    console.log("\nStep 2: Classifying Intent...");
    const classification = ClassificationService.classify(rawLead.message);
    expect(classification.type).toBe('QUOTE_REQUEST');
    console.log(`✅ Classification: ${classification.type} (Confidence: ${classification.confidence})`);

    // 4. Simulation Step: Campaign Sync
    console.log("\nStep 3: Syncing to Campaign...");
    savedLead.stage = 'NEW';
    await campaignManager.syncLeadToCampaign(savedLead);
    console.log("✅ Lead enrolled in 'new-internet-lead' campaign.");

    // 5. Simulation Step: Letta Coordination
    console.log("\nStep 4: Orchestrating via Letta...");
    await orchestrator.triggerAgent('nyra-5090-worker', 'Draft initial 3-option quote for new lead.');

    // 6. Simulation Step: Task Routing
    console.log("\nStep 5: Routing Tasks...");
    const router = new RoutingService();
    const targetNode = router.route('Complex Refinance Analysis', 'BORROWER_COMMUNICATION');
    console.log(`✅ Task routed to: ${targetNode.hostname} (Role: ${targetNode.role})`);

    // 7. Simulation Step: Approval Gate
    console.log("\nStep 6: Human Approval Gate...");
    const approvals = new ApprovalService(audit);
    const isApproved = await approvals.requestApproval('Send SMS Quote to Borrower', 'AGENT_NYRA');
    expect(isApproved).toBe(true);
    console.log(`✅ Communication Approved and Audited.`);

    // 8. Simulation Step: Paperclip Governance Audit
    console.log("\nStep 7: Paperclip Governance Audit...");
    const governor = new PaperclipGovernor(audit);
    const govResult = await governor.auditProposal("I can get you a 6.5% rate today!", { leadId: savedLead.id, hasQuote: false });
    expect(govResult.allowed).toBe(false);
    console.log(`✅ Hallucination Blocked: ${govResult.reasoning}`);

    // 9. Simulation Step: Voice Profile Calibration
    console.log("\nStep 8: Voice Profile Calibration (Voicemod)...");
    const voicemod = new MockVoicemodClient();
    await voicemod.setVoice('broker_pro');
    console.log("✅ Voice profile 'broker_pro' calibrated for physical worker node.");

    console.log("\n🏁 Simulation Complete. Every foundation component responded successfully.");
  });
});
