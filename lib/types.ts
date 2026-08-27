export interface ClientUser {
  id: number;
  client_id: string;
  email: string;
  password_hash: string;
  name: string;
  role: 'owner' | 'staff';
  is_active: boolean;
  last_login_at?: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface Client {
  client_id: string;
  channel_account_id?: string | null;
  business_name: string;
  channel?: string | null;
  status?: string | null;
  plan_id?: string | null;
  owner_phone?: string | null;
  owner_email?: string | null;
  reply_tone?: string | null;
  service_type?: string | null;
  timezone?: string | null;
  language?: string | null;
  crm_webhook_url?: string | null;
  storage_destination?: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface Plan {
  plan_id: string;
  name: string;
  monthly_chat_limit: number;
  allowed_channels: string[];
  allowed_message_types: string[];
  enabled_modules: Record<string, boolean>;
  lead_fields: string[];
  ai_level?: string | null;
  memory_level?: string | null;
  order_capture_enabled: boolean;
  human_handoff_enabled: boolean;
  storage_level?: string | null;
  crm_enabled: boolean;
  is_active: boolean;
}

export interface ClientSettings {
  client_id: string;
  service_description?: string | null;
  pricing_rules?: string | null;
  coverage_rules?: string | null;
  booking_requirements?: string | null;
  fallback_response?: string | null;
  escalation_keyword?: string | null;
  human_agent_phone?: string | null;
  booking_required_fields: string[];
}

export interface KnowledgeBaseSection {
  id: number;
  client_id: string;
  section_key: string;
  content: string;
  enabled: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ChannelIntegration {
  id: number;
  client_id: string;
  platform: string;
  status: string;
  external_account_id?: string | null;
  external_account_name?: string | null;
  facebook_page_id?: string | null;
  instagram_account_id?: string | null;
  whatsapp_phone_number_id?: string | null;
  waba_id?: string | null;
  webhook_status?: string | null;
  last_validated_at?: Date | null;
}

export interface Conversation {
  id: number;
  client_id: string;
  business_name?: string | null;
  customer_id?: string | null;
  from_phone?: string | null;
  channel?: string | null;
  message_id?: string | null;
  message_type?: string | null;
  message_text?: string | null;
  public_customer_reply?: string | null;
  direction?: string | null;
  block_reason?: string | null;
  order_confirmed?: boolean | null;
  current_month?: string | null;
  metadata?: any;
  created_at: Date;
}

export interface LeadOrder {
  id: number;
  client_id: string;
  business_name?: string | null;
  customer_id?: string | null;
  from_phone?: string | null;
  channel?: string | null;
  message_id?: string | null;
  message_type?: string | null;
  message_text?: string | null;
  public_customer_reply?: string | null;
  order_confirmed?: boolean | null;
  lead_status?: string | null;
  order_status?: string | null;
  order_payload?: any;
  assigned_staff?: string | null;
  notes?: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface UsageCounter {
  id: number;
  client_id: string;
  month: string;
  used_chats: number;
  monthly_limit: number;
}

export interface TokenPayload {
  userId: number;
  email: string;
  name: string;
  role: 'owner' | 'staff';
  clientId: string;
}

export interface DashboardStats {
  totalConversations: number;
  totalLeads: number;
  totalOrders: number;
  usedChats: number;
  monthlyLimit: number;
  recentActivity: Array<{
    type: string;
    description: string;
    timestamp: Date;
    channel?: string;
  }>;
}
