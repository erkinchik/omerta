import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Session {
  id: string;
  type: 'COMMON_HALL' | 'CABIN';
  stationId: string;
  startTime: string;
  endTime?: string;
  items: SessionItem[];
  isActive: boolean;
  playTimePrice?: number;
  totalBill?: number;
}

export interface SessionItem {
  name: string;
  price: number;
  quantity: number;
}

export interface StartSessionRequest {
  type: 'COMMON_HALL' | 'CABIN';
  stationId: string;
  startTime?: string; // ISO 8601 format
  durationMinutes?: number; // Duration in minutes
}

export interface StopSessionRequest {
  sessionId: string;
}

export interface AddItemRequest {
  name: string;
  price: number;
  quantity: number;
}

export const sessionsApi = {
  start: async (data: StartSessionRequest): Promise<Session> => {
    const response = await api.post('/sessions/start', data);
    return response.data;
  },

  stop: async (data: StopSessionRequest): Promise<Session> => {
    const response = await api.post('/sessions/stop', data);
    return response.data;
  },

  addItem: async (sessionId: string, data: AddItemRequest): Promise<Session> => {
    const response = await api.post(`/sessions/${sessionId}/items`, data);
    return response.data;
  },

  getActive: async (): Promise<Session[]> => {
    const response = await api.get('/sessions/active');
    return response.data;
  },

  getAll: async (): Promise<Session[]> => {
    const response = await api.get('/sessions');
    return response.data;
  },
};


