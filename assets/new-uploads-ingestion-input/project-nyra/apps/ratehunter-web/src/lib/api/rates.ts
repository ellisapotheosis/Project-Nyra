import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface Rate {
  id: string;
  loanType: string;
  term: string;
  rate: number;
  apr: number;
  points: number;
  monthlyPayment: string;
  updatedAt: string;
}

export async function getRates(): Promise<Rate[]> {
  try {
    const response = await axios.get(`${API_URL}/api/rates`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || 'Failed to fetch rates'
      );
    }
    throw error;
  }
}

export async function getRateById(id: string): Promise<Rate> {
  try {
    const response = await axios.get(`${API_URL}/api/rates/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || 'Failed to fetch rate'
      );
    }
    throw error;
  }
}
