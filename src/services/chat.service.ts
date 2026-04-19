import api from './api';

export interface ChatMessage {
  id: string;
  leadPhone: string;
  sender: 'LEAD' | 'ADMIN';
  content: string;
  createdAt: string;
}

export interface LeadWithChat {
    phone: string;
    studentName: string;
    lastMessage?: ChatMessage;
}

export async function getLeadHistory(phone: string): Promise<ChatMessage[]> {
    const { data } = await api.get(`/chat/history/${phone}`);
    return data.data;
}

export async function getAllLeadsWithChats(): Promise<LeadWithChat[]> {
    // We'll add an endpoint for this in the backend, or fetch from leads
    const { data } = await api.get('/inquiries'); // Temporary: get from inquiries
    // In a real app, we'd have a specific /chat/leads endpoint
    return data.data.map((i: any) => ({
        phone: i.leadPhone,
        studentName: i.lead.studentName
    }));
}
