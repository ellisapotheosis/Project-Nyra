import { Twilio } from 'twilio';

export interface TwilioConfig {
  accountSid: string;
  authToken: string;
  phoneNumber: string;
  apiKey?: string;
  apiSecret?: string;
}

export interface SMSMessage {
  to: string;
  from: string;
  body: string;
  mediaUrl?: string[];
  statusCallback?: string;
  messagingServiceSid?: string;
}

export interface SMSResponse {
  sid: string;
  status: string;
  to: string;
  from: string;
  body: string;
  dateCreated: Date;
  dateSent?: Date;
  errorCode?: number;
  errorMessage?: string;
  price?: string;
  priceUnit?: string;
}

export interface VoiceCallParams {
  to: string;
  from: string;
  url: string;
  method?: 'GET' | 'POST';
  statusCallback?: string;
  statusCallbackMethod?: 'GET' | 'POST';
  timeout?: number;
  record?: boolean;
  recordingStatusCallback?: string;
}

export interface VoiceCallResponse {
  sid: string;
  status: string;
  to: string;
  from: string;
  direction: string;
  dateCreated: Date;
  duration?: string;
  price?: string;
  priceUnit?: string;
}

export interface IVRConfig {
  welcomeMessage: string;
  menuOptions: IVRMenuOption[];
  defaultRoute?: string;
  invalidInputMessage?: string;
  maxRetries?: number;
}

export interface IVRMenuOption {
  digit: string;
  action: 'forward' | 'voicemail' | 'hangup' | 'submenu' | 'queue';
  destination?: string;
  message?: string;
  submenu?: IVRConfig;
}

export interface CallRecording {
  sid: string;
  callSid: string;
  accountSid: string;
  duration: string;
  status: string;
  channels: number;
  uri: string;
  dateCreated: Date;
  price?: string;
  priceUnit?: string;
}

export interface ConversationMessage {
  id: string;
  conversationId: string;
  from: string;
  to: string;
  body: string;
  direction: 'inbound' | 'outbound';
  status: string;
  timestamp: Date;
  mediaUrls?: string[];
}

export interface Conversation {
  id: string;
  phoneNumber: string;
  contactName?: string;
  status: 'active' | 'closed';
  messages: ConversationMessage[];
  startedAt: Date;
  lastMessageAt: Date;
  metadata?: Record<string, any>;
}

export interface PhoneNumber {
  sid: string;
  phoneNumber: string;
  friendlyName: string;
  capabilities: {
    voice: boolean;
    sms: boolean;
    mms: boolean;
    fax: boolean;
  };
  status: 'active' | 'inactive';
  dateCreated: Date;
  monthlyPrice?: string;
  priceUnit?: string;
}

export interface WebhookPayload {
  MessageSid?: string;
  AccountSid: string;
  From: string;
  To: string;
  Body?: string;
  NumMedia?: string;
  MediaUrl0?: string;
  CallSid?: string;
  CallStatus?: string;
  Direction?: string;
  Digits?: string;
  RecordingUrl?: string;
  RecordingSid?: string;
  RecordingDuration?: string;
}

export interface CallAnalytics {
  totalCalls: number;
  completedCalls: number;
  failedCalls: number;
  averageDuration: number;
  totalDuration: number;
  totalCost: number;
  callsByStatus: Record<string, number>;
  callsByDirection: Record<string, number>;
  peakHours: Record<string, number>;
}

export interface SMSAnalytics {
  totalMessages: number;
  sentMessages: number;
  deliveredMessages: number;
  failedMessages: number;
  totalCost: number;
  messagesByStatus: Record<string, number>;
  messagesByDirection: Record<string, number>;
  averageResponseTime?: number;
}

export interface CostTracking {
  period: {
    start: Date;
    end: Date;
  };
  voice: {
    totalCalls: number;
    totalMinutes: number;
    totalCost: number;
    costPerMinute: number;
  };
  sms: {
    totalMessages: number;
    totalCost: number;
    costPerMessage: number;
  };
  recording: {
    totalRecordings: number;
    totalDuration: number;
    totalCost: number;
  };
  phoneNumbers: {
    totalNumbers: number;
    monthlyCost: number;
  };
  totalCost: number;
}

export interface TwilioWebhookRequest extends Express.Request {
  twilioSignature?: string;
  body: WebhookPayload;
}

export type TwilioClient = Twilio;
