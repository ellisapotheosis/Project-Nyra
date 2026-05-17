import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

export interface Lead {
  id: string;
  crmRecordId: string;
  source: string;
  stage: string;
  ownerId: string;
  leadScore: number;
  loanPurpose: string;
  loanAmount: number;
  propertyValue: number;
  createdAt: string;
  updatedAt: string;
}

export interface Campaign {
  id: string;
  name: string;
  version: number;
  status: "draft" | "active" | "paused" | "archived";
  loanPurpose: string;
  createdBy: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Quote {
  id: string;
  leadId: string;
  status: "draft" | "sent" | "viewed" | "accepted" | "rejected";
  createdAt: string;
  expiresAt: string;
  updatedAt: string;
}

export interface ComplianceEvent {
  id: string;
  decision: "allow" | "block" | "require_approval";
  reason: string;
  policyVersion: string;
  channel: string;
  leadId: string;
  timestamp: string;
}
