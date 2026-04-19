import type { ChatMessage } from '../services/chat.service';

/**
 * Formats a date string into a clean time (e.g., 10:30 AM)
 */
export const formatTime = (dateStr: string) => {
    return new Intl.DateTimeFormat('en', { timeStyle: 'short' }).format(new Date(dateStr));
};

/**
 * Determines the divider text for a date (Today, Yesterday, or full date)
 */
export const formatDateDivider = (date: Date) => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    
    return new Intl.DateTimeFormat('en', { 
        month: 'long', 
        day: 'numeric', 
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined 
    }).format(date);
};

/**
 * Groups a sequence of messages by their creation date for display with dividers
 */
export const groupMessagesByDate = (messages: ChatMessage[]) => {
    const groups: { date: string, messages: ChatMessage[] }[] = [];
    messages.forEach(msg => {
        const date = formatDateDivider(new Date(msg.createdAt));
        const lastGroup = groups[groups.length - 1];
        if (lastGroup && lastGroup.date === date) {
            lastGroup.messages.push(msg);
        } else {
            groups.push({ date, messages: [msg] });
        }
    });
    return groups;
};
