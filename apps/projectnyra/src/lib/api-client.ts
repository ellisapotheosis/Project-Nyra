import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Lead operations
export const leadApi = {
  async getAll() {
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(lead: any) {
    const { data, error } = await supabase
      .from("leads")
      .insert([lead])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabase
      .from("leads")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase.from("leads").delete().eq("id", id);
    if (error) throw error;
  },
};

// Campaign operations
export const campaignApi = {
  async getAll() {
    const { data, error } = await supabase
      .from("campaigns")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from("campaigns")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(campaign: any) {
    const { data, error } = await supabase
      .from("campaigns")
      .insert([campaign])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabase
      .from("campaigns")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

// Quote operations
export const quoteApi = {
  async getAll() {
    const { data, error } = await supabase
      .from("quotes")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },

  async create(quote: any) {
    const { data, error } = await supabase
      .from("quotes")
      .insert([quote])
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

// Event operations
export const eventApi = {
  async log(event: any) {
    const { data, error } = await supabase
      .from("events")
      .insert([event])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getRecent(limit = 50) {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data;
  },
};

// Compliance event operations
export const complianceApi = {
  async logEvent(event: any) {
    const { data, error } = await supabase
      .from("compliance_events")
      .insert([event])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getByLead(leadId: string) {
    const { data, error } = await supabase
      .from("compliance_events")
      .select("*")
      .eq("lead_id", leadId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },
};
