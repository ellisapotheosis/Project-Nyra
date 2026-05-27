#!/usr/bin/env node
/**
 * N8N Drip Campaign Workflow Generator
 * Generates 30 daily drip campaign workflow JSON files for mortgage lead nurturing
 *
 * Usage: node generate-drip-workflows.js
 * Output: Creates drip-campaign-day1.json through drip-campaign-day30.json
 */

const fs = require("fs");
const path = require("path");

// Campaign content strategy by day ranges
const campaignStrategies = {
  week1: {
    range: [1, 7],
    focus: "Onboarding & Education",
    frequency: "daily",
    priority: "high",
    channels: ["sms", "email"],
  },
  week2: {
    range: [8, 14],
    focus: "Document Collection & Pre-approval",
    frequency: "every-2-days",
    priority: "high",
    channels: ["email", "sms"],
  },
  week3: {
    range: [15, 21],
    focus: "Rate Lock & Urgency",
    frequency: "every-2-days",
    priority: "critical",
    channels: ["sms", "email", "call"],
  },
  week4: {
    range: [22, 30],
    focus: "Re-engagement & Final Push",
    frequency: "every-3-days",
    priority: "normal",
    channels: ["email"],
  },
};

// Day-specific message templates
const messageTemplates = {
  1: {
    subject: "🏠 Welcome to Your Mortgage Journey!",
    sms: "Hi {{firstName}}! 👋 Welcome to Day 1 of your mortgage journey! Your dedicated loan officer will contact you today. Reply YES to connect now!",
    theme: "welcome",
    cta: "Access Your Portal",
  },
  2: {
    subject: "Your Complete Document Checklist is Here",
    sms: "{{firstName}}, ready to speed up approval? Check your email for the complete document checklist. Reply DOCS for quick access.",
    theme: "education",
    cta: "View Document Checklist",
  },
  3: {
    subject: "Day 3: Understanding Your Mortgage Options",
    sms: "Quick tip {{firstName}}: Know the difference? 30-year = Lower payments. 15-year = Less interest. Let's find your best fit!",
    theme: "education",
    cta: "Compare Loan Options",
  },
  5: {
    subject: "📊 Your Personalized Rate Quote Inside",
    sms: "{{firstName}}, great news! Your personalized rate quote is ready. Check email now or reply RATE for instant access.",
    theme: "rate-update",
    cta: "View Your Rate",
  },
  7: {
    subject: "🎉 Week 1 Complete! Here's What's Next",
    sms: "Congrats {{firstName}}! You've completed Week 1. Most approvals happen by Week 2-3. Need help? Reply HELP.",
    theme: "milestone",
    cta: "See Your Progress",
  },
  10: {
    subject: "Pre-Approval: Your Secret Weapon",
    sms: "{{firstName}}, did you know? Pre-approved buyers close 40% faster! Ready to get pre-approved? Reply YES.",
    theme: "education",
    cta: "Get Pre-Approved",
  },
  14: {
    subject: "🏁 2 Weeks In: Let's Accelerate Your Approval",
    sms: "2-week milestone {{firstName}}! You're halfway through the typical approval timeline. What can we do to help you close faster?",
    theme: "milestone",
    cta: "Schedule Strategy Call",
  },
  17: {
    subject: "Success Story: From Application to Approval in 10 Days",
    sms: "{{firstName}}, meet Sarah who got approved in just 10 days! Want to know her secret? Check your email.",
    theme: "social-proof",
    cta: "Read Success Story",
  },
  21: {
    subject: "⚠️ Rate Alert: Lock In Before Rates Rise",
    sms: "URGENT {{firstName}}: Rates may increase this week. Lock in your rate today to protect your budget! Reply LOCK.",
    theme: "urgency",
    cta: "Lock Your Rate Now",
  },
  24: {
    subject: "Your Mortgage Questions Answered",
    sms: "{{firstName}}, we've compiled answers to the top 10 mortgage questions. Check your email for the FAQ guide!",
    theme: "education",
    cta: "Read FAQ Guide",
  },
  28: {
    subject: "⏰ Final Reminder: Special Rate Expires Soon",
    sms: "{{firstName}}, this is it! Your special rate expires in 48 hours. Don't miss out - reply NOW to secure it.",
    theme: "urgency",
    cta: "Claim Your Rate",
  },
  30: {
    subject: "💙 We're Still Here to Help You, {{firstName}}",
    sms: "{{firstName}}, it's been a month since you started your mortgage journey. We're still here to help. Reply YES to reconnect.",
    theme: "re-engagement",
    cta: "Let's Reconnect",
  },
};

