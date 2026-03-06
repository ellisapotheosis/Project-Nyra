import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface CreateLeadDto {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  loanType: 'purchase' | 'refinance';
  propertyValue: string;
  creditScore: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface Lead extends CreateLeadDto {
  id: string;
  status: string;
  createdAt: string;
}

export async function createLead(data: CreateLeadDto): Promise<Lead> {
  try {
    const response = await axios.post(`${API_URL}/api/leads`, data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || 'Failed to submit lead'
      );
    }
    throw error;
  }
}

export async function getLead(id: string): Promise<Lead> {
  try {
    const response = await axios.get(`${API_URL}/api/leads/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || 'Failed to fetch lead'
      );
    }
    throw error;
  }
}
