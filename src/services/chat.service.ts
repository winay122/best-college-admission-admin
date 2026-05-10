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
    const { data } = await api.get('/chat/inbox'); 
    return data.data.map((i: any) => ({
        phone: i.phone,
        studentName: i.studentName,
        lastMessage: i.chatMessages && i.chatMessages.length > 0 ? i.chatMessages[0] : undefined
    }));
}