// Generate default message for days without specific template
function generateDefaultMessage(day) {
  const isOdd = day % 2 === 1;

  if (day <= 7) {
    return {
      subject: `Day ${day}: Your Mortgage Progress Update`,
      sms: `Hi {{firstName}}! Day ${day} update: Keep gathering those documents. Reply HELP if you need assistance.`,
      theme: "education",
      cta: "Check Your Progress",
    };
  } else if (day <= 14) {
    return {
      subject: `Day ${day}: Pre-Approval Status Update`,
      sms: `{{firstName}}, Day ${day}! How's document collection going? Reply DONE when ready for review.`,
      theme: "progress",
      cta: "Upload Documents",
    };
  } else if (day <= 21) {
    return {
      subject: `Day ${day}: Rate Lock Reminder`,
      sms: `{{firstName}}, protecting your rate is important. Check today's rates and consider locking. Reply RATE.`,
      theme: "rate-update",
      cta: "View Today's Rates",
    };
  } else {
    return {
      subject: `Day ${day}: Still Interested in Your Mortgage?`,
      sms: `Hi {{firstName}}, just checking in! How can we help you move forward? Reply with your questions.`,
      theme: "re-engagement",
      cta: "Contact Your Officer",
    };
  }
}

// Generate workflow JSON for a specific day
function generateWorkflow(day) {
  const template = messageTemplates[day] || generateDefaultMessage(day);

  return {
    name: `Drip Campaign - Day ${day}`,
    nodes: [
      {
        parameters: {
          rule: {
            interval: [
              {
                field: "cronExpression",
                expression: "0 10 * * *",
              },
            ],
          },
        },
        id: "cron-trigger",
        name: `Schedule - Day ${day}`,
        type: "n8n-nodes-base.scheduleTrigger",
        typeVersion: 1,
        position: [250, 300],
      },
      {
        parameters: {
          operation: "executeQuery",
          query: `SELECT l.*, lc.created_at as campaign_start FROM leads l JOIN lead_campaigns lc ON l.id = lc.lead_id WHERE lc.status = 'active' AND DATE(lc.created_at) = CURRENT_DATE - INTERVAL '${day} days' AND lc.day${day}_sent = false ORDER BY l.lead_score DESC`,
        },
        id: `fetch-day${day}-leads`,
        name: `Fetch Day ${day} Leads`,
        type: "n8n-nodes-base.postgres",
        typeVersion: 2,
        position: [450, 300],
        credentials: {
          postgres: {
            id: "orchestrator_db",
            name: "Orchestrator PostgreSQL",
          },
        },
      },
      {
        parameters: {
          operation: "sendSms",
          from: "={{ $env.TWILIO_PHONE_NUMBER }}",
          to: "={{ $json.phone }}",
          message: template.sms,
        },
        id: "send-sms",
        name: `Send Day ${day} SMS`,
        type: "n8n-nodes-base.twilio",
        typeVersion: 1,
        position: [650, 300],
        credentials: {
          twilioApi: {
            id: "twilio_account",
            name: "Twilio Account",
          },
        },
      },
      {
        parameters: {
          fromEmail: "={{ $env.SMTP_FROM_EMAIL }}",
          toEmail: "={{ $json.email }}",
          subject: template.subject,
          emailType: "html",
          message: `<!DOCTYPE html><html><body style="font-family: Arial, sans-serif;"><div style="max-width: 600px; margin: 0 auto;"><div style="background: #667eea; color: white; padding: 30px; text-align: center;"><h1>Day ${day}</h1><p>${template.subject}</p></div><div style="padding: 30px;"><p>Hi {{$json.first_name}},</p><p>This is day ${day} of your mortgage journey. We're here to help you every step of the way!</p><a href="{{$env.CRM_URL}}/portal/{{$json.id}}" style="display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0;">${template.cta}</a></div></div></body></html>`,
        },
        id: "send-email",
        name: `Send Day ${day} Email`,
        type: "n8n-nodes-base.emailSend",
        typeVersion: 2,
        position: [850, 300],
        credentials: {
          smtp: {
            id: "smtp_account",
            name: "SMTP Account",
          },
        },
      },
      {
        parameters: {
          operation: "executeQuery",
          query: `UPDATE lead_campaigns SET day${day}_sent = true, last_touchpoint = NOW() WHERE lead_id = $1`,
          additionalFields: {
            queryParameters: "={{ JSON.stringify([$json.id]) }}",
          },
        },
        id: `mark-day${day}-sent`,
        name: `Mark Day ${day} Sent`,
        type: "n8n-nodes-base.postgres",
        typeVersion: 2,
        position: [1050, 300],
        credentials: {
          postgres: {
            id: "orchestrator_db",
            name: "Orchestrator PostgreSQL",
          },
        },
      },
      {
        parameters: {
          url: "={{ $env.CRM_API_URL }}/api/activities",
          authentication: "predefinedCredentialType",
          nodeCredentialType: "httpHeaderAuth",
          sendHeaders: true,
          headerParameters: {
            parameters: [
              {
                name: "Authorization",
                value: "={{ 'Bearer ' + $env.CRM_API_KEY }}",
              },
            ],
          },
          method: "POST",
          sendBody: true,
          specifyBody: "json",
          jsonBody: `={{ JSON.stringify({ leadId: $json.id, type: 'drip-campaign', day: ${day}, theme: '${template.theme}', timestamp: new Date().toISOString() }) }}`,
        },
        id: "log-to-crm",
        name: "Log Activity to CRM",
        type: "n8n-nodes-base.httpRequest",
        typeVersion: 3,
        position: [1250, 300],
      },
    ],
    connections: {
      [`Schedule - Day ${day}`]: {
        main: [[{ node: `Fetch Day ${day} Leads`, type: "main", index: 0 }]],
      },
      [`Fetch Day ${day} Leads`]: {
        main: [[{ node: `Send Day ${day} SMS`, type: "main", index: 0 }]],
      },
      [`Send Day ${day} SMS`]: {
        main: [[{ node: `Send Day ${day} Email`, type: "main", index: 0 }]],
      },
      [`Send Day ${day} Email`]: {
        main: [[{ node: `Mark Day ${day} Sent`, type: "main", index: 0 }]],
      },
      [`Mark Day ${day} Sent`]: {
        main: [[{ node: "Log Activity to CRM", type: "main", index: 0 }]],
      },
    },
    active: true,
    settings: {
      executionOrder: "v1",
    },
    tags: [
      {
        id: `drip-day${day}`,
        name: `Day ${day}`,
      },
      {
        id: template.theme,
        name: template.theme,
      },
    ],
    meta: {
      instanceId: "orchestrator-mini",
    },
  };
}

// Main execution
function main() {
  console.log("🚀 Generating N8N Drip Campaign Workflows...\n");

  const outputDir = __dirname;
  let successCount = 0;
  let errorCount = 0;

  for (let day = 1; day <= 30; day++) {
    try {
      const workflow = generateWorkflow(day);
      const filename = `drip-campaign-day${day}.json`;
      const filepath = path.join(outputDir, filename);

      fs.writeFileSync(filepath, JSON.stringify(workflow, null, 2));
      console.log(`✅ Generated: ${filename}`);
      successCount++;
    } catch (error) {
      console.error(`❌ Error generating day ${day}: ${error.message}`);
      errorCount++;
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Successfully generated: ${successCount} workflows`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log(`\n✨ All drip campaign workflows have been generated!`);
  console.log(`📁 Location: ${outputDir}`);
}

// Run the generator
if (require.main === module) {
  main();
}

module.exports = { generateWorkflow, messageTemplates, campaignStrategies };
