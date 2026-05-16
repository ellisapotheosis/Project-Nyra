// Core Types
export interface User {
  id: string
  name: string
  email: string
  role: 'loan_officer' | 'admin' | 'processor'
  avatar?: string
  phone?: string
}

export interface Client {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  status: 'lead' | 'active' | 'pending' | 'closed'
  createdAt: string
  updatedAt: string
  loanOfficerId: string
  address?: string
  creditScore?: number
  annualIncome?: number
}

export interface Document {
  id: string
  name: string
  type: 'income' | 'identity' | 'asset' | 'credit' | 'other'
  size: number
  uploadedAt: string
  uploadedBy: string
  clientId: string
  applicationId?: string
  url: string
  status: 'pending' | 'verified' | 'rejected'
}

export interface Application {
  id: string
  clientId: string
  loanAmount: number
  loanType: 'conventional' | 'fha' | 'va' | 'jumbo' | 'other'
  status: ApplicationStatus
  stage: ApplicationStage
  createdAt: string
  updatedAt: string
  estimatedCloseDate?: string
  interestRate?: number
  propertyAddress?: string
  propertyValue?: number
}

export type ApplicationStatus =
  | 'draft'
  | 'submitted'
  | 'processing'
  | 'underwriting'
  | 'approved'
  | 'denied'
  | 'closed'

export type ApplicationStage =
  | 'application'
  | 'documentation'
  | 'processing'
  | 'underwriting'
  | 'closing'
  | 'funded'

export interface Task {
  id: string
  title: string
  description: string
  status: 'todo' | 'in_progress' | 'completed' | 'blocked'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assigneeId: string
  clientId?: string
  applicationId?: string
  dueDate?: string
  createdAt: string
  updatedAt: string
  tags?: string[]
}

export interface Appointment {
  id: string
  title: string
  description?: string
  startTime: string
  endTime: string
  clientId?: string
  attendees: string[]
  location?: string
  type: 'call' | 'meeting' | 'closing' | 'other'
  status: 'scheduled' | 'completed' | 'cancelled'
  createdAt: string
}

export interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  read: boolean
  createdAt: string
  actionUrl?: string
  actionLabel?: string
}

export interface DashboardMetrics {
  totalClients: number
  activeApplications: number
  pendingTasks: number
  upcomingAppointments: number
  closedLoansThisMonth: number
  totalLoanVolume: number
  averageProcessingTime: number
  conversionRate: number
}

export interface ChartData {
  name: string
  value: number
  [key: string]: string | number
}
